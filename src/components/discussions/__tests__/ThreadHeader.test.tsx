import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ThreadHeader from '../ThreadHeader';
import type { Thread } from '@/types';

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

function mockThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Parking on Coronation Road during the school run',
    body: 'b',
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
    upvotes: 2,
    upvotedBy: [],
    replyCount: 6,
    isPinned: false,
    bookmarkedBy: [],
    reportedBy: [],
    ...overrides,
  } as Thread;
}

describe('ThreadHeader', () => {
  it('leads with the category as an icon plate over a terracotta micro-label', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    const category = screen.getByTestId('thread-category');

    expect(category.textContent).toContain('Parking');
    const label = category.querySelector('span:not([aria-hidden])');
    expect(label?.className).toContain('text-terracotta');

    const plate = category.querySelector('[aria-hidden="true"]');
    expect(plate?.className).toContain('bg-forest/[0.07]');
    expect(plate?.className).toContain('rounded-md');
  });

  it('makes the category the gutter column, carrying the rule on its right edge', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    const category = screen.getByTestId('thread-category');

    expect(category.className).toContain('sm:w-32');
    expect(category.className).toContain('sm:border-r');
    expect(category.className).toContain('sm:border-sage/40');
    expect(category.className).toContain('sm:pr-5');
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('sm:pl-5');

    // Mobile: no rule — the strip is horizontal there.
    expect(category.className).not.toMatch(/(^|\s)border-r/);
    expect(category.className).toContain('order-1');
  });

  it('scopes the rule to the title row rather than the whole card', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    // The rule is the category column's own border, so it can only ever be as tall as
    // the row it sits in — it cannot reach the body or the toolbar below.
    const row = screen.getByTestId('thread-header-top');
    expect(row.contains(screen.getByTestId('thread-category'))).toBe(true);
    expect(row.contains(screen.getByTestId('thread-header-byline'))).toBe(false);
  });

  it('centres the title on the emblem instead of stretching to the row', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    const title = screen.getByRole('heading', { level: 1 });

    expect(title.className).toContain('sm:self-start');
    expect(title.className).toContain('sm:items-center');
    // min-h tracks the emblem's height at each step, so a short title sits on its centre.
    expect(title.className).toContain('sm:min-h-[2.75rem]');
    expect(title.className).toContain('md:min-h-[3rem]');
  });

  it('indents the byline to the gutter so it lines up under the title', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    expect(screen.getByTestId('thread-header-byline').className).toContain(
      'sm:pl-[calc(8rem_+_1.25rem)]',
    );
  });

  it('gives the title its own full-width line below sm, at a smaller size', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    const title = screen.getByRole('heading', { level: 1 });

    expect(title.className).toContain('basis-full');
    expect(title.className).toContain('sm:basis-0');
    // Mobile steps down from the desktop scale.
    expect(title.className).toContain('text-xl');
    expect(title.className).toContain('sm:text-2xl');
    expect(title.className).toContain('md:text-3xl');
  });

  it('orders the category and controls above the title on mobile', () => {
    render(
      <ThreadHeader
        thread={mockThread({ isPinned: true })}
        showBackLink={false}
        documentActions={<button type="button">Save</button>}
      />,
    );

    expect(screen.getByTestId('thread-category').className).toContain('order-1');
    expect(screen.getByTestId('thread-header-controls').className).toContain('order-2');
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('order-3');
    // From sm the title takes the middle column and the controls move last.
    expect(screen.getByRole('heading', { level: 1 }).className).toContain('sm:order-2');
    expect(screen.getByTestId('thread-header-controls').className).toContain('sm:order-3');
  });

  it('renders document actions once, beside the pin', () => {
    render(
      <ThreadHeader
        thread={mockThread({ isPinned: true })}
        showBackLink={false}
        documentActions={<button type="button">Save</button>}
      />,
    );

    // One instance only: a mobile/desktop pair would duplicate the control in the DOM.
    expect(screen.getAllByRole('button', { name: 'Save' })).toHaveLength(1);
    const controls = screen.getByTestId('thread-header-controls');
    expect(within(controls).getByRole('button', { name: 'Save' })).toBeInTheDocument();
    expect(controls.textContent).toContain('Pinned');
  });

  it('keeps the byline on one row, stepping the avatar and timestamp down on mobile', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    const byline = screen.getByTestId('thread-header-byline');

    // A row at every width — it used to stack via flex-col below sm.
    expect(byline.className).not.toContain('flex-col');
    expect(byline.className).toContain('items-center');

    const meta = byline.querySelector('time')?.closest('div');
    expect(meta?.className).toContain('text-xs');
    expect(meta?.className).toContain('sm:text-sm');
  });

  it('omits the pin badge when the thread is not pinned', () => {
    render(<ThreadHeader thread={mockThread()} showBackLink={false} />);
    expect(screen.queryByText('Pinned')).toBeNull();
  });
});
