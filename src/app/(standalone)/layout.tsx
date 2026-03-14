/**
 * Standalone layout for error pages that bypasses the main Layout.
 * This prevents infinite loops when auth errors redirect to error pages
 * (e.g., /no-access) since those pages don't trigger additional API calls.
 */

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      <main id="main-content" className="flex-grow">
        {children}
      </main>
    </div>
  );
}
