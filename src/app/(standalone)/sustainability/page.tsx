import type { Metadata } from 'next';
import Link from 'next/link';
import RibbonHero from '@/components/sustainability/RibbonHero';
import ClosingTimesList from '@/components/sustainability/ClosingTimesList';

/**
 * /sustainability — the explainer page linked from the cold-start banner.
 *
 * Fully static, server-rendered, with zero dependency on the cgrs-api. The
 * page MUST render correctly when the API is cold, slow, or unreachable —
 * that is the entire point of the page existing.
 *
 * See openspec/changes/cold-start-status-banner/specs/sustainability-page/spec.md
 */

export const metadata: Metadata = {
  title: 'When we sleep, and why we chose to.',
  description:
    'CGRS closes its server overnight, like the library and the dairy. Our server runs in Sydney, where the grid still leans on coal. Here is why we keep it switched off when no-one needs it.',
  openGraph: {
    title: 'When we sleep, and why we chose to.',
    description:
      'CGRS closes its server overnight, like the library and the dairy. Our server runs in Sydney, where the grid still leans on coal. Here is why we keep it switched off when no-one needs it.',
    type: 'article',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      {/* Lightweight standalone chrome (no API, no auth) — mirrors the petition layout pattern. */}
      <header className="w-full bg-forest text-bone py-sm px-md md:px-lg flex items-center">
        <Link
          href="/"
          className="font-display text-base font-medium tracking-wide leading-none flex items-center shrink-0"
        >
          <span className="flex flex-col leading-tight">
            <span className="block whitespace-nowrap">CORONATION</span>
            <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
          </span>
        </Link>
      </header>

      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-md md:px-lg py-2xl">
          {/* Eyebrow + masthead pair (DESIGN.md eyebrow-and-title rule). */}
          <p className="text-xs font-body font-semibold uppercase tracking-[0.15em] text-terracotta mb-sm">
            A note from CGRS
          </p>
          <h1 className="font-display text-display text-forest leading-[1.05] tracking-tight mb-xl">
            When we sleep, and why we chose to.
          </h1>

          {/* 24-hour ribbon: visualises the awake / asleep windows + current time marker. */}
          <RibbonHero />

          {/* Almanac list: framing CGRS as one neighbourhood institution among many. */}
          <div className="mt-2xl">
            <ClosingTimesList />
          </div>

          {/* "The honest part." section. */}
          <section className="mt-2xl border-t border-sage/30 pt-xl" aria-labelledby="honest-heading">
            <h2
              id="honest-heading"
              className="font-display text-heading-md text-forest mb-md"
            >
              The honest part.
            </h2>

            <div className="font-body text-forest space-y-md max-w-prose">
              <p>
                Our server runs in Sydney, where the grid still leans on coal. We keep it
                switched off when no-one needs it. That is about seven hours of compute we
                do not burn, every night.
              </p>
              <p>
                This also keeps our hosting bill small enough that a community society can
                afford to run a real website. We mention this because being honest about
                the trade-off matters more to us than the pitch.
              </p>
            </div>
          </section>

          {/* Closing line: speaks directly to the visitor who arrived via the cold-start banner. */}
          <section className="mt-2xl border-t border-sage/30 pt-xl">
            <p className="font-display text-heading-md text-forest leading-snug max-w-prose">
              So if you arrived between 11 pm and 6 am and waited ten seconds for the page
              to wake up: that is why. Thanks for waiting.
            </p>

            <div className="mt-lg">
              <Link
                href="/"
                className="inline-block text-sm font-body font-medium tracking-wide uppercase py-2 px-4 border border-forest rounded transition-colors hover:bg-forest hover:text-bone"
              >
                Back to the home page
              </Link>
            </div>
          </section>
        </article>
      </main>

      <footer className="border-t border-sage/30 py-lg px-md md:px-lg text-xs font-body text-forest/60 text-center">
        Coronation Gardens Residents Society. Mangere Bridge, Auckland.
      </footer>
    </div>
  );
}
