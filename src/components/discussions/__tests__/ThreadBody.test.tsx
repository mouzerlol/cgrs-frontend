import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThreadBody from '../ThreadBody';
import type { Thread } from '@/types';

const { mockUseThreadAttachmentImages } = vi.hoisted(() => ({
  mockUseThreadAttachmentImages: vi.fn(() => ({ images: [] as { id: string; url: string; thumbnail: string; alt?: string }[], isLoading: false })),
}));

vi.mock('@/hooks/useCurrentUser', () => ({
  useCurrentUser: () => ({ data: undefined }),
}));

vi.mock('@/hooks/useThreadAttachmentImages', () => ({
  useThreadAttachmentImages: () => mockUseThreadAttachmentImages(),
}));

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill: _f, sizes: _s, unoptimized: _u, ...rest } = props;
    return <img data-testid="next-image" alt="" {...rest} />;
  },
}));

vi.mock('@/components/ui/ImageLightbox', () => ({
  default: function MockLightbox() {
    return null;
  },
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
      avatar: undefined,
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
  beforeEach(() => {
    mockUseThreadAttachmentImages.mockReturnValue({ images: [], isLoading: false });
  });

  it('adds bottom margin on prose block matching thread body top offset (mb-6)', () => {
    render(<ThreadBody thread={mockThread()} />);
    const prose = screen.getByText('Opening paragraph text.').closest('.prose');
    expect(prose).toBeTruthy();
    expect(prose?.className).toContain('mb-6');
  });

  it('renders image gallery, then body prose, then poll when all are present', () => {
    mockUseThreadAttachmentImages.mockReturnValue({
      images: [
        {
          id: 'att-1',
          url: 'https://example.com/full.jpg',
          thumbnail: 'https://example.com/thumb.jpg',
          alt: 'Thread image',
        },
      ],
      isLoading: false,
    });

    const thread = mockThread({
      attachments: [{ id: 'att-1', contentType: 'image/jpeg', byteSize: 1000 }],
      poll: {
        question: 'Which is better?',
        options: [
          { id: 'o1', text: 'A', votes: 0, voters: [] },
          { id: 'o2', text: 'B', votes: 0, voters: [] },
        ],
        allowMultiple: false,
        isClosed: false,
        creatorId: 'a1',
      },
    });

    render(<ThreadBody thread={thread} />);
    const imageButton = screen.getByRole('button', { name: /View image 1/i });
    const bodyParagraph = screen.getByText('Opening paragraph text.');
    const pollHeading = screen.getByRole('heading', { name: 'Which is better?' });

    expect(imageButton.compareDocumentPosition(bodyParagraph) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(bodyParagraph.compareDocumentPosition(pollHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });
});
