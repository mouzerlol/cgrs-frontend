import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { Providers } from '@/lib/providers';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
  axes: ['opsz'],
});

const manrope = Manrope({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'CGRS - Coronation Gardens Residents Society',
  description: 'Official website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland',
  metadataBase: new URL('https://coronationgardens.co.nz'),
  alternates: {
    canonical: './',
  },
  keywords: ['Coronation Gardens', 'Residents Society', 'Mangere Bridge', 'Auckland', 'Community'],
  authors: [{ name: 'CGRS Development Team' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' }
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'CGRS - Coronation Gardens Residents Society',
    description: 'Official website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland',
    type: 'website',
    locale: 'en_NZ',
    images: [
      {
        url: '/images/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Coronation Gardens Residents Society - Mangere Bridge, Auckland',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}
