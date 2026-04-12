import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import PollDisplay from '../PollDisplay';
import type { Poll } from '@/types';

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

const mockPoll: Poll = {
  question: 'Which is better?',
  options: [
    { id: 'opt-a', text: 'Option A', votes: 0, voters: [] },
    { id: 'opt-b', text: 'Option B', votes: 0, voters: [] },
  ],
  allowMultiple: false,
  isClosed: false,
  creatorId: 'member-1',
};

describe('PollDisplay', () => {
  it('places the question heading on the same row as the Community Poll label', () => {
    render(<PollDisplay poll={mockPoll} />);

    expect(screen.getByText('Community Poll')).toBeInTheDocument();
    const heading = screen.getByRole('heading', { level: 3, name: /which is better/i });
    expect(heading).toBeInTheDocument();

    const sharedRow = heading.parentElement;
    expect(sharedRow?.textContent).toContain('Community Poll');
  });

  it('places View voters in the header to the left of the Open/Closed badge, not beside an option row', () => {
    const pollWithVoters: Poll = {
      ...mockPoll,
      isClosed: true,
      options: [
        { id: 'opt-a', text: 'Option A', votes: 1, voters: ['user-1'] },
        { id: 'opt-b', text: 'Option B', votes: 0, voters: [] },
      ],
    };

    render(
      <PollDisplay poll={pollWithVoters} hasVoted votedFor={['opt-a']} voterNames={{ 'user-1': 'Alex' }} />
    );

    const headerToggle = screen.getByRole('button', { name: /view voters/i });
    expect(headerToggle.textContent).toMatch(/view voters/i);
    const statusBadge = screen.getByText('Closed');
    expect(statusBadge.compareDocumentPosition(headerToggle)).toBe(Node.DOCUMENT_POSITION_PRECEDING);

    expect(screen.queryByRole('button', { name: /view \d+ voter/i })).toBeNull();
    const optionBlock = screen.getByText('Option A').closest('button')?.parentElement;
    expect(optionBlock?.querySelector('button')?.textContent).toContain('Option A');
  });

  it('makes the total vote summary a toggle that shares state with the header voter control', () => {
    const pollWithVoters: Poll = {
      ...mockPoll,
      isClosed: true,
      options: [{ id: 'opt-a', text: 'Option A', votes: 1, voters: ['user-1'] }],
    };

    render(
      <PollDisplay poll={pollWithVoters} hasVoted votedFor={['opt-a']} voterNames={{ 'user-1': 'Alex' }} />
    );

    const headerToggle = screen.getByRole('button', { name: /view voters/i });
    const totalToggle = screen.getByRole('button', { name: /1 total vote/i });
    expect(totalToggle.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(totalToggle);
    expect(headerToggle.getAttribute('aria-expanded')).toBe('true');
    expect(totalToggle.getAttribute('aria-expanded')).toBe('true');

    const voterList = screen.getByRole('list', { name: /voters for this option/i });
    expect(voterList.className).toContain('max-h-[200px]');
  });

  it('renders the vote summary footer row without a top border divider', () => {
    render(<PollDisplay poll={mockPoll} />);
    const voteSummary = screen.getByText(/total vote/);
    const footerRow = voteSummary.parentElement?.parentElement;
    expect(footerRow).toBeTruthy();
    expect(footerRow?.className).not.toContain('border-t');
    expect(footerRow?.className).toContain('items-end');
    expect(footerRow?.className).toContain('mt-4');
    expect(footerRow?.className).not.toContain('mb-4');
    expect(footerRow?.className).not.toMatch(/\bitems-center\b/);
  });

  it('places the vote summary row after the poll options in the DOM', () => {
    render(<PollDisplay poll={mockPoll} />);
    const pollRoot = screen.getByText('Community Poll').closest('div.bg-gradient-to-br');
    expect(pollRoot).toBeTruthy();
    const children = Array.from(pollRoot!.children);
    const totalIdx = children.findIndex((el) => el.textContent?.includes('total vote'));
    const optionsIdx = children.findIndex((el) => el.className.includes('flex flex-col gap-xs'));
    expect(totalIdx).toBeGreaterThan(-1);
    expect(optionsIdx).toBeGreaterThan(-1);
    expect(totalIdx).toBeGreaterThan(optionsIdx);
  });
});
