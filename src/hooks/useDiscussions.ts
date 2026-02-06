import { useQuery } from '@tanstack/react-query';
import {
  getThreads,
  getThread,
  getRepliesForThread,
  getCategories,
  getCategory,
  getDefaultCategory,
  getCategoryStats,
  getPinnedThreads,
  getThreadsByUser,
  getRepliesByUser,
  getUserTitles,
  getUserBadges,
  getUserBadge,
  getForumStats,
  getThreadsWithLatestReply,
  type GetThreadsOptions,
} from '@/lib/api/discussions';
import type { DiscussionCategorySlug } from '@/types';

// =============================================================================
// Query Key Factory
// =============================================================================

/**
 * Centralized query key factory for discussions.
 * Ensures consistent cache key structure across all hooks.
 */
export const discussionKeys = {
  all: ['discussions'] as const,

  // Thread keys
  threads: () => [...discussionKeys.all, 'threads'] as const,
  threadList: (options?: GetThreadsOptions) =>
    [...discussionKeys.threads(), 'list', options] as const,
  threadDetail: (id: string) =>
    [...discussionKeys.threads(), 'detail', id] as const,
  threadListWithLatestReply: (options?: GetThreadsOptions) =>
    [...discussionKeys.threads(), 'listWithLatestReply', options] as const,
  pinnedThreads: (category?: DiscussionCategorySlug) =>
    [...discussionKeys.threads(), 'pinned', category] as const,
  userThreads: (userId: string) =>
    [...discussionKeys.threads(), 'user', userId] as const,

  // Reply keys
  replies: () => [...discussionKeys.all, 'replies'] as const,
  threadReplies: (threadId: string) =>
    [...discussionKeys.replies(), 'thread', threadId] as const,
  userReplies: (userId: string) =>
    [...discussionKeys.replies(), 'user', userId] as const,

  // Category keys
  categories: () => [...discussionKeys.all, 'categories'] as const,
  categoryList: () => [...discussionKeys.categories(), 'list'] as const,
  categoryDetail: (slug: string) =>
    [...discussionKeys.categories(), 'detail', slug] as const,
  categoryDefault: () =>
    [...discussionKeys.categories(), 'default'] as const,
  categoryStats: () => [...discussionKeys.categories(), 'stats'] as const,

  // Gamification keys
  titles: () => [...discussionKeys.all, 'titles'] as const,
  badges: () => [...discussionKeys.all, 'badges'] as const,
  badge: (id: string) => [...discussionKeys.badges(), id] as const,

  // Stats keys
  forumStats: () => [...discussionKeys.all, 'stats'] as const,
};

// =============================================================================
// Thread Hooks
// =============================================================================

/**
 * Fetch threads with optional filtering, sorting, and pagination.
 */
export function useThreads(options?: GetThreadsOptions) {
  return useQuery({
    queryKey: discussionKeys.threadList(options),
    queryFn: () => getThreads(options),
  });
}

/**
 * Fetch a single thread by ID.
 */
export function useThread(id: string) {
  return useQuery({
    queryKey: discussionKeys.threadDetail(id),
    queryFn: () => getThread(id),
    enabled: !!id,
  });
}

/**
 * Fetch pinned threads, optionally filtered by category.
 */
export function usePinnedThreads(category?: DiscussionCategorySlug) {
  return useQuery({
    queryKey: discussionKeys.pinnedThreads(category),
    queryFn: () => getPinnedThreads(category),
  });
}

/**
 * Fetch threads created by a specific user.
 */
export function useUserThreads(userId: string) {
  return useQuery({
    queryKey: discussionKeys.userThreads(userId),
    queryFn: () => getThreadsByUser(userId),
    enabled: !!userId,
  });
}

/**
 * Fetch threads with computed latest reply info.
 * Useful for thread list views that show recent activity.
 */
export function useThreadsWithLatestReply(options?: GetThreadsOptions) {
  return useQuery({
    queryKey: discussionKeys.threadListWithLatestReply(options),
    queryFn: () => getThreadsWithLatestReply(options),
  });
}

// =============================================================================
// Reply Hooks
// =============================================================================

/**
 * Fetch replies for a specific thread.
 * Returns replies properly ordered with nesting.
 */
export function useReplies(threadId: string) {
  return useQuery({
    queryKey: discussionKeys.threadReplies(threadId),
    queryFn: () => getRepliesForThread(threadId),
    enabled: !!threadId,
  });
}

/**
 * Fetch replies made by a specific user.
 */
export function useUserReplies(userId: string) {
  return useQuery({
    queryKey: discussionKeys.userReplies(userId),
    queryFn: () => getRepliesByUser(userId),
    enabled: !!userId,
  });
}

// =============================================================================
// Category Hooks
// =============================================================================

/**
 * Fetch all discussion categories.
 * Categories rarely change, so use longer stale time.
 */
export function useCategories() {
  return useQuery({
    queryKey: discussionKeys.categoryList(),
    queryFn: () => getCategories(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch a single category by slug.
 */
export function useCategory(slug: string) {
  return useQuery({
    queryKey: discussionKeys.categoryDetail(slug),
    queryFn: () => getCategory(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch the default category (General Discussion).
 */
export function useDefaultCategory() {
  return useQuery({
    queryKey: discussionKeys.categoryDefault(),
    queryFn: () => getDefaultCategory(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch statistics for all categories (thread/reply counts).
 */
export function useCategoryStats() {
  return useQuery({
    queryKey: discussionKeys.categoryStats(),
    queryFn: () => getCategoryStats(),
  });
}

// =============================================================================
// Gamification Hooks
// =============================================================================

/**
 * Fetch all available user titles.
 * Titles rarely change, use longer stale time.
 */
export function useUserTitles() {
  return useQuery({
    queryKey: discussionKeys.titles(),
    queryFn: () => getUserTitles(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch all available user badges.
 * Badges rarely change, use longer stale time.
 */
export function useUserBadges() {
  return useQuery({
    queryKey: discussionKeys.badges(),
    queryFn: () => getUserBadges(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch a specific badge by ID.
 */
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

/**
 * Fetch overall forum statistics.
 */
export function useForumStats() {
  return useQuery({
    queryKey: discussionKeys.forumStats(),
    queryFn: () => getForumStats(),
  });
}
