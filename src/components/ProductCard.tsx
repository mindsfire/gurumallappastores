"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import styles from "@/app/page.module.css";

type Variant = {
  id: string;
  unitSize: string;
  price: number;
  isAvailable: boolean;
};

type ProductCardProps = {
  name: string;
  description: string;
  iconPath: React.ReactNode;
  variants: Variant[];
};

export default function ProductCard({ name, description, iconPath, variants }: ProductCardProps) {
  const { items, addToCart, updateQuantity } = useCart() as any;
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find(v => v.id === selectedVariantId);
  const cartItem = items.find((item: any) => item.productId === selectedVariantId);

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    addToCart({
      productId: selectedVariant.id,
      name: `${name} - ${selectedVariant.unitSize}`,
      price: selectedVariant.price,
      quantity: 1
    });

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className={styles.productCard}>
      <div className={styles.productIcon}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {iconPath}
        </svg>
      </div>
      <h3>{name}</h3>
      <p>{description}</p>
      
      <div style={{ marginTop: "1rem", marginBottom: "1rem", width: "100%" }}>
        <select 
          value={selectedVariantId} 
          onChange={(e) => setSelectedVariantId(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc", background: "#fff", appearance: "auto" }}
        >
          {variants.map(v => (
            <option key={v.id} value={v.id}>
              {v.unitSize} - ₹{v.price} {!v.isAvailable ? "(Out of Stock)" : ""}
            </option>
          ))}
        </select>
      </div>

      {cartItem ? (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f9f9f9",
          border: "1px solid #ddd",
          borderRadius: "4px",
          overflow: "hidden",
          width: "100%",
          position: "relative",
          zIndex: 10
        }}>
          <button 
            type="button"
            onClick={() => updateQuantity(cartItem.productId, cartItem.quantity - 1)}
            style={{ padding: "0.75rem 1rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", fontSize: "1.2rem", color: "#4a2c00", touchAction: "manipulation" }}
          >
            −
          </button>
          <span style={{ fontWeight: "bold", color: "#333" }}>{cartItem.quantity} in Cart</span>
          <button 
            type="button"
            onClick={() => updateQuantity(cartItem.productId, cartItem.quantity + 1)}
            style={{ padding: "0.75rem 1rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", fontSize: "1.2rem", color: "#4a2c00", touchAction: "manipulation" }}
          >
            +
          </button>
        </div>
      ) : (
        <button 
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant || !selectedVariant.isAvailable}
          style={{
            width: "100%",
            padding: "0.75rem",
            background: "var(--primary-color, #4a2c00)",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontWeight: "bold",
            cursor: (!selectedVariant || !selectedVariant.isAvailable) ? "not-allowed" : "pointer",
            opacity: (!selectedVariant || !selectedVariant.isAvailable) ? 0.6 : 1,
            position: "relative",
            zIndex: 10,
            touchAction: "manipulation"
          }}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
