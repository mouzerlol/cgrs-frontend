/**
 * Build per-category thread/reply counts for the discussion sidebar.
 * When bookmark-only mode is on, counts reflect loaded bookmarked threads so badges match the list.
 */

export interface SidebarCategoryStat {
  threadCount: number;
  replyCount: number;
}

/** Minimal thread shape for aggregating bookmark counts. */
export type ThreadCategoryCountSource = {
  category: string;
  replyCount: number;
};

/**
 * @param bookmarksOnly - If true, aggregate from bookmarkSourceThreads; else use apiStats.
 * @param categories - Categories to include (zero-filled when missing).
 * @param apiStats - Server category stats (all non-deleted threads visible to the user segment).
 * @param bookmarkSourceThreads - Typically all loaded pages of bookmarked threads.
 */
export function buildDiscussionSidebarStats(
  bookmarksOnly: boolean,
  categories: readonly { slug: string }[],
  apiStats: Record<string, SidebarCategoryStat | undefined>,
  bookmarkSourceThreads: readonly ThreadCategoryCountSource[],
): Record<string, SidebarCategoryStat> {
  const statsMap: Record<string, SidebarCategoryStat> = {};

  if (bookmarksOnly) {
    const acc: Record<string, SidebarCategoryStat> = {};
    for (const t of bookmarkSourceThreads) {
      if (!acc[t.category]) {
        acc[t.category] = { threadCount: 0, replyCount: 0 };
      }
      acc[t.category].threadCount += 1;
      acc[t.category].replyCount += t.replyCount;
    }
    for (const cat of categories) {
      statsMap[cat.slug] = acc[cat.slug] ?? { threadCount: 0, replyCount: 0 };
    }
    return statsMap;
  }

  for (const cat of categories) {
    statsMap[cat.slug] = {
      threadCount: apiStats[cat.slug]?.threadCount ?? 0,
      replyCount: apiStats[cat.slug]?.replyCount ?? 0,
    };
  }
  return statsMap;
}
