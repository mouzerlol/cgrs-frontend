/**
 * Privacy-masked rendering of an email address.
 *
 * Mirrors the server algorithm in `cgrs-api/shared/strings.py:mask_email`.
 * Format: first char of local part + (len(local) - 2) asterisks + last char of
 * local part + '@' + full domain. Edge cases:
 *
 *   length 1 → '*@domain'
 *   length 2 → '**@domain'
 *   length 3 → 'f*l@domain'
 *   length 4+ → 'f<asterisks>l@domain' with (len - 2) asterisks
 *
 * Values without an '@' are returned unchanged. Splitting uses the last '@'.
 */
export function maskEmail(value: string): string {
  const at = value.lastIndexOf('@');
  if (at < 0) return value;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (local.length === 0) return value;

  const n = local.length;
  let maskedLocal: string;
  if (n === 1) {
    maskedLocal = '*';
  } else if (n === 2) {
    maskedLocal = '**';
  } else if (n === 3) {
    maskedLocal = `${local[0]}*${local[n - 1]}`;
  } else {
    maskedLocal = `${local[0]}${'*'.repeat(n - 2)}${local[n - 1]}`;
  }
  return `${maskedLocal}@${domain}`;
}
