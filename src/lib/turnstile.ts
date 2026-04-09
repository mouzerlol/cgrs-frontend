/**
 * Turnstile env helpers. Vercel and shell-sourced env values sometimes include
 * trailing newlines, which Cloudflare rejects with "Invalid input for parameter sitekey".
 */

/** Return trimmed site key, or undefined if missing / whitespace-only. */
export function normalizeTurnstileSiteKey(raw: string | undefined): string | undefined {
  const t = raw?.trim();
  return t || undefined;
}
