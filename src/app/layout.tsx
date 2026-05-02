import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Gurumallappa Stores | Authentic Pure Cow Ghee & Butter',
  description: 'A legacy of purity since 1880. Buy authentic pure cow ghee, butter, and gulkand from Mysore.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>{children}</main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
