import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReplyCard from '../ReplyCard';
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

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ content, children }: { content: string; children: React.ReactNode }) => (
    <div data-tooltip={content}>{children}</div>
  ),
}));

function makeReply(overrides: Partial<Reply> = {}): Reply {
  return {
    id: 'reply-1',
    threadId: 'thread-1',
    body: 'This is a test reply',
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
    upvotes: 3,
    upvotedBy: [],
    reportedBy: [],
    isUpvoted: false,
    isDeleted: false,
    depth: 0,
    ...overrides,
  };
}

describe('ReplyCard', () => {
  it('renders reply body and author', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} />);

    expect(screen.getByText('This is a test reply')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('styles author name badge with sage/20 background matching border, corner radii, black text, no uppercase', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} />);
    const badge = screen.getByText('Test User');
    expect(badge.className.split(/\s+/)).toContain('bg-sage/20');
    expect(badge.className).not.toContain('bg-bone');
    expect(badge.className).not.toContain('bg-sage-light');
    expect(badge.className).not.toMatch(/text-shadow/);
    expect(badge.className).toContain('border-sage/20');
    expect(badge.className.split(/\s+/)).toContain('text-black');
    expect(badge.className).not.toContain('italic');
    expect(badge.className.split(/\s+/)).not.toContain('uppercase');
    expect(badge.className).toContain('rounded-tl-md');
    expect(badge.className).toContain('-mt-3');
    expect(badge.className).toContain('-ml-3');
  });

  it('does not render author title badge', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} />);
    expect(screen.queryByText(reply.author.title)).not.toBeInTheDocument();
  });

  it('wraps content in a slightly lighter-than-bone panel with padding and overflow clip (name tag offset with negative margin)', () => {
    const reply = makeReply();
    const { container } = render(<ReplyCard reply={reply} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain('bg-bone-light');
    expect(wrapper.className).toContain('p-3');
    expect(wrapper.className).toContain('overflow-hidden');
  });

  it('uses compact toolbar controls with faint border on reply actions', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} />);
    const replyBtn = screen.getByRole('button', { name: /^Reply$/i });
    expect(replyBtn.className).toContain('border-forest/10');
    expect(replyBtn.className).toContain('min-h-[26px]');
  });

  it('does not show a report control', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} />);
    expect(screen.queryByRole('button', { name: /report content/i })).not.toBeInTheDocument();
  });

  it('shows Edited indicator when isEdited is true', () => {
    const reply = makeReply({ isEdited: true });
    render(<ReplyCard reply={reply} />);

    expect(screen.getByText('Edited')).toBeInTheDocument();
  });

  it('does not show Edited indicator when isEdited is false', () => {
    const reply = makeReply({ isEdited: false });
    render(<ReplyCard reply={reply} />);

    expect(screen.queryByText('Edited')).not.toBeInTheDocument();
  });

  it('shows Edit and Delete buttons only for author', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} isAuthor />);

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  it('groups author Edit and Delete in a right-aligned toolbar cluster', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} isAuthor />);

    const editBtn = screen.getByRole('button', { name: /Edit/i });
    expect(editBtn.closest('.ml-auto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i }).closest('.ml-auto')).toBe(
      editBtn.closest('.ml-auto')
    );
  });

  it('does not show Edit or Delete buttons for non-author', () => {
    const reply = makeReply();
    render(<ReplyCard reply={reply} isAuthor={false} />);

    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Delete/i })).not.toBeInTheDocument();
  });

  it('clicking Edit shows ReplyForm with existing body pre-filled', async () => {
    const reply = makeReply({ body: 'Original reply text' });
    const user = userEvent.setup();
    render(<ReplyCard reply={reply} isAuthor />);

    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Original reply text');
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('submitting the edit form calls onEdit with trimmed text', async () => {
    const reply = makeReply({ body: 'Original text' });
    const onEdit = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ReplyCard reply={reply} isAuthor onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /Edit/i }));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Updated text');

    await user.click(screen.getByRole('button', { name: /Save/i }));

    expect(onEdit).toHaveBeenCalledWith('Updated text');
  });

  it('cancel closes edit mode and restores body display', async () => {
    const reply = makeReply({ body: 'Original text' });
    const onEdit = vi.fn();
    const user = userEvent.setup();
    render(<ReplyCard reply={reply} isAuthor onEdit={onEdit} />);

    await user.click(screen.getByRole('button', { name: /Edit/i }));
    expect(screen.getByRole('textbox')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Cancel/i }));

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(screen.getByText('Original text')).toBeInTheDocument();
    expect(onEdit).not.toHaveBeenCalled();
  });

  it('renders soft-deleted state with placeholder', () => {
    const reply = makeReply({ isDeleted: true });
    render(<ReplyCard reply={reply} />);

    expect(screen.getByText('[deleted]')).toBeInTheDocument();
    expect(screen.getByText('This comment was deleted')).toBeInTheDocument();
    expect(screen.queryByText('This is a test reply')).not.toBeInTheDocument();
  });
});
