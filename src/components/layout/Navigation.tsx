'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs';
import Icon, { IconName } from '@/components/ui/Icon';
import { ALL_NAV_ITEMS } from '@/lib/constants';
import { formatRole, isNavItemVisible } from '@/lib/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useCommunity } from '@/hooks/useCommunity';

const NAV_LINK_CLASS =
  'text-sm font-medium tracking-wide uppercase relative px-2 py-1.5 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-[width] after:duration-[250ms] after:ease-out-custom hover:after:w-full text-bone whitespace-nowrap';

/**
 * Desktop top nav with responsive overflow: rightmost links fold into More when space is limited.
 * Main nav links use ALL CAPS; More dropdown uses title case with icons.
 * Consumes useCurrentUser so backend /users/me is called when signed in; shows role next to UserButton.
 */
export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [overflowCount, setOverflowCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const { data: community } = useCommunity();

  const navItems = useMemo(() => {
    const items = ALL_NAV_ITEMS.filter((item) =>
        isNavItemVisible(
          item.href,
          currentUser?.membership?.role,
          currentUser?.is_superadmin ?? false,
          isSignedIn && (isCurrentUserLoading || currentUser === undefined),
        ),
    );
    return items;
  }, [currentUser?.membership?.role, currentUser?.is_superadmin, isSignedIn, isCurrentUserLoading]);

  const visibleItems = navItems.slice(0, navItems.length - overflowCount);
  const overflowItems = navItems.slice(navItems.length - overflowCount);
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

      setOverflowCount(navItems.length - bestCount);
    };

    updateOverflow();
    const ro = new ResizeObserver(() => requestAnimationFrame(updateOverflow));
    ro.observe(container);
    return () => ro.disconnect();
  }, [navItems.length]);

  return (
    <nav
      ref={containerRef}
      className="hidden md:flex flex-1 items-center justify-end min-w-0 relative"
    >
      {/* Hidden measuring containers for every possible visible count (role-filtered) */}
      {Array.from({ length: navItems.length + 1 }).map((_, i) => {
        const count = i; // 0 to navItems.length
        const showMoreBtn = count < navItems.length;
        return (
          <div
            key={`measure-${count}`}
            data-measure-count={count}
            aria-hidden="true"
            className="absolute top-0 right-0 w-full flex flex-wrap justify-end items-center gap-4 lg:gap-8 invisible pointer-events-none"
          >
            {navItems.slice(0, count).map((item) => (
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
              Login
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

        {isLoaded && isSignedIn ? (
          <div className="flex items-center gap-2 shrink-0">
            {(currentUser?.membership?.role || community?.name) && (
              <span className="text-xs font-medium uppercase tracking-wide text-bone/70 hidden sm:inline">
                {currentUser?.membership?.role && formatRole(currentUser.membership.role)}
                {currentUser?.membership?.role && community?.name && ' · '}
                {community?.name && <span className="normal-case">{community.name}</span>}
              </span>
            )}
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Link
                  label="My Profile"
                  labelIcon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  }
                  href="/profile"
                />
                <UserButton.Action label="manageAccount" />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        ) : (
          <SignInButton mode="redirect">
            <span
              role="button"
              tabIndex={0}
              className="text-sm font-medium tracking-wide uppercase py-2 px-4 border border-bone rounded transition-all duration-[250ms] ease-out-custom hover:bg-bone hover:text-forest shrink-0 cursor-pointer inline-block"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push('/login');
                }
              }}
            >
              Resident Login
            </span>
          </SignInButton>
        )}
      </div>
    </nav>
  );
}
