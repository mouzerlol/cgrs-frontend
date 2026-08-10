'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { BreadcrumbBar } from '@/components/ui/BreadcrumbBar';
import { BreadcrumbTrail } from '@/components/ui/BreadcrumbTrail';
import { resolveBreadcrumbsSync, shouldShowSiteBreadcrumbs } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';

export type SiteBreadcrumbsVariant = 'belowHero' | 'belowWorkManagementNav' | 'onSurface';

export interface SiteBreadcrumbsProps {
  className?: string;
  /**
   * belowHero: under marketing PageHeader / hero.
   * belowWorkManagementNav: under WorkManagementNavBar (immersive shell; no extra top offset).
   * onSurface: the trail alone, no bar. For a trail placed inside a surface that
   * already owns its background, e.g. a hero card sitting on a photograph, where
   * the strip's own bone bar would cut a band across the image and a transparent
   * one would hand the text's contrast to whatever the photograph happens to be.
   */
  variant?: SiteBreadcrumbsVariant;
  /** When true, never render (e.g. embedded demos). */
  forceHide?: boolean;
  /**
   * Names the final crumb, for a route whose title is not resolvable from the
   * URL alone — a blog post's title comes from the published manifest, which
   * only the server has read.
   */
  leafLabel?: string;
}

/**
 * URL-driven breadcrumb strip. Resolves items from the current pathname.
 *
 * - Renders nothing on `/`, `/no-access`, etc. (see `shouldShowSiteBreadcrumbs`).
 * - For manual items, use {@link BreadcrumbBar} + {@link BreadcrumbTrail}.
 */
export function SiteBreadcrumbs({
  className,
  variant = 'belowHero',
  forceHide,
  leafLabel,
}: SiteBreadcrumbsProps) {
  const pathname = usePathname() ?? '/';
  const items = useMemo(
    () => resolveBreadcrumbsSync(pathname, leafLabel),
    [pathname, leafLabel]
  );

  if (forceHide || !shouldShowSiteBreadcrumbs(pathname)) {
    return null;
  }

  if (variant === 'onSurface') {
    return <BreadcrumbTrail items={items} className={className} />;
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
