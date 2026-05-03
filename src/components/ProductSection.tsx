"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

type Variant = {
  id: string;
  unitSize: string;
  price: number;
  isAvailable: boolean;
};

type ProductGroup = {
  name: string;
  description: string;
  variants: Variant[];
};

export default function ProductSection({ productGroups }: { productGroups: ProductGroup[] }) {
  return (
    <div style={{ display: "grid", gridTemplate: "auto / repeat(auto-fit, minmax(280px, 1fr))", gap: "2rem" }}>
      {productGroups.map(group => (
        <ProductCard key={group.name} group={group} />
      ))}
    </div>
  );
}

function ProductCard({ group }: { group: ProductGroup }) {
  const cart = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(group.variants[0]?.id || "");

  const selectedVariant = group.variants.find(v => v.id === selectedVariantId);
  const cartItem = cart.items.find((item) => item.productId === selectedVariantId);

  const handleAdd = () => {
    if (!selectedVariant || !selectedVariant.isAvailable) return;
    cart.addToCart({
      productId: selectedVariant.id,
      name: `${group.name} - ${selectedVariant.unitSize}`,
      price: selectedVariant.price,
      quantity: 1
    });
  };

  return (
    <div style={{
      background: "white",
      padding: "2rem",
      borderRadius: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      border: "1px solid rgba(0,0,0,0.03)",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }}>
      <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem", color: "#1a1a1a" }}>{group.name}</h3>
      <p style={{ color: "#666", fontSize: "0.95rem", marginBottom: "1rem", flexGrow: 1 }}>{group.description}</p>

      <div style={{ width: "100%", marginBottom: "1rem" }}>
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          style={{
            width: "100%",
            padding: "0.6rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fff",
            fontSize: "0.95rem"
          }}
        >
          {group.variants.map(v => (
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
          background: "#f5f5f5",
          border: "1px solid #ddd",
          borderRadius: "6px",
          width: "100%"
        }}>
          <button
            type="button"
            onClick={() => cart.updateQuantity(cartItem.productId, cartItem.quantity - 1)}
            style={{ padding: "0.85rem 1.2rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", fontSize: "1.3rem", color: "#4a2c00", touchAction: "manipulation" }}
          >
            −
          </button>
          <span style={{ fontWeight: "bold", color: "#333", fontSize: "0.95rem" }}>{cartItem.quantity} in Cart</span>
          <button
            type="button"
            onClick={() => cart.updateQuantity(cartItem.productId, cartItem.quantity + 1)}
            style={{ padding: "0.85rem 1.2rem", border: "none", background: "transparent", cursor: "pointer", fontWeight: "bold", fontSize: "1.3rem", color: "#4a2c00", touchAction: "manipulation" }}
          >
            +
          </button>
        </div>
      ) : (
        <div style={{ width: "100%" }}
          onTouchEnd={(e) => { e.preventDefault(); handleAdd(); }}
        >
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedVariant || !selectedVariant.isAvailable}
            style={{
              width: "100%",
              padding: "0.85rem",
              background: (!selectedVariant || !selectedVariant.isAvailable) ? "#999" : "#4a2c00",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: (!selectedVariant || !selectedVariant.isAvailable) ? "not-allowed" : "pointer",
              opacity: (!selectedVariant || !selectedVariant.isAvailable) ? 0.6 : 1,
              touchAction: "manipulation"
            }}
          >
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
}
