import Link from 'next/link';
import Image from 'next/image';

const QUICK_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'News & Updates', href: '/news' },
  { name: 'Contact the Committee', href: '/contact' },
  { name: 'Community Guidelines', href: '/guidelines' },
  { name: 'Parking', href: '/guidelines#parking' },
  { name: 'Pet Policy', href: '/guidelines#pets' },
];

const SUPPORT_LINKS = [
  { name: 'Report an Issue', href: '/contact?subject=issue' },
  { name: 'Help FAQ', href: '/guidelines#faq' },
  { name: 'Community Rules', href: '/guidelines' },
  { name: 'Contact Us', href: '/contact' },
];

/**
 * Footer component with forest background and grain texture.
 * Four-column grid with brand, quick links, support, and map.
 */
export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-brand flex flex-col">
            <h3>
              <span className="block whitespace-nowrap">CORONATION</span>
              <span className="block whitespace-nowrap tracking-wider">GARDENS</span>
            </h3>
            <p className="opacity-70 max-w-[280px] leading-relaxed text-sm mb-4">
              Māngere Bridge<br />
              Auckland 2022<br />
              New Zealand
            </p>
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

          {/* Map Column */}
          <div className="footer-column pt-4">
            <h4>Map</h4>
            <div className="mt-1">
              <div className="relative w-full h-[120px] rounded-lg overflow-hidden mb-3">
                <Image
                  src="/images/location-map.png"
                  alt="Location map of Coronation Gardens development"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <a
                href="https://www.google.com/maps/search/M%C4%81ngere+Bridge+Auckland"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs uppercase tracking-wider text-terracotta hover:underline"
              >

              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <p className="text-[0.8125rem] opacity-50">
            &copy; {new Date().getFullYear()} Coronation Gardens. All rights reserved.
          </p>
          <p className="text-[0.8125rem] opacity-50">
            Designed with intention.
          </p>
        </div>
      </div>
    </footer>
  );
}
