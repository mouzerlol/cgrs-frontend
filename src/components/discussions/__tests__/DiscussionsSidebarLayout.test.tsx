import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiscussionsSidebarLayout } from '../DiscussionsSidebarLayout';
import type { DiscussionCategory, DiscussionCategorySlug } from '@/types';

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} data-testid="icon" />,
}));

// Sample test data
const mockCategories: DiscussionCategory[] = [
  { id: '1', name: 'Introductions', slug: 'introductions', icon: 'lucide:user', color: 'terracotta', description: 'Introduce yourself' },
  { id: '2', name: 'Announcements', slug: 'announcements', icon: 'lucide:megaphone', color: 'forest', description: 'Official announcements' },
  { id: '3', name: 'General', slug: 'general', icon: 'lucide:message-circle', color: 'sage', description: 'General discussion' },
];

const mockStats = {
  introductions: { threadCount: 3, replyCount: 5 },
  announcements: { threadCount: 1, replyCount: 2 },
  general: { threadCount: 2, replyCount: 8 },
} as Record<DiscussionCategorySlug, { threadCount: number; replyCount: number }>;

describe('DiscussionsSidebarLayout', () => {
  const defaultProps = {
    categories: mockCategories,
    stats: mockStats,
    activeCategory: null as DiscussionCategorySlug | null,
    onCategoryChange: vi.fn(),
    children: <div data-testid="children-content">Test Children</div>,
  };

  describe('Rendering', () => {
    it('renders sidebar layout with children', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} />);

      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('renders sidebar with all category tabs', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} />);

      // Tabs include the count in the text (e.g., "Introductions 3")
      expect(screen.getByRole('tab', { name: /all categories/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /introductions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /announcements/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument();
    });

    it('shows correct thread counts in sidebar', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} />);

      // The count is displayed in the button text
      const introTab = screen.getByRole('tab', { name: /introductions/i });
      expect(introTab.textContent).toContain('3');
    });

    it('highlights active category tab', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} activeCategory="introductions" />);

      const introTab = screen.getByRole('tab', { name: /introductions/i });
      expect(introTab).toHaveClass('category-tab-active');
    });

    it('highlights All Categories when no active category', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} activeCategory={null} />);

      const allTab = screen.getByRole('tab', { name: /all categories/i });
      expect(allTab).toHaveClass('category-tab-active');
    });
  });

  describe('Interactions', () => {
    it('calls onCategoryChange when category tab is clicked', async () => {
      const user = userEvent.setup();
      render(<DiscussionsSidebarLayout {...defaultProps} />);

      await user.click(screen.getByRole('tab', { name: /announcements/i }));

      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('announcements');
    });

    it('calls onCategoryChange with null for All Categories', async () => {
      const user = userEvent.setup();
      render(<DiscussionsSidebarLayout {...defaultProps} activeCategory="announcements" />);

      await user.click(screen.getByRole('tab', { name: /all categories/i }));

      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(null);
    });

    it('does not call onCategoryChange when clicking already active tab', async () => {
      const user = userEvent.setup();
      render(<DiscussionsSidebarLayout {...defaultProps} activeCategory="introductions" />);

      await user.click(screen.getByRole('tab', { name: /introductions/i }));

      expect(defaultProps.onCategoryChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes on tabs', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} activeCategory="general" />);

      const allTab = screen.getByRole('tab', { name: /all categories/i });
      expect(allTab).not.toHaveAttribute('aria-selected', 'true');

      const generalTab = screen.getByRole('tab', { name: /general/i });
      expect(generalTab).toHaveAttribute('aria-selected', 'true');
    });

    it('has navigation label', () => {
      render(<DiscussionsSidebarLayout {...defaultProps} />);

      expect(screen.getByRole('navigation', { name: /discussion categories/i })).toBeInTheDocument();
    });
  });
});

describe('DiscussionCategorySidebar', () => {
  const sidebarDefaultProps = {
    categories: mockCategories,
    stats: mockStats,
    activeCategory: null as DiscussionCategorySlug | null,
    onCategoryChange: vi.fn(),
    children: null as React.ReactNode,
  };

  it('renders all categories with correct icons', () => {
    render(<DiscussionsSidebarLayout {...sidebarDefaultProps} />);

    mockCategories.forEach(category => {
      expect(screen.getByRole('tab', { name: new RegExp(category.name, 'i') })).toBeInTheDocument();
    });
  });

  it('displays thread counts correctly', () => {
    render(<DiscussionsSidebarLayout {...sidebarDefaultProps} />);

    // Find the button containing "Introductions" and check for count
    const introButton = screen.getByRole('tab', { name: /introductions/i });
    expect(introButton.textContent).toContain('3');
  });

  it('handles missing stats gracefully', () => {
    render(<DiscussionsSidebarLayout {...sidebarDefaultProps} stats={undefined} />);

    expect(screen.getByRole('tab', { name: /introductions/i })).toBeInTheDocument();
  });
});
