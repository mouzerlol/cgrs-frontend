/**
 * Breadcrumb UI kit — compose or use URL-driven {@link SiteBreadcrumbs}.
 *
 * @example
 * // Manual trail
 * <BreadcrumbBar><BreadcrumbTrail items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} /></BreadcrumbBar>
 *
 * @example
 * // Current route (most pages)
 * <SiteBreadcrumbs variant="belowHero" />
 */

export { BreadcrumbBar, type BreadcrumbBarProps } from '../BreadcrumbBar';
export { BreadcrumbTrail, type BreadcrumbTrailProps } from '../BreadcrumbTrail';
export {
  SiteBreadcrumbs,
  Breadcrumbs,
  type SiteBreadcrumbsProps,
  type SiteBreadcrumbsVariant,
} from '../Breadcrumbs';

export type { BreadcrumbItem } from '@/lib/breadcrumbs';
export { normalizeSitePath, shouldShowSiteBreadcrumbs } from '@/lib/breadcrumbs';
