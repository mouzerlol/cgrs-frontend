import { redirect } from 'next/navigation';

/**
 * Verification no longer has its own page — it lives as a collapsible accordion at
 * the bottom of My Property. Redirect any old links, bookmarks, or QR-mail returns
 * to that surface so they don't reach a dead route.
 */
export default function VerificationPage() {
  redirect('/account/my-property');
}
