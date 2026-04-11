import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadBody from '../ThreadBody';
import type { Thread } from '@/types';

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: undefined }),
}));

vi.mock('@/hooks/useThreadAttachmentImages', () => ({
  useThreadAttachmentImages: () => ({ images: [], isLoading: false }),
}));

vi.mock('@iconify/react', () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

function mockThread(overrides: Partial<Thread> = {}): Thread {
  return {
    id: 't1',
    title: 'Title',
    body: 'Opening paragraph text.',
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

describe('ThreadBody', () => {
  it('adds bottom margin on prose block matching thread body top offset (mb-6)', () => {
    render(<ThreadBody thread={mockThread()} />);
    const prose = screen.getByText('Opening paragraph text.').closest('.prose');
    expect(prose).toBeTruthy();
    expect(prose?.className).toContain('mb-6');
  });
});
