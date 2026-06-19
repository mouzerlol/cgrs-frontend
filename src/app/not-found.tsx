import Link from 'next/link';

/**
 * Root App Router not-found. Required at the app root: without it, Next falls back to
 * the pages-router /404 + /_error, which import the AMP <Html> document and break the
 * production build's static export ("<Html> should not be imported outside of
 * pages/_document"). Kept dependency-light so it renders during static generation.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-bone px-4">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">404</p>
        <h1 className="mt-2 font-display text-3xl text-forest">Page not found</h1>
        <p className="mt-3 text-sm text-forest/60">
          We couldn&apos;t find that page. It may have moved, or the link was mistyped.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-terracotta px-5 py-2.5 text-sm font-semibold text-bone transition-colors hover:bg-terracotta-dark"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
