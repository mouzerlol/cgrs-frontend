import Header from '@/components/layout/Header';
import BetaBanner from '@/components/layout/BetaBanner';

/**
 * Layout for immersive full-screen pages (e.g. work management).
 * Fixed header; main is offset so content clears it. Breadcrumbs render under
 * WorkManagementNavBar (not here). Top padding absorbs the optional beta
 * banner via `--site-banner-height` (defaults to 0).
 */
export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-bone overflow-hidden">
      <Header />
      <BetaBanner />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pt-[calc(72px_+_var(--site-banner-height))]">
        {children}
      </main>
    </div>
  );
}
