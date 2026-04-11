import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadCard from '../ThreadCard';
import type { Thread } from '@/types';

const mockPush = vi.hoisted(() => vi.fn());

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), back: vi.fn(), prefetch: vi.fn() }),
}));

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill: _f, ...rest } = props;
    return <img data-testid="next-image" alt="" {...rest} />;
  },
}));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} data-testid="iconify-icon" />,
}));

function mockThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Thread title',
    body: 'Body text',
    category: 'general',
    author: {
      id: 'a1',
      displayName: 'Author Name',
      avatar: null,
      title: '',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-04-01T12:00:00Z',
    upvotes: 3,
    upvotedBy: [],
    replyCount: 2,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  };
}

describe('ThreadCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('always reserves the left thumb column; shows image when preview exists', () => {
    const { rerender } = render(<ThreadCard thread={mockThread()} previewUrl={null} />);

    expect(screen.getByTestId('thread-card-thumb-slot')).toBeInTheDocument();
    expect(screen.getByTestId('thread-card-category-placeholder')).toBeInTheDocument();
    expect(screen.queryByTestId('next-image')).not.toBeInTheDocument();

    rerender(<ThreadCard thread={mockThread()} previewUrl="https://example.com/p.jpg" />);
    expect(screen.queryByTestId('thread-card-category-placeholder')).not.toBeInTheDocument();
    expect(screen.getByTestId('next-image')).toHaveAttribute('src', 'https://example.com/p.jpg');
  });

  it('renders upvote and reply on the footer row and share/report actions', () => {
    const onShare = vi.fn();
    const onReport = vi.fn();
    render(
      <ThreadCard thread={mockThread()} previewUrl={null} onShare={onShare} onReport={onReport} />,
    );

    expect(screen.getByRole('button', { name: /upvote/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/2 replies/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /report/i })).toBeInTheDocument();
  });

  it('calls onShare and onReport without navigating', async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();
    const onReport = vi.fn();

    render(<ThreadCard thread={mockThread()} previewUrl={null} onShare={onShare} onReport={onReport} />);

    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByRole('button', { name: /report/i }));
    expect(onShare).toHaveBeenCalledTimes(1);
    expect(onReport).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
