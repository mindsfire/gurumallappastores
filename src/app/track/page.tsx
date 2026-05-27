"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function TrackOrderPage() {
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<any[]>([]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setOrders([]);

    try {
      const response = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, pincode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load history");
      }

      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING_UTR": return "Awaiting Payment";
      case "PENDING_VERIFICATION": return "Pending Verification";
      case "PROCESSING": return "Processing";
      case "SHIPPED": return "Shipped";
      case "COMPLETED": return "Delivered";
      case "CANCELLED": return "Cancelled";
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Track Your Orders</h1>
      <p className={styles.subtitle}>Enter your Mobile Number and any Delivery Pincode you've used.</p>

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleTrack}>
        <div className={styles.formGroup}>
          <label htmlFor="phone">Mobile Number</label>
          <input 
            type="tel" 
            id="phone" 
            value={phone} 
            onChange={(e) => setPhone(e.target.value.trim())} 
            placeholder="10-digit number" 
            pattern="[0-9]{10}"
            required 
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="pincode">Delivery Pincode</label>
          <input 
            type="text" 
            id="pincode" 
            value={pincode} 
            onChange={(e) => setPincode(e.target.value.trim())} 
            placeholder="e.g. 570001" 
            required 
          />
        </div>

        <button type="submit" className={styles.submitBtn} disabled={isLoading}>
          {isLoading ? "Searching..." : "View Order History"}
        </button>
      </form>

      {orders.length > 0 && (
        <div style={{ marginTop: "3rem" }}>
          <h2 style={{ marginBottom: "1rem", color: "#333" }}>Your Order History</h2>
          
          {orders.map((orderData) => (
            <div key={orderData.id} className={styles.resultCard} style={{ marginTop: 0, marginBottom: "2rem" }}>
              <div className={styles.statusHeader}>
                <h3>Order {orderData.shortId}</h3>
                <span className={`${styles.badge} ${styles[orderData.status]}`}>
                  {getStatusText(orderData.status)}
                </span>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Date Placed</span>
                  <span className={styles.detailValue}>
                    {new Date(orderData.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Total Amount</span>
                  <span className={styles.detailValue}>₹{orderData.totalAmount}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Delivery To</span>
                  <span className={styles.detailValue}>{orderData.customer.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>City</span>
                  <span className={styles.detailValue}>{orderData.customer.city}</span>
                </div>
              </div>
              
              <div style={{ marginTop: "1rem" }}>
                 <span className={styles.detailLabel}>Items Ordered</span>
                 <ul style={{ listStyleType: "none", padding: 0, margin: "0.5rem 0 0 0" }}>
                   {orderData.items.map((item: any) => (
                     <li key={item.id} style={{ padding: "0.5rem 0", borderTop: "1px solid #eee" }}>
                       {item.product?.name || `Product ID: ${item.productId}`} - {item.quantity} qty
                     </li>
                   ))}
                 </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
