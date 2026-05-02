"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function FloatingCartButton() {
  const { items, totalPrice } = useCart() as any;
  const cartCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  if (cartCount === 0) return null;

  return (
    <Link
      href="/checkout"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        background: "var(--primary-color, #4a2c00)",
        color: "white",
        padding: "1rem 2rem",
        borderRadius: "50px",
        fontWeight: "bold",
        fontSize: "1rem",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        whiteSpace: "nowrap",
        touchAction: "manipulation"
      }}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/>
        <circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      View Cart ({cartCount}) — ₹{totalPrice + 30}
    </Link>
  );
}
