import type { Metadata } from "next";
import localFont from "next/font/local";
import MergePlanCheckout from "../MergePlanCheckout";
import styles from "../mergePlan.module.css";

const inter = localFont({
  src: "../../public/assets/Inter-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-merge-plan",
});

export const metadata: Metadata = {
  title: "Merge Max Checkout — Dark",
};

export default function DarkCheckoutPage() {
  return (
    <main
      className={`${styles.page} ${styles.darkPage} ${inter.variable}`}
      data-theme="dark"
    >
      <div className={styles.stage}>
        <MergePlanCheckout layout="horizontal" showPlans={false} />
      </div>
    </main>
  );
}
