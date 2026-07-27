import localFont from "next/font/local";
import MergePlanCheckout from "./MergePlanCheckout";
import styles from "./mergePlan.module.css";

const inter = localFont({
  src: "../public/assets/Inter-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-merge-plan",
});

export default function CheckoutPage() {
  return (
    <main className={`${styles.page} ${inter.variable}`}>
      <div className={styles.stage}>
        <MergePlanCheckout />
      </div>
    </main>
  );
}
