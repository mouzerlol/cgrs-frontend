/**
 * Route helpers for account area URLs (App Router nested segments vs layout-driven tabs).
 */

/**
 * True when the pathname is a single reported issue detail route, e.g.
 * `/account/reported-issues/<uuid>`. The account layout must render `{children}` on these paths
 * so `reported-issues/[requestId]/page.tsx` mounts; the list view uses the layout tab slot only.
 */
export function isReportedIssueDetailPath(pathname: string): boolean {
  return /^\/account\/reported-issues\/[^/]+\/?$/.test(pathname);
}

/**
 * Account tabs that wear the management identity: square corners, crisp borders,
 * record-like surfaces. The community-facing tabs (profile, bookmarks, etc.) keep
 * the warm, rounded almanac treatment. See DESIGN.md "Dual radius doctrine".
 */
export const SQUARE_ACCOUNT_TABS = ['society', 'ground-report'] as const;

export function isSquareAccountTab(tab: string | null | undefined): boolean {
  return tab != null && (SQUARE_ACCOUNT_TABS as readonly string[]).includes(tab);
}
