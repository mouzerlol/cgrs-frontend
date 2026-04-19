import { describe, expect, it } from 'vitest';

import { buildDiscussionSidebarStats } from '../discussion-sidebar-stats';

describe('buildDiscussionSidebarStats', () => {
  const categories = [{ slug: 'introductions' }, { slug: 'announcements' }];

  it('uses API stats when not bookmark-only', () => {
    const api = {
      introductions: { threadCount: 3, replyCount: 10 },
      announcements: { threadCount: 1, replyCount: 0 },
    };
    const result = buildDiscussionSidebarStats(false, categories, api, []);
    expect(result.introductions).toEqual({ threadCount: 3, replyCount: 10 });
    expect(result.announcements).toEqual({ threadCount: 1, replyCount: 0 });
  });

  it('aggregates bookmarked threads by category when bookmark-only', () => {
    const api = {
      introductions: { threadCount: 99, replyCount: 999 },
    };
    const threads = [
      { category: 'introductions', replyCount: 2 },
      { category: 'introductions', replyCount: 0 },
      { category: 'announcements', replyCount: 5 },
    ];
    const result = buildDiscussionSidebarStats(true, categories, api, threads);
    expect(result.introductions).toEqual({ threadCount: 2, replyCount: 2 });
    expect(result.announcements).toEqual({ threadCount: 1, replyCount: 5 });
  });

  it('zero-fills categories with no bookmarked threads', () => {
    const result = buildDiscussionSidebarStats(
      true,
      [{ slug: 'introductions' }],
      {},
      [{ category: 'announcements', replyCount: 0 }],
    );
    expect(result.introductions).toEqual({ threadCount: 0, replyCount: 0 });
  });
});
