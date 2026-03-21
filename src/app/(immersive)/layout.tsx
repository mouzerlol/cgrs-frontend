import Header from '@/components/layout/Header';

/**
 * Layout for immersive full-screen pages (e.g. work management).
 * Fixed header; main is offset so content clears it. Breadcrumbs render under
 * WorkManagementNavBar (not here).
 */
export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-bone overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden pt-[72px]">
        {children}
      </main>
    </div>
  );
}
