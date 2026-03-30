/**
 * React Query hooks for discussions.
 * All hooks require getToken from useAuth() for authenticated API calls.
 */

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
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
  getCategoryStats,
  getDefaultCategory,
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

// =============================================================================
// Thread Hooks
// =============================================================================

export function useThreads(options?: GetThreadsOptions) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.threadList(options),
    queryFn: () => getThreads(options, getToken),
  });
}

export function useInfiniteThreads(
  options?: Omit<GetThreadsOptions, 'offset' | 'limit'>,
) {
  const { getToken } = useAuth();
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
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.offset + lastPage.limit : undefined,
  });
}

export function useThread(id: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.threadDetail(id),
    queryFn: () => getThread(id, getToken),
    enabled: !!id,
  });
}

export function usePinnedThreads(category?: DiscussionCategorySlug) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.pinnedThreads(category),
    queryFn: () => getPinnedThreads(category, getToken),
  });
}

export function useUserThreads(userId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.userThreads(userId),
    queryFn: () => getThreadsByUser(userId, getToken),
    enabled: !!userId,
  });
}

export function useThreadsWithLatestReply(options?: GetThreadsOptions) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.threadListWithLatestReply(options),
    queryFn: () => getThreadsWithLatestReply(options, getToken),
  });
}

// =============================================================================
// Reply Hooks
// =============================================================================

export function useReplies(threadId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.threadReplies(threadId),
    queryFn: () => getRepliesForThread(threadId, getToken),
    enabled: !!threadId,
  });
}

export function useUserReplies(userId: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.userReplies(userId),
    queryFn: () => getRepliesByUser(userId, getToken),
    enabled: !!userId,
  });
}

// =============================================================================
// Category Hooks
// =============================================================================

export function useCategories(options?: { postable?: boolean }) {
  const { getToken } = useAuth();
  const postable = options?.postable ?? false;

  return useQuery({
    queryKey: discussionKeys.categoryList(postable),
    queryFn: () => getCategories(getToken, { postable }),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCategory(slug: string) {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.categoryDetail(slug),
    queryFn: () => getCategory(slug, getToken),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useDefaultCategory() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.categoryDefault(),
    queryFn: () => getDefaultCategory(getToken),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useCategoryStats() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.categoryStats(),
    queryFn: () => getCategoryStats(getToken),
  });
}

// =============================================================================
// Gamification Hooks
// =============================================================================

export function useUserTitles() {
  return useQuery({
    queryKey: discussionKeys.titles(),
    queryFn: () => getUserTitles(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useUserBadges() {
  return useQuery({
    queryKey: discussionKeys.badges(),
    queryFn: () => getUserBadges(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useUserBadge(id: string) {
  return useQuery({
    queryKey: discussionKeys.badge(id),
    queryFn: () => getUserBadge(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

// =============================================================================
// Statistics Hooks
// =============================================================================

export function useForumStats() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: discussionKeys.forumStats(),
    queryFn: () => getForumStats(getToken),
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(id) });
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(id) });
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(id) });
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
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ threadId, body, parentReplyId }: { threadId: string; body: string; parentReplyId?: string }) =>
      createReply(threadId, body, parentReplyId, getToken),
    onMutate: async ({ threadId, body, parentReplyId }) => {
      await queryClient.cancelQueries({ queryKey: discussionKeys.threadReplies(threadId) });

      const previousReplies = queryClient.getQueryData(discussionKeys.threadReplies(threadId));

      const optimisticReply: Reply = {
        id: `temp-${Date.now()}`,
        threadId,
        parentReplyId,
        body,
        author: {
          id: 'currentUser',
          displayName: 'You',
          avatar: undefined,
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadReplies(threadId) });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(threadId) });
    },
  });
}

export function useUpdateReply() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      updateReply(id, body, getToken),
    onSuccess: () => {
      // Reply is cached by thread, but we don't know which thread without fetching
      queryClient.invalidateQueries({ queryKey: discussionKeys.replies() });
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threads() });
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadReplies(threadId) });
    },
  });
}

export function useUpvoteReply() {
  const { getToken } = useAuth();
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
            const isCurrentlyUpvoted = reply.upvotedBy?.includes('currentUser') || reply.isUpvoted;
            return {
              ...reply,
              upvotes: isCurrentlyUpvoted ? reply.upvotes - 1 : reply.upvotes + 1,
              isUpvoted: !isCurrentlyUpvoted,
              upvotedBy: isCurrentlyUpvoted
                ? (reply.upvotedBy || []).filter((uid) => uid !== 'currentUser')
                : [...(reply.upvotedBy || []), 'currentUser'],
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
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadReplies(threadId) });
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

      queryClient.setQueryData(
        discussionKeys.threadDetail(threadId),
        (old: { poll?: { options: { id: string; votes: number; voters: string[] }[] } } | undefined) => {
          if (!old?.poll) return old;

          const currentMemberId = 'currentUser'; // Will be replaced with actual member ID
          const newOptions = old.poll.options.map((opt) => {
            const hasVoted = opt.voters.includes(currentMemberId);

            if (hasVoted) {
              // Remove vote
              return {
                ...opt,
                votes: opt.votes - 1,
                voters: opt.voters.filter((v) => v !== currentMemberId),
              };
            } else {
              // Add vote
              if (allowMultiple) {
                return {
                  ...opt,
                  votes: opt.votes + 1,
                  voters: [...opt.voters, currentMemberId],
                };
              } else {
                // For single choice, first remove from all options, then add to this one
                return {
                  ...opt,
                  votes: opt.votes + 1,
                  voters: [...opt.voters, currentMemberId],
                };
              }
            }
          });

          // If single choice, remove votes from other options
          const finalOptions = allowMultiple
            ? newOptions
            : newOptions.map((opt, idx) => {
                const originalHasVoted = old.poll!.options[idx].voters.includes(currentMemberId);
                if (opt.id === optionId) return opt;
                if (originalHasVoted) {
                  return {
                    ...opt,
                    votes: opt.votes - 1,
                    voters: opt.voters.filter((v) => v !== currentMemberId),
                  };
                }
                return opt;
              });

          return {
            ...old,
            poll: {
              ...old.poll,
              options: finalOptions,
            },
          };
        },
      );

      return { previousThread, threadId };
    },
    onError: (_, __, context) => {
      if (context?.previousThread && context?.threadId) {
        queryClient.setQueryData(
          discussionKeys.threadDetail(context.threadId),
          context.previousThread,
        );
      }
    },
    onSettled: (_, __, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(threadId) });
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
    onError: (_, threadId, context) => {
      if (context?.previousThread) {
        queryClient.setQueryData(
          discussionKeys.threadDetail(threadId),
          context.previousThread,
        );
      }
    },
    onSettled: (_, __, threadId) => {
      queryClient.invalidateQueries({ queryKey: discussionKeys.threadDetail(threadId) });
    },
  });
}
