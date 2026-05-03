"use client";

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FloatingCartButton from '@/components/FloatingCartButton';

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
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <FloatingCartButton />
      <Footer />
    </>
  );
}
