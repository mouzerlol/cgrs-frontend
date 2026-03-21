import type { MemberSummaryResponse } from '@/types/authorization';

/** Human-readable label for a community member (matches create-task assignee dropdown). */
export function memberDisplayName(member: MemberSummaryResponse): string {
  const u = member.user;
  const full = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
  return full || u.email || u.clerk_user_id || 'Member';
}
