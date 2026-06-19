'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import SocialMediaTray from './SocialMediaTray';
import Wordmark from './Wordmark';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';

const FooterMap = dynamic(() => import('./FooterMap'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: '100%',
        height: '160px',
        borderRadius: '8px',
        background: '#2C3E2D',
      }}
    />
  ),
});

const QUICK_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Parking', href: '/guidelines#parking' },
  { name: 'Pet Policy', href: '/guidelines#pets' },
];

const SUPPORT_LINKS = [
  { name: 'Community Rules', href: '/guidelines' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Why we sleep', href: '/sustainability' },
  { name: 'Contact Us', href: '/contact' },
];

/**
 * Footer component with forest background and signal texture.
 * Four-column grid with brand, quick links, support, and social media.
 * Quick Links and Support sections can be hidden via feature flags.
 */
export default function Footer() {
  const showQuickLinks = useFeatureFlag(FEATURE_FLAG_IDS.FOOTER_QUICK_LINKS);
  const showSupport = useFeatureFlag(FEATURE_FLAG_IDS.FOOTER_SUPPORT);

  return (
    <footer className="bg-forest text-bone py-[3.75rem] bg-[image:var(--texture-grain)] texture-signal" id="contact">
      <div className="container px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg md:gap-xl mb-xl">
          {/* Brand Column with Map - min-w-0 prevents Leaflet overflow into adjacent columns */}
          <div className="w-full min-w-0 md:col-span-1 flex flex-col">
            <Wordmark className="text-[clamp(2rem,4vw,3rem)] mb-sm" />

            <div className="flex-1 flex items-start min-h-[160px] w-full min-w-0 overflow-hidden">
              <Link href="/map" aria-label="View interactive map" className="footer-map-link block min-w-0 w-full">
                <FooterMap className="footer-map-interactive w-full" />
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          {showQuickLinks && (
            <div className="pt-4 min-w-0 md:pl-5">
              <SectionLabel as="h4" className="mb-sm">Quick Links</SectionLabel>
              <ul className="flex flex-col gap-2 list-none">
                {QUICK_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm opacity-70 transition-opacity duration-300 inline-block py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-[width] after:duration-300 hover:opacity-100 hover:after:w-full">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support Column */}
          {showSupport && (
            <div className="pt-4 min-w-0 md:pl-5">
              <SectionLabel as="h4" className="mb-sm">Support</SectionLabel>
              <ul className="flex flex-col gap-2 list-none">
                {SUPPORT_LINKS.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm opacity-70 transition-opacity duration-300 inline-block py-0.5 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-[width] after:duration-300 hover:opacity-100 hover:after:w-full">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Social Media Column */}
          <div className="pt-4 min-w-0 md:pl-5">
            <SocialMediaTray />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex justify-center">
          <p className="text-[0.8125rem] opacity-50">
            &copy; {new Date().getFullYear()} Coronation Gardens. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
