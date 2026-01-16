import type {
  Thread,
  Reply,
  DiscussionCategory,
  DiscussionCategorySlug,
  ThreadFilters,
  ThreadSortOption,
  UserTitle,
  UserBadge,
  ForumUserStats,
} from '@/types';

// =============================================================================
// Data Import Functions
// =============================================================================

interface DiscussionsData {
  threads: Thread[];
  replies: Reply[];
}

interface CategoriesData {
  categories: DiscussionCategory[];
}

interface TitlesData {
  titles: UserTitle[];
  badges: UserBadge[];
}

async function importDiscussionsData(): Promise<DiscussionsData> {
  const data = await import('@/data/discussions.json');
  return data.default as DiscussionsData;
}

async function importCategoriesData(): Promise<CategoriesData> {
  const data = await import('@/data/forum-categories.json');
  return data.default as CategoriesData;
}

async function importTitlesData(): Promise<TitlesData> {
  const data = await import('@/data/user-titles.json');
  return data.default as TitlesData;
}

// =============================================================================
// Categories API
// =============================================================================

/**
 * Get all discussion categories.
 */
export async function getCategories(): Promise<DiscussionCategory[]> {
  const { categories } = await importCategoriesData();
  return categories;
}

/**
 * Get a single category by slug.
 */
export async function getCategory(
  slug: string
): Promise<DiscussionCategory | null> {
  const { categories } = await importCategoriesData();
  return categories.find((c) => c.slug === slug) || null;
}

/**
 * Get the default category (General Discussion).
 */
export async function getDefaultCategory(): Promise<DiscussionCategory | null> {
  const { categories } = await importCategoriesData();
  return categories.find((c) => c.isDefault) || categories[0] || null;
}

// =============================================================================
// Threads API
// =============================================================================

export interface GetThreadsOptions extends ThreadFilters {
  limit?: number;
  offset?: number;
}

export interface GetThreadsResult {
  threads: Thread[];
  total: number;
}

/**
 * Get threads with optional filtering, sorting, and pagination.
 */
export async function getThreads(
  options?: GetThreadsOptions
): Promise<GetThreadsResult> {
  const { threads } = await importDiscussionsData();
  let result = [...threads];

  // Filter by category
  if (options?.category) {
    result = result.filter((t) => t.category === options.category);
  }

  // Filter by search (title and body)
  if (options?.search) {
    const searchLower = options.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.body?.toLowerCase().includes(searchLower)
    );
  }

  // Filter pinned only
  if (options?.pinnedOnly) {
    result = result.filter((t) => t.isPinned);
  }

  // Sort threads
  const sort = options?.sort || 'newest';
  result = sortThreads(result, sort);

  // Get total count before pagination
  const total = result.length;

  // Apply pagination
  if (options?.offset) {
    result = result.slice(options.offset);
  }
  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return { threads: result, total };
}

/**
 * Sort threads by the specified criteria.
 * Pinned threads always appear first.
 */
function sortThreads(threads: Thread[], sort: ThreadSortOption): Thread[] {
  // Separate pinned and unpinned threads
  const pinned = threads.filter((t) => t.isPinned);
  const unpinned = threads.filter((t) => !t.isPinned);

  const sortFn = (a: Thread, b: Thread): number => {
    switch (sort) {
      case 'newest':
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'most-upvoted':
        return b.upvotes - a.upvotes;
      case 'most-discussed':
        return b.replyCount - a.replyCount;
      default:
        return 0;
    }
  };

  // Sort each group and combine (pinned first)
  return [...pinned.sort(sortFn), ...unpinned.sort(sortFn)];
}

/**
 * Get a single thread by ID.
 */
export async function getThread(id: string): Promise<Thread | null> {
  const { threads } = await importDiscussionsData();
  return threads.find((t) => t.id === id) || null;
}

/**
 * Get all pinned threads, optionally filtered by category.
 */
export async function getPinnedThreads(
  category?: DiscussionCategorySlug
): Promise<Thread[]> {
  const { threads } = await importDiscussionsData();
  let result = threads.filter((t) => t.isPinned);

  if (category) {
    result = result.filter((t) => t.category === category);
  }

  // Sort by pin date (most recently pinned first)
  return result.sort(
    (a, b) =>
      new Date(b.pinnedAt || b.createdAt).getTime() -
      new Date(a.pinnedAt || a.createdAt).getTime()
  );
}

/**
 * Get threads by a specific user.
 */
export async function getThreadsByUser(userId: string): Promise<Thread[]> {
  const { threads } = await importDiscussionsData();
  return threads
    .filter((t) => t.author.id === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// =============================================================================
// Replies API
// =============================================================================

/**
 * Get all replies for a thread, properly ordered with nesting.
 * Top-level replies are sorted by upvotes, nested replies by date.
 */
export async function getRepliesForThread(threadId: string): Promise<Reply[]> {
  const { replies } = await importDiscussionsData();
  const threadReplies = replies.filter((r) => r.threadId === threadId);

  // Get top-level replies (no parent), sorted by upvotes
  const topLevel = threadReplies
    .filter((r) => !r.parentReplyId)
    .sort((a, b) => b.upvotes - a.upvotes);

  // Build result with nested replies
  const result: Reply[] = [];

  for (const reply of topLevel) {
    result.push(reply);

    // Find and add nested replies (sorted by date)
    const nested = threadReplies
      .filter((r) => r.parentReplyId === reply.id)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

    result.push(...nested);
  }

  return result;
}

/**
 * Get a single reply by ID.
 */
export async function getReply(id: string): Promise<Reply | null> {
  const { replies } = await importDiscussionsData();
  return replies.find((r) => r.id === id) || null;
}

/**
 * Get replies by a specific user.
 */
export async function getRepliesByUser(userId: string): Promise<Reply[]> {
  const { replies } = await importDiscussionsData();
  return replies
    .filter((r) => r.author.id === userId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// =============================================================================
// User Titles & Badges API
// =============================================================================

/**
 * Get all available user titles.
 */
export async function getUserTitles(): Promise<UserTitle[]> {
  const { titles } = await importTitlesData();
  return titles;
}

/**
 * Get all available user badges.
 */
export async function getUserBadges(): Promise<UserBadge[]> {
  const { badges } = await importTitlesData();
  return badges;
}

/**
 * Get a specific badge by ID.
 */
export async function getUserBadge(id: string): Promise<UserBadge | null> {
  const { badges } = await importTitlesData();
  return badges.find((b) => b.id === id) || null;
}

/**
 * Calculate the appropriate title for a user based on their stats.
 * Returns the highest title the user qualifies for.
 */
export function calculateUserTitle(
  stats: ForumUserStats,
  titles: UserTitle[]
): UserTitle {
  // Sort titles by requirements (highest first)
  const sorted = [...titles].sort(
    (a, b) =>
      b.minUpvotes +
      b.minReplies +
      b.minThreads -
      (a.minUpvotes + a.minReplies + a.minThreads)
  );

  // Find highest qualifying title
  for (const title of sorted) {
    if (
      stats.upvotesReceived >= title.minUpvotes &&
      stats.repliesCount >= title.minReplies &&
      stats.threadsCreated >= title.minThreads
    ) {
      return title;
    }
  }

  // Default to first (lowest) title
  return titles[0];
}

// =============================================================================
// Statistics API
// =============================================================================

export interface CategoryStats {
  threadCount: number;
  replyCount: number;
  latestThread?: Thread;
}

/**
 * Get statistics for all categories.
 */
export async function getCategoryStats(): Promise<
  Record<DiscussionCategorySlug, CategoryStats>
> {
  const { threads, replies } = await importDiscussionsData();

  const stats: Record<string, CategoryStats> = {};

  // Initialize stats for each category
  const categories: DiscussionCategorySlug[] = [
    'announcements',
    'parking',
    'waste-management',
    'questions-help',
    'neighborhood-watch',
    'general',
  ];

  for (const category of categories) {
    stats[category] = { threadCount: 0, replyCount: 0 };
  }

  // Calculate thread counts and find latest thread per category
  for (const thread of threads) {
    if (stats[thread.category]) {
      stats[thread.category].threadCount++;
      stats[thread.category].replyCount += thread.replyCount;

      // Track latest thread
      if (
        !stats[thread.category].latestThread ||
        new Date(thread.createdAt) >
          new Date(stats[thread.category].latestThread!.createdAt)
      ) {
        stats[thread.category].latestThread = thread;
      }
    }
  }

  return stats as Record<DiscussionCategorySlug, CategoryStats>;
}

/**
 * Get overall forum statistics.
 */
export async function getForumStats(): Promise<{
  totalThreads: number;
  totalReplies: number;
  totalUsers: number;
}> {
  const { threads, replies } = await importDiscussionsData();

  // Count unique users from threads and replies
  const userIds = new Set<string>();
  threads.forEach((t) => userIds.add(t.author.id));
  replies.forEach((r) => userIds.add(r.author.id));

  return {
    totalThreads: threads.length,
    totalReplies: replies.length,
    totalUsers: userIds.size,
  };
}
