/**
 * Thread visibility aligns with cgrs-api `VisibilityEnum` (IntEnum values).
 * Used for create-thread payloads and owner+ audience selection.
 */

/** API `VisibilityEnum` numeric values. */
export const THREAD_VISIBILITY = {
  PUBLIC: 0,
  LOGGED_IN: 10,
  RESIDENT: 20,
  OWNER: 30,
} as const;

export type ThreadVisibilityValue = (typeof THREAD_VISIBILITY)[keyof typeof THREAD_VISIBILITY];

export const THREAD_VISIBILITY_OPTIONS: {
  value: ThreadVisibilityValue;
  label: string;
  description: string;
}[] = [
  {
    value: THREAD_VISIBILITY.PUBLIC,
    label: 'Everyone (including guests)',
    description: 'Visible to anyone who can open this site, even if not signed in.',
  },
  {
    value: THREAD_VISIBILITY.LOGGED_IN,
    label: 'Signed-in members',
    description: 'Anyone with an account in this community.',
  },
  {
    value: THREAD_VISIBILITY.RESIDENT,
    label: 'Verified residents and above',
    description: 'Residents, owners, committee members, chair, and SuperAdmin.',
  },
  {
    value: THREAD_VISIBILITY.OWNER,
    label: 'Property owners and above',
    description: 'Owners, committee members, chair, and SuperAdmin only.',
  },
];

/** Whether the audience selector should appear (owners and above per product rules). */
export function canConfigureThreadVisibility(
  role: string | undefined,
  isSuperadmin: boolean,
): boolean {
  if (isSuperadmin) return true;
  if (!role) return false;
  return (
    role === 'owner' || role === 'committee_member' || role === 'committee_chairperson'
  );
}

/** Default visibility for new threads: matches backend `_default_visibility_for_role`. */
export function defaultThreadVisibilityForRole(
  role: string | undefined,
  isSuperadmin: boolean,
): ThreadVisibilityValue {
  if (isSuperadmin || role === 'committee_member' || role === 'committee_chairperson') {
    return THREAD_VISIBILITY.OWNER;
  }
  if (role === 'owner') {
    return THREAD_VISIBILITY.OWNER;
  }
  return THREAD_VISIBILITY.LOGGED_IN;
}
