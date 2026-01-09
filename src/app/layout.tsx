import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/layout/Layout';
import { Providers } from '@/lib/providers';

export const metadata: Metadata = {
  title: 'CGRS - Coronation Gardens Residents Society',
  description: 'Official website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland',
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
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
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
