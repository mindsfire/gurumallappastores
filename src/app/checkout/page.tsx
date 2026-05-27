"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import QRCode from "react-qr-code";
import Link from "next/link";
import styles from "./page.module.css";

const STORE_UPI_ID = process.env.NEXT_PUBLIC_STORE_UPI_ID || "vjsandu-3@okhdfcbank";
const STORE_NAME = "Gurumallappa Stores";

type Step = "details" | "payment";

type CartLine = { productId: string; name: string; price: number; quantity: number };
type PendingCheckout = { orderId: string; items: CartLine[]; finalTotal: number; phone: string };

const PENDING_KEY = "gms_pending_checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart, updateQuantity } = useCart() as any;
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>("details");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "Mysore",
    pincode: "",
  });

  const [orderId, setOrderId] = useState("");
  const [snapshot, setSnapshot] = useState<PendingCheckout | null>(null);
  const [utrNumber, setUtrNumber] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [utrError, setUtrError] = useState("");

  // Recover an in-progress PENDING_UTR order on mount (handles page refresh on step 2)
  useEffect(() => {
    setMounted(true);
    const raw = localStorage.getItem(PENDING_KEY);
    if (!raw) return;
    try {
      const pending: PendingCheckout = JSON.parse(raw);
      if (!pending.phone) {
        localStorage.removeItem(PENDING_KEY);
        return;
      }
      fetch(`/api/orders/${pending.orderId}/status?phone=${encodeURIComponent(pending.phone)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.status === "PENDING_UTR") {
            setOrderId(pending.orderId);
            setSnapshot(pending);
            setStep("payment");
          } else {
            localStorage.removeItem(PENDING_KEY);
          }
        })
        .catch(() => localStorage.removeItem(PENDING_KEY));
    } catch {
      localStorage.removeItem(PENDING_KEY);
    }
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && step === "details") {
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

  // Step 1: place order (no UTR yet)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError("");
    setIsSubmittingOrder(true);

    try {
      // If a PENDING_UTR order already exists for this customer (e.g. back-nav after step 2),
      // resume it instead of creating a duplicate.
      const existing = localStorage.getItem(PENDING_KEY);
      if (existing) {
        try {
          const pending: PendingCheckout = JSON.parse(existing);
          if (pending.orderId && pending.phone === formData.phone) {
            const r = await fetch(`/api/orders/${pending.orderId}/status?phone=${encodeURIComponent(pending.phone)}`);
            const d = await r.json();
            if (r.ok && d.status === "PENDING_UTR") {
              setOrderId(pending.orderId);
              setSnapshot(pending);
              setStep("payment");
              setIsSubmittingOrder(false);
              return;
            }
            // Stale snapshot — clear and fall through to create a new order
            localStorage.removeItem(PENDING_KEY);
          }
        } catch {
          localStorage.removeItem(PENDING_KEY);
        }
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: formData,
          items,
          totalAmount: totalPrice + 30,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to place order");

      const finalTotal = totalPrice + 30;
      const snap: PendingCheckout = { orderId: data.orderId, items, finalTotal, phone: formData.phone };
      localStorage.setItem("gms_last_order", data.orderId);
      localStorage.setItem(PENDING_KEY, JSON.stringify(snap));
      setOrderId(data.orderId);
      setSnapshot(snap);
      setStep("payment");
    } catch (err: any) {
      setOrderError(err.message);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Step 2: submit UTR after payment
  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setUtrError("");

    if (utrNumber.length < 12) {
      setUtrError("Please enter a valid 12-digit UTR/Reference number from your payment app.");
      return;
    }

    setIsSubmittingUtr(true);

    try {
      const response = await fetch(`/api/orders/${orderId}/utr`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utrNumber, phone: snapshot?.phone || formData.phone }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to submit UTR");

      clearCart();
      localStorage.removeItem(PENDING_KEY);
      router.push(`/order-confirmation/${orderId}`);
    } catch (err: any) {
      setUtrError(err.message);
      setIsSubmittingUtr(false);
    }
  };

  const finalTotal = step === "payment" && snapshot ? snapshot.finalTotal : totalPrice + 30;
  const summaryItems: CartLine[] = step === "payment" && snapshot ? snapshot.items : items;
  const upiUrl = `upi://pay?pa=${STORE_UPI_ID}&pn=${encodeURIComponent(STORE_NAME)}&am=${finalTotal}&cu=INR`;

  // ── Step indicator ──────────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#4a2c00", color: "white", fontWeight: "bold", fontSize: "0.9rem"
      }}>1</div>
      <span style={{ fontWeight: step === "details" ? "bold" : "normal", color: step === "details" ? "#4a2c00" : "#666", fontSize: "0.9rem" }}>
        Delivery Details
      </span>
      <div style={{ width: 40, height: 2, background: step === "payment" ? "#4a2c00" : "#ddd" }} />
      <div style={{
        width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
        background: step === "payment" ? "#4a2c00" : "#ddd", color: step === "payment" ? "white" : "#999",
        fontWeight: "bold", fontSize: "0.9rem"
      }}>2</div>
      <span style={{ fontWeight: step === "payment" ? "bold" : "normal", color: step === "payment" ? "#4a2c00" : "#999", fontSize: "0.9rem" }}>
        Payment
      </span>
    </div>
  );

  // ── Step 1: Delivery details ────────────────────────────────────────────────
  if (step === "details") {
    return (
      <div className={styles.checkoutContainer}>
        <h1 className={styles.title}>Checkout</h1>
        <StepIndicator />

        {orderError && <div className={styles.error}>{orderError}</div>}

        <form onSubmit={handlePlaceOrder} className={styles.formGrid}>
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
              <textarea id="address" name="address" required rows={3} value={formData.address} onChange={handleInputChange} placeholder="House No, Street, Landmark" />
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

          <div>
            <div className={styles.section} style={{ marginBottom: "2rem" }}>
              <h2 className={styles.sectionTitle}>Order Summary</h2>
              {items.map((item: any) => (
                <div key={item.productId} className={styles.cartItem} style={{ alignItems: "center" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontWeight: "500" }}>{item.name}</span>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: "4px" }}>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity - 1)} style={{ padding: "0.2rem 0.6rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }}>-</button>
                        <span style={{ fontSize: "0.9rem", width: "20px", textAlign: "center" }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.productId, item.quantity + 1)} style={{ padding: "0.2rem 0.6rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold" }}>+</button>
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
                </div>
              ))}
              <div className={styles.cartItem} style={{ color: "#666", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px dashed #ccc" }}>
                <span>Delivery Fee (Mysuru)</span>
                <span>₹30</span>
              </div>
              <div className={styles.cartTotal}>
                <span>Total to Pay</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <button type="submit" disabled={isSubmittingOrder} className={styles.submitBtn}>
              {isSubmittingOrder ? "Processing..." : "Proceed to Payment →"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ── Step 2: Payment + UTR ───────────────────────────────────────────────────
  return (
    <div className={styles.checkoutContainer}>
      <h1 className={styles.title}>Checkout</h1>
      <StepIndicator />

      <div style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{
          background: "#f0fdf4", border: "1px solid #86efac", borderRadius: "8px",
          padding: "0.75rem 1rem", marginBottom: "1.5rem", fontSize: "0.9rem", color: "#166534"
        }}>
          ✓ Order <strong>{orderId}</strong> created. Complete your payment below and enter the UTR to confirm.
        </div>

        <div className={`${styles.section} ${styles.paymentSection}`}>
          <h2 className={styles.sectionTitle}>2. Payment — ₹{finalTotal}</h2>
          <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1rem" }}>
            Scan the QR code or tap the button to pay via your UPI app. The exact amount is pre-filled.
          </p>

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

          <form onSubmit={handleSubmitUtr}>
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
                Find this in your payment app (GPay / PhonePe) after a successful transaction.
              </small>
              {utrError && (
                <small style={{ color: "#c0392b", display: "block", marginTop: "0.5rem", fontWeight: 500 }}>
                  {utrError}
                </small>
              )}
            </div>

            <button type="submit" disabled={isSubmittingUtr} className={styles.submitBtn}>
              {isSubmittingUtr ? "Confirming..." : "Confirm Payment & Place Order"}
            </button>
          </form>

          <p style={{ marginTop: "1rem", fontSize: "0.8rem", color: "#999" }}>
            Already paid but closed the tab?{" "}
            <Link href={`/order-confirmation/${orderId}`} style={{ color: "#4a2c00", textDecoration: "underline" }}>
              Go to your order
            </Link>{" "}
            and submit your UTR there.
          </p>
        </div>

        <div className={styles.section} style={{ marginTop: "1.5rem" }}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          {summaryItems.map((item) => (
            <div key={item.productId} className={styles.cartItem}>
              <span>{item.name} <span style={{ color: "#666", fontSize: "0.85rem" }}>× {item.quantity}</span></span>
              <span style={{ fontWeight: "bold" }}>₹{item.price * item.quantity}</span>
            </div>
          ))}
          <div className={styles.cartItem} style={{ color: "#666", marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px dashed #ccc" }}>
            <span>Delivery Fee (Mysuru)</span>
            <span>₹30</span>
          </div>
          <div className={styles.cartTotal}>
            <span>Total to Pay</span>
            <span>₹{finalTotal}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
