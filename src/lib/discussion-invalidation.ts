/**
 * Shared cache invalidation helpers for discussion mutations.
 *
 * Every mutation's onSettled/onSuccess should call one of these rather than
 * assembling ad-hoc invalidateQueries calls.  This ensures consistent
 * invalidation scope and makes it trivial to adjust if the key hierarchy
 * changes.
 */

import type { QueryClient } from '@tanstack/react-query';
import { discussionKeys } from '@/lib/discussion-keys';

/** Invalidate a single thread detail + all thread list queries. */
export function invalidateThread(qc: QueryClient, threadId: string) {
  qc.invalidateQueries({ queryKey: discussionKeys.threadDetail(threadId) });
  qc.invalidateQueries({ queryKey: discussionKeys.threads() });
}

/** Invalidate replies for a thread + the parent thread (reply count changed). */
export function invalidateReplies(qc: QueryClient, threadId: string) {
  qc.invalidateQueries({ queryKey: discussionKeys.threadReplies(threadId) });
  invalidateThread(qc, threadId);
}

/** Invalidate everything under the discussions key hierarchy. */
export function invalidateAllDiscussions(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: discussionKeys.all });
}
