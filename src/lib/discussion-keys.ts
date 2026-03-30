/**
 * Discussion query key factory and pagination constants.
 * Kept in a plain module (no React hooks) so it can be safely imported
 * by both client-side hooks and server-side prefetch layouts.
 */
import type { GetThreadsOptions } from '@/lib/api/discussions';

export const PAGE_SIZE = 20;

/** Strip undefined values so query keys match regardless of how options are constructed. */
export function normalizeThreadOptions(
  opts?: Partial<GetThreadsOptions>,
): Record<string, unknown> {
  if (!opts) return {};
  return Object.fromEntries(
    Object.entries(opts).filter(([, v]) => v !== undefined),
  );
}

export const discussionKeys = {
  all: ['discussions'] as const,

  threads: () => [...discussionKeys.all, 'threads'] as const,
  threadList: (options?: GetThreadsOptions | Record<string, unknown>) =>
    [...discussionKeys.threads(), 'list', options] as const,
  threadDetail: (id: string) =>
    [...discussionKeys.threads(), 'detail', id] as const,
  threadListWithLatestReply: (options?: GetThreadsOptions) =>
    [...discussionKeys.threads(), 'listWithLatestReply', options] as const,
  pinnedThreads: (category?: string) =>
    [...discussionKeys.threads(), 'pinned', category] as const,
  userThreads: (userId: string) =>
    [...discussionKeys.threads(), 'user', userId] as const,

  replies: () => [...discussionKeys.all, 'replies'] as const,
  threadReplies: (threadId: string) =>
    [...discussionKeys.replies(), 'thread', threadId] as const,
  userReplies: (userId: string) =>
    [...discussionKeys.replies(), 'user', userId] as const,

  categories: () => [...discussionKeys.all, 'categories'] as const,
  categoryList: (postable?: boolean) =>
    [...discussionKeys.categories(), 'list', postable ?? false] as const,
  categoryDetail: (slug: string) =>
    [...discussionKeys.categories(), 'detail', slug] as const,
  categoryDefault: () =>
    [...discussionKeys.categories(), 'default'] as const,
  categoryStats: () => [...discussionKeys.categories(), 'stats'] as const,

  titles: () => [...discussionKeys.all, 'titles'] as const,
  badges: () => [...discussionKeys.all, 'badges'] as const,
  badge: (id: string) => [...discussionKeys.badges(), id] as const,

  forumStats: () => [...discussionKeys.all, 'stats'] as const,
};
