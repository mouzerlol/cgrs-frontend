/**
 * Route helpers for profile area URLs (App Router nested segments vs layout-driven tabs).
 */

/**
 * True when the pathname is a single reported issue detail route, e.g.
 * `/profile/reported-issues/<uuid>`. The profile layout must render `{children}` on these paths
 * so `reported-issues/[requestId]/page.tsx` mounts; the list view uses the layout tab slot only.
 */
export function isReportedIssueDetailPath(pathname: string): boolean {
  return /^\/profile\/reported-issues\/[^/]+\/?$/.test(pathname);
}
