import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getThreadsWithLatestReply } from '@/lib/api/discussions';
import { apiRequest } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiRequest: vi.fn(),
}));

const author = (id: string, displayName: string) => ({
  id,
  display_name: displayName,
  avatar: null,
  title: 'New Member',
  badges: [],
  created_at: '2026-01-01T00:00:00Z',
});

const apiReply = (overrides: {
  id: string;
  parent_reply_id?: string | null;
  created_at: string;
  upvotes?: number;
  author_name?: string;
}) => ({
  id: overrides.id,
  thread_id: 'thread-1',
  parent_reply_id: overrides.parent_reply_id ?? null,
  body: 'Body',
  author: author(`author-${overrides.id}`, overrides.author_name ?? `Author ${overrides.id}`),
  created_at: overrides.created_at,
  updated_at: null,
  is_edited: false,
  depth: 0,
  upvotes: overrides.upvotes ?? 0,
  is_deleted: false,
  is_upvoted: false,
});

const apiThread = {
  id: 'thread-1',
  title: 'Thread',
  body: 'Body',
  category: 'general',
  author: author('author-thread', 'Thread Author'),
  created_at: '2026-01-01T00:00:00Z',
  updated_at: null,
  is_edited: false,
  upvotes: 0,
  reply_count: 3,
  is_pinned: false,
  is_locked: false,
  is_deleted: false,
  is_upvoted: false,
  is_bookmarked: false,
  visibility: 'logged_in',
};

describe('getThreadsWithLatestReply', () => {
  const getToken = vi.fn(async () => 'token');

  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    getToken.mockClear();
  });

  it('reports the newest reply even when it is nested under a low-upvote root', async () => {
    vi.mocked(apiRequest).mockImplementation(async (path: string) => {
      if (path.includes('/replies')) {
        return {
          // Server order: created_at ascending, flat.
          items: [
            apiReply({ id: 'popular-root', created_at: '2026-02-01T09:00:00Z', upvotes: 20 }),
            apiReply({ id: 'quiet-root', created_at: '2026-02-01T10:00:00Z', upvotes: 0 }),
            apiReply({
              id: 'newest',
              parent_reply_id: 'quiet-root',
              created_at: '2026-02-05T08:30:00Z',
              author_name: 'Newest Author',
            }),
          ],
          total: 3,
          offset: 0,
          limit: 50,
          has_more: false,
        } as never;
      }
      return { items: [apiThread], total: 1, offset: 0, limit: 20, has_more: false } as never;
    });

    const { threads } = await getThreadsWithLatestReply({}, getToken);

    expect(threads[0].latestReply?.replyId).toBe('newest');
    expect(threads[0].latestReply?.author.displayName).toBe('Newest Author');
    expect(threads[0].latestReply?.createdAt).toBe('2026-02-05T08:30:00Z');
  });

  it('reports no latest reply for a thread with none', async () => {
    vi.mocked(apiRequest).mockImplementation(async (path: string) => {
      if (path.includes('/replies')) {
        return { items: [], total: 0, offset: 0, limit: 50, has_more: false } as never;
      }
      return { items: [apiThread], total: 1, offset: 0, limit: 20, has_more: false } as never;
    });

    const { threads } = await getThreadsWithLatestReply({}, getToken);

    expect(threads[0].latestReply).toBeUndefined();
  });
});
