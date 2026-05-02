"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import QRCode from "react-qr-code";
import styles from "./page.module.css";

const STORE_UPI_ID = process.env.NEXT_PUBLIC_STORE_UPI_ID || "vjsandu-3@okhdfcbank";
const STORE_NAME = "Gurumallappa Stores";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, isLoaded } = useCart() as any; // any to bypass strict type check for isLoaded if not added
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Mysore",
    pincode: "",
  });
  
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Avoid hydration mismatch

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
        <h2>Your cart is empty</h2>
        <p>Please add some items before checking out.</p>
        <button onClick={() => router.push("/")} className="btn-primary" style={{ marginTop: "1rem" }}>
          Return to Shop
        </button>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(STORE_UPI_ID);
    alert("UPI ID copied to clipboard!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (utrNumber.length < 12) {
      setError("Please enter a valid 12-digit UTR/Reference number from your payment app.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items,
          totalAmount: totalPrice + 30, // Include delivery fee
          utrNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process order");
      }

      // Success
      clearCart();
      // Store the order ID locally for tracking
      localStorage.setItem("gms_last_order", data.orderId);
      router.push(`/order-confirmation/${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Generate Dynamic UPI Link (Total + ₹30 delivery)
  const finalTotal = totalPrice + 30;
  const upiUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${finalTotal}&cu=INR`;

  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.title}>Secure Checkout</h1>
      
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Left Column: Shipping Details */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Delivery Details</h2>
          
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name *</label>
            <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Rahul Sharma" />
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="phone">Mobile Number *</label>
              <input type="tel" id="phone" name="phone" required pattern="[0-9]{10}" value={formData.phone} onChange={handleInputChange} placeholder="10-digit number" />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email (Optional)</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="For receipt" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address">Complete Address *</label>
            <textarea id="address" name="address" required rows={3} value={formData.address} onChange={handleInputChange} placeholder="House No, Street, Landmark"></textarea>
          </div>

          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="city">City *</label>
              <input type="text" id="city" name="city" required value={formData.city} onChange={handleInputChange} />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="pincode">Pincode *</label>
              <input type="text" id="pincode" name="pincode" required pattern="^57[01][0-9]{3}$" value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 570001 (Mysuru Only)" title="Delivery is restricted to Mysuru district (starting with 570 or 571)" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Payment */}
        <div>
          <div className={styles.section} style={{ marginBottom: "2rem" }}>
            <h2 className={styles.sectionTitle}>Order Summary</h2>
            {items.map((item: any) => (
              <div key={item.productId} className={styles.cartItem}>
                <span>{item.name} x{item.quantity}</span>
                <span>₹{item.price * item.quantity}</span>
              </div>
            ))}
            <div className={styles.cartItem} style={{ color: "#666", marginTop: "0.5rem" }}>
              <span>Delivery Fee (Mysuru)</span>
              <span>₹30</span>
            </div>
            <div className={styles.cartTotal}>
              <span>Total to Pay</span>
              <span>₹{totalPrice + 30}</span>
            </div>
          </div>

          <div className={`${styles.section} ${styles.paymentSection}`}>
            <h2 className={styles.sectionTitle}>2. Payment</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
              Scan the QR code or tap the button below to pay securely via your UPI app. The exact amount is pre-filled.
            </p>

            {/* Mobile Pay Button (Intent Link) */}
            <a href={upiUrl} className={styles.mobilePayBtn}>
              📱 Tap to Pay via UPI
            </a>

            <div className={styles.qrWrapper}>
              <QRCode value={upiUrl} size={160} />
            </div>
            
            <div className={styles.upiDetails}>
              UPI ID: <strong>{STORE_UPI_ID}</strong>
              <button type="button" onClick={copyUpiId} className={styles.copyBtn}>Copy</button>
            </div>

            <div className={styles.formGroup} style={{ textAlign: "left" }}>
              <label htmlFor="utrNumber">Enter 12-Digit UTR/Reference No. *</label>
              <input 
                type="text" 
                id="utrNumber" 
                value={utrNumber} 
                onChange={(e) => setUtrNumber(e.target.value)}
                required 
                placeholder="e.g. 312345678901"
                maxLength={12}
                minLength={12}
                style={{ fontSize: "1.1rem", letterSpacing: "2px", textAlign: "center" }}
              />
              <small style={{ color: "#666", display: "block", marginTop: "0.5rem" }}>
                You can find this in your payment app (GPay/PhonePe) after a successful transaction.
              </small>
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? "Processing..." : "Confirm & Place Order"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
