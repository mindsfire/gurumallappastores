"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./page.module.css";

export default function OrderConfirmationPage({ params }: { params: { id: string } }) {
  const orderId = params.id;

  const [status, setStatus] = useState<string | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [utrError, setUtrError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch current order status to decide which view to show
  useEffect(() => {
    fetch(`/api/orders/${orderId}/status`)
      .then((r) => r.json())
      .then((d) => setStatus(d.status ?? "PENDING_VERIFICATION"))
      .catch(() => setStatus("PENDING_VERIFICATION"));
  }, [orderId]);

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError("");

    if (utrNumber.length < 12) {
      setUtrError("Please enter a valid 12-digit UTR/Reference number from your payment app.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/utr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utrNumber }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit UTR");

      setSubmitted(true);
      setStatus("PENDING_VERIFICATION");
    } catch (err: any) {
      setUtrError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (status === null) {
    return (
      <div className={styles.container}>
        <p style={{ color: "#666" }}>Loading...</p>
      </div>
    );
  }

  // UTR still pending — show payment confirmation prompt
  if (status === "PENDING_UTR" && !submitted) {
    return (
      <div className={styles.container}>
        <div style={{ color: "#856404", fontSize: 48, marginBottom: "1rem" }}>💳</div>
        <h1 className={styles.title}>Complete Your Payment</h1>
        <p className={styles.subtitle}>
          Your order <strong>{orderId}</strong> has been created. Once you have paid, enter your UTR/Reference number below to confirm.
        </p>

        <div className={styles.orderCard}>
          <div className={styles.orderLabel}>Your Order ID</div>
          <div className={styles.orderId}>{orderId}</div>
          <div className={styles.statusBadge}>⏳ Awaiting Payment</div>
        </div>

        <form onSubmit={handleSubmitUtr} style={{ textAlign: "left", marginBottom: "1.5rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ display: "block", fontWeight: 500, fontSize: "0.9rem", marginBottom: "0.5rem", color: "#333" }}>
              12-Digit UTR / Reference No. *
            </label>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              required
              placeholder="e.g. 312345678901"
              maxLength={12}
              minLength={12}
              style={{
                width: "100%", padding: "0.75rem", border: "1px solid #ccc", borderRadius: "6px",
                fontSize: "1.1rem", letterSpacing: "2px", textAlign: "center", fontFamily: "inherit",
                boxSizing: "border-box"
              }}
            />
            <small style={{ color: "#666", display: "block", marginTop: "0.5rem" }}>
              Find this in GPay / PhonePe after a successful transaction.
            </small>
            {utrError && (
              <small style={{ color: "#c0392b", display: "block", marginTop: "0.5rem", fontWeight: 500 }}>
                {utrError}
              </small>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: "100%", padding: "1rem", background: isSubmitting ? "#a5d8b0" : "#28a745",
              color: "white", border: "none", borderRadius: "8px", fontSize: "1rem",
              fontWeight: "bold", cursor: isSubmitting ? "not-allowed" : "pointer"
            }}
          >
            {isSubmitting ? "Confirming..." : "Submit UTR & Confirm Order"}
          </button>
        </form>

        <div className={styles.actions}>
          <Link href="/" className={styles.homeBtn}>Return to Home</Link>
        </div>
      </div>
    );
  }

  // Confirmed (UTR submitted)
  return (
    <div className={styles.container}>
      <div className={styles.successIcon}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>

      <h1 className={styles.title}>
        {submitted ? "Payment Confirmed!" : "Order Placed Successfully!"}
      </h1>
      <p className={styles.subtitle}>
        {submitted
          ? "Thank you! We have received your UTR and will verify your payment shortly."
          : "Thank you for choosing Gurumallappa Stores. Your payment UTR is pending verification by our team."}
      </p>

      <div className={styles.orderCard}>
        <div className={styles.orderLabel}>Your Order ID</div>
        <div className={styles.orderId}>{orderId}</div>
        <div className={styles.statusBadge}>🕒 Pending Payment Verification</div>
      </div>

      <div className={styles.actions}>
        <Link href="/track" className={styles.trackBtn}>Track Order Status</Link>
        <Link href="/" className={styles.homeBtn}>Return to Home</Link>
      </div>
    </div>
  );
}
