import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadDetail from '../ThreadDetail';
import type { Thread } from '@/types';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <img data-testid="backdrop-image" alt={alt} />,
}));

// ThreadBody reaches for Clerk and R2 attachments; neither matters to the gutter layout.
vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: undefined }),
}));

vi.mock('@/hooks/useThreadAttachmentImages', () => ({
  useThreadAttachmentImages: () => ({ images: [], isLoading: false }),
}));

vi.mock('@/components/ui/ImageLightbox', () => ({
  default: () => null,
}));

function mockThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Parking on Coronation Road',
    body: 'Body copy',
    category: 'parking',
    author: {
      id: 'a1',
      clerkUserId: 'a1',
      displayName: 'Dameon Hill',
      avatar: null,
      title: '',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-04-01T12:00:00Z',
    upvotes: 12,
    upvotedBy: [],
    replyCount: 0,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  } as Thread;
}

const GUTTER = 'sm:pl-[calc(8rem_+_1.25rem)]';

describe('ThreadDetail gutter', () => {
  it('indents the body to the gutter so prose starts on the title edge', () => {
    render(<ThreadDetail thread={mockThread()} replies={[]} />);
    expect(screen.getByTestId('thread-body-row').className).toContain(GUTTER);
  });

  it('keeps the toolbar out of the gutter so its rule spans the card', () => {
    render(<ThreadDetail thread={mockThread()} replies={[]} />);
    const actions = screen.getByTestId('thread-actions-row');

    expect(actions.className).not.toContain(GUTTER);
    expect(actions.className).not.toContain('pl-');

    // The rule sits on the toolbar itself, so it inherits the toolbar's full width.
    const toolbar = actions.firstElementChild as HTMLElement;
    expect(toolbar.className).toContain('border-t');
  });

  it('carries no full-height rule — the divider belongs to the header row alone', () => {
    render(<ThreadDetail thread={mockThread()} replies={[]} />);
    expect(screen.queryByTestId('thread-gutter-rule')).toBeNull();
    expect(screen.queryByTestId('thread-gutter-layout')).toBeNull();
  });

  it('states the reply count once, in the toolbar — not as a heading over the tree', () => {
    render(<ThreadDetail thread={mockThread()} replies={[]} />);

    const count = screen.getByTestId('reply-count');
    expect(count.textContent).toContain('0 Replies');
    expect(screen.getByTestId('thread-actions-row').contains(count)).toBe(true);
    expect(screen.queryByTestId('reply-count-heading')).toBeNull();
  });

  it('mounts on the photograph only when asked', () => {
    const { rerender } = render(<ThreadDetail thread={mockThread()} replies={[]} />);
    expect(screen.queryByTestId('backdrop-image')).toBeNull();

    rerender(<ThreadDetail mountOnBackdrop thread={mockThread()} replies={[]} />);
    expect(screen.getByTestId('backdrop-image')).toBeInTheDocument();
  });
});
