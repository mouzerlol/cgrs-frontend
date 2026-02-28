import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadList from '../ThreadList';
import type { Thread, DiscussionCategory } from '@/types';

// Setup DOM environment
beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock next/navigation - ThreadCard/ThreadCardCompact use useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), prefetch: vi.fn(), forward: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/discussion',
}));

// Properly mock next/image with default export
vi.mock('next/image', async () => {
  const actual = await vi.importActual('next/image');
  return {
    ...actual,
    __default__: (props: any) => {
      const { src, alt, ...rest } = props;
      return <img data-testid="next-image" src={src} alt={alt} {...rest} />;
    },
    default: (props: any) => {
      const { src, alt, ...rest } = props;
      return <img data-testid="next-image" src={src} alt={alt} {...rest} />;
    },
  };
});

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} data-testid="icon" />,
}));

// Sample test data
const mockCategories: DiscussionCategory[] = [
  { id: '1', name: 'Introductions', slug: 'introductions', icon: 'lucide:user', color: 'terracotta', description: 'Introduce yourself' },
  { id: '2', name: 'Announcements', slug: 'announcements', icon: 'lucide:megaphone', color: 'forest', description: 'Official announcements' },
  { id: '3', name: 'General', slug: 'general', icon: 'lucide:message-circle', color: 'sage', description: 'General discussion' },
];

const mockThreads: Thread[] = [
  {
    id: 'thread-001',
    title: 'Welcome to the Community!',
    body: 'This is a welcome thread.',
    category: 'introductions',
    author: {
      id: 'user-001',
      displayName: 'TestUser',
      avatar: '/images/avatars/default.svg',
      title: 'New Member',
      badges: [],
      stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 1 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-01-10T10:00:00Z',
    upvotes: 5,
    upvotedBy: [],
    replyCount: 2,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
  },
  {
    id: 'thread-002',
    title: 'Community BBQ This Weekend',
    body: 'Join us for a BBQ!',
    category: 'general',
    author: {
      id: 'user-002',
      displayName: 'AnotherUser',
      avatar: '/images/avatars/default.svg',
      title: 'Active Member',
      badges: [],
      stats: { upvotesReceived: 10, repliesCount: 5, threadsCreated: 3 },
      createdAt: '2026-01-01',
    },
    createdAt: '2026-01-12T14:00:00Z',
    upvotes: 15,
    upvotedBy: ['user-003'],
    replyCount: 8,
    isPinned: true,
    pinnedAt: '2026-01-12',
    bookmarkedBy: [],
    reportedBy: [],
  },
  {
    id: 'thread-003',
    title: 'Announcement: New Rules',
    body: 'Please read the new community guidelines.',
    category: 'announcements',
    author: {
      id: 'user-003',
      displayName: 'Moderator',
      avatar: '/images/avatars/committee.svg',
      title: 'Moderator',
      badges: ['committee'],
      stats: { upvotesReceived: 50, repliesCount: 20, threadsCreated: 10 },
      createdAt: '2025-01-01',
    },
    createdAt: '2026-01-15T09:00:00Z',
    upvotes: 25,
    upvotedBy: [],
    replyCount: 5,
    isPinned: true,
    pinnedAt: '2026-01-15',
    bookmarkedBy: [],
    reportedBy: [],
  },
];

describe('ThreadList', () => {
  const defaultProps = {
    threads: mockThreads,
    viewMode: 'compact' as const,
    upvotedThreads: new Set<string>(),
    bookmarkedThreads: new Set<string>(),
    onUpvote: vi.fn(),
    onBookmark: vi.fn(),
    onReport: vi.fn(),
    onShare: vi.fn(),
    showCategory: true,
    isLoading: false,
    skeletonCount: 3,
    emptyMessage: 'No discussions yet.',
  };

  describe('Rendering', () => {
    it('renders all threads in compact view', () => {
      render(<ThreadList {...defaultProps} />);

      expect(screen.getByText('Welcome to the Community!')).toBeInTheDocument();
      expect(screen.getByText('Community BBQ This Weekend')).toBeInTheDocument();
      expect(screen.getByText('Announcement: New Rules')).toBeInTheDocument();
    });

    it('renders all threads in card view', () => {
      render(<ThreadList {...defaultProps} viewMode="card" />);

      expect(screen.getByText('Welcome to the Community!')).toBeInTheDocument();
      expect(screen.getByText('Community BBQ This Weekend')).toBeInTheDocument();
      expect(screen.getByText('Announcement: New Rules')).toBeInTheDocument();
    });

    it('renders empty state when no threads', () => {
      render(<ThreadList {...defaultProps} threads={[]} />);

      expect(screen.getByText('No discussions yet.')).toBeInTheDocument();
    });

    it('renders custom empty message', () => {
      render(<ThreadList {...defaultProps} threads={[]} emptyMessage="Custom empty message" />);

      expect(screen.getByText('Custom empty message')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('shows only threads for specific category', () => {
      const introThreads = mockThreads.filter(t => t.category === 'introductions');
      render(<ThreadList {...defaultProps} threads={introThreads} />);

      expect(screen.getByText('Welcome to the Community!')).toBeInTheDocument();
      expect(screen.queryByText('Community BBQ This Weekend')).not.toBeInTheDocument();
    });

    it('shows empty state for category with no threads', () => {
      render(<ThreadList {...defaultProps} threads={[]} emptyMessage="No threads in this category" />);

      expect(screen.getByText('No threads in this category')).toBeInTheDocument();
    });
  });

  describe('View Toggle', () => {
    it('renders in compact view by default', () => {
      render(<ThreadList {...defaultProps} viewMode="compact" />);

      // Compact view should have space-y class
      const container = document.querySelector('[class*="space-y"]');
      expect(container).toBeInTheDocument();
    });

    it('renders in card view when specified', () => {
      render(<ThreadList {...defaultProps} viewMode="card" />);

      // Card view should have grid class
      const container = document.querySelector('[class*="grid"]');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onUpvote when upvote button is clicked', async () => {
      const user = userEvent.setup();
      render(<ThreadList {...defaultProps} />);

      const upvoteButton = screen.getAllByRole('button', { name: /upvote/i })[0];
      await user.click(upvoteButton);

      expect(defaultProps.onUpvote).toHaveBeenCalledWith('thread-001');
    });

    it('does not crash when callbacks are not provided', () => {
      const noCallbacks = {
        ...defaultProps,
        onUpvote: undefined,
        onBookmark: undefined,
        onReport: undefined,
        onShare: undefined,
      };

      render(<ThreadList {...noCallbacks} />);

      // Should still render without errors
      expect(screen.getByText('Welcome to the Community!')).toBeInTheDocument();
    });
  });

  describe('Category Badges', () => {
    it('renders without errors when showCategory is true', () => {
      // This test verifies the component renders without crashing
      // when category badges are enabled
      const { container } = render(<ThreadList {...defaultProps} showCategory={true} />);
      expect(container.querySelector('.space-y-2')).toBeInTheDocument();
    });
  });
});

describe('ThreadList Filtering Logic', () => {
  // Test the filtering logic used in the DiscussionPage
  const filterAndSortThreads = (
    threads: Thread[],
    category: string | null,
    search: string,
    sort: 'newest' | 'oldest' | 'most-replies' | 'most-upvotes'
  ) => {
    let result = [...threads];

    // Filter by category
    if (category) {
      result = result.filter(thread => thread.category === category);
    }

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(thread =>
        thread.title.toLowerCase().includes(searchLower) ||
        thread.body.toLowerCase().includes(searchLower)
      );
    }

    // Sort threads
    switch (sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'most-replies':
        result.sort((a, b) => b.replyCount - a.replyCount);
        break;
      case 'most-upvotes':
        result.sort((a, b) => b.upvotes - a.upvotes);
        break;
    }

    return result;
  };

  it('filters by category correctly', () => {
    const result = filterAndSortThreads(mockThreads, 'introductions', '', 'newest');

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Welcome to the Community!');
  });

  it('shows all threads when category is null', () => {
    const result = filterAndSortThreads(mockThreads, null, '', 'newest');

    expect(result.length).toBe(3);
  });

  it('filters by search term correctly', () => {
    const result = filterAndSortThreads(mockThreads, null, 'BBQ', 'newest');

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Community BBQ This Weekend');
  });

  it('sorts by newest correctly', () => {
    const result = filterAndSortThreads(mockThreads, null, '', 'newest');

    expect(result[0].title).toBe('Announcement: New Rules'); // Most recent
  });

  it('sorts by oldest correctly', () => {
    const result = filterAndSortThreads(mockThreads, null, '', 'oldest');

    expect(result[0].title).toBe('Welcome to the Community!'); // Oldest
  });

  it('sorts by most replies correctly', () => {
    const result = filterAndSortThreads(mockThreads, null, '', 'most-replies');

    expect(result[0].title).toBe('Community BBQ This Weekend'); // 8 replies
  });

  it('sorts by most upvotes correctly', () => {
    const result = filterAndSortThreads(mockThreads, null, '', 'most-upvotes');

    expect(result[0].title).toBe('Announcement: New Rules'); // 25 upvotes
  });

  it('combines category filter with search', () => {
    const result = filterAndSortThreads(mockThreads, 'general', 'BBQ', 'newest');

    expect(result.length).toBe(1);
    expect(result[0].title).toBe('Community BBQ This Weekend');
  });
});
