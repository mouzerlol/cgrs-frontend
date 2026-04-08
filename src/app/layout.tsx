import type { Metadata } from 'next';
import { Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-appearance';
import { getAfterSignOutUrl } from '@/lib/app-url';
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

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'CGRS - Coronation Gardens Residents Society',
  description: 'Official website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland',
  metadataBase: new URL('https://www.cgrs.co.nz'),
  alternates: {
    canonical: './',
  },
  keywords: ['Coronation Gardens', 'Residents Society', 'Mangere Bridge', 'Auckland', 'Community'],
  authors: [{ name: 'CGRS Development Team' }],
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
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body>
        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          afterSignOutUrl={getAfterSignOutUrl()}
          appearance={clerkAppearance}
        >
          <Providers>
            {children}
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}
