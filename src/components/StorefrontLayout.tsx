"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCartButton from '@/components/FloatingCartButton';

const ORDERING_ENABLED = process.env.NEXT_PUBLIC_ORDERING_ENABLED !== 'false';
const STORE_PHONE = '9742942911';

function OrderingClosedBanner() {
  return (
    <div style={{
      background: '#fef3c7', color: '#78350f', textAlign: 'center',
      padding: '0.6rem 1rem', fontSize: '0.9rem', fontWeight: 500
    }}>
      Online orders are blocked, please call the store at{' '}
      <a href={`tel:${STORE_PHONE}`} style={{ color: '#78350f', textDecoration: 'underline' }}>
        {STORE_PHONE}
      </a>{' '}
      to order.
    </div>
  );
}

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    return (
      <>
        <main style={{ flex: 1 }}>{children}</main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {!ORDERING_ENABLED && <OrderingClosedBanner />}
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <FloatingCartButton />
      <Footer />
    </>
  );
}
