'use client';

import { useState, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import Icon from '@/components/ui/Icon';
import Navigation from './Navigation';
import { NAVIGATION_ITEMS, MORE_NAVIGATION_ITEMS } from '@/lib/constants';

const MANAGEMENT_PATHS = ['/work-management', '/management-request'];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isManagementPage = MANAGEMENT_PATHS.some((p) => pathname === p || (pathname ?? '').startsWith(`${p}/`));

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const headerClassName = isManagementPage
    ? 'fixed top-0 left-0 w-full py-sm px-md md:px-lg flex justify-between items-center z-[1000] bg-forest border-b border-white/10 text-bone'
    : 'fixed top-0 left-0 w-full py-sm px-md md:px-lg flex justify-between items-center z-[1000] bg-forest/85 backdrop-blur-[12px] border-b border-white/10 text-bone';

  return (
    <header className={headerClassName}>
      {/* Logo */}
      <Link href="/" className="font-display text-base font-medium tracking-wide leading-none flex items-center shrink-0 pr-8 md:pr-16 lg:pr-24" onClick={closeMenu}>
        <span className="flex flex-col leading-tight">
          <span className="block whitespace-nowrap">CORONATION</span>
          <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
        </span>
      </Link>

      {/* Desktop Navigation */}
      <Navigation />

      {/* Mobile Nav Toggle */}
      <button
        className="md:hidden z-[1001] bg-transparent border-none cursor-pointer p-3"
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
                <DialogPanel className="w-[85%] max-w-sm bg-forest/[0.98] backdrop-blur-xl flex flex-col pt-[min(20vh,6rem)] px-8 pb-8 min-h-full">
                  
                  {/* Mobile: Logo */}
                  <Link href="/" onClick={closeMenu} className="mb-10">
                    <span className="flex flex-col text-bone">
                      <span className="block whitespace-nowrap font-display text-3xl">CORONATION</span>
                      <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
                      <span className="text-xs tracking-widest text-bone/50 mt-1">Residents Society</span>
                    </span>
                  </Link>

                  {/* Mobile: Navigation Items - ALL CAPS for consistency */}
                  <nav className="space-y-3">
                    {NAVIGATION_ITEMS.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-5 py-4 rounded-lg text-bone hover:bg-sage-light hover:text-forest transition-colors uppercase tracking-wide"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </nav>

                  <hr className="border-bone/10 my-2" />

                  {/* Mobile: More Section - ALL CAPS for consistency */}
                  <div className="mt-8 mb-8">
                    <h3 className="text-xs font-medium uppercase tracking-wider text-bone/50 mb-4">
                      More
                    </h3>
                    <nav className="space-y-3">
                      {MORE_NAVIGATION_ITEMS.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMenu}
                          className="flex items-center gap-3 px-5 py-4 rounded-lg text-bone hover:bg-sage-light hover:text-forest transition-colors uppercase tracking-wide"
                        >
                          <Icon name={item.icon as import('@/components/ui/Icon').IconName} size="md" />
                          <span>{item.name}</span>
                        </Link>
                      ))}
                    </nav>
                  </div>

                  <hr className="border-bone/10" />

                  {/* Mobile: Login Button */}
                  <button
                    onClick={closeMenu}
                    className="mt-auto mb-8 w-full text-sm font-medium tracking-wide uppercase py-2 px-4 border border-bone rounded transition-all duration-[250ms] ease-out-custom hover:bg-bone hover:text-forest max-md:py-3 max-md:min-h-[44px]"
                  >
                    Resident Login
                  </button>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
