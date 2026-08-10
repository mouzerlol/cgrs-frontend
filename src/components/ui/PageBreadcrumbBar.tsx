'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { BreadcrumbBar } from '@/components/ui/BreadcrumbBar';
import { BreadcrumbTrail } from '@/components/ui/BreadcrumbTrail';
import { resolveBreadcrumbsSync, shouldShowSiteBreadcrumbs } from '@/lib/breadcrumbs';
import { cn } from '@/lib/utils';

/*
 * The trail's own strip, above the hero and under the marquee.
 *
 * It exists as one component rather than as a variant flag because the pages
 * that carry it — a thread, an article — are the pages with no `PageHeader` to
 * hang a trail under, and each of them was left to assemble the strip itself.
 * That is how the two drifted apart: same primitives, different wrappers, so
 * the band ended up a different height on each and the labels a different size.
 * Anything that decides how tall the strip is or how big its text runs belongs
 * in this file and nowhere else.
 */

/*
 * The band's height, stated rather than inherited. `py-3` either side of a
 * 20px line already lands on 44px, but as a floor it also survives a trail that
 * wraps to two lines on a phone, and it means the height is a number somebody
 * chose instead of a consequence of the padding under the text.
 */
const BAR_HEIGHT = 'min-h-11'; // 44px

/*
 * The labels' scale, pinned here for the same reason. 13px on a phone, 14px
 * from `md`, both on a 20px line so the band's height does not move with the
 * breakpoint.
 */
const TRAIL_TEXT = 'text-[13px] leading-5 md:text-sm md:leading-5';

/*
 * Clearance for the fixed site chrome, which the strip carries because it is the
 * first thing on the page under it.
 *
 * `--chrome-height` and not `calc(72px + var(--site-banner-height))`. The static
 * form is what the article was using and it is 9px short: the header measures 81
 * rather than 72, so the real chrome is 117px, and the strip was mounting 9px up
 * behind the marquee — a band that read as too short with its labels sitting low
 * in what was left. The variable is measured from the chrome itself, so it is
 * right whatever the header ends up being.
 *
 * `--chrome-height` rather than `--chrome-offset`: the offset collapses to 0 when
 * the chrome hides on scroll, which is what a sticky sub-bar wants and would make
 * this one jump up the page under a chrome that is still there on first paint.
 *
 * The variable is re-measured by script, so the strip moves by the difference
 * between the CSS default and the measured height on hydration. That is the trade
 * the thread page has always made and it is the smaller of the two: a few pixels
 * of settle beats a band permanently tucked behind the marquee.
 */
const CHROME_CLEARANCE = 'pt-[var(--chrome-height)]';

export interface PageBreadcrumbBarProps {
  /** Classes on the strip's surface — use sparingly; geometry lives in here. */
  className?: string;
  /**
   * Names the final crumb, for a route whose title is not resolvable from the
   * URL alone — a blog post's title comes from the published manifest, which
   * only the server has read.
   */
  leafLabel?: string;
}

/**
 * URL-driven breadcrumb strip for pages that open on their own hero: bone band,
 * container gutters, fixed height and text scale, and the clearance for the fixed
 * chrome above it — the page mounts this at the top of its content and adds no
 * offset of its own.
 *
 * Used by `/discussion/thread/[id]` and `/blog/[slug]`, which is the point —
 * both get the same band from the same place. For a trail under a `PageHeader`,
 * or one placed inside a surface that owns its own background, use
 * {@link SiteBreadcrumbs}.
 */
export function PageBreadcrumbBar({ className, leafLabel }: PageBreadcrumbBarProps) {
  const pathname = usePathname() ?? '/';
  const items = useMemo(() => resolveBreadcrumbsSync(pathname, leafLabel), [pathname, leafLabel]);

  if (!shouldShowSiteBreadcrumbs(pathname)) {
    return null;
  }

  return (
    <BreadcrumbBar
      className={cn(BAR_HEIGHT, className)}
      outerClassName={cn('bg-bone', CHROME_CLEARANCE)}
    >
      <BreadcrumbTrail items={items} className={TRAIL_TEXT} />
    </BreadcrumbBar>
  );
}
