'use client';

/**
 * Root segment error boundary. Catches runtime errors and shows fallback UI.
 * Required by Next.js App Router for proper error handling.
 */

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bone px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-medium text-forest mb-2">Something went wrong</h1>
        <p className="text-forest/70 text-sm mb-6">
          An unexpected error occurred. You can try again or return home.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="px-4 py-2 rounded-lg bg-forest text-bone font-medium text-sm hover:bg-forest/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-forest text-forest font-medium text-sm hover:bg-forest/10 transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
