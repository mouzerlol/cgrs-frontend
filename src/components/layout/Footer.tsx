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
    <footer className="footer texture-signal" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column with Map */}
          <div className="footer-brand flex flex-col">
            <h3>
              <span className="block whitespace-nowrap">CORONATION</span>
              <span className="block whitespace-nowrap tracking-wider">GARDENS</span>
            </h3>
            <div className="footer-map-container">
              <Link href="/map" aria-label="View interactive map" className="footer-map-link">
                <FooterMap className="footer-map-interactive w-full" />
              </Link>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-column pt-4">
            <h4>Quick Links</h4>
            <ul className="flex flex-col gap-2 list-none">
              {QUICK_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Column */}
          <div className="footer-column pt-4">
            <h4>Support</h4>
            <ul className="flex flex-col gap-2 list-none">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="footer-link">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Column */}
          <div className="footer-column pt-4">
            <SocialMediaTray />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
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
