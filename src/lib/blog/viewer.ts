import 'server-only';

import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';

/**
 * Whether the person reading may see posts gated to owners.
 *
 * This is the only place the blog asks the API anything. The reading path is
 * otherwise R2-only — no Cloud Run, no database — and that property is kept for
 * signed-out visitors, who never reach this file: the routes that call it are
 * only entered when a Clerk session exists.
 *
 * Roles are not in Clerk's session claims; they live in Postgres and reach the
 * frontend only through `/api/v1/users/me`. Syncing them into Clerk metadata
 * would remove this call entirely and is the obvious next optimisation, but it
 * needs a sync path kept in step with the database, which this change does not
 * take on.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * The roles that pass.
 *
 * Ownership, and the roles that hold the society's business — not tenancy.
 * `resident` is deliberately outside: a tenant is an occupant of the
 * development, and what is gated here is owner business.
 */
const GATE_ROLES: ReadonlySet<string> = new Set([
  'owner',
  'society_manager',
  'committee_member',
  'committee_chairperson',
]);

/** How long to wait on the role call before giving up and treating the viewer as public. */
const ROLE_TIMEOUT_MS = 4000;

interface CurrentUserResponse {
  membership: { role?: string } | null;
  is_superadmin?: boolean;
}

/**
 * Resolve once per request.
 *
 * `cache()` dedupes across the render, so a page that needs this for both its
 * body and its metadata pays for one call, not two.
 */
export const canViewGatedPosts = cache(async (): Promise<boolean> => {
  let token: string | null = null;

  try {
    const session = await auth();
    token = await session.getToken();
  } catch (error) {
    console.error('[blog] could not read the session; treating the viewer as public', error);
    return false;
  }

  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      // Per-viewer and security-bearing: caching it would hand one member's
      // answer to another.
      cache: 'no-store',
      signal: AbortSignal.timeout(ROLE_TIMEOUT_MS),
    });

    if (!response.ok) {
      console.error('[blog] role lookup returned', response.status);
      return false;
    }

    const body = (await response.json()) as CurrentUserResponse;
    if (body.is_superadmin) return true;

    const role = body.membership?.role;
    return typeof role === 'string' && GATE_ROLES.has(role);
  } catch (error) {
    /*
     * Fails closed, always. The API is cold outside the keep-warm window and can
     * time out on the first request of the morning; a gate that opens when the
     * backend hiccups is not a gate, and the cost of failing the other way is
     * only that a member briefly sees the public listing.
     */
    console.error('[blog] role lookup failed; treating the viewer as public', error);
    return false;
  }
});

/** The passing roles, for tests and for the copy in the admin editor. */
export const GATED_POST_ROLES = Array.from(GATE_ROLES);
