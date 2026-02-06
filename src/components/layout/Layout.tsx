import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FooterNewsletter from '@/components/sections/FooterNewsletter';
import { ScrollToTop } from '@/components/layout/ScrollToTop';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout wrapper with skip link for accessibility.
 * Fixed header with scroll-aware behavior.
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bone">
      {/* Skip Link for Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <ScrollToTop />
      <main id="main-content" className="flex-grow">
        {children}
      </main>
      <FooterNewsletter />
      <Footer />
    </div>
  );
}
