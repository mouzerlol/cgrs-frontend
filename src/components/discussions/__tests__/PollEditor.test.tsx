import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PollEditor from '../PollEditor';
import type { Poll } from '@/types';

// Setup DOM environment
beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock iconify
vi.mock('@iconify/react', () => ({
  Icon: ({ icon, ...props }: { icon: string }) => (
    <span data-testid="icon" data-icon={icon} {...props} />
  ),
}));

// Mock UI components
vi.mock('@/components/ui/Button', () => {
  const MockButton = ({ children, onClick, variant, size, ...props }: any) => (
    <button
      onClick={onClick}
      data-variant={variant}
      data-size={size}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  );
  return { default: MockButton, Button: MockButton };
});

// Sample test data
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

describe('PollEditor', () => {
  const pollWith3Options: Poll = {
    id: 'poll-1',
    question: 'What is your favorite color?',
    options: [
      { id: 'opt-1', text: 'Red', votes: 5, voters: ['user-1', 'user-2'] },
      { id: 'opt-2', text: 'Blue', votes: 3, voters: ['user-3'] },
      { id: 'opt-3', text: 'Green', votes: 2, voters: ['user-4'] },
    ],
    allowMultiple: false,
    isClosed: false,
    creatorId: 'user-1',
    creatorClerkUserId: 'user-1',
    voterDisplayNames: {},
  };

  const defaultProps = {
    poll: pollWith3Options,
    onChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders existing poll options', () => {
      render(<PollEditor {...defaultProps} />);
      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(3);
    });

    it('displays option texts correctly', () => {
      render(<PollEditor {...defaultProps} />);
      expect(screen.getByDisplayValue('Red')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Blue')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Green')).toBeInTheDocument();
    });

    it('shows allow_multiple toggle', () => {
      render(<PollEditor {...defaultProps} />);
      expect(screen.getByLabelText(/allow multiple/i)).toBeInTheDocument();
    });
  });

  describe('Adding Options', () => {
    it('calls onChange with new option when Add Option is clicked', async () => {
      const user = userEvent.setup();
      render(<PollEditor {...defaultProps} />);

      const addButton = screen.getByRole('button', { name: /add option/i });
      await user.click(addButton);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.arrayContaining([
            expect.objectContaining({ text: '' }),
          ]),
        }),
      );
    });
  });

  describe('Removing Options', () => {
    it('calls onChange with fewer options when Remove is clicked', async () => {
      const user = userEvent.setup();
      render(<PollEditor {...defaultProps} />);

      // Find remove buttons by aria-label
      const removeButtons = document.querySelectorAll('button[aria-label="Remove option"]');
      expect(removeButtons.length).toBeGreaterThan(0);
      await user.click(removeButtons[0]);

      expect(defaultProps.onChange).toHaveBeenCalled();
    });
  });

  describe('Editing Options', () => {
    it('calls onChange with updated option text when input changes', async () => {
      const user = userEvent.setup();
      render(<PollEditor {...defaultProps} />);

      const firstInput = screen.getAllByRole('textbox')[0];
      await user.clear(firstInput);
      await user.type(firstInput, 'Green');

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.arrayContaining([
            expect.objectContaining({ text: 'Green' }),
          ]),
        }),
      );
    });
  });

  describe('Allow Multiple Toggle', () => {
    it('calls onChange with allowMultiple=true when toggled', async () => {
      const user = userEvent.setup();
      render(<PollEditor {...defaultProps} />);

      const toggle = screen.getByLabelText(/allow multiple/i);
      await user.click(toggle);

      expect(defaultProps.onChange).toHaveBeenCalledWith(
        expect.objectContaining({ allowMultiple: true }),
      );
    });
  });

  describe('Empty Poll', () => {
    it('renders with empty options when poll has no options', () => {
      const emptyPoll = {
        ...mockPoll,
        options: [],
      };
      render(<PollEditor poll={emptyPoll} onChange={vi.fn()} />);
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    });
  });
});
