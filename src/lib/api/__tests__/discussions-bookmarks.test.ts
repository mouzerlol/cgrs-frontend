import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBookmarkedThreads } from '@/lib/api/discussions';
import { apiRequest } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiRequest: vi.fn(),
}));

describe('getBookmarkedThreads', () => {
  const getToken = vi.fn(async () => 'token');

  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    getToken.mockClear();
  });

  it('calls GET /api/v1/discussions/bookmarks and maps paginated response', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      items: [
        {
          id: '3bcafa86-3125-47b5-9a51-1f01c616303c',
          title: 'Hello',
          body: 'Body',
          category: 'general',
          author: {
            id: 'a0000000-0000-0000-0000-000000000001',
            display_name: 'User',
            created_at: '2024-01-01T00:00:00Z',
          },
          created_at: '2024-01-02T00:00:00Z',
          updated_at: null,
          is_edited: false,
          upvotes: 0,
          reply_count: 0,
          is_pinned: false,
          is_locked: false,
          is_deleted: false,
          is_upvoted: false,
          is_bookmarked: true,
          visibility: 'logged_in',
        },
      ],
      total: 1,
      offset: 0,
      limit: 20,
      has_more: false,
    });

    const result = await getBookmarkedThreads({ offset: 0, limit: 20 }, getToken);

    expect(apiRequest).toHaveBeenCalledWith(
      '/api/v1/discussions/bookmarks?offset=0&limit=20',
      getToken,
    );
    expect(result.threads).toHaveLength(1);
    expect(result.threads[0].id).toBe('3bcafa86-3125-47b5-9a51-1f01c616303c');
    expect(result.threads[0].isBookmarked).toBe(true);
    expect(result.total).toBe(1);
    expect(result.hasMore).toBe(false);
    expect(result.offset).toBe(0);
    expect(result.limit).toBe(20);
  });

  it('omits query string when no pagination options', async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      items: [],
      total: 0,
      offset: 0,
      limit: 20,
      has_more: false,
    });

    await getBookmarkedThreads({}, getToken);

    expect(apiRequest).toHaveBeenCalledWith('/api/v1/discussions/bookmarks', getToken);
  });
});
