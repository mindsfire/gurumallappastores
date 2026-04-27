import Link from 'next/link';
import './Navbar.css';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-logo">
          <span className="logo-primary">Gurumallappa</span>
          <span className="logo-secondary">Stores</span>
        </Link>
        <div className="navbar-links">
          <Link href="/#products" className="navbar-link">Products</Link>
          <Link href="/track" className="navbar-link">Track Order</Link>
          <Link href="/checkout" className="btn-primary navbar-btn">Order Now</Link>
        </div>
      </div>
    </nav>
  );
}
