/**
 * Public site origin for absolute redirect URLs (e.g. Clerk sign-out → login with redirect_url).
 * Set NEXT_PUBLIC_APP_URL in .env for explicit control; on Vercel, https://VERCEL_URL is used when unset.
 */

/** Resolves the app origin without a trailing slash. */
export function getPublicAppOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, '')}`;
  }
  return 'http://localhost:3000';
}

/**
 * Full URL after sign-out (login with encoded home as redirect_url).
 * Clerk validates redirects; same-origin absolute URLs are accepted more reliably than relative paths with query strings.
 */
export function getAfterSignOutUrl(): string {
  const origin = getPublicAppOrigin();
  const home = `${origin}/`;
  return `${origin}/login/?redirect_url=${encodeURIComponent(home)}`;
}
