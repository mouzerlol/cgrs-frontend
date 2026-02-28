import Header from '@/components/layout/Header';

/**
 * Layout for immersive full-screen pages (e.g. work management).
 * Includes master Header with top padding so content sits below it.
 */
export default function ImmersiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh flex flex-col bg-bone overflow-hidden">
      <Header />
      <main className="pt-[72px] flex-1 flex flex-col min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
