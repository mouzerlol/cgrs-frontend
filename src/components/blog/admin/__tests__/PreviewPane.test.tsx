import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PreviewPane from '../PreviewPane';
import type { BlogPreviewResponse } from '@/types/blog-admin';

/**
 * The preview's whole promise is that it is not a second renderer: it draws the
 * API's parsed blocks with the same components the public article page uses, so
 * an author can trust what they are looking at.
 *
 * These assert the places that promise has actually leaked. It is not a general
 * test of the renderer — `blocks/__tests__/BlockRenderer.test.tsx` is that.
 */

vi.mock('next/image', () => ({
  default: function MockImage(props: Record<string, unknown>) {
    const { fill, priority, sizes, unoptimized, alt, ...rest } = props;
    return <img {...rest} alt={typeof alt === 'string' ? alt : ''} />;
  },
}));

const LEAD =
  'The committee met on Tuesday to settle the concrete pad, and the decision it ' +
  'reached is set out below along with the conditions attached to it.';

function preview(overrides: Partial<BlogPreviewResponse> = {}): BlogPreviewResponse {
  return {
    schemaVersion: 1,
    slug: 'a-draft',
    blocks: [{ type: 'paragraph', runs: [{ text: LEAD }] }],
    excerpt: 'An excerpt.',
    excerptDerived: false,
    readingTime: 2,
    diagnostics: { errors: [], warnings: [], blockingFields: [] },
    ...overrides,
  };
}

describe('PreviewPane', () => {
  it('opens the draft on a drop cap, block and all', () => {
    /*
     * The cap used to come out as bare sage-light type on paper here: the block
     * behind the letter was painted by the article page's body plate, which the
     * preview has no equivalent of. It travels with the letter now, so the
     * author sees the article's actual opening.
     */
    const { container } = render(<PreviewPane preview={preview()} isPending={false} />);

    const cap = container.querySelector('span.bg-forest-light');
    expect(cap).not.toBeNull();
    expect(cap!.textContent).toBe('T');
  });

  it('indents the body past the cap’s gutter, as the article page does', () => {
    // Without it the cap's block hangs off the copy's left edge and out through
    // the pane's own padding, which is not what publishing would produce.
    const { container } = render(<PreviewPane preview={preview()} isPending={false} />);

    expect(container.querySelector('.md\\:ml-\\[7rem\\]')).not.toBeNull();
  });

  it('shows the excerpt, because it publishes under the author’s name', () => {
    render(<PreviewPane preview={preview()} isPending={false} />);

    expect(screen.getByText('An excerpt.')).toBeInTheDocument();
  });

  it('gives the excerpt its own pane, separate from the body', () => {
    /*
     * The excerpt used to sit as a lede inside the body's frame, which read as
     * the article's opening paragraph. It is not: it is what the listing card
     * shows, what search engines take as the description, and what a shared link
     * previews with — and it may not be the author's words at all.
     */
    render(<PreviewPane preview={preview()} isPending={false} />);

    expect(screen.getByText('Excerpt')).toBeInTheDocument();
    expect(screen.getByText('Article')).toBeInTheDocument();
  });

  it('says when an excerpt was written by the author', () => {
    render(<PreviewPane preview={preview({ excerptDerived: false })} isPending={false} />);

    expect(screen.getByTestId('excerpt-origin')).toHaveTextContent('Authored');
  });

  it('says when one was derived from the opening paragraph instead', () => {
    // The case that matters: this text publishes under the author's byline
    // without them having written it, and it is what most readers see first.
    render(<PreviewPane preview={preview({ excerptDerived: true })} isPending={false} />);

    expect(screen.getByTestId('excerpt-origin')).toHaveTextContent(
      'Derived from opening paragraph'
    );
  });

  it('does not repeat the derived-excerpt warning the badge already carries', () => {
    const derived = preview({
      excerptDerived: true,
      diagnostics: {
        errors: [],
        warnings: [
          {
            field: 'excerpt',
            message: 'No excerpt was given, so one was derived from the opening paragraph.',
          },
        ],
        blockingFields: [],
      },
    });

    render(<PreviewPane preview={derived} isPending={false} />);

    expect(screen.queryByText(/No excerpt was given/)).not.toBeInTheDocument();
  });

  it('says so when there is nothing to draw yet', () => {
    render(<PreviewPane preview={null} isPending={false} />);

    expect(screen.getByText(/preview will appear here/)).toBeInTheDocument();
  });

  it('repeats the API’s warnings where the author is looking', () => {
    const withWarning = preview({
      diagnostics: {
        errors: [],
        warnings: [{ field: 'body', message: 'Raw HTML was removed.' }],
        blockingFields: [],
      },
    });

    render(<PreviewPane preview={withWarning} isPending={false} />);

    expect(screen.getByText('Raw HTML was removed.')).toBeInTheDocument();
  });
});
