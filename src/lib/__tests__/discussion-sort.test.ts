import { describe, it, expect } from 'vitest';
import { sortThreadsByOption } from '@/lib/discussion-sort';
import type { Thread } from '@/types';

const base = (overrides: Partial<Thread>): Thread =>
  ({
    id: '1',
    title: 't',
    category: 'introductions',
    author: {
      id: 'a',
      displayName: 'A',
      title: 'x',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 0 },
      createdAt: '2020-01-01',
    },
    createdAt: '2020-01-01T00:00:00.000Z',
    upvotes: 0,
    upvotedBy: [],
    replyCount: 0,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  }) as Thread;

describe('sortThreadsByOption', () => {
  it('sorts by newest (createdAt desc)', () => {
    const a = base({ id: 'a', createdAt: '2020-01-01T00:00:00.000Z' });
    const b = base({ id: 'b', createdAt: '2021-01-01T00:00:00.000Z' });
    const out = sortThreadsByOption([a, b], 'newest');
    expect(out.map((t) => t.id)).toEqual(['b', 'a']);
  });

  it('sorts by most-upvoted', () => {
    const a = base({ id: 'a', upvotes: 1 });
    const b = base({ id: 'b', upvotes: 5 });
    const out = sortThreadsByOption([a, b], 'most-upvoted');
    expect(out.map((t) => t.id)).toEqual(['b', 'a']);
  });

  it('sorts by most-discussed', () => {
    const a = base({ id: 'a', replyCount: 0 });
    const b = base({ id: 'b', replyCount: 3 });
    const out = sortThreadsByOption([a, b], 'most-discussed');
    expect(out.map((t) => t.id)).toEqual(['b', 'a']);
  });
});
