'use client';

import { useState, useEffect, Fragment, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { SignInButton, useAuth, useUser, UserAvatar } from '@clerk/nextjs';
import { SignOutButton } from '@clerk/nextjs';
import { Settings, LogOut, X } from 'lucide-react';
import Icon from '@/components/ui/Icon';
import Navigation from './Navigation';
import Wordmark from './Wordmark';
import { useNavItems } from '@/hooks/useNavItems';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCommunity } from '@/hooks/useCommunity';
import { formatRole, canAccessManagement } from '@/lib/auth';
import { useEasterEggContext } from './WindyTextContext';

const MANAGEMENT_PATHS = ['/admin', '/management-request'];

interface HeaderProps {
  /** Reports mobile-menu open/close up to SiteChrome so it can pin the chrome shown. */
  onMenuOpenChange?: (open: boolean) => void;
}

export default function Header({ onMenuOpenChange }: HeaderProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isManagementPage = MANAGEMENT_PATHS.some((p) => pathname === p || (pathname ?? '').startsWith(`${p}/`));
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  /** Remember last confirmed signed-in state to avoid flashing login button during Clerk revalidation. */
  const lastSignedInRef = useRef(isSignedIn);
  if (isLoaded) lastSignedInRef.current = isSignedIn;
  const lastSignedIn = lastSignedInRef.current;
  const { data: currentUser } = useCurrentUser();
  const { data: community } = useCommunity();
  const { data: navData } = useNavItems();
  const { getToken } = useAuth();
  const { trigger: triggerEasterEgg } = useEasterEggContext();

  const role = currentUser?.membership?.role;
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canSeeSystemSettings = canAccessManagement(role, isSuperadmin);

  const [afterSignOutUrl, setAfterSignOutUrl] = useState('/');

  useEffect(() => {
    const o = window.location.origin;
    setAfterSignOutUrl(`${o}/login/?redirect_url=${encodeURIComponent(`${o}/`)}`);
  }, []);

  // Report menu state up so SiteChrome keeps the chrome shown while the menu is open.
  useEffect(() => {
    onMenuOpenChange?.(isMenuOpen);
  }, [isMenuOpen, onMenuOpenChange]);

  // Server-filtered navigation items for mobile menu
  const mobileNavItems = navData?.items ?? [];
  const mobileMainNav = mobileNavItems.slice(0, 5);
  const mobileMoreNav = mobileNavItems.slice(5);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    // Trigger animation Easter egg when clicking logo on homepage
    if (pathname === '/') {
      e.preventDefault();
      triggerEasterEgg();
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Fixed positioning lives on the SiteChrome wrapper; the header is an in-flow child.
  // `relative z-10` keeps the header (and its dropdowns) stacked above the banner sibling —
  // the header's backdrop-blur creates a stacking context that would otherwise trap z-50
  // popovers below the later-painted banner.
  const headerClassName = isManagementPage
    ? 'relative z-10 w-full py-sm px-md md:px-lg flex justify-between items-center bg-forest border-b border-white/10 text-bone'
    : 'relative z-10 w-full py-sm px-md md:px-lg flex justify-between items-center bg-forest/85 backdrop-blur-[12px] border-b border-white/10 text-bone';

  return (
    <header data-site-header className={headerClassName}>
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center shrink-0 pr-8 md:pr-16 lg:pr-24"
        onClick={(e) => {
          closeMenu();
          handleLogoClick(e);
        }}
      >
        <Wordmark className="text-lg md:text-base" />
      </Link>

      {/* Desktop Navigation (includes Resident Login on md+) */}
      <Navigation />

      {/* Mobile: Resident Login visible in header so it's discoverable without opening menu */}
      <div className="md:hidden flex items-center gap-2 shrink-0">
        {isLoaded && !lastSignedIn && (
          <SignInButton mode="redirect">
            <button
              type="button"
              className="text-sm font-medium tracking-wide uppercase py-2 px-3 border border-bone rounded transition-colors, transition-transform duration-[250ms] ease-out-custom hover:bg-bone hover:text-forest cursor-pointer inline-block"
              onClick={() => router.push('/login')}
            >
              Resident Login
            </button>
          </SignInButton>
        )}
      </div>

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
                <DialogPanel className="relative w-[85%] max-w-sm bg-forest/[0.98] backdrop-blur-xl flex flex-col pt-[min(20vh,6rem)] px-8 pb-8 min-h-full">

                  {/* Mobile: Close button */}
                  <button
                    type="button"
                    onClick={closeMenu}
                    aria-label="Close menu"
                    className="absolute top-5 left-5 inline-flex h-10 w-10 items-center justify-center rounded text-bone/90 transition-colors hover:bg-forest-light hover:text-bone focus:outline-none focus-visible:ring-2 focus-visible:ring-bone/70"
                  >
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>

                  {/* Mobile: Logo */}
                  <Link href="/" onClick={closeMenu} className="mb-10">
                    <Wordmark className="text-3xl" subtitle />
                  </Link>

                  {/* Mobile: Navigation Items - ALL CAPS for consistency (role-filtered) */}
                  <nav className="space-y-3">
                    {mobileMainNav.map((item) => (
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
                    {mobileMoreNav.length > 0 && (
                      <>
                        <h3 className="text-xs font-medium uppercase tracking-wider text-bone/50 mb-4">
                          More
                        </h3>
                        <nav className="space-y-3">
                          {mobileMoreNav.map((item) => (
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
                      </>
                    )}
                  </div>

                  <hr className="border-bone/10" />

                  {/* Mobile: Auth */}
                  <div className="mt-auto mb-8">
                    {isLoaded && lastSignedIn ? (
                      <>
                        {/* Flattened menu items - no nested dropdown */}
                        <nav className="space-y-1">
                          <Link
                            href="/account/profile"
                            onClick={closeMenu}
                            className="flex items-center gap-3 px-5 py-4 rounded-lg text-bone hover:bg-sage-light hover:text-forest transition-colors tracking-wide"
                          >
                            <div className="w-6 h-6 shrink-0 flex items-center justify-center rounded-full overflow-hidden">
                              <UserAvatar />
                            </div>
                            <span className="font-medium">My Account</span>
                          </Link>

                          {canSeeSystemSettings && (
                            <Link
                              href="/settings/system"
                              onClick={closeMenu}
                              className="flex items-center gap-3 px-5 py-4 rounded-lg text-bone hover:bg-sage-light hover:text-forest transition-colors tracking-wide"
                            >
                              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-current" aria-hidden="true" />
                              </div>
                              <span className="font-medium">System Settings</span>
                            </Link>
                          )}

                          <SignOutButton redirectUrl={afterSignOutUrl}>
                            <button
                              type="button"
                              className="flex w-full items-center gap-3 px-5 py-4 rounded-lg text-left text-bone hover:bg-sage-light hover:text-forest transition-colors tracking-wide"
                            >
                              <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                                <LogOut className="h-5 w-5 text-current" aria-hidden="true" />
                              </div>
                              <span className="font-medium">Sign out</span>
                            </button>
                          </SignOutButton>
                        </nav>
                      </>
                    ) : (
                      <SignInButton mode="redirect">
                        <button
                          type="button"
                          className="block w-full text-center text-sm font-medium tracking-wide uppercase py-2 px-4 border border-bone rounded transition-colors, transition-transform duration-[250ms] ease-out-custom hover:bg-bone hover:text-forest max-md:py-3 max-md:min-h-[44px] cursor-pointer"
                          onClick={() => router.push('/login')}
                        >
                          Resident Login
                        </button>
                      </SignInButton>
                    )}
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}

