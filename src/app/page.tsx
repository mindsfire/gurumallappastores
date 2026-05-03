import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";
import { prisma } from "@/lib/prisma";
import ProductSection from "@/components/ProductSection";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const allProducts = await prisma.product.findMany({
    orderBy: [{ name: 'asc' }, { price: 'asc' }]
  });

  // Dynamically group products by name — any new product name added via admin will appear automatically
  const productNames = [...new Set(allProducts.map(p => p.name))];

  const getImageForProduct = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('ghee')) return '/products/ghee.png';
    if (n.includes('butter')) return '/products/butter.png';
    if (n.includes('gulkand')) return '/products/gulkand.png';
    return null;
  };

  const productGroups = productNames.map(name => ({
    name,
    description: allProducts.find(p => p.name === name)?.description || "",
    imageUrl: getImageForProduct(name),
    variants: allProducts.filter(p => p.name === name).map(p => ({
      id: p.id,
      unitSize: p.unitSize,
      price: p.price,
      isAvailable: p.isAvailable
    }))
  }));

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
              alt="Gurumallappa Stores storefront in Mysore"
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
          <ProductSection productGroups={productGroups} />
        </div>
      </section>
    </div>
  );
}
