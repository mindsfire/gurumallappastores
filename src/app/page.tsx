import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { PrismaClient } from '@prisma/client';
import ProductCard from "@/components/ProductCard";

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic'; // Ensure we fetch fresh products on load

export default async function Home() {
  const allProducts = await prisma.product.findMany();

  // Group products by name
  const gheeVariants = allProducts.filter(p => p.name === 'Pure Cow Ghee').map(p => ({ id: p.id, unitSize: p.unitSize, price: p.price, isAvailable: p.isAvailable }));
  const butterVariants = allProducts.filter(p => p.name === 'Fresh Cow Butter').map(p => ({ id: p.id, unitSize: p.unitSize, price: p.price, isAvailable: p.isAvailable }));
  const gulkandVariants = allProducts.filter(p => p.name === 'Special Gulkand' || p.name.includes('Gulkand')).map(p => ({ id: p.id, unitSize: p.unitSize, price: p.price, isAvailable: p.isAvailable }));

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
            <Link href="#products" className="btn-primary">
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
            <p className={styles.sectionSubtitle}>Delivery restricted to Mysuru Pincodes only. Mandatory ₹30 delivery charge applies.</p>
          </div>
          <div className={styles.productGrid}>
            
            <ProductCard 
              name="Pure Cow Ghee"
              description="Rich, aromatic, and deeply nourishing. Made using the traditional Bilona method."
              iconPath={<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>}
              variants={gheeVariants}
            />

            <ProductCard 
              name="Fresh Cow Butter"
              description="Creamy, unsalted, and churned daily for the absolute freshest taste."
              iconPath={<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>}
              variants={butterVariants}
            />

            <ProductCard 
              name="Specialty Gulkand"
              description="A sweet preserve of rose petals, dates, and dry fruits. Best paired with our ghee."
              iconPath={<><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m12 18-3-3m0 0 3-3m-3 3h8"/></>}
              variants={gulkandVariants.length > 0 ? gulkandVariants : [{ id: "placeholder", unitSize: "500g Pack", price: 160, isAvailable: false }]}
            />

          </div>
        </div>
      </section>
    </div>
  );
}
