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
