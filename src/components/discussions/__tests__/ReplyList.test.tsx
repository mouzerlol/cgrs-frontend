import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('heads the section with the reply count on a forest surface with amber text', () => {
    render(<ReplyList replies={[makeReply({ id: 'a' }), makeReply({ id: 'b' })]} />);
    const heading = screen.getByTestId('reply-count-heading');

    expect(heading.tagName).toBe('H2');
    expect(heading.textContent).toContain('2 Replies');
    expect(heading.className).toContain('bg-forest');
    expect(heading.className).toContain('text-amber');
    expect(heading.querySelector('[aria-hidden="true"]')?.className).toContain('bg-bone/10');
  });

  it('singularises the count for one reply', () => {
    render(<ReplyList replies={[makeReply()]} />);
    expect(screen.getByTestId('reply-count-heading').textContent).toContain('1 Reply');
  });

  it('carries no rule under the count — the heading opens the section on its own', () => {
    render(<ReplyList replies={[makeReply()]} />);
    expect(screen.getByTestId('reply-count-heading').className).not.toContain('border-b');
  });

  it('links the count to the composer when there is one to point at', async () => {
    const onReplyClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ReplyList replies={[makeReply()]} replyHref="#reply-form" onReplyClick={onReplyClick} />,
    );

    const link = screen.getByRole('link', { name: /1 Reply/ });
    // The href stays on the element so the jump works before hydration; the
    // handler takes over from it to scroll and focus.
    expect(link.getAttribute('href')).toBe('#reply-form');

    await user.click(link);
    expect(onReplyClick).toHaveBeenCalledTimes(1);
  });

  it('leaves the count as plain text on a thread with no composer', () => {
    render(<ReplyList replies={[makeReply()]} />);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('drops the heading when the host states the count itself', () => {
    render(<ReplyList replies={[makeReply()]} showCount={false} />);
    expect(screen.queryByTestId('reply-count-heading')).toBeNull();
    expect(screen.getAllByRole('article')).toHaveLength(1);
  });
});
