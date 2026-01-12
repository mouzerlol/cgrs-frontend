'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { NAVIGATION_ITEMS, MORE_NAVIGATION_ITEMS } from '@/lib/constants';

export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="hidden md:flex items-center gap-10">
      {NAVIGATION_ITEMS.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="nav-link text-bone text-[0.875rem]"
        >
          {item.name}
        </Link>
      ))}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="nav-link text-bone text-[0.875rem] flex items-center gap-2"
          aria-expanded={isDropdownOpen}
          aria-haspopup="menu"
        >
          More
          <Icon name="chevron-down" size="sm" />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-3 w-56 origin-top-right bg-forest/95 backdrop-blur-xl rounded-xl shadow-lg ring-1 ring-white/10 border border-white/10 py-2 z-50">
            {MORE_NAVIGATION_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 px-4 py-2.5 text-[0.875rem] transition-all duration-200 text-bone/90 font-medium hover:bg-white/10"
              >
                <Icon name={item.icon as IconName} size="sm" />
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link href="/login" className="nav-button">
        Resident Login
      </Link>
    </nav>
  );
}
