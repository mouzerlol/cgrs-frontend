import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarLayout } from '../SidebarLayout';
import type { SidebarCategory } from '../SidebarLayout';

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

const mockCategories: SidebarCategory[] = [
  { id: 'introductions', name: 'Introductions', icon: 'lucide:user', count: 3 },
  { id: 'announcements', name: 'Announcements', icon: 'lucide:megaphone', count: 1 },
  { id: 'general', name: 'General', icon: 'lucide:message-circle', count: 2 },
];

describe('SidebarLayout', () => {
  const defaultProps = {
    categories: mockCategories,
    activeCategory: null as string | null,
    onCategoryChange: vi.fn(),
    showAllOption: true,
    children: <div data-testid="children-content">Test Children</div>,
  };

  describe('Rendering', () => {
    it('renders layout with children', () => {
      render(<SidebarLayout {...defaultProps} />);
      expect(screen.getByTestId('children-content')).toBeInTheDocument();
    });

    it('renders sidebar with all category tabs plus All option', () => {
      render(<SidebarLayout {...defaultProps} />);
      expect(screen.getByRole('tab', { name: /all categories/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /introductions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /announcements/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /general/i })).toBeInTheDocument();
    });

    it('shows correct counts in sidebar', () => {
      render(<SidebarLayout {...defaultProps} />);
      const introTab = screen.getByRole('tab', { name: /introductions/i });
      expect(introTab.textContent).toContain('3');
    });

    it('marks active category with aria-selected', () => {
      render(<SidebarLayout {...defaultProps} activeCategory="introductions" />);
      const introTab = screen.getByRole('tab', { name: /introductions/i });
      expect(introTab).toHaveAttribute('aria-selected', 'true');
    });

    it('marks All Categories active when no active category', () => {
      render(<SidebarLayout {...defaultProps} activeCategory={null} />);
      const allTab = screen.getByRole('tab', { name: /all categories/i });
      expect(allTab).toHaveAttribute('aria-selected', 'true');
    });

    it('does not show All option when showAllOption is false', () => {
      render(<SidebarLayout {...defaultProps} showAllOption={false} />);
      expect(screen.queryByRole('tab', { name: /all categories/i })).not.toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('calls onCategoryChange when category tab is clicked', async () => {
      const user = userEvent.setup();
      render(<SidebarLayout {...defaultProps} />);
      await user.click(screen.getByRole('tab', { name: /announcements/i }));
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith('announcements');
    });

    it('calls onCategoryChange with null for All Categories', async () => {
      const user = userEvent.setup();
      render(<SidebarLayout {...defaultProps} activeCategory="announcements" />);
      await user.click(screen.getByRole('tab', { name: /all categories/i }));
      expect(defaultProps.onCategoryChange).toHaveBeenCalledWith(null);
    });
  });

  describe('Accessibility', () => {
    it('has proper aria attributes on tabs', () => {
      render(<SidebarLayout {...defaultProps} activeCategory="general" />);
      const allTab = screen.getByRole('tab', { name: /all categories/i });
      expect(allTab).not.toHaveAttribute('aria-selected', 'true');
      const generalTab = screen.getByRole('tab', { name: /general/i });
      expect(generalTab).toHaveAttribute('aria-selected', 'true');
    });

    it('has navigation label', () => {
      render(<SidebarLayout {...defaultProps} ariaLabel="Discussion categories" />);
      expect(screen.getByRole('navigation', { name: /discussion categories/i })).toBeInTheDocument();
    });
  });

  describe('Without counts', () => {
    it('renders categories without counts gracefully', () => {
      const noCounts: SidebarCategory[] = [
        { id: 'intro', name: 'Introductions', icon: 'lucide:user' },
      ];
      render(<SidebarLayout {...defaultProps} categories={noCounts} showAllOption={false} />);
      expect(screen.getByRole('tab', { name: /introductions/i })).toBeInTheDocument();
    });
  });
});
