import Link from "next/link";
import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import ProductSection from "@/components/ProductSection";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allProducts = await prisma.product.findMany();

  // Group products into product groups with plain serializable data (no JSX)
  const productGroups = [
    {
      name: "Pure Cow Ghee",
      description: "Rich, aromatic, and deeply nourishing. Made using the traditional Bilona method.",
      variants: allProducts.filter(p => p.name === "Pure Cow Ghee").map(p => ({
        id: p.id,
        unitSize: p.unitSize,
        price: p.price,
        isAvailable: p.isAvailable
      }))
    },
    {
      name: "Fresh Cow Butter",
      description: "Creamy, unsalted, and churned daily for the absolute freshest taste.",
      variants: allProducts.filter(p => p.name === "Fresh Cow Butter").map(p => ({
        id: p.id,
        unitSize: p.unitSize,
        price: p.price,
        isAvailable: p.isAvailable
      }))
    },
    {
      name: "Special Gulkand",
      description: "A sweet preserve of rose petals, dates, and dry fruits. Best paired with our ghee.",
      variants: allProducts.filter(p => p.name === "Special Gulkand").map(p => ({
        id: p.id,
        unitSize: p.unitSize,
        price: p.price,
        isAvailable: p.isAvailable
      }))
    }
  ];

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
        </div>
      </section>

      <section id="products" className={styles.products}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Our Heritage Collection</h2>
            <p className={styles.sectionSubtitle}>Delivery restricted to Mysuru Pincodes only. Mandatory ₹30 delivery charge applies.</p>
          </div>
          <ProductSection productGroups={productGroups} />
        </div>
      </section>
    </div>
  );
}
