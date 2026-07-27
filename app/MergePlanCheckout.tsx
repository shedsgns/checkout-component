"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import {
  type ChangeEvent,
  type FocusEvent as ReactFocusEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TransitionEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import styles from "./mergePlan.module.css";

const ICON_ROOT = "/assets";

type PlanId = "pro" | "max";

type Plan = {
  id: PlanId;
  name: string;
  usage: string;
  price: number;
};

const PLANS: readonly Plan[] = [
  {
    id: "pro",
    name: "Merge Max plan",
    usage: "5x more usage than Pro",
    price: 100,
  },
  {
    id: "max",
    name: "Merge Max plan",
    usage: "20x more usage than Pro",
    price: 200,
  },
];

function AnimatedPrice({ value }: { value: number }) {
  const visualRef = useRef<HTMLSpanElement>(null);
  const displayedValue = useRef(value);

  useEffect(() => {
    const visual = visualRef.current;

    if (!visual) {
      return;
    }

    const visualElement: HTMLSpanElement = visual;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      displayedValue.current = value;
      visualElement.textContent = `$${value}`;
      return;
    }

    const startValue = displayedValue.current;
    const difference = value - startValue;

    if (difference === 0) {
      visualElement.textContent = `$${value}`;
      return;
    }

    const duration = 420;
    const startTime = performance.now();
    let frameId = 0;

    function updatePrice(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = (1 - Math.cos(Math.PI * progress)) / 2;
      const nextValue = startValue + difference * eased;

      displayedValue.current = nextValue;
      visualElement.textContent = `$${Math.round(nextValue)}`;

      if (progress < 1) {
        frameId = requestAnimationFrame(updatePrice);
      } else {
        displayedValue.current = value;
        visualElement.textContent = `$${value}`;
      }
    }

    frameId = requestAnimationFrame(updatePrice);

    return () => cancelAnimationFrame(frameId);
  }, [value]);

  return (
    <>
      <span ref={visualRef} aria-hidden="true">
        ${value}
      </span>
      <span className={styles.srOnly} aria-live="polite" aria-atomic="true">
        ${value}
      </span>
    </>
  );
}

function Chevron({ expanded }: { expanded: boolean }) {
  function markRotationStart(event: TransitionEvent<HTMLSpanElement>) {
    if (event.propertyName === "transform") {
      event.currentTarget.dataset.animating = "true";
    }
  }

  function markRotationEnd(event: TransitionEvent<HTMLSpanElement>) {
    if (event.propertyName === "transform") {
      delete event.currentTarget.dataset.animating;
    }
  }

  return (
    <span className={styles.chevron} aria-hidden="true">
      <span
        className={styles.chevronGlyph}
        data-expanded={expanded}
        onTransitionRun={markRotationStart}
        onTransitionEnd={markRotationEnd}
        onTransitionCancel={markRotationEnd}
      />
    </span>
  );
}

function Disclosure({
  title,
  open,
  onToggle,
  disabled = false,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  const bodyId = useId();

  function markAnimationStart(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.currentTarget !== event.target ||
      event.propertyName !== "grid-template-rows"
    ) {
      return;
    }
    event.currentTarget.dataset.animating = "true";
  }

  function markAnimationEnd(event: TransitionEvent<HTMLDivElement>) {
    if (
      event.currentTarget !== event.target ||
      event.propertyName !== "grid-template-rows"
    ) {
      return;
    }
    delete event.currentTarget.dataset.animating;
  }

  return (
    <section className={styles.disclosure} data-open={open}>
      <button
        className={styles.disclosureTrigger}
        type="button"
        aria-expanded={open}
        aria-controls={bodyId}
        disabled={disabled}
        onClick={onToggle}
      >
        <span>{title}</span>
        <Chevron expanded={open} />
      </button>

      <div
        className={styles.disclosureReveal}
        data-open={open}
        onTransitionRun={markAnimationStart}
        onTransitionEnd={markAnimationEnd}
        onTransitionCancel={markAnimationEnd}
      >
        <div className={styles.disclosureClip}>
          <div
            className={styles.disclosureBody}
            id={bodyId}
            aria-hidden={!open}
            inert={!open}
          >
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function MoneyRow({
  label,
  value,
  separator = false,
}: {
  label: ReactNode;
  value: number;
  separator?: boolean;
}) {
  return (
    <>
      {separator && <div className={styles.dashedDivider} aria-hidden="true" />}
      <div className={styles.moneyRow}>
        <div className={styles.moneyLabel}>{label}</div>
        <div className={styles.moneyValue}>
          <AnimatedPrice value={value} />
        </div>
      </div>
    </>
  );
}

function TaxLabel({ disabled = false }: { disabled?: boolean }) {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  useEffect(() => {
    setPortalTarget(
      (infoButtonRef.current?.closest(
        "[data-merge-plan-root]",
      ) as HTMLElement | null) ?? document.body,
    );
  }, []);

  function positionTooltip(
    x: number,
    y: number,
    transform = "translateX(-4px)",
  ) {
    const tooltip = tooltipRef.current;

    if (!tooltip) {
      return;
    }

    tooltip.style.transform = `translate3d(${x}px, ${y}px, 0) ${transform}`;
  }

  function showAtPointer(event: ReactMouseEvent<HTMLButtonElement>) {
    positionTooltip(event.clientX, event.clientY + 12);
    setVisible(true);
  }

  function showAtTrigger(event: ReactFocusEvent<HTMLButtonElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    positionTooltip(
      rect.left + rect.width / 2,
      rect.bottom + 8,
      "translateX(-50%)",
    );
    setVisible(true);
  }

  return (
    <span className={styles.taxLabel}>
      <span>Tax</span>
      <span className={styles.infoAnchor}>
        <button
          className={styles.infoButton}
          ref={infoButtonRef}
          type="button"
          disabled={disabled}
          aria-describedby={visible ? tooltipId : undefined}
          onMouseEnter={showAtPointer}
          onMouseMove={(event) =>
            positionTooltip(event.clientX, event.clientY + 12)
          }
          onMouseLeave={() => setVisible(false)}
          onFocus={showAtTrigger}
          onBlur={() => setVisible(false)}
        >
          <Image
            src={`${ICON_ROOT}/Info.svg`}
            width={16}
            height={16}
            alt="Tax information"
            draggable={false}
          />
        </button>
        {portalTarget
          ? createPortal(
              <span
                className={styles.tooltip}
                data-visible={visible}
                id={tooltipId}
                ref={tooltipRef}
                role="tooltip"
              >
                Tax is determined by billing information
              </span>,
              portalTarget,
            )
          : null}
      </span>
    </span>
  );
}

function PaymentFields({ disabled = false }: { disabled?: boolean }) {
  const [cardNumber, setCardNumber] = useState("");
  const cardNumberRef = useRef<HTMLInputElement>(null);
  const caretFrame = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (caretFrame.current !== null) {
        cancelAnimationFrame(caretFrame.current);
      }
    };
  }, []);

  function handleCardNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const rawValue = input.value;
    const rawCaret = input.selectionStart ?? rawValue.length;
    const digitsBeforeCaret = rawValue
      .slice(0, rawCaret)
      .replace(/\D/g, "").length;
    const digits = rawValue.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.match(/.{1,4}/g)?.join(" ") ?? "";
    const nextCaret =
      digitsBeforeCaret === 0
        ? 0
        : Math.min(
            digitsBeforeCaret + Math.floor((digitsBeforeCaret - 1) / 4),
            formatted.length,
          );

    setCardNumber(formatted);

    if (caretFrame.current !== null) {
      cancelAnimationFrame(caretFrame.current);
    }

    caretFrame.current = requestAnimationFrame(() => {
      cardNumberRef.current?.setSelectionRange(nextCaret, nextCaret);
      caretFrame.current = null;
    });
  }

  return (
    <div className={styles.paymentFields}>
      <div className={styles.formGroup}>
        <label className={styles.fieldLabel} htmlFor="merge-card-number">
          Card
        </label>
        <div className={styles.cardFields}>
          <div className={`${styles.fieldShell} ${styles.cardNumberShell}`}>
            <input
              className={styles.input}
              id="merge-card-number"
              ref={cardNumberRef}
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength={19}
              placeholder="1234 5678 9123 4656"
              aria-label="Card number"
              disabled={disabled}
              value={cardNumber}
              onChange={handleCardNumberChange}
            />
            <span className={styles.cardBrands} aria-hidden="true">
              <Image
                src={`${ICON_ROOT}/Mastercard.svg`}
                width={34}
                height={26}
                alt=""
                draggable={false}
              />
              <Image
                src={`${ICON_ROOT}/Visa.svg`}
                width={32}
                height={24}
                alt=""
                draggable={false}
              />
            </span>
          </div>
          <div className={styles.cardSecondaryRow}>
            <div className={`${styles.fieldShell} ${styles.expiryShell}`}>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM / YY"
                aria-label="Expiration date"
                disabled={disabled}
              />
            </div>
            <div className={`${styles.fieldShell} ${styles.cvcShell}`}>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                placeholder="CVC"
                aria-label="Security code"
                disabled={disabled}
              />
              <Image
                className={styles.cardIcon}
                src={`${ICON_ROOT}/Card.svg`}
                width={18}
                height={18}
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.fieldLabel} htmlFor="merge-cardholder">
          Cardholder name
        </label>
        <div className={styles.fieldShell}>
          <input
            className={styles.input}
            id="merge-cardholder"
            type="text"
            autoComplete="cc-name"
            placeholder="Full name on card"
            disabled={disabled}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.fieldLabel}>Billing address</span>
        <div className={styles.addressFields}>
          <div className={`${styles.fieldShell} ${styles.countryShell}`}>
            <input
              className={styles.input}
              type="text"
              value="Armenia"
              aria-label="Country"
              autoComplete="country-name"
              readOnly
              disabled={disabled}
            />
            <Chevron expanded={false} />
          </div>
          <div className={styles.fieldShell}>
            <input
              className={styles.input}
              type="text"
              autoComplete="address-line1"
              placeholder="Address line 1"
              aria-label="Address line 1"
              disabled={disabled}
            />
          </div>
          <div className={styles.fieldShell}>
            <input
              className={styles.input}
              type="text"
              autoComplete="address-line2"
              placeholder="Address line 2"
              aria-label="Address line 2"
              disabled={disabled}
            />
          </div>
          <div className={styles.addressLastRow}>
            <div className={styles.fieldShell}>
              <input
                className={styles.input}
                type="text"
                autoComplete="address-level2"
                placeholder="City"
                aria-label="City"
                disabled={disabled}
              />
            </div>
            <div className={styles.fieldShell}>
              <input
                className={styles.input}
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="ZIP"
                aria-label="ZIP code"
                disabled={disabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MergePlanCheckout({
  onSubscribe,
  disabled = false,
}: {
  onSubscribe?: (plan: PlanId) => void;
  disabled?: boolean;
}) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("max");
  const [orderOpen, setOrderOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);
  const plan = PLANS.find((item) => item.id === selectedPlan) ?? PLANS[1];

  return (
    <div className={styles.checkout} data-merge-plan-root>
      <div className={styles.planInfo}>
        <h1 className={styles.title}>{plan.name}</h1>
        <div className={styles.planOptions} role="radiogroup" aria-label="Choose plan">
          {PLANS.map((option) => {
            const selected = option.id === selectedPlan;
            return (
              <button
                className={styles.planOption}
                data-selected={selected}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={disabled}
                onClick={() => setSelectedPlan(option.id)}
                key={option.id}
              >
                <svg
                  className={styles.planOutline}
                  aria-hidden="true"
                  focusable="false"
                  width="100%"
                  height="100%"
                >
                  <rect
                    x="0.5"
                    y="0.5"
                    width="calc(100% - 1px)"
                    height="calc(100% - 1px)"
                    rx="11.5"
                  />
                </svg>
                <span className={styles.planUsage}>{option.usage}</span>
                <span className={styles.planPrice}>
                  US ${option.price.toFixed(2)}/month + tax
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Disclosure
        title="Order details"
        open={orderOpen}
        disabled={disabled}
        onToggle={() => setOrderOpen((open) => !open)}
      >
        <div className={styles.orderBody}>
          <MoneyRow
            label={
              <>
                <span>{plan.name}</span>
                <span>{plan.usage}</span>
              </>
            }
            value={plan.price}
          />
          <MoneyRow label={<TaxLabel disabled={disabled} />} value={0} />
          <MoneyRow label="Subtotal" value={plan.price} separator />
          <MoneyRow label="Total due today" value={plan.price} separator />
        </div>
      </Disclosure>

      <Disclosure
        title="Payment information"
        open={paymentOpen}
        disabled={disabled}
        onToggle={() => setPaymentOpen((open) => !open)}
      >
        <PaymentFields disabled={disabled} />
      </Disclosure>

      <button
        className={styles.subscribeButton}
        type="button"
        disabled={disabled}
        onClick={() => onSubscribe?.(selectedPlan)}
      >
        Subscribe
      </button>
    </div>
  );
}
