'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SignInButton, useAuth } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import ClerkAppUserButton from '@/components/layout/ClerkAppUserButton';
import NotificationsBell from '@/components/notifications/NotificationsBell';
import Icon, { IconName } from '@/components/ui/Icon';
import { ALL_NAV_ITEMS } from '@/lib/constants';
import { isNavItemVisible } from '@/lib/auth';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAllFeatureFlags } from '@/hooks/useFeatureFlag';
import { prefetchDiscussionCore } from '@/lib/discussion-prefetch';

const NAV_LINK_CLASS =
  'text-sm font-medium tracking-wide uppercase relative px-2 py-1.5 after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-current after:transition-[width] after:duration-[250ms] after:ease-out-custom hover:after:w-full text-bone whitespace-nowrap';

/**
 * Desktop top nav with responsive overflow: rightmost links fold into More when space is limited.
 * Hidden measure rows reserve the same width as the live auth block (UserButton or login CTA)
 * so overflow counting matches signed-in layouts.
 * Navigation visibility is controlled by feature flags.
 */
export default function Navigation() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [overflowCount, setOverflowCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  /** Width of the trailing auth cluster (signed-in label + UserButton or Resident Login) for overflow measurement. */
  const authSlotRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  /** Remember last confirmed signed-in state to avoid flashing login button during Clerk revalidation. */
  const lastSignedInRef = useRef(isSignedIn);
  if (isLoaded) lastSignedInRef.current = isSignedIn;
  const lastSignedIn = lastSignedInRef.current;
  const { data: currentUser, isLoading: isCurrentUserLoading } = useCurrentUser();
  const queryClient = useQueryClient();
  const featureFlags = useAllFeatureFlags();

  const handleDiscussionPrefetch = useCallback(() => {
    if (!isSignedIn) return;
    prefetchDiscussionCore(queryClient, getToken);
  }, [queryClient, isSignedIn, getToken]);

  const navItems = useMemo(() => {
    const items = ALL_NAV_ITEMS.filter((item) =>
        isNavItemVisible(
          item.href,
          currentUser?.membership?.role,
          currentUser?.is_superadmin ?? false,
          Boolean(isSignedIn),
          isSignedIn && (isCurrentUserLoading || currentUser === undefined),
          featureFlags,
        ),
    );
    return items;
  }, [currentUser, isSignedIn, isCurrentUserLoading, featureFlags]);

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

  const updateOverflow = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const measuredAuth = authSlotRef.current?.getBoundingClientRect().width ?? 0;
    /** Conservative floor when Clerk/user text has not laid out yet (avoids one-frame over-count). */
    const fallbackTail = !isLoaded ? 152 : isSignedIn ? 72 : 152;
    const tailPx = Math.max(measuredAuth, fallbackTail);

    container.querySelectorAll('[data-auth-spacer]').forEach((node) => {
      (node as HTMLElement).style.width = `${tailPx}px`;
    });

    const measureContainers = container.querySelectorAll('[data-measure-count]');
    let bestCount = 0;

    measureContainers.forEach((el) => {
      const count = parseInt(el.getAttribute('data-measure-count') || '0', 10);
      const children = Array.from(el.children) as HTMLElement[];
      if (children.length > 0) {
        const firstTop = children[0].offsetTop;
        const lastTop = children[children.length - 1].offsetTop;
        if (Math.abs(firstTop - lastTop) < 10) {
          if (count > bestCount) bestCount = count;
        }
      }
    });

    setOverflowCount(navItems.length - bestCount);
  }, [isLoaded, isSignedIn, navItems.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    updateOverflow();
    const schedule = () => requestAnimationFrame(updateOverflow);
    const ro = new ResizeObserver(schedule);
    ro.observe(container);
    const authEl = authSlotRef.current;
    if (authEl) ro.observe(authEl);
    return () => ro.disconnect();
  }, [updateOverflow, currentUser?.membership?.role]);

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
            {/* Invisible spacer: width synced in updateOverflow to match real auth block */}
            <div data-auth-spacer className="shrink-0 h-6 invisible" aria-hidden />
          </div>
        );
      })}

      {/* Actual visible navigation */}
      <div className="flex items-center gap-4 lg:gap-8 shrink-0">
        {visibleItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={NAV_LINK_CLASS}
            prefetch={true}
            onMouseEnter={item.href === '/discussion' ? handleDiscussionPrefetch : undefined}
            onFocus={item.href === '/discussion' ? handleDiscussionPrefetch : undefined}
          >
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
                    prefetch={true}
                    onMouseEnter={item.href === '/discussion' ? handleDiscussionPrefetch : undefined}
                    onFocus={item.href === '/discussion' ? handleDiscussionPrefetch : undefined}
                  >
                    <Icon name={item.icon as IconName} size="sm" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div ref={authSlotRef} className="flex items-center shrink-0">
          {isLoaded && lastSignedIn ? (
            <>
              <NotificationsBell />
              <span className="mx-1 shrink-0" aria-hidden />
              <ClerkAppUserButton />
            </>
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
      </div>
    </nav>
  );
}
