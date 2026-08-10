import type { Metadata } from 'next';
import { Atkinson_Hyperlegible_Next, Fraunces, Manrope, JetBrains_Mono } from 'next/font/google';
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

/**
 * The micro face: for type set smaller than any of the three above can survive.
 *
 * Atkinson Hyperlegible was drawn by the Braille Institute for readers with low
 * vision, and the brief is exactly the one that matters at 9px — every letter
 * has to stay itself. The pairs that collapse first when type gets small are
 * `I l 1`, `O 0`, `c e o`, `b d p q`, and this face separates each of them
 * deliberately: a tailed `l`, a slashed zero, wide-open apertures on the round
 * letters, and asymmetric bowls so the mirrored pairs are not mirrors. It also
 * carries a tall x-height, which is what buys the extra millimetre of readable
 * letter at a size where cap height is all there is to work with.
 *
 * `Next` rather than the 2019 original: same design, redrawn as a variable
 * weight, so a 700 for micro labels costs the same request as the 400.
 *
 * Scoped by intent, not by page. Anything under about 10px should take this
 * face; anything above it belongs to Manrope, which is the site's voice.
 */
const atkinson = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-atkinson',
});

export const metadata: Metadata = {
  title: 'CGRS - Coronation Gardens Residents Society',
  description:
    'Official website for the Coronation Gardens Residents Society in Mangere Bridge, Auckland. Find community news, event updates, and committee information.',
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
    <html lang="en" data-scroll-behavior="smooth" className={`${fraunces.variable} ${manrope.variable} ${jetbrainsMono.variable} ${atkinson.variable}`}>
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
