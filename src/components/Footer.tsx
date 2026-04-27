import Link from 'next/link';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container">
        <div className="pre-footer">
          <div className="pre-footer-logo">
            <span className="pre-logo-primary">Gurumallappa</span>
            <span className="pre-logo-secondary">Stores</span>
          </div>
          <p className="pre-footer-text">
            Dedicated to preserving the authentic, traditional methods of dairy preparation. 
            Join generations of families who trust our purity and heritage.
          </p>
        </div>
      </div>
      
      <div className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <span className="logo-primary">Gurumallappa</span>
              <span className="logo-secondary">Stores</span>
            </Link>
            <p className="footer-legacy">Serving authentic Pure Cow Ghee and Butter since 1880.</p>
          </div>
          <div className="footer-contact">
            <h3>Visit Us</h3>
            <p>Mandi Mohalla, Halladakere</p>
            <p>Mysore, Karnataka 570001</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Gurumallappa Stores. All rights reserved.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
            Developed by <a href="https://mindsfire.com" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>Mindsfire</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
