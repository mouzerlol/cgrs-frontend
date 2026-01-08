'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStaggeredReveal, useFadeUpObserver } from '@/hooks/useIntersectionObserver';
import { UTILITY_DOCK_ITEMS } from '@/lib/constants';

/**
 * Floating utility dock with icon links.
 * Overlaps hero section with elevated shadow.
 */
export default function UtilityDock() {
  const setRef = useStaggeredReveal(200, 100);
  useFadeUpObserver();

  return (
    <div className="container">
      <section className="utility-dock fade-up">
        <div className="utility-grid">
          {UTILITY_DOCK_ITEMS.map((item, index) => (
            <Link
              key={item.name}
              href={item.href}
              className="utility-item"
              aria-label={item.name}
              ref={setRef(index)}
            >
              <Image
                src={item.icon}
                alt={item.name}
                width={110}
                height={110}
                className="utility-icon"
                loading="lazy"
              />
              <span
                className="utility-label"
                dangerouslySetInnerHTML={{ __html: item.label.replace('\n', '<br>') }}
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
