"use client";

import Link from 'next/link';
import './Navbar.css';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const { items } = useCart() as any;
  const cartCount = items.reduce((acc: number, item: any) => acc + item.quantity, 0);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-logo">
          <span className="logo-primary">Gurumallappa</span>
          <span className="logo-secondary">Stores</span>
        </Link>
        <div className="navbar-links">
          <Link href="/#products" className="navbar-link hide-on-mobile">Products</Link>
          <Link href="/track" className="navbar-link track-order-link">
            <span>Track</span>
            <span>Order</span>
          </Link>
          <Link href="/checkout" className="btn-primary navbar-btn cart-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            <span className="cart-text">Cart</span>
            {cartCount > 0 && (
              <span style={{ 
                background: 'white', 
                color: 'var(--primary-color, #4a2c00)', 
                borderRadius: '50%', 
                padding: '0.1rem 0.4rem', 
                fontSize: '0.75rem', 
                fontWeight: 'bold',
                marginLeft: '0.2rem'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
