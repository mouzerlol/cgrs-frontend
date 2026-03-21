import { SITE_CONFIG } from './constants';
import { resolveDynamicLabel, type DynamicLabelKind } from './breadcrumb-registry';

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/** Normalize pathname for matching (no query, no trailing slash except root). */
export function normalizeSitePath(pathname: string): string {
  const base = pathname.split('?')[0] || '/';
  if (base !== '/' && base.endsWith('/')) {
    return base.replace(/\/+$/, '') || '/';
  }
  return base;
}

/**
 * Whether the auto breadcrumb strip should render for this URL.
 * Home and standalone error flows are excluded; extend as needed.
 */
export function shouldShowSiteBreadcrumbs(pathname: string): boolean {
  const path = normalizeSitePath(pathname);
  if (path === '/') return false;
  if (path === '/no-access' || path.startsWith('/no-access/')) return false;
  return true;
}

/** Static route definitions - parent-child hierarchy */
const ROUTE_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Home', href: '/' }],
  '/about': [{ label: 'Home', href: '/' }, { label: 'About', href: '/about' }],
  '/blog': [{ label: 'Home', href: '/' }, { label: 'Blog', href: '/blog' }],
  '/calendar': [{ label: 'Home', href: '/' }, { label: 'Calendar', href: '/calendar' }],
  '/contact': [{ label: 'Home', href: '/' }, { label: 'Contact', href: '/contact' }],
  '/design-system': [{ label: 'Home', href: '/' }, { label: 'Design System', href: '/design-system' }],
  '/directory': [{ label: 'Home', href: '/' }, { label: 'Directory', href: '/directory' }],
  '/forgot-password': [{ label: 'Home', href: '/' }, { label: 'Forgot Password', href: '/forgot-password' }],
  '/guidelines': [{ label: 'Home', href: '/' }, { label: 'Guidelines', href: '/guidelines' }],
  '/login': [{ label: 'Home', href: '/' }, { label: 'Login', href: '/login' }],
  '/map': [{ label: 'Home', href: '/' }, { label: 'Map', href: '/map' }],
  '/management-request': [{ label: 'Home', href: '/' }, { label: 'Report Issue', href: '/management-request' }],
  '/notice-board': [{ label: 'Home', href: '/' }, { label: 'Notice Board', href: '/notice-board' }],
  '/privacy-policy': [{ label: 'Home', href: '/' }, { label: 'Privacy Policy', href: '/privacy-policy' }],
  '/register': [{ label: 'Home', href: '/' }, { label: 'Register', href: '/register' }],
  '/discussion': [{ label: 'Home', href: '/' }, { label: 'Discussion', href: '/discussion' }],
  '/discussion/new': [{ label: 'Home', href: '/' }, { label: 'Discussion', href: '/discussion' }, { label: 'New Thread', href: '/discussion/new' }],
  '/profile': [{ label: 'Home', href: '/' }, { label: 'Profile', href: '/profile' }],
  '/profile/my-property': [{ label: 'Home', href: '/' }, { label: 'Profile', href: '/profile' }, { label: 'My Property', href: '/profile/my-property' }],
  '/profile/reported-issues': [{ label: 'Home', href: '/' }, { label: 'Profile', href: '/profile' }, { label: 'Reported Issues', href: '/profile/reported-issues' }],
  '/work-management': [{ label: 'Home', href: '/' }, { label: 'Work Management', href: '/work-management' }],
  '/work-management/portfolios': [{ label: 'Home', href: '/' }, { label: 'Work Management', href: '/work-management' }, { label: 'Portfolios', href: '/work-management/portfolios' }],
  '/work-management/boards': [{ label: 'Home', href: '/' }, { label: 'Work Management', href: '/work-management' }, { label: 'Boards', href: '/work-management/boards' }],
  '/work-management/decisions': [{ label: 'Home', href: '/' }, { label: 'Work Management', href: '/work-management' }, { label: 'Decisions', href: '/work-management/decisions' }],
  '/no-access': [{ label: 'Home', href: '/' }, { label: 'No Access', href: '/no-access' }],
};

/** Dynamic routes: pattern, static prefix crumbs key, label kind for last segment */
const DYNAMIC_PATTERNS: Array<{
  pattern: RegExp;
  base: string;
  labelKind: DynamicLabelKind;
}> = [
  { pattern: /^\/blog\/([^/]+)$/, base: '/blog', labelKind: 'blog' },
  { pattern: /^\/calendar\/([^/]+)$/, base: '/calendar', labelKind: 'calendar' },
  { pattern: /^\/discussion\/thread\/([^/]+)$/, base: '/discussion', labelKind: 'thread' },
  { pattern: /^\/profile\/reported-issues\/([^/]+)$/, base: '/profile/reported-issues', labelKind: 'request' },
  { pattern: /^\/work-management\/portfolios\/([^/]+)$/, base: '/work-management/portfolios', labelKind: 'portfolio' },
  { pattern: /^\/work-management\/boards\/([^/]+)$/, base: '/work-management/boards', labelKind: 'board' },
];

/**
 * Resolve breadcrumbs for a pathname (sync; safe for client components).
 */
export function resolveBreadcrumbsSync(pathname: string): BreadcrumbItem[] {
  const path = normalizeSitePath(pathname);

  if (ROUTE_BREADCRUMBS[path]) {
    return ROUTE_BREADCRUMBS[path];
  }

  for (const { pattern, base, labelKind } of DYNAMIC_PATTERNS) {
    const match = path.match(pattern);
    if (match) {
      const baseBreadcrumbs = ROUTE_BREADCRUMBS[base] || [{ label: 'Home', href: '/' }];
      const label = resolveDynamicLabel(labelKind, match[1]);
      return [...baseBreadcrumbs, { label }];
    }
  }

  const segments = path.split('/').filter(Boolean);
  if (segments.length === 0) {
    return [{ label: 'Home', href: '/' }];
  }

  const breadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const staticMatch = ROUTE_BREADCRUMBS[currentPath];
    if (staticMatch) {
      breadcrumbs.push(...staticMatch.slice(1));
    } else {
      breadcrumbs.push({ label: segment.replace(/-/g, ' '), href: currentPath });
    }
  }

  return breadcrumbs;
}

/** Async wrapper for server call sites */
export async function resolveBreadcrumbs(pathname: string): Promise<BreadcrumbItem[]> {
  return resolveBreadcrumbsSync(pathname);
}

/**
 * Generate JSON-LD structured data for breadcrumbs.
 */
export function getBreadcrumbsJsonLd(items: BreadcrumbItem[], baseUrl: string = SITE_CONFIG.url) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${baseUrl}${item.href}` }),
    })),
  };
}
