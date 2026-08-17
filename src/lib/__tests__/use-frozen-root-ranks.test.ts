import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFrozenRootRanks } from '@/lib/reply-tree';
import type { Reply } from '@/types';

function makeReply(id: string, upvotes: number): Reply {
  return {
    id,
    threadId: 'thread-1',
    body: 'Body',
    author: {
      id: 'user-1',
      clerkUserId: 'user-1',
      displayName: 'Test User',
      avatar: '/images/avatars/default.svg',
      title: 'New Member',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 0 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-01-10T10:00:00Z',
    upvotes,
    upvotedBy: [],
    reportedBy: [],
    depth: 0,
  };
}

describe('useFrozenRootRanks', () => {
  it('captures the counts each reply had when it first appeared', () => {
    const { result } = renderHook(() => useFrozenRootRanks([makeReply('a', 3), makeReply('b', 0)]));

    expect([...result.current]).toEqual([['a', 3], ['b', 0]]);
  });

  it('holds the snapshot when a count changes while mounted', () => {
    const { result, rerender } = renderHook(({ replies }) => useFrozenRootRanks(replies), {
      initialProps: { replies: [makeReply('a', 0), makeReply('b', 5)] },
    });

    // The member upvotes 'a' — the optimistic update hands the hook a new array.
    rerender({ replies: [makeReply('a', 1), makeReply('b', 5)] });

    expect(result.current.get('a')).toBe(0);
    expect(result.current.get('b')).toBe(5);
  });

  it('captures a reply that arrives while mounted at its current count', () => {
    const { result, rerender } = renderHook(({ replies }) => useFrozenRootRanks(replies), {
      initialProps: { replies: [makeReply('a', 0)] },
    });

    rerender({ replies: [makeReply('a', 0), makeReply('new', 2)] });

    expect(result.current.get('new')).toBe(2);
  });

  it('forgets a reply that goes away, so a restored one re-enters at its live count', () => {
    const { result, rerender } = renderHook(({ replies }) => useFrozenRootRanks(replies), {
      initialProps: { replies: [makeReply('a', 4), makeReply('b', 0)] },
    });

    rerender({ replies: [makeReply('b', 0)] });
    expect(result.current.has('a')).toBe(false);

    rerender({ replies: [makeReply('a', 9), makeReply('b', 0)] });
    expect(result.current.get('a')).toBe(9);
  });
});
