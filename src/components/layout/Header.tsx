'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { NAVIGATION_ITEMS } from '@/lib/constants';

/**
 * Navigation header with glassmorphism backdrop.
 * Fixed position, mobile hamburger menu with slide-in drawer.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleSmoothScroll = useCallback((e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMenu();
      }
    }
  }, [closeMenu]);

  return (
    <header className="nav">
      {/* Logo */}
      <Link href="/" className="nav-logo" onClick={closeMenu}>
        <span className="flex flex-col">
          <span className="block whitespace-nowrap">CORONATION</span>
          <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
        </span>
      </Link>

      {/* Mobile Nav Toggle */}
      <button
        className="md:hidden z-[1001] bg-transparent border-none cursor-pointer p-2"
        aria-label="Toggle navigation"
        aria-expanded={isMenuOpen}
        onClick={toggleMenu}
      >
        <span
          className={`block w-6 h-0.5 bg-bone relative transition-transform duration-300 ${
            isMenuOpen ? 'rotate-45 translate-y-[10px]' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-bone mt-2 transition-opacity duration-300 ${
            isMenuOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`block w-6 h-0.5 bg-bone mt-2 transition-transform duration-300 ${
            isMenuOpen ? '-rotate-45 -translate-y-[10px]' : ''
          }`}
        />
      </button>

      {/* Navigation Links */}
      <nav
        className={`
          fixed md:relative inset-0 md:inset-auto left-[30%] md:left-auto
          bg-forest/[0.98] md:bg-transparent backdrop-blur-xl md:backdrop-blur-none
          flex flex-col md:flex-row items-start md:items-center
          pt-[min(20vh,6rem)] md:pt-0 px-8 md:px-0
          gap-8 md:gap-10
          transition-transform duration-300 ease-out
          z-[1000]
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}
        data-visible={isMenuOpen}
      >
        {NAVIGATION_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="nav-link text-bone text-[1.25rem] md:text-[0.875rem]"
            onClick={(e) => {
              if (item.href.startsWith('#')) {
                handleSmoothScroll(e, item.href);
              } else {
                closeMenu();
              }
            }}
          >
            {item.name}
          </Link>
        ))}
        <Link
          href="/login"
          className="nav-button mt-4 md:mt-0 w-full md:w-auto text-center"
          onClick={closeMenu}
        >
          Resident Login
        </Link>
      </nav>
    </header>
  );
}
