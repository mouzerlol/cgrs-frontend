import { Event } from '@/types';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * A date in its shortest readable form: `8 Aug 26`.
 *
 * For places that carry a date beside other small facts — a byline, a reading
 * time, a category — where the full month name is the longest thing on the line
 * and says nothing the abbreviation does not.
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: '2-digit'
  });
}

/**
 * Human-readable relative time from an ISO date string.
 * @param compact When true, use short labels (e.g. `3d`, `2w`) for tight UI.
 */
export function formatRelativeDate(dateString: string, compact = false): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (compact) {
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1d';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo`;
    return date.toLocaleDateString('en-NZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

  return date.toLocaleDateString('en-NZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// `getFeaturedArticles` and `getLatestArticles` are gone. Both sorted and
// filtered a bundled array of posts; the manifest arrives already sorted
// newest-first and already knows which posts are featured, so re-deriving either
// here would only be a chance to disagree with it. See `src/lib/blog/`.

export function getUpcomingEvents(events: Event[], limit: number = 2): Event[] {
  const now = new Date();
  return events
    .filter(event => new Date(event.date) >= now)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}

export function getFeaturedEvents(events: Event[]): Event[] {
  return events.filter(event => event.featured);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
