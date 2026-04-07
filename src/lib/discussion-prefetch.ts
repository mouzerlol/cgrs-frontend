/**
 * Shared discussion prefetch helper.
 *
 * Used by both the server-side discussion layout (RSC) and the client-side
 * Navigation hover handler, ensuring identical query keys, options, and
 * staleTime values in both contexts.
 */

import type { QueryClient } from '@tanstack/react-query';
import {
  getCategories,
  getCategoryStatsAggregated,
  getThreads,
} from '@/lib/api/discussions';
import {
  discussionKeys,
  PAGE_SIZE,
  normalizeThreadOptions,
} from '@/lib/discussion-keys';
import { STALE_TIMES } from '@/lib/cache-config';

const DEFAULT_OPTS = normalizeThreadOptions({ sort: 'newest' });

/**
 * Prefetch core discussion data: categories, category stats, and the first
 * page of threads.  Returns a settled promise array so a single failing
 * prefetch never crashes the caller.
 */
export function prefetchDiscussionCore(
  queryClient: QueryClient,
  getToken: () => Promise<string | null>,
) {
  return Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: discussionKeys.categoryList(false),
      queryFn: () => getCategories(getToken),
      staleTime: STALE_TIMES.REFERENCE,
    }),
    queryClient.prefetchQuery({
      queryKey: discussionKeys.categoryStats(),
      queryFn: () => getCategoryStatsAggregated(getToken),
      staleTime: STALE_TIMES.STATS,
    }),
    queryClient.prefetchInfiniteQuery({
      queryKey: discussionKeys.threadList({
        ...DEFAULT_OPTS,
        limit: PAGE_SIZE,
      }),
      queryFn: () =>
        getThreads(
          { ...DEFAULT_OPTS, limit: PAGE_SIZE, offset: 0 },
          getToken,
        ),
      initialPageParam: 0,
      staleTime: STALE_TIMES.CONTENT,
    }),
  ]);
}
