'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Icon, { IconName } from '@/components/ui/Icon';
import { ALL_NAV_ITEMS } from '@/lib/constants';

const NAV_LINK_CLASS =
  'text-sm font-medium tracking-wide uppercase relative px-2 py-1.5 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-[width] after:duration-[250ms] after:ease-out-custom hover:after:w-full text-bone whitespace-nowrap';

/**
 * Desktop top nav with responsive overflow: rightmost links fold into More when space is limited.
 * Main nav links use ALL CAPS; More dropdown uses title case with icons.
 */
export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [overflowCount, setOverflowCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const visibleItems = ALL_NAV_ITEMS.slice(0, ALL_NAV_ITEMS.length - overflowCount);
  const overflowItems = ALL_NAV_ITEMS.slice(ALL_NAV_ITEMS.length - overflowCount);
  const showMore = overflowItems.length > 0;

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateOverflow = () => {
      const measureContainers = container.querySelectorAll('[data-measure-count]');
      let bestCount = 0;

      measureContainers.forEach((el) => {
        const count = parseInt(el.getAttribute('data-measure-count') || '0', 10);
        const children = Array.from(el.children) as HTMLElement[];
        if (children.length > 0) {
          const firstTop = children[0].offsetTop;
          const lastTop = children[children.length - 1].offsetTop;
          // If first and last child are on the same line (within 10px diff), this count fits
          if (Math.abs(firstTop - lastTop) < 10) {
            if (count > bestCount) bestCount = count;
          }
        }
      });

      setOverflowCount(ALL_NAV_ITEMS.length - bestCount);
    };

    updateOverflow();
    const ro = new ResizeObserver(() => requestAnimationFrame(updateOverflow));
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  return (
    <nav
      ref={containerRef}
      className="hidden md:flex flex-1 items-center justify-end min-w-0 relative"
    >
      {/* Hidden measuring containers for every possible visible count */}
      {Array.from({ length: ALL_NAV_ITEMS.length + 1 }).map((_, i) => {
        const count = i; // 0 to ALL_NAV_ITEMS.length
        const showMoreBtn = count < ALL_NAV_ITEMS.length;
        return (
          <div
            key={`measure-${count}`}
            data-measure-count={count}
            aria-hidden="true"
            className="absolute top-0 right-0 w-full flex flex-wrap justify-end items-center gap-4 lg:gap-8 invisible pointer-events-none"
          >
            {ALL_NAV_ITEMS.slice(0, count).map((item) => (
              <span key={item.name} className={NAV_LINK_CLASS}>
                {item.name}
              </span>
            ))}
            {showMoreBtn && (
              <span className={`${NAV_LINK_CLASS} flex items-center gap-2 font-bold`}>
                More <Icon name="chevron-down" size="sm" />
              </span>
            )}
            <span className="text-sm font-medium tracking-wide uppercase py-2 px-4 border border-bone rounded shrink-0">
              Resident Login
            </span>
          </div>
        );
      })}

      {/* Actual visible navigation */}
      <div className="flex items-center gap-4 lg:gap-8 shrink-0 relative z-10">
        {visibleItems.map((item) => (
          <Link key={item.name} href={item.href} className={NAV_LINK_CLASS}>
            {item.name}
          </Link>
        ))}

        {showMore && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`${NAV_LINK_CLASS} flex items-center gap-2 font-bold`}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
            >
              More
              <Icon name="chevron-down" size="sm" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 origin-top-right bg-forest/95 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-white/10 border border-white/10 py-2 z-50">
                {overflowItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-2.5 text-[0.875rem] transition-all duration-200 text-bone/90 font-medium hover:bg-white/10 uppercase tracking-wide"
                  >
                    <Icon name={item.icon as IconName} size="sm" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <Link
          href="/login"
          className="text-sm font-medium tracking-wide uppercase py-2 px-4 border border-bone rounded transition-all duration-[250ms] ease-out-custom hover:bg-bone hover:text-forest max-md:py-3 max-md:min-h-[44px] shrink-0"
        >
          Resident Login
        </Link>
      </div>
    </nav>
  );
}
