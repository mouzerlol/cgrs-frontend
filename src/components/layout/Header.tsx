'use client';

import { useState, useCallback, Fragment } from 'react';
import Link from 'next/link';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { NAVIGATION_ITEMS } from '@/lib/constants';

/**
 * Navigation header with glassmorphism backdrop.
 * Fixed position, mobile hamburger menu with Headless UI Dialog.
 */
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        onClick={() => setIsMenuOpen(true)}
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

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-10">
        {NAVIGATION_ITEMS.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="nav-link text-bone text-[0.875rem]"
            onClick={(e) => {
              if (item.href.startsWith('#')) {
                handleSmoothScroll(e, item.href);
              }
            }}
          >
            {item.name}
          </Link>
        ))}
        <Link href="/login" className="nav-button">
          Resident Login
        </Link>
      </nav>

      {/* Mobile Menu Dialog */}
      <Transition show={isMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[1000]" onClose={closeMenu}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </TransitionChild>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full justify-end">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel className="w-[70%] max-w-xs bg-forest/[0.98] backdrop-blur-xl flex flex-col pt-[min(20vh,6rem)] px-8 min-h-full">
                  {NAVIGATION_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="nav-link text-bone text-[1.25rem] py-3"
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
                    className="nav-button mt-6 w-full text-center"
                    onClick={closeMenu}
                  >
                    Resident Login
                  </Link>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
