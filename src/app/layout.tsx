import type { Metadata } from 'next';
import './globals.css';
import StorefrontLayout from '@/components/StorefrontLayout';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'Gurumallappa Stores | Authentic Pure Cow Ghee & Butter',
  description: 'A legacy of purity since 1880. Buy authentic pure cow ghee, butter, and gulkand from Mysore.',
  openGraph: {
    title: 'Gurumallappa Stores | Authentic Pure Cow Ghee & Butter',
    description: 'A legacy of purity since 1880. Buy authentic pure cow ghee, butter, and gulkand from Mysore.',
    images: [
      {
        url: '/hero_ghee.png',
        width: 800,
        height: 1000,
        alt: 'Gurumallappa Stores Storefront',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <CartProvider>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <StorefrontLayout>{children}</StorefrontLayout>
          </div>
        </CartProvider>
      </body>
    </html>
  );
}
