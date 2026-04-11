import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadCardCompact from '../ThreadCardCompact';
import type { Thread } from '@/types';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill: _f, ...rest } = props;
    return <img data-testid="next-image" alt="" {...rest} />;
  },
}));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

function baseThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Test thread title',
    body: 'Body',
    category: 'general',
    author: {
      id: 'a1',
      displayName: 'Author',
      avatar: null,
      title: '',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-04-01T12:00:00Z',
    upvotes: 0,
    upvotedBy: [],
    replyCount: 0,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  };
}

describe('ThreadCardCompact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('always reserves the thumbnail column so text column aligns with or without preview', () => {
    const { rerender } = render(<ThreadCardCompact thread={baseThread()} previewUrl={null} />);

    const slots = screen.getAllByTestId('thread-card-thumb-slot');
    expect(slots).toHaveLength(1);
    expect(slots[0]).toHaveClass('w-20', 'h-20');
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();
    expect(screen.getByTestId('thread-card-category-placeholder')).toBeInTheDocument();
    expect(screen.getByLabelText('Category: General')).toBeInTheDocument();

    rerender(<ThreadCardCompact thread={baseThread()} previewUrl="https://example.com/preview.jpg" />);

    const slotsAfter = screen.getAllByTestId('thread-card-thumb-slot');
    expect(slotsAfter).toHaveLength(1);
    expect(slotsAfter[0]).toHaveClass('w-20', 'h-20');
    expect(screen.getByTestId('next-image')).toHaveAttribute('src', 'https://example.com/preview.jpg');
    expect(screen.queryByTestId('thread-card-category-placeholder')).not.toBeInTheDocument();
  });

  it('uses category-specific placeholder label when no preview', () => {
    render(<ThreadCardCompact thread={baseThread({ category: 'events' })} previewUrl={null} />);
    expect(screen.getByLabelText('Category: Events')).toBeInTheDocument();
  });
});
