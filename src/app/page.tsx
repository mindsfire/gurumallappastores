import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroContainer}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroBadge}>Est. 1880</span>
            <h1 className={styles.heroTitle}>A Legacy of Purity</h1>
            <p className={styles.heroSubtitle}>
              Experience the authentic taste of Mysore with our traditionally crafted Pure Cow Ghee, Butter, and signature Gulkand. Serving families for over a century.
            </p>
            <Link href="/checkout" className="btn-primary">
              Shop Authentic Ghee
            </Link>
          </div>
          <div className={styles.heroImageWrapper}>
            <div className={styles.imageDecoration}></div>
            <Image
              src="/hero_ghee.png"
              alt="Golden bowl of pure cow ghee on a rustic wooden table"
              width={500}
              height={625}
              className={styles.heroImage}
              priority
            />
          </div>
        </div>
      </section>
      
      <section id="products" className={styles.products}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Heritage Collection</h2>
            <p className={styles.sectionSubtitle}>Crafted with time-honored methods from locally sourced cow milk.</p>
          </div>
          <div className={styles.productGrid}>
            <div className={styles.productCard}>
              <div className={styles.productIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <h3>Pure Cow Ghee</h3>
              <p>Rich, aromatic, and deeply nourishing. Made using the traditional Bilona method.</p>
              <Link href="/checkout" className={styles.productAction}>Order Now <span>→</span></Link>
            </div>
            <div className={styles.productCard}>
              <div className={styles.productIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/></svg>
              </div>
              <h3>Fresh Cow Butter</h3>
              <p>Creamy, unsalted, and churned daily for the absolute freshest taste.</p>
              <Link href="/checkout" className={styles.productAction}>Order Now <span>→</span></Link>
            </div>
            <div className={styles.productCard}>
              <div className={styles.productIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m12 18-3-3m0 0 3-3m-3 3h8"/></svg>
              </div>
              <h3>Specialty Gulkand</h3>
              <p>A sweet preserve of rose petals, dates, and dry fruits. Best paired with our ghee.</p>
              <Link href="/checkout" className={styles.productAction}>Order Now <span>→</span></Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
