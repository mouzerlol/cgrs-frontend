import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
  it('renders jump-to-reply control with border aligned to other toolbar buttons', () => {
    render(
      <ThreadActions thread={mockThread()} replyCount={6} onReplyButtonClick={() => {}} />
    );
    const jump = screen.getByRole('button', { name: /6 replies/i });
    expect(jump.className).toContain('border-sage');
    expect(jump.className).toContain('min-h-[36px]');
  });

  it('adds left margin to bookmark for spacing after reply count without shifting the icon', () => {
    render(
      <ThreadActions thread={mockThread()} replyCount={6} onReplyButtonClick={() => {}} />
    );
    const bookmark = screen.getByRole('button', { name: /bookmark thread/i });
    expect(bookmark.className).toContain('ml-3');
    expect(bookmark.className).not.toContain('pl-3');
  });

  it('right-aligns edit and more actions when author controls are shown', () => {
    render(
      <ThreadActions
        thread={mockThread()}
        replyCount={6}
        onReplyButtonClick={() => {}}
        canEdit
        canDelete
        onEdit={() => {}}
        onDelete={() => {}}
      />
    );
    const edit = screen.getByRole('button', { name: /edit thread/i });
    expect(edit.closest('.ml-auto')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /more options/i }).closest('.ml-auto')).toBe(
      edit.closest('.ml-auto')
    );
  });
});
