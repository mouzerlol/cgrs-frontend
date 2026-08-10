import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadActions from '../ThreadActions';
import type { Thread } from '@/types';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

function mockThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Test',
    body: 'b',
    category: 'general',
    author: {
      id: 'a1',
      displayName: 'A',
      avatar: null,
      title: '',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-04-01T12:00:00Z',
    upvotes: 2,
    upvotedBy: [],
    replyCount: 6,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  };
}

describe('ThreadActions', () => {
  it('states the reply count beside the vote', () => {
    render(<ThreadActions thread={mockThread()} replyCount={6} onReplyButtonClick={() => {}} />);
    const count = screen.getByTestId('reply-count');

    expect(count.textContent).toContain('6 Replies');
    expect(count.className).toContain('bg-forest');
    expect(count.className).toContain('text-amber');
    // Left cluster with the upvote, not the right-hand action group.
    expect(count.closest('.ml-auto')).toBeNull();
  });

  it('singularises the count for one reply', () => {
    render(<ThreadActions thread={mockThread()} replyCount={1} />);
    expect(screen.getByTestId('reply-count').textContent).toContain('1 Reply');
  });

  it('omits the count entirely when none is given', () => {
    render(<ThreadActions thread={mockThread()} onReplyButtonClick={() => {}} />);
    expect(screen.queryByTestId('reply-count')).toBeNull();
  });

  it('links the count to the reply section when there is one to point at', async () => {
    const onReplyCountClick = vi.fn();
    const user = userEvent.setup();

    render(
      <ThreadActions
        thread={mockThread()}
        replyCount={6}
        replyCountHref="#replies"
        onReplyCountClick={onReplyCountClick}
      />
    );

    const link = screen.getByRole('link', { name: /6 Replies/ });
    // The href stays on the element so the jump works before hydration; the
    // handler takes over from it to scroll.
    expect(link.getAttribute('href')).toBe('#replies');

    await user.click(link);
    expect(onReplyCountClick).toHaveBeenCalledTimes(1);
  });

  it('leaves the count as plain text with no section to jump to', () => {
    render(<ThreadActions thread={mockThread()} replyCount={0} />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByTestId('reply-count').textContent).toContain('0 Replies');
  });

  it('keeps document actions out of the footer — bookmark and share live in the header', () => {
    render(<ThreadActions thread={mockThread()} onReplyButtonClick={() => {}} />);
    expect(screen.queryByRole('button', { name: /bookmark thread/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /share thread/i })).toBeNull();
  });

  it('right-aligns the Reply primary and folds author controls into the overflow menu', () => {
    render(
      <ThreadActions
        thread={mockThread()}
        onReplyButtonClick={() => {}}
        canEdit
        canDelete
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    const reply = screen.getByRole('button', { name: /^reply$/i });
    const more = screen.getByRole('button', { name: /more options/i });
    expect(reply.closest('.ml-auto')).toBeInTheDocument();
    expect(more.closest('.ml-auto')).toBe(reply.closest('.ml-auto'));

    // Edit is no longer a standalone toolbar button; it lives behind the menu.
    expect(screen.queryByRole('button', { name: /edit thread/i })).toBeNull();
  });

  it('hides the Reply primary when the thread cannot be replied to', () => {
    render(<ThreadActions thread={mockThread()} />);
    expect(screen.queryByRole('button', { name: /^reply$/i })).toBeNull();
  });
});
