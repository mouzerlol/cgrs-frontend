import { differenceInCalendarMonths, differenceInDays } from 'date-fns';

/**
 * Human-readable "member since" bucket for the admin users table: week-based
 * labels for new members, then calendar month/year counts.
 */
export function formatMemberSince(dateStr: string, referenceDate: Date = new Date()): string {
  const joined = new Date(dateStr);
  const now = referenceDate;
  const diffDays = differenceInDays(now, joined);

  if (diffDays < 7) return 'This week';
  if (diffDays < 21) return 'Two weeks ago';

  const months = differenceInCalendarMonths(now, joined);
  const displayMonths = Math.max(1, months);

  if (displayMonths < 12) {
    return displayMonths === 1 ? '1 month' : `${displayMonths} months`;
  }

  const years = Math.floor(displayMonths / 12);
  return years === 1 ? '1 year' : `${years} years`;
}
