'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { BreadcrumbBar } from '@/components/ui/BreadcrumbBar';
import { BreadcrumbTrail } from '@/components/ui/BreadcrumbTrail';
import { resolveBreadcrumbsSync, shouldShowSiteBreadcrumbs } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';

export type SiteBreadcrumbsVariant = 'belowHero' | 'belowWorkManagementNav';

export interface SiteBreadcrumbsProps {
  className?: string;
  /**
   * belowHero: under marketing PageHeader / hero.
   * belowWorkManagementNav: under WorkManagementNavBar (immersive shell; no extra top offset).
   */
  variant?: SiteBreadcrumbsVariant;
  /** When true, never render (e.g. embedded demos). */
  forceHide?: boolean;
}

/**
 * URL-driven breadcrumb strip. Resolves items from the current pathname.
 *
 * - Renders nothing on `/`, `/no-access`, etc. (see `shouldShowSiteBreadcrumbs`).
 * - For manual items, use {@link BreadcrumbBar} + {@link BreadcrumbTrail}.
 */
export function SiteBreadcrumbs({ className, variant = 'belowHero', forceHide }: SiteBreadcrumbsProps) {
  const pathname = usePathname() ?? '/';
  const items = useMemo(() => resolveBreadcrumbsSync(pathname), [pathname]);

  if (forceHide || !shouldShowSiteBreadcrumbs(pathname)) {
    return null;
  }

  const underWmNav = variant === 'belowWorkManagementNav';

  return (
    <BreadcrumbBar className={cn(underWmNav && 'shadow-none shrink-0', className)}>
      <BreadcrumbTrail items={items} />
    </BreadcrumbBar>
  );
}

/** @deprecated Prefer the name `SiteBreadcrumbs`; kept for existing imports. */
export const Breadcrumbs = SiteBreadcrumbs;
