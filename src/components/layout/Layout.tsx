import SiteChromeBar from '@/components/layout/SiteChromeBar';
import Footer from '@/components/layout/Footer';
import FooterCallToAction from '@/components/sections/FooterCallToAction';
import { ScrollToTop } from '@/components/layout/ScrollToTop';
import { AppToaster } from '@/components/ui/AppToaster';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper with skip link for accessibility.
 * Fixed header with scroll-aware behavior.
 * Site breadcrumbs render below each page hero via PageHeader, profile/article/event shells, etc. (`@/components/ui/breadcrumb`).
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="absolute -top-[100px] left-0 bg-forest text-bone p-4 z-[10000] transition-[top] duration-300 focus:top-0">
        Skip to main content
      </a>
      <SiteChromeBar />
      <ScrollToTop />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <FooterCallToAction />
      <Footer />
      <AppToaster />
    </div>
  );
}
