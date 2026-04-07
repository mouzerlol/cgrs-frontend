/**
 * React Query hooks for discussions.
 * All hooks require getToken from useAuth() for authenticated API calls.
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from '@/lib/sonner';
import { CURRENT_USER_QUERY_KEY } from '@/hooks/useCurrentUser';
import { STALE_TIMES } from '@/lib/cache-config';
import { invalidateThread, invalidateReplies, invalidateAllDiscussions } from '@/lib/discussion-invalidation';
import {
  discussionKeys,
  normalizeThreadOptions,
  PAGE_SIZE,
} from '@/lib/discussion-keys';
import {
  bookmarkThread,
  closePoll,
  createReply,
  createThread,
  uploadDiscussionImageFile,
  deleteReply,
  deleteThread,
  getCategories,
  getCategory,
  getCategoryStatsAggregated,
  getDefaultCategory,
  getDiscussionSettings,
  getForumStats,
  getPinnedThreads,
  getRepliesByUser,
  getRepliesForThread,
  getThread,
  getThreads,
  getThreadsByUser,
  getThreadsWithLatestReply,
  getUserBadge,
  getUserBadges,
  getUserTitles,
  reportReply,
  reportThread,
  type DiscussionSettings,
  type GetThreadsOptions,
  updateReply,
  updateThread,
  upvoteReply,
  upvoteThread,
  voteOnPoll,
} from '@/lib/api/discussions';
import type { DiscussionCategorySlug, Reply } from '@/types';

// Re-export so existing consumers that import from this file keep working
export { discussionKeys, normalizeThreadOptions, PAGE_SIZE } from '@/lib/discussion-keys';

/** Clerk session must be loaded before getToken() works; otherwise API requests go out without Authorization (401). */
function useClerkReadyForDiscussionApi() {
  const { isLoaded, isSignedIn } = useAuth();
  return isLoaded && !!isSignedIn;
}

// =============================================================================
// Thread Hooks
// =============================================================================

export function useThreads(options?: GetThreadsOptions) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.threadList(options),
    queryFn: () => getThreads(options, getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function useInfiniteThreads(
  options?: Omit<GetThreadsOptions, 'offset' | 'limit'>,
) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();
  const normalizedOpts = normalizeThreadOptions(options);

  return useInfiniteQuery({
    queryKey: discussionKeys.threadList({
      ...normalizedOpts,
      limit: PAGE_SIZE,
    }),
    queryFn: ({ pageParam = 0 }) =>
      getThreads(
        { ...normalizedOpts, limit: PAGE_SIZE, offset: pageParam },
        getToken,
      ),
    initialPageParam: 0,
    enabled: authReady,
    staleTime: STALE_TIMES.CONTENT,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });
}

export function useThread(id: string) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.threadDetail(id),
    queryFn: () => getThread(id, getToken),
    enabled: authReady && !!id,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function usePinnedThreads(category?: DiscussionCategorySlug) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.pinnedThreads(category),
    queryFn: () => getPinnedThreads(getToken, category),
    enabled: authReady,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function useUserThreads(userId: string) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.userThreads(userId),
    queryFn: () => getThreadsByUser(userId, getToken),
    enabled: authReady && !!userId,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function useThreadsWithLatestReply(options?: GetThreadsOptions) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.threadListWithLatestReply(options),
    queryFn: () => getThreadsWithLatestReply(options, getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.CONTENT,
  });
}

// =============================================================================
// Reply Hooks
// =============================================================================

export function useReplies(threadId: string) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.threadReplies(threadId),
    queryFn: () => getRepliesForThread(threadId, getToken),
    enabled: authReady && !!threadId,
    staleTime: STALE_TIMES.CONTENT,
  });
}

export function useUserReplies(userId: string) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.userReplies(userId),
    queryFn: () => getRepliesByUser(userId, getToken),
    enabled: authReady && !!userId,
    staleTime: STALE_TIMES.CONTENT,
  });
}

// =============================================================================
// Category Hooks
// =============================================================================

export function useCategories(options?: { postable?: boolean }) {
  const { getToken } = useAuth();
  const postable = options?.postable ?? false;
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.categoryList(postable),
    queryFn: () => getCategories(getToken, { postable }),
    enabled: authReady,
    staleTime: STALE_TIMES.REFERENCE,
  });
}

export function useCategory(slug: string) {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.categoryDetail(slug),
    queryFn: () => getCategory(slug, getToken),
    enabled: authReady && !!slug,
    staleTime: STALE_TIMES.REFERENCE,
  });
}

export function useDefaultCategory() {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.categoryDefault(),
    queryFn: () => getDefaultCategory(getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.REFERENCE,
  });
}

export function useCategoryStats() {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.categoryStats(),
    queryFn: () => getCategoryStatsAggregated(getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.STATS,
  });
}

// =============================================================================
// Settings Hooks
// =============================================================================

export function useDiscussionSettings(): DiscussionSettings | undefined {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  const { data } = useQuery({
    queryKey: ['discussion-settings'] as const,
    queryFn: () => getDiscussionSettings(getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.REFERENCE,
  });

  return data;
}

// =============================================================================
// Gamification Hooks
// =============================================================================

export function useUserTitles() {
  return useQuery({
    queryKey: discussionKeys.titles(),
    queryFn: () => getUserTitles(),
    staleTime: STALE_TIMES.REFERENCE,
  });
}

export function useUserBadges() {
  return useQuery({
    queryKey: discussionKeys.badges(),
    queryFn: () => getUserBadges(),
    staleTime: STALE_TIMES.REFERENCE,
  });
}

export function useUserBadge(id: string) {
  return useQuery({
    queryKey: discussionKeys.badge(id),
    queryFn: () => getUserBadge(id),
    enabled: !!id,
    staleTime: STALE_TIMES.REFERENCE,
  });
}

// =============================================================================
// Statistics Hooks
// =============================================================================

export function useForumStats() {
  const { getToken } = useAuth();
  const authReady = useClerkReadyForDiscussionApi();

  return useQuery({
    queryKey: discussionKeys.forumStats(),
    queryFn: () => getForumStats(getToken),
    enabled: authReady,
    staleTime: STALE_TIMES.STATS,
  });
}

// =============================================================================
// Mutation Hooks
// =============================================================================

export function useCreateThread() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      body: string;
      category: string;
      visibility?: number;
      poll?: { question: string; options: string[]; allowMultiple: boolean };
      images?: File[];
    }) => {
      let attachmentIds: string[] | undefined;
      if (data.images?.length) {
        attachmentIds = [];
        for (const file of data.images) {
          attachmentIds.push(await uploadDiscussionImageFile(file, getToken));
        }
      }
      return createThread(
        {
          title: data.title,
          body: data.body,
          category: data.category,
          visibility: data.visibility,
          poll: data.poll,
          attachmentIds,
        },
        getToken,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
    },
  });
}

export function useUpdateThread() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { title?: string; body?: string } }) =>
      updateThread(id, data, getToken),
    onSuccess: (_, { id }) => {
      invalidateThread(queryClient, id);
    },
  });
}

export function useDeleteThread() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; threadId: string }) => deleteThread(data.id, getToken),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threads() });

      const previousThreads = queryClient.getQueryData(discussionKeys.threads());

      queryClient.setQueryData(
        discussionKeys.threads(),
        (old: { id: string; isDeleted?: boolean }[] | undefined) => {
          if (!old) return old;
          return old.map((thread) =>
            thread.id === id ? { ...thread, isDeleted: true } : thread,
          );
        },
      );

      return { previousThreads };
    },
    onError: (_, __, context) => {
      if (context?.previousThreads) {
        queryClient.setQueryData(discussionKeys.threads(), context.previousThreads);
      }
    },
    onSettled: () => {
      invalidateAllDiscussions(queryClient);
    },
  });
}

export function useUpvoteThread() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => upvoteThread(id, getToken),
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadDetail(id) });

      // Snapshot previous value
      const previousThread = queryClient.getQueryData(discussionKeys.threadDetail(id));

      // Optimistically update
      queryClient.setQueryData(
        discussionKeys.threadDetail(id),
        (old: { upvotes: number; isUpvoted: boolean } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            upvotes: old.isUpvoted ? old.upvotes - 1 : old.upvotes + 1,
            isUpvoted: !old.isUpvoted,
          };
        },
      );

      return { previousThread };
    },
    onError: (_, id, context) => {
      // Rollback on error
      if (context?.previousThread) {
        queryClient.setQueryData(discussionKeys.threadDetail(id), context.previousThread);
      }
    },
    onSettled: (_, __, id) => {
      invalidateThread(queryClient, id);
    },
  });
}

export function useBookmarkThread() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bookmarkThread(id, getToken),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadDetail(id) });

      const previousThread = queryClient.getQueryData(discussionKeys.threadDetail(id));

      queryClient.setQueryData(
        discussionKeys.threadDetail(id),
        (old: { isBookmarked: boolean } | undefined) => {
          if (!old) return old;
          return { ...old, isBookmarked: !old.isBookmarked };
        },
      );

      return { previousThread };
    },
    onError: (_, id, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(discussionKeys.threadDetail(id), context.previousThread);
      }
    },
    onSettled: (_, __, id) => {
      invalidateThread(queryClient, id);
    },
  });
}

export function useReportThread() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reportThread(id, reason, getToken),
  });
}

export function useCreateReply() {
  const { getToken, userId } = useAuth();
  const { user } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, body, parentReplyId }: { threadId: string; body: string; parentReplyId?: string }) =>
      createReply(threadId, body, getToken, parentReplyId),
    onMutate: async ({ threadId, body, parentReplyId }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadReplies(threadId) });

      const previousReplies = queryClient.getQueryData(discussionKeys.threadReplies(threadId));

      const optimisticReply: Reply = {
        id: `temp-${Date.now()}`,
        threadId,
        parentReplyId,
        body,
        author: {
          id: userId ?? 'unknown',
          displayName: user?.fullName ?? user?.firstName ?? 'You',
          avatar: user?.imageUrl,
          title: 'Seedling',
          badges: [],
          stats: {
            upvotesReceived: 0,
            repliesCount: 0,
            threadsCreated: 0,
          },
          createdAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        upvotes: 0,
        upvotedBy: [],
        reportedBy: [],
        isUpvoted: false,
        isDeleted: false,
        depth: 0,
      };

      queryClient.setQueryData(
        discussionKeys.threadReplies(threadId),
        (old: Reply[] | undefined) => {
          if (!old) return [optimisticReply];
          return parentReplyId
            ? [...old, optimisticReply]
            : [optimisticReply, ...old];
        },
      );

      return { previousReplies, threadId };
    },
    onError: (_, __, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(
          discussionKeys.threadReplies(context.threadId),
          context.previousReplies,
        );
      }
    },
    onSettled: (_, __, { threadId }) => {
      invalidateReplies(queryClient, threadId);
    },
  });
}

export function useUpdateReply() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; threadId: string; body: string }) =>
      updateReply(id, body, getToken),
    onSuccess: (_, { threadId }) => {
      invalidateReplies(queryClient, threadId);
    },
  });
}

export function useDeleteReply() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; threadId: string }) => deleteReply(data.id, getToken),
    onMutate: async ({ id, threadId }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadReplies(threadId) });

      const previousReplies = queryClient.getQueryData(discussionKeys.threadReplies(threadId));

      queryClient.setQueryData(
        discussionKeys.threadReplies(threadId),
        (old: Reply[] | undefined) => {
          if (!old) return old;
          return old.filter((reply) => reply.id !== id);
        },
      );

      return { previousReplies, threadId };
    },
    onError: (_, __, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(
          discussionKeys.threadReplies(context.threadId),
          context.previousReplies,
        );
      }
    },
    onSettled: (_, __, { threadId }) => {
      invalidateReplies(queryClient, threadId);
    },
  });
}

export function useUpvoteReply() {
  const { getToken, userId } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; threadId: string }) => upvoteReply(data.id, getToken),
    onMutate: async ({ id, threadId }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadReplies(threadId) });

      const previousReplies = queryClient.getQueryData(discussionKeys.threadReplies(threadId));

      queryClient.setQueryData(
        discussionKeys.threadReplies(threadId),
        (old: Reply[] | undefined) => {
          if (!old) return old;
          return old.map((reply) => {
            if (reply.id !== id) return reply;
            const memberId = userId ?? 'unknown';
            const isCurrentlyUpvoted = reply.upvotedBy?.includes(memberId) || reply.isUpvoted;
            return {
              ...reply,
              upvotes: isCurrentlyUpvoted ? reply.upvotes - 1 : reply.upvotes + 1,
              isUpvoted: !isCurrentlyUpvoted,
              upvotedBy: isCurrentlyUpvoted
                ? (reply.upvotedBy || []).filter((uid) => uid !== memberId)
                : [...(reply.upvotedBy || []), memberId],
            };
          });
        },
      );

      return { previousReplies, threadId };
    },
    onError: (_, __, context) => {
      if (context?.previousReplies) {
        queryClient.setQueryData(
          discussionKeys.threadReplies(context.threadId),
          context.previousReplies,
        );
      }
    },
    onSettled: (_, __, { threadId }) => {
      invalidateReplies(queryClient, threadId);
    },
  });
}

export function useReportReply() {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      reportReply(id, reason, getToken),
  });
}

export function useVoteOnPoll() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { threadId: string; optionId: string; allowMultiple: boolean }) =>
      voteOnPoll(data.threadId, data.optionId, getToken),
    onMutate: async ({ threadId, optionId, allowMultiple }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadDetail(threadId) });

      const previousThread = queryClient.getQueryData(discussionKeys.threadDetail(threadId));

      // Get forum membership ID (not Clerk user ID) — voters arrays use membership UUIDs
      const currentUser = queryClient.getQueryData<{ membership?: { id: string } }>(CURRENT_USER_QUERY_KEY);
      const currentMemberId = currentUser?.membership?.id;

      if (!currentMemberId) {
        return { previousThread, threadId };
      }

      queryClient.setQueryData(
        discussionKeys.threadDetail(threadId),
        (old: { poll?: { options: { id: string; votes: number; voters: string[] }[] } } | undefined) => {
          if (!old?.poll) return old;

          const updatedOptions = old.poll.options.map((opt) => {
            const hadVoted = opt.voters.includes(currentMemberId);
            const isTarget = opt.id === optionId;

            if (isTarget) {
              // Toggle the clicked option on or off
              return hadVoted
                ? { ...opt, votes: opt.votes - 1, voters: opt.voters.filter((v) => v !== currentMemberId) }
                : { ...opt, votes: opt.votes + 1, voters: [...opt.voters, currentMemberId] };
            } else if (!allowMultiple && hadVoted) {
              // Single-choice: deselect whichever option the user previously voted on
              return { ...opt, votes: opt.votes - 1, voters: opt.voters.filter((v) => v !== currentMemberId) };
            }
            return opt;
          });

          return {
            ...old,
            poll: { ...old.poll, options: updatedOptions },
          };
        },
      );

      return { previousThread, threadId };
    },
    onSuccess: (data, { threadId }) => {
      // Reconcile cache with server-authoritative vote counts
      if (data.options.length > 0) {
        const countById = new Map(data.options.map((o) => [o.id, o.votes]));
        queryClient.setQueryData(
          discussionKeys.threadDetail(threadId),
          (old: { poll?: { options: { id: string; votes: number }[] } } | undefined) => {
            if (!old?.poll) return old;
            return {
              ...old,
              poll: {
                ...old.poll,
                options: old.poll.options.map((opt) => {
                  const serverVotes = countById.get(opt.id);
                  return serverVotes !== undefined ? { ...opt, votes: serverVotes } : opt;
                }),
              },
            };
          },
        );
      }
      toast.success('Vote recorded');
    },
    onError: (_, __, context) => {
      if (context?.previousThread && context?.threadId) {
        queryClient.setQueryData(
          discussionKeys.threadDetail(context.threadId),
          context.previousThread,
        );
      }
      toast.error('Failed to record vote');
    },
    onSettled: (_, __, { threadId }) => {
      invalidateThread(queryClient, threadId);
    },
  });
}

export function useClosePoll() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (threadId: string) => closePoll(threadId, getToken),
    onMutate: async (threadId) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadDetail(threadId) });

      const previousThread = queryClient.getQueryData(discussionKeys.threadDetail(threadId));

      queryClient.setQueryData(
        discussionKeys.threadDetail(threadId),
        (old: { poll?: { isClosed: boolean; closedAt?: string } } | undefined) => {
          if (!old?.poll) return old;
          return {
            ...old,
            poll: {
              ...old.poll,
              isClosed: true,
              closedAt: new Date().toISOString(),
            },
          };
        },
      );

      return { previousThread, threadId };
    },
    onSuccess: () => {
      toast.success('Poll closed');
    },
    onError: (_, threadId, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(
          discussionKeys.threadDetail(threadId),
          context.previousThread,
        );
      }
      toast.error('Failed to close poll');
    },
    onSettled: (_, __, threadId) => {
      invalidateThread(queryClient, threadId);
    },
  });
}
