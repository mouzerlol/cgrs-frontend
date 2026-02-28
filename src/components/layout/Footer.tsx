'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import SocialMediaTray from './SocialMediaTray';

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
  { name: 'Contact the Committee', href: '/contact' },
  { name: 'Community Guidelines', href: '/guidelines' },
  { name: 'Parking', href: '/guidelines#parking' },
  { name: 'Pet Policy', href: '/guidelines#pets' },
];

const SUPPORT_LINKS = [
  { name: 'Report an Issue', href: '/management-request' },
  { name: 'Help FAQ', href: '/guidelines#faq' },
  { name: 'Community Rules', href: '/guidelines' },
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Contact Us', href: '/contact' },
];

/**
 * Footer component with forest background and signal texture.
 * Four-column grid with brand, quick links, support, and social media.
 */
export default function Footer() {
  return (
    <footer className="bg-forest text-bone py-[3.75rem] bg-[image:var(--texture-grain)] texture-signal" id="contact">
      <div className="container px-0">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-lg md:gap-xl mb-xl">
          {/* Brand Column with Map - min-w-0 prevents Leaflet overflow into adjacent columns */}
          <div className="w-full min-w-0 md:col-span-1 flex flex-col">
            <h3 className="font-display text-[clamp(2rem,4vw,3rem)] mb-sm tracking-tight leading-[0.95] text-bone">
              <span className="block whitespace-nowrap">CORONATION</span>
              <span className="block whitespace-nowrap tracking-wider">GARDENS</span>
            </h3>
            <div className="flex-1 flex items-start min-h-[160px] w-full min-w-0 overflow-hidden">
              <Link href="/map" aria-label="View interactive map" className="footer-map-link block min-w-0 w-full">
                <FooterMap className="footer-map-interactive w-full" />
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="pt-4 min-w-0 md:pl-5">
            <h4 className="font-body text-xs mb-sm text-terracotta font-semibold tracking-[0.15em] uppercase">Quick Links</h4>
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

          {/* Support Column */}
          <div className="pt-4 min-w-0 md:pl-5">
            <h4 className="font-body text-xs mb-sm text-terracotta font-semibold tracking-[0.15em] uppercase">Support</h4>
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

          {/* Social Media Column */}
          <div className="pt-4 min-w-0 md:pl-5">
            <SocialMediaTray />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/10 pt-8 flex flex-col items-center gap-3 md:flex-row md:justify-between">
          <p className="text-[0.8125rem] opacity-50">
            &copy; {new Date().getFullYear()} Coronation Gardens. All rights reserved.
          </p>
          <p className="text-[0.8125rem] opacity-50">
            Designed with intention. Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer" className="hover:text-terracotta transition-colors">CARTO</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
