'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Building2, MessageSquare, ShieldCheck, User, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllFeatureFlags } from '@/hooks/useFeatureFlag';

/** Profile nav uses Lucide SVGs directly so icons always render (no Iconify async bundle). */
const NAV_ITEMS = [
  { id: 'verification', href: '/profile/verification', label: 'Verification', flagId: 'profile.verification' },
  { id: 'details', href: '/profile', label: 'Profile Details', flagId: null },
  { id: 'reported-issues', href: '/profile/reported-issues', label: 'Reported Issues', flagId: 'profile.reported-issues' },
  { id: 'my-property', href: '/profile/my-property', label: 'My Property', flagId: 'profile.my-property' },
  { id: 'bookmarks', href: '/profile/bookmarks', label: 'Bookmarks', flagId: null },
] as const;

type NavId = (typeof NAV_ITEMS)[number]['id'];

const NAV_ITEM_ICONS: Record<NavId, LucideIcon> = {
  verification: ShieldCheck,
  details: User,
  'reported-issues': MessageSquare,
  'my-property': Building2,
  bookmarks: Bookmark,
};

const DEFAULT_FLAG_IDS: Record<string, boolean> = {
  'profile.verification': true,
  'profile.reported-issues': true,
  'profile.my-property': true,
};

interface ProfileSideNavProps {
  onNavigate?: () => void;
  onCategoryChange?: (id: string) => void;
  onTabHover?: (href: string) => void;
  activeCategory?: string | null;
  hasPendingVerification?: boolean;
  className?: string;
}

export default function ProfileSideNav({
  onNavigate,
  onCategoryChange,
  onTabHover,
  activeCategory: controlledActive,
  hasPendingVerification,
  className,
}: ProfileSideNavProps) {
  const pathname = usePathname();
  const featureFlags = useAllFeatureFlags();

  // Filter nav items based on feature flags
  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      if (!item.flagId) return true;
      // Use feature flag if available, otherwise default to true
      return featureFlags[item.flagId] ?? DEFAULT_FLAG_IDS[item.flagId] ?? true;
    });
  }, [featureFlags]);

  function isActive(id: string) {
    if (controlledActive !== undefined) {
      return controlledActive === id;
    }
    // Fallback to pathname-based active detection
    const item = visibleNavItems.find((item) => item.id === id);
    if (!item) return false;
    if (item.href === '/profile') return pathname === '/profile';
    return pathname.startsWith(item.href);
  }

  function handleNavClick(id: string, _href: string) {
    // Let parent handle navigation via onCategoryChange
    // This enables client-side routing without full page reload
    if (onCategoryChange) {
      onCategoryChange(id);
    }
    onNavigate?.();
  }

  function handleMouseEnter(href: string) {
    if (onTabHover) {
      onTabHover(href);
    }
  }

  return (
    <nav
      aria-label="Profile navigation"
      className={cn('hidden lg:flex flex-col w-64 flex-shrink-0 bg-forest-light rounded-l-2xl pr-0 p-md', className)}
    >
      <ul className="flex flex-col gap-1">
        {visibleNavItems.map(({ id, href, label }) => {
          const active = isActive(id);
          const NavIcon = NAV_ITEM_ICONS[id];
          return (
            <li key={href}>
              <button
                type="button"
                onClick={() => handleNavClick(id, href)}
                onMouseEnter={() => handleMouseEnter(href)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center border border-bone/[0.12] border-r-0 rounded-l-xl w-full',
                  'gap-sm px-md py-3.5 min-h-[56px] text-[0.9375rem]',
                  'bg-bone/[0.08]',
                  'font-body font-medium text-bone text-left',
                  'cursor-pointer relative',
                  'transition-all duration-[250ms] ease-out-custom',
                  !active && 'hover:bg-bone/[0.15] hover:translate-x-1',
                  active && [
                    'bg-sage-light text-forest font-semibold z-10',
                    'after:content-[""] after:absolute after:right-[-1px] after:top-0 after:bottom-0 after:w-0.5 after:bg-sage-light',
                  ]
                )}
              >
                <span
                  className={cn(
                    'flex items-center justify-center rounded-lg shrink-0',
                    'transition-all duration-[250ms] ease-out-custom',
                    'w-8 h-8',
                    active
                      ? 'bg-terracotta text-bone'
                      : 'bg-bone/[0.12] text-sage-light'
                  )}
                >
                  <NavIcon className="h-5 w-5 shrink-0" aria-hidden strokeWidth={2} />
                </span>
                <span className="flex-1 leading-snug">{label}</span>
                {id === 'verification' && hasPendingVerification && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-bone shadow-sm shrink-0">
                    <span className="sr-only">Pending verification</span>
                    <span aria-hidden="true">!</span>
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
