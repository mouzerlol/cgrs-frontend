'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Building2, Landmark, MapPinned, MessageSquare, User, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAllFeatureFlags } from '@/hooks/useFeatureFlag';
import ProfileIdentityCard from './ProfileIdentityCard';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';

/** Profile nav uses Lucide SVGs directly so icons always render (no Iconify async bundle). */
const NAV_ITEMS = [
  { id: 'details', href: '/account/profile', label: 'Profile Details', flagId: null },
  { id: 'my-property', href: '/account/my-property', label: 'My Property', flagId: 'account.my-property' },
  { id: 'reported-issues', href: '/account/reported-issues', label: 'Reported Issues', flagId: 'account.reported-issues' },
  { id: 'bookmarks', href: '/account/bookmarks', label: 'Bookmarks', flagId: null },
  { id: 'society', href: '/account/society', label: 'Society', flagId: null },
  { id: 'ground-report', href: '/account/ground-report', label: 'Ground Report', flagId: null },
] as const;

type NavId = (typeof NAV_ITEMS)[number]['id'];

const NAV_ITEM_ICONS: Record<NavId, LucideIcon> = {
  details: User,
  'reported-issues': MessageSquare,
  'my-property': Building2,
  bookmarks: Bookmark,
  society: Landmark,
  'ground-report': MapPinned,
};

const DEFAULT_FLAG_IDS: Record<string, boolean> = {
  'account.reported-issues': true,
  'account.my-property': true,
};

interface ProfileSideNavProps {
  onNavigate?: () => void;
  onCategoryChange?: (id: string) => void;
  onTabHover?: (href: string) => void;
  activeCategory?: string | null;
  hasPendingVerification?: boolean;
  /** Whether the Society tab should be shown (owners-and-up only). */
  canViewSociety?: boolean;
  /** Whether the Ground Report tab should be shown (owners-and-up only). */
  canViewGroundReport?: boolean;
  /**
   * `desktop` renders the sticky folder-tab sidebar (≥lg only).
   * `mobile` renders a transparent, full-width list for the slide-in drawer
   * on small screens, sharing the same items, icons, badges and flag logic.
   */
  variant?: 'desktop' | 'mobile';
  className?: string;
  /**
   * Signed-in identity rendered as a card pinned above the nav buttons (the old
   * ProfileHero, relocated). Optional so the nav still renders if data is absent.
   */
  user?: CurrentUserResponse['user'];
  membership?: CurrentUserResponse['membership'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string; email?: string };
}

export default function ProfileSideNav({
  onNavigate,
  onCategoryChange,
  onTabHover,
  activeCategory: controlledActive,
  hasPendingVerification,
  canViewSociety = false,
  canViewGroundReport = false,
  variant = 'desktop',
  className,
  user,
  membership,
  clerkFallback,
}: ProfileSideNavProps) {
  // `mobile` drops the desktop folder-tab affordances for the slide-in drawer.
  const isMobile = variant === 'mobile';
  const pathname = usePathname();
  const featureFlags = useAllFeatureFlags();

  // Filter nav items based on feature flags
  const visibleNavItems = useMemo(() => {
    return NAV_ITEMS.filter((item) => {
      // Society & Ground Report are role-gated (owners-and-up), not feature-flagged.
      if (item.id === 'society') return canViewSociety;
      if (item.id === 'ground-report') return canViewGroundReport;
      if (!item.flagId) return true;
      // Use feature flag if available, otherwise default to true
      return featureFlags[item.flagId] ?? DEFAULT_FLAG_IDS[item.flagId] ?? true;
    });
  }, [featureFlags, canViewSociety, canViewGroundReport]);

  function isActive(id: string) {
    if (controlledActive !== undefined) {
      return controlledActive === id;
    }
    // Fallback to pathname-based active detection
    const item = visibleNavItems.find((item) => item.id === id);
    if (!item) return false;
    if (item.href === '/account/profile') return pathname === '/account/profile';
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
      className={cn(
        'flex-col flex-shrink-0',
        isMobile
          ? 'flex w-full bg-transparent p-0'
          : 'hidden lg:flex w-64 bg-forest-light rounded-l-2xl pr-0 p-md',
        className
      )}
    >
      {user && (
        <ProfileIdentityCard
          user={user}
          membership={membership ?? null}
          clerkFallback={clerkFallback}
          onActivate={() => handleNavClick('details', '/account/profile')}
        />
      )}
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
                  'group flex items-center border border-bone/[0.12] w-full',
                  isMobile ? 'rounded-xl' : 'border-r-0 rounded-l-xl',
                  'gap-sm px-md py-3.5 min-h-[56px] text-[0.9375rem]',
                  'bg-bone/[0.08]',
                  'font-body font-medium text-bone text-left',
                  'cursor-pointer relative',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta',
                  'transition-all duration-[250ms] ease-out-custom',
                  !active && (isMobile ? 'hover:bg-bone/[0.15]' : 'hover:bg-bone/[0.15] hover:translate-x-1'),
                  active && [
                    'bg-sage-light text-forest font-semibold z-10',
                    !isMobile &&
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
                {id === 'my-property' && hasPendingVerification && (
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
