import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import ReplyList from '../ReplyList';
import type { Reply } from '@/types';

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock('@iconify/react', () => ({
  Icon: ({ icon, ...props }: { icon: string }) => (
    <span data-testid="icon" data-icon={icon} {...props} />
  ),
}));

function makeReply(overrides: Partial<Reply> = {}): Reply {
  return {
    id: 'reply-1',
    threadId: 'thread-1',
    body: 'Test body',
    author: {
      id: 'user-1',
      clerkUserId: 'user-1',
      displayName: 'Test User',
      avatar: '/images/avatars/default.svg',
      title: 'New Member',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-01-10T10:00:00Z',
    upvotes: 0,
    upvotedBy: [],
    reportedBy: [],
    isUpvoted: false,
    isDeleted: false,
    depth: 0,
    ...overrides,
  };
}

describe('ReplyList', () => {
  it('uses compact vertical spacing between root thread items', () => {
    const { container } = render(
      <ReplyList
        replies={[
          makeReply({ id: 'a' }),
          makeReply({ id: 'b' }),
        ]}
      />
    );

    const treeWrapper = container.querySelector('.space-y-1');
    expect(treeWrapper).not.toBeNull();
    expect(treeWrapper?.querySelectorAll('article')).toHaveLength(2);
  });

  it('does not wrap threads in an extra CommentThread shell — ReplyCard supplies the card border', () => {
    const { container } = render(<ReplyList replies={[makeReply()]} />);
    expect(container.querySelectorAll('[class*="border-sage/25"]')).toHaveLength(0);
  });
});
