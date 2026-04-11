/**
 * Client-side thread ordering for lists where the server does not apply sort
 * (e.g. bookmarked threads from the bookmarks endpoint).
 */

import type { Thread, ThreadSortOption } from '@/types';

/**
 * Return a new array of threads sorted by the given option, matching main list semantics.
 */
export function sortThreadsByOption(threads: Thread[], sort: ThreadSortOption): Thread[] {
  const copy = [...threads];
  const byCreated = (a: Thread, b: Thread) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const byActivity = (a: Thread, b: Thread) =>
    new Date(a.updatedAt ?? a.createdAt).getTime() - new Date(b.updatedAt ?? b.createdAt).getTime();

  switch (sort) {
    case 'newest':
      return copy.sort((a, b) => -byCreated(a, b));
    case 'oldest':
      return copy.sort(byCreated);
    case 'most-upvoted':
      return copy.sort((a, b) => b.upvotes - a.upvotes);
    case 'most-discussed':
      return copy.sort((a, b) => b.replyCount - a.replyCount);
    case 'recent-activity':
      return copy.sort((a, b) => -byActivity(a, b));
    default:
      return copy;
  }
}
