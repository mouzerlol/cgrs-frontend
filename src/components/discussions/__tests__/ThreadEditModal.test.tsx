import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThreadEditModal from '../ThreadEditModal';
import type { Thread, Poll } from '@/types';

// Setup DOM environment
beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn(), refresh: vi.fn() }),
}));

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, ...props }: { icon: string }) => (
    <span data-testid="icon" data-icon={icon} {...props} />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/Button', () => {
  const MockButton = ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button" {...props}>
      {children}
    </button>
  );
  return { default: MockButton, Button: MockButton };
});

vi.mock('@/components/ui/Modal', () => ({
  Modal: ({ isOpen, onClose, children, title }: any) =>
    isOpen ? (
      <div data-testid="modal" role="dialog" aria-label={title}>
        <button data-testid="modal-close" onClick={onClose} aria-label="Close">
          X
        </button>
        {children}
      </div>
    ) : null,
}));

// Sample test data
const mockThread: Thread = {
  id: 'thread-1',
  title: 'Original Title',
  body: 'Original body content',
  category: 'general',
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
  updatedAt: '2026-01-10T10:00:00Z',
  isEdited: false,
  upvotes: 5,
  upvotedBy: [],
  replyCount: 2,
  isPinned: false,
  isLocked: false,
  isDeleted: false,
  bookmarkedBy: [],
  reportedBy: [],
};

const mockPoll: Poll = {
  id: 'poll-1',
  question: 'What is your favorite color?',
  options: [
    { id: 'opt-1', text: 'Red', votes: 5, voters: ['user-1', 'user-2'] },
    { id: 'opt-2', text: 'Blue', votes: 3, voters: ['user-3'] },
  ],
  allowMultiple: false,
  isClosed: false,
  creatorId: 'user-1',
  creatorClerkUserId: 'user-1',
  voterDisplayNames: {},
};

describe('ThreadEditModal', () => {
  const defaultProps = {
    thread: mockThread,
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    isSaving: false,
    currentUserId: 'user-1',
  };

  describe('Rendering', () => {
    it('renders when isOpen is true', () => {
      render(<ThreadEditModal {...defaultProps} />);
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });

    it('does not render when isOpen is false', () => {
      render(<ThreadEditModal {...defaultProps} isOpen={false} />);
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('pre-fills title with current thread title', () => {
      render(<ThreadEditModal {...defaultProps} />);
      const titleInput = document.querySelector('input[id="edit-title"]') as HTMLInputElement;
      expect(titleInput.value).toBe('Original Title');
    });

    it('pre-fills body with current thread body', () => {
      render(<ThreadEditModal {...defaultProps} />);
      const bodyTextarea = document.querySelector('textarea[id="edit-body"]') as HTMLTextAreaElement;
      expect(bodyTextarea.value).toBe('Original body content');
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup();
      render(<ThreadEditModal {...defaultProps} />);

      const closeButton = screen.getByTestId('modal-close');
      await user.click(closeButton);

      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onSave with updated title when save is clicked', async () => {
      const user = userEvent.setup();
      render(<ThreadEditModal {...defaultProps} />);

      const titleInput = document.querySelector('input[id="edit-title"]') as HTMLInputElement;
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Title');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(defaultProps.onSave).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Updated Title' }),
      );
    });
  });

  describe('Loading States', () => {
    it('disables buttons when isSaving is true', () => {
      render(<ThreadEditModal {...defaultProps} isSaving={true} />);
      const saveButtons = screen.getAllByRole('button');
      expect(saveButtons.some((b) => b.textContent?.includes('Saving'))).toBe(true);
    });
  });

  describe('Poll Display', () => {
    it('shows Add Poll button when thread has no poll', () => {
      render(<ThreadEditModal {...defaultProps} thread={mockThread} />);
      expect(screen.getByText('Add Poll')).toBeInTheDocument();
    });

    it('shows Poll section when thread has a poll', () => {
      const threadWithPoll = { ...mockThread, poll: mockPoll };
      render(<ThreadEditModal {...defaultProps} thread={threadWithPoll} />);
      // Should show "Poll" in the poll section header
      expect(screen.getByText('Poll')).toBeInTheDocument();
    });
  });
});
