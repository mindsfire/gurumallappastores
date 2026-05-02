import Link from "next/link";
import styles from "./page.module.css";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  // We await params in next 15+ if needed, but for simplicity here we just use it directly
  // Note: in Next.js App Router, params is officially a Promise in the latest versions, 
  // but if we are on <15 we can use it directly. We'll use a standard approach.
  const orderId = params.id;

  return (
    <div className={styles.container}>
      <div className={styles.successIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h1 className={styles.title}>Order Placed Successfully!</h1>
      <p className={styles.subtitle}>
        Thank you for choosing Gurumallappa Stores. We have received your order details and your payment UTR is currently pending verification by our team.
      </p>

      <div className={styles.orderCard}>
        <div className={styles.orderLabel}>Your Order ID</div>
        <div className={styles.orderId}>{orderId}</div>
        <div className={styles.statusBadge}>🕒 Pending Payment Verification</div>
      </div>

      <div className={styles.actions}>
        <Link href="/track" className={styles.trackBtn}>
          Track Order Status
        </Link>
        <Link href="/" className={styles.homeBtn}>
          Return to Home
        </Link>
      </div>
    </div>
  );
}
