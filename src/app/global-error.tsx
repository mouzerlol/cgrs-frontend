'use client';

/**
 * Global error boundary. Catches errors in the root layout (e.g. ClerkProvider, Providers).
 * Replaces the entire app when active; must define its own html/body.
 */

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#f5f2ed', color: '#1a2e1a' }}>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ color: 'rgba(26, 46, 26, 0.7)', fontSize: 14, marginBottom: 24 }}>
            An unexpected error occurred. Try refreshing the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: '10px 20px',
              borderRadius: 8,
              background: '#1a2e1a',
              color: '#f5f2ed',
              fontWeight: 500,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
