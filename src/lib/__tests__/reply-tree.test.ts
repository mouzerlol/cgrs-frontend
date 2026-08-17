import { describe, it, expect } from 'vitest';
import { buildReplyTree, type TreeNode } from '@/lib/reply-tree';
import type { Reply } from '@/types';

function makeReply(overrides: Partial<Reply> & { id: string }): Reply {
  return {
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
    upvotes: 0,
    upvotedBy: [],
    reportedBy: [],
    depth: 0,
    ...overrides,
  };
}

/** Ids in render order, roots then each subtree depth-first. */
function flatten(nodes: TreeNode[]): string[] {
  return nodes.flatMap((node) => [node.reply.id, ...flatten(node.children)]);
}

describe('buildReplyTree ordering', () => {
  it('orders root replies by upvotes, most first', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'zero', upvotes: 0, createdAt: '2026-01-10T10:00:00Z' }),
      makeReply({ id: 'five', upvotes: 5, createdAt: '2026-01-10T11:00:00Z' }),
      makeReply({ id: 'two', upvotes: 2, createdAt: '2026-01-10T12:00:00Z' }),
    ]);

    expect(tree.map((node) => node.reply.id)).toEqual(['five', 'two', 'zero']);
  });

  it('orders children oldest first, ignoring their upvotes', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'root' }),
      makeReply({ id: 'mid', parentReplyId: 'root', upvotes: 9, createdAt: '2026-01-11T10:00:00Z' }),
      makeReply({ id: 'old', parentReplyId: 'root', upvotes: 0, createdAt: '2026-01-10T10:00:00Z' }),
      makeReply({ id: 'new', parentReplyId: 'root', upvotes: 4, createdAt: '2026-01-12T10:00:00Z' }),
    ]);

    expect(tree[0].children.map((node) => node.reply.id)).toEqual(['old', 'mid', 'new']);
  });

  it('breaks an upvote tie with creation time, oldest first', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'newer', upvotes: 3, createdAt: '2026-01-11T10:00:00Z' }),
      makeReply({ id: 'older', upvotes: 3, createdAt: '2026-01-10T10:00:00Z' }),
    ]);

    expect(tree.map((node) => node.reply.id)).toEqual(['older', 'newer']);
  });

  it('is deterministic regardless of input order', () => {
    const replies = [
      makeReply({ id: 'a', upvotes: 3, createdAt: '2026-01-10T10:00:00Z' }),
      makeReply({ id: 'b', upvotes: 3, createdAt: '2026-01-11T10:00:00Z' }),
      makeReply({ id: 'c', upvotes: 7, createdAt: '2026-01-12T10:00:00Z' }),
      makeReply({ id: 'a1', parentReplyId: 'a', createdAt: '2026-01-13T10:00:00Z' }),
      makeReply({ id: 'a2', parentReplyId: 'a', createdAt: '2026-01-14T10:00:00Z' }),
    ];

    const forwards = flatten(buildReplyTree(replies));
    const backwards = flatten(buildReplyTree([...replies].reverse()));

    expect(forwards).toEqual(['c', 'a', 'a1', 'a2', 'b']);
    expect(backwards).toEqual(forwards);
  });

  it('counts descendants at every level', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'root' }),
      makeReply({ id: 'child', parentReplyId: 'root' }),
      makeReply({ id: 'grandchild', parentReplyId: 'child' }),
    ]);

    expect(tree[0].descendantCount).toBe(2);
    expect(tree[0].children[0].descendantCount).toBe(1);
  });
});

describe('buildReplyTree orphan handling', () => {
  it('promotes a reply whose parent is not in the loaded set', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'root', upvotes: 5 }),
      makeReply({ id: 'orphan', parentReplyId: 'off-page-parent', upvotes: 1 }),
    ]);

    expect(tree.map((node) => node.reply.id)).toEqual(['root', 'orphan']);
  });

  it('keeps an orphan subtree intact', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'orphan', parentReplyId: 'deleted-parent' }),
      makeReply({ id: 'orphan-child', parentReplyId: 'orphan', createdAt: '2026-01-11T10:00:00Z' }),
    ]);

    expect(flatten(tree)).toEqual(['orphan', 'orphan-child']);
    expect(tree[0].descendantCount).toBe(1);
  });

  it('promotes replies in a parent cycle rather than dropping them', () => {
    const tree = buildReplyTree([
      makeReply({ id: 'a', parentReplyId: 'b' }),
      makeReply({ id: 'b', parentReplyId: 'a' }),
    ]);

    expect(flatten(tree).sort()).toEqual(['a', 'b']);
  });

  it('renders every loaded reply exactly once', () => {
    const replies = [
      makeReply({ id: 'root', upvotes: 2 }),
      makeReply({ id: 'child', parentReplyId: 'root' }),
      makeReply({ id: 'orphan', parentReplyId: 'missing' }),
      makeReply({ id: 'orphan-child', parentReplyId: 'orphan' }),
      makeReply({ id: 'self', parentReplyId: 'self' }),
    ];

    const rendered = flatten(buildReplyTree(replies));

    expect(rendered).toHaveLength(replies.length);
    expect([...rendered].sort()).toEqual(replies.map((reply) => reply.id).sort());
  });
});

describe('buildReplyTree frozen root ranks', () => {
  it('ranks roots by the snapshot rather than their live counts', () => {
    const replies = [
      makeReply({ id: 'a', upvotes: 0, createdAt: '2026-01-10T10:00:00Z' }),
      makeReply({ id: 'b', upvotes: 5, createdAt: '2026-01-11T10:00:00Z' }),
    ];
    // 'a' has since been upvoted past 'b', but the snapshot says otherwise.
    replies[0].upvotes = 9;

    const ranks = new Map([['a', 0], ['b', 5]]);

    expect(buildReplyTree(replies, ranks).map((n) => n.reply.id)).toEqual(['b', 'a']);
    expect(buildReplyTree(replies).map((n) => n.reply.id)).toEqual(['a', 'b']);
  });

  it('falls back to the live count for a reply missing from the snapshot', () => {
    const replies = [
      makeReply({ id: 'known', upvotes: 1, createdAt: '2026-01-10T10:00:00Z' }),
      makeReply({ id: 'fresh', upvotes: 4, createdAt: '2026-01-11T10:00:00Z' }),
    ];

    const tree = buildReplyTree(replies, new Map([['known', 1]]));

    expect(tree.map((n) => n.reply.id)).toEqual(['fresh', 'known']);
  });

  it('does not apply the snapshot to nested replies, which are ordered by time', () => {
    const replies = [
      makeReply({ id: 'root' }),
      makeReply({ id: 'child-new', parentReplyId: 'root', upvotes: 9, createdAt: '2026-01-12T10:00:00Z' }),
      makeReply({ id: 'child-old', parentReplyId: 'root', upvotes: 0, createdAt: '2026-01-11T10:00:00Z' }),
    ];

    const tree = buildReplyTree(replies, new Map([['child-new', 0], ['child-old', 9]]));

    expect(tree[0].children.map((n) => n.reply.id)).toEqual(['child-old', 'child-new']);
  });
});

describe('buildReplyTree purity', () => {
  it('does not reorder the input array', () => {
    const replies = [
      makeReply({ id: 'low', upvotes: 0 }),
      makeReply({ id: 'high', upvotes: 9 }),
      makeReply({ id: 'child', parentReplyId: 'low', createdAt: '2026-01-01T10:00:00Z' }),
    ];
    const before = replies.map((reply) => reply.id);

    buildReplyTree(replies);

    expect(replies.map((reply) => reply.id)).toEqual(before);
  });
});
