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
  '/account': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }],
  '/account/profile': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Profile', href: '/account/profile' }],
  '/account/my-property': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'My Property', href: '/account/my-property' }],
  '/account/reported-issues': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Reported Issues', href: '/account/reported-issues' }],
  '/account/bookmarks': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Bookmarks', href: '/account/bookmarks' }],
  '/account/society': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Society', href: '/account/society' }],
  '/admin': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }],
  '/admin/portfolios': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Portfolios', href: '/admin/portfolios' }],
  '/admin/boards': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Boards', href: '/admin/boards' }],
  '/admin/decisions': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Decisions', href: '/admin/decisions' }],
  '/admin/society': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Society', href: '/admin/society' }],
  '/admin/documents': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Documents', href: '/admin/documents' }],
  '/admin/ground-report': [{ label: 'Home', href: '/' }, { label: 'Administration', href: '/admin' }, { label: 'Ground Report', href: '/admin/ground-report' }],
  '/account/ground-report': [{ label: 'Home', href: '/' }, { label: 'Account', href: '/account' }, { label: 'Ground Report', href: '/account/ground-report' }],
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
  { pattern: /^\/account\/reported-issues\/([^/]+)$/, base: '/account/reported-issues', labelKind: 'request' },
  { pattern: /^\/admin\/portfolios\/([^/]+)$/, base: '/admin/portfolios', labelKind: 'portfolio' },
  { pattern: /^\/admin\/boards\/([^/]+)$/, base: '/admin/boards', labelKind: 'board' },
];

/**
 * Resolve breadcrumbs for a pathname (sync; safe for client components).
 *
 * `leafLabel` names the final crumb, for a route whose title cannot be resolved
 * synchronously — a blog post's title lives in the published manifest, which is
 * fetched on the server, so the page that already has it hands it down rather
 * than the client going looking.
 */
export function resolveBreadcrumbsSync(pathname: string, leafLabel?: string): BreadcrumbItem[] {
  const path = normalizeSitePath(pathname);

  if (ROUTE_BREADCRUMBS[path]) {
    return ROUTE_BREADCRUMBS[path];
  }

  for (const { pattern, base, labelKind } of DYNAMIC_PATTERNS) {
    const match = path.match(pattern);
    if (match) {
      const baseBreadcrumbs = ROUTE_BREADCRUMBS[base] || [{ label: 'Home', href: '/' }];
      const label = leafLabel ?? resolveDynamicLabel(labelKind, match[1]);
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
export async function resolveBreadcrumbs(
  pathname: string,
  leafLabel?: string
): Promise<BreadcrumbItem[]> {
  return resolveBreadcrumbsSync(pathname, leafLabel);
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
