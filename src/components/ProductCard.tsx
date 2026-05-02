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
  const { addToCart } = useCart() as any;
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find(v => v.id === selectedVariantId);

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
      
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <select 
          value={selectedVariantId} 
          onChange={(e) => setSelectedVariantId(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          {variants.map(v => (
            <option key={v.id} value={v.id}>
              {v.unitSize} - ₹{v.price} {!v.isAvailable ? "(Out of Stock)" : ""}
            </option>
          ))}
        </select>
      </div>

      <button 
        onClick={handleAddToCart}
        disabled={!selectedVariant || !selectedVariant.isAvailable}
        style={{
          width: "100%",
          padding: "0.75rem",
          background: added ? "#28a745" : "var(--primary-color, #4a2c00)",
          color: "white",
          border: "none",
          borderRadius: "4px",
          fontWeight: "bold",
          cursor: (!selectedVariant || !selectedVariant.isAvailable) ? "not-allowed" : "pointer",
          opacity: (!selectedVariant || !selectedVariant.isAvailable) ? 0.6 : 1
        }}
      >
        {added ? "Added to Cart ✓" : "Add to Cart"}
      </button>
    </div>
  );
}
