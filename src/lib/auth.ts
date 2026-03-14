/**
 * Shared auth helpers: role labels, role-based access, and capability constants.
 */

/** All available capabilities exposed by the backend. */
export const CAPABILITIES = {
  VIEW_COMMUNITY_PROFILE: 'viewCommunityProfile',
  VIEW_MEMBER_DIRECTORY: 'viewMemberDirectory',
  SUBMIT_MANAGEMENT_REQUEST: 'submitManagementRequest',
  VIEW_MANAGEMENT_REQUESTS: 'viewManagementRequests',
  PUBLISH_BLOG: 'publishBlog',
  PUBLISH_CALENDAR: 'publishCalendar',
  MODERATE_DISCUSSIONS: 'moderateDiscussions',
  PROMOTE_TO_RESIDENT: 'promoteToResident',
  PROMOTE_TO_OWNER: 'promoteToOwner',
  PROMOTE_TO_COMMITTEE_MEMBER: 'promoteToCommitteeMember',
  PROMOTE_TO_SOCIETY_MANAGER: 'promoteToSocietyManager',
  ASSIGN_CHAIR: 'assignChair',
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

/** Whether the user can access the Management nav item and routes. */
export function canAccessManagement(role: string | undefined, isSuperadmin: boolean): boolean {
  if (isSuperadmin) return true;
  return role !== undefined && MANAGEMENT_ROLES.has(role);
}

/** Nav item href that is restricted by role (Management). */
export const MANAGEMENT_NAV_HREF = '/work-management';

/**
 * Whether a nav item should be shown for the given role and superadmin flag.
 * When currentUser is still loading (isSignedInAndLoading), show Management so the link isn't hidden during load.
 */
export function isNavItemVisible(
  href: string,
  role: string | undefined,
  isSuperadmin: boolean,
  isSignedInAndLoading = false,
): boolean {
  if (href !== MANAGEMENT_NAV_HREF) return true;
  const visible = isSignedInAndLoading || canAccessManagement(role, isSuperadmin);
  return visible;
}
