/**
 * Shared auth helpers: role labels, role-based access, and capability constants.
 */

import { NAV_ITEM_TO_FLAG, type FeatureFlagId } from '@/lib/feature-flags';

/** All available capabilities exposed by the backend. */
export const CAPABILITIES = {
  VIEW_COMMUNITY_PROFILE: 'view_community_profile',
  VIEW_MEMBER_DIRECTORY: 'view_member_directory',
  SUBMIT_MANAGEMENT_REQUEST: 'submit_management_request',
  VIEW_MANAGEMENT_REQUESTS: 'view_management_requests',
  PUBLISH_BLOG: 'publish_blog',
  PUBLISH_CALENDAR: 'publish_calendar',
  MODERATE_DISCUSSIONS: 'moderate_discussions',
  PROMOTE_TO_RESIDENT: 'promote_to_resident',
  PROMOTE_TO_OWNER: 'promote_to_owner',
  PROMOTE_TO_COMMITTEE_MEMBER: 'promote_to_committee_member',
  PROMOTE_TO_SOCIETY_MANAGER: 'promote_to_society_manager',
  ASSIGN_CHAIR: 'assign_chair',
} as const;

/** Role hierarchy - higher numeric values include lower role capabilities. */
export const ROLE_HIERARCHY: Record<string, number> = {
  contact: 10,
  resident: 20,
  owner: 30,
  society_manager: 40,
  committee_member: 50,
  committee_chairperson: 60,
};

/**
 * Check if a role meets minimum threshold.
 * Returns true if userRole rank >= minimum rank.
 */
export function hasMinimumRole(userRole: string | null | undefined, minimum: string): boolean {
  if (!userRole) return false;
  const userRank = ROLE_HIERARCHY[userRole];
  const minimumRank = ROLE_HIERARCHY[minimum];
  if (userRank === undefined || minimumRank === undefined) return false;
  return userRank >= minimumRank;
}

/** Human-readable label for backend membership role. */
export function formatRole(role: string): string {
  const labels: Record<string, string> = {
    contact: 'Contact',
    resident: 'Resident',
    owner: 'Owner',
    society_manager: 'Society manager',
    committee_member: 'Committee member',
    committee_chairperson: 'Committee chair',
  };
  return labels[role] ?? role.replace(/_/g, ' ');
}

/** Roles that can access the Management (work-management) area. */
const MANAGEMENT_ROLES = new Set([
  'society_manager',
  'committee_member',
  'committee_chairperson',
]);

/** Roles considered verified (no CAPTCHA needed, can have pre-filled read-only fields). */
const VERIFIED_ROLES = new Set([
  'resident',
  'owner',
  'society_manager',
  'committee_member',
  'committee_chairperson',
]);

/** Whether the user can access the Management nav item and routes. */
export function canAccessManagement(role: string | undefined, isSuperadmin: boolean): boolean {
  if (isSuperadmin) return true;
  return role !== undefined && MANAGEMENT_ROLES.has(role);
}

/** Check if a role is verified (no CAPTCHA needed). */
export function isVerifiedRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return VERIFIED_ROLES.has(role);
}

/** Nav item href that is restricted by role (Management). */
export const MANAGEMENT_NAV_HREF = '/work-management';

/** Nav item href that requires authentication (Discussion). */
export const DISCUSSION_NAV_HREF = '/discussion';

/**
 * Whether a nav item should be shown for the given role and superadmin flag.
 * When currentUser is still loading (isSignedInAndLoading), show Management so the link isn't hidden during load.
 * Discussion requires authentication — unauthenticated users see /no-access.
 * Society Manager does not have access to Discussion.
 *
 * @param href - The navigation item href
 * @param role - User's community role
 * @param isSuperadmin - Whether user is a superadmin
 * @param isSignedIn - Whether user is signed in
 * @param isSignedInAndLoading - Whether auth is still loading (keeps nav stable during Clerk revalidation)
 * @param featureFlags - Optional map of feature flag IDs to enabled status
 */
export function isNavItemVisible(
  href: string,
  role: string | undefined,
  isSuperadmin: boolean,
  isSignedIn: boolean,
  isSignedInAndLoading = false,
  featureFlags?: Record<string, boolean>,
): boolean {
  if (href === DISCUSSION_NAV_HREF) {
    // Society Manager does not have access to discussion
    if (role === 'society_manager' && !isSuperadmin) {
      return false;
    }
    if (!isSignedInAndLoading && !isSignedIn) {
      return false;
    }
  }

  if (href === MANAGEMENT_NAV_HREF) {
    const visible = isSignedInAndLoading || canAccessManagement(role, isSuperadmin);
    if (!visible) return false;
  }

  // Check feature flag for nav items that have one
  const flagId = NAV_ITEM_TO_FLAG[href] as FeatureFlagId | undefined;
  if (flagId && featureFlags) {
    return featureFlags[flagId] ?? true;
  }

  return true;
}
