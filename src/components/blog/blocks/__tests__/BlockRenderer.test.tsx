import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import BlockRenderer from '../BlockRenderer';
import type { Block } from '@/lib/blog/types';

/**
 * Renderer tests over a corpus carrying one of every block type.
 *
 * The corpus is written here rather than imported from a generated fixture
 * origin. That origin is gone — it doubled as a bundled content source and put
 * invented posts inside the production build — and the parser's own golden
 * corpus still lives in `cgrs-api/tests/fixtures/blog/markdown`, where the
 * writer's output is asserted against markdown that produced it. What this file
 * owes is the other half of the contract: that every shape the writer may emit
 * renders, which is a statement about these block objects and needs no round
 * trip through a bucket to make.
 *
 * Keep it in step with `src/lib/blog/types.ts`. A block type added there with no
 * entry here is a type nothing proves renders.
 *
 * The renderer has two callers — the server-rendered article page and the
 * client-side admin preview — so it is exercised as both.
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

const EVERY_BLOCK_TYPE: Block[] = [
  { type: 'paragraph', runs: [{ text: LEAD }] },
  { type: 'heading', level: 2, runs: [{ text: 'What was decided' }] },
  {
    type: 'paragraph',
    runs: [
      { text: 'The full papers are in the ' },
      { text: 'society documents', href: '/society-documents' },
      { text: ', and the ' },
      { text: 'council guidance', href: 'https://example.test/guidance' },
      { text: ' explains the ' },
      { text: 'consent', bold: true },
      { text: ' path in ' },
      { text: 'general', italic: true },
      { text: ' terms.' },
    ],
  },
  {
    type: 'list',
    items: [
      [{ text: 'Drainage to be completed before the pad is used' }],
      [{ text: 'Fencing reinstated to the original line' }],
    ],
  },
  { type: 'heading', level: 3, runs: [{ text: 'The conditions' }] },
  {
    type: 'orderedList',
    start: 1,
    items: [
      [{ text: 'Lodge the application' }],
      [{ text: 'Serve notice on the neighbours' }],
      [{ text: 'Book the inspection' }],
    ],
  },
  {
    type: 'quote',
    runs: [{ text: 'The pad was never the point. The drainage was.' }],
    attribution: 'Margaret Reid, resident',
  },
  {
    type: 'figure',
    url: '/images/mangere-mountain.jpg',
    alt: 'The concrete pad as poured, looking north',
    width: 1600,
    height: 900,
    caption: 'Looking north from the reserve boundary.',
    credit: 'Coronation Gardens',
  },
  {
    type: 'table',
    head: [[{ text: 'Item' }], [{ text: 'Cost' }]],
    rows: [
      [[{ text: 'Drainage' }], [{ text: '$4,200' }]],
      [[{ text: 'Fencing' }], [{ text: '$1,850' }]],
    ],
    align: ['left', 'right'],
  },
  {
    type: 'callout',
    variant: 'note',
    title: 'Submissions close 30 September',
    blocks: [{ type: 'paragraph', runs: [{ text: 'Written submissions only.' }] }],
  },
  {
    type: 'callout',
    variant: 'warning',
    title: null,
    blocks: [{ type: 'paragraph', runs: [{ text: 'The reserve is closed while work runs.' }] }],
  },
  {
    type: 'callout',
    variant: 'success',
    title: 'Outcome',
    blocks: [{ type: 'paragraph', runs: [{ text: 'Consent granted with conditions.' }] }],
  },
  { type: 'thematicBreak' },
];

describe('BlockRenderer over the whole contract', () => {
  it('renders every block type in the corpus without throwing', () => {
    const { container } = render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} dropCap indent />);
    expect(container).not.toBeEmptyDOMElement();
  });

  it('maps headings to h2 and h3 and never to h1', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    expect(screen.getByRole('heading', { level: 2, name: 'What was decided' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'The conditions' })).toBeInTheDocument();
    // The article page owns the page's only h1.
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull();
  });

  it('renders an unordered list as items rather than as run-on copy', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    expect(
      screen.getByText('Drainage to be completed before the pad is used')
    ).toBeInTheDocument();
  });

  it('keeps an ordered list ordered, starting where the source did', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    const list = screen.getByText('Lodge the application').closest('ol');
    expect(list).not.toBeNull();
    expect(within(list!).getAllByRole('listitem')).toHaveLength(3);
  });

  it('renders a quote with its attribution lifted out of the text', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    expect(screen.getByText('Margaret Reid, resident')).toBeInTheDocument();
    expect(
      screen.getByText(/The pad was never the point/, { exact: false })
    ).toBeInTheDocument();
  });

  it('renders a figure with its intrinsic dimensions so nothing shifts on load', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    const figure = screen.getByAltText('The concrete pad as poured, looking north');
    expect(figure).toHaveAttribute('width', '1600');
    expect(figure).toHaveAttribute('height', '900');
  });

  it('offers a way into the lightbox from every in-article figure', () => {
    // The body's measure is under 350px on a phone, which is not enough for a
    // site plan or a wide landscape to be readable in place.
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    const expand = screen.getByRole('button', {
      name: 'View image full size: Looking north from the reserve boundary.',
    });
    expect(expand).toBeInTheDocument();
  });

  it('renders a table inside its own horizontally scrolling container', () => {
    const { container } = render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    // The page body must never scroll horizontally to accommodate a wide table.
    expect(container.querySelector('.overflow-x-auto')).not.toBeNull();
  });

  it('renders each callout variant with its own title or label', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    expect(screen.getByText('Submissions close 30 September')).toBeInTheDocument();
    expect(screen.getByText('Warning')).toBeInTheDocument();
    expect(screen.getByText('Outcome')).toBeInTheDocument();
  });

  it('renders inline links, sending internal ones through client-side navigation', () => {
    render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    const internal = screen.getByRole('link', { name: 'society documents' });
    expect(internal).toHaveAttribute('href', '/society-documents');
    expect(internal).not.toHaveAttribute('target');

    const external = screen.getByRole('link', { name: 'council guidance' });
    expect(external).toHaveAttribute('target', '_blank');
    expect(external).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('carries no markup from the body — the artifact holds none to carry', () => {
    const { container } = render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />);

    expect(container.querySelector('script')).toBeNull();
    expect(container.innerHTML).not.toContain('&lt;script');
  });
});

describe('degradation', () => {
  it('skips an unknown block type and still renders the rest of the article', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const blocks = [
      { type: 'paragraph', runs: [{ text: 'Before.' }] },
      { type: 'somethingNewer', payload: 'from a later schema version' },
      { type: 'paragraph', runs: [{ text: 'After.' }] },
    ] as unknown as Block[];

    render(<BlockRenderer blocks={blocks} />);

    expect(screen.getByText('Before.')).toBeInTheDocument();
    expect(screen.getByText('After.')).toBeInTheDocument();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('somethingNewer'));
  });

  it('renders an empty body as nothing rather than as a broken page', () => {
    const { container } = render(<BlockRenderer blocks={[]} />);
    expect(container.querySelector('p')).toBeNull();
  });
});

describe('the drop cap', () => {
  const long = 'x'.repeat(120);

  /** The cap's own block, which is what makes the letter legible. */
  const cap = (container: HTMLElement) => container.querySelector('span.bg-forest-light');

  it('opens the body on its first character', () => {
    const blocks = [{ type: 'paragraph', runs: [{ text: `L${long}` }] }] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    expect(cap(container)?.textContent).toBe('L');
  });

  it('caps a heading when the article opens on one', () => {
    /*
     * The cap marks where the reading starts, and it sits in the body plate's
     * top-left corner — one position, always. The old rule hunted for the first
     * paragraph long enough to wrap around, so an article opening on a heading
     * put the letter several blocks below the coloured corner it belonged in.
     */
    const blocks = [
      { type: 'heading', level: 2, runs: [{ text: 'This is test heading' }] },
      { type: 'paragraph', runs: [{ text: long }] },
    ] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    const letter = cap(container);
    expect(letter?.textContent).toBe('T');
    // In the heading, not in some later paragraph.
    expect(letter!.closest('h2')).not.toBeNull();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('This is test heading');
  });

  it('caps a short opening paragraph rather than skipping to a longer one', () => {
    const blocks = [
      { type: 'paragraph', runs: [{ text: 'Short.' }] },
      { type: 'paragraph', runs: [{ text: `L${long}` }] },
    ] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    expect(cap(container)?.textContent).toBe('S');
  });

  it('draws none when the body opens on something that carries its own furniture', () => {
    // A reversed capital cut into the first cell of a table is not a drop cap.
    const blocks = [
      {
        type: 'quote',
        runs: [{ text: 'An opening quotation.' }],
        attribution: null,
      },
      { type: 'paragraph', runs: [{ text: long }] },
    ] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    expect(cap(container)).toBeNull();
  });

  it('capitalises the letter, whatever case the copy opens in', () => {
    const blocks = [{ type: 'paragraph', runs: [{ text: `w${'e'.repeat(120)}` }] }] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    expect(cap(container)?.textContent).toBe('W');
  });

  it('keeps the letter in the sentence, so the copy still reads whole', () => {
    const blocks = [{ type: 'paragraph', runs: [{ text: `W${'e'.repeat(120)}` }] }] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} dropCap />);

    expect(container.textContent?.startsWith('W')).toBe(true);
  });

  it('draws no cap at all when the renderer is not opening an article', () => {
    const blocks = [{ type: 'paragraph', runs: [{ text: long }] }] as Block[];

    const { container } = render(<BlockRenderer blocks={blocks} />);

    expect(cap(container)).toBeNull();
  });
});

describe('both call sites', () => {
  /*
   * The public article page is a server component and the admin preview pane is
   * a client one. Neither may need the other's environment: a block component
   * that reached for a server-only API would break the preview, and one that
   * required the client boundary would force the article page off the server.
   */
  it('renders identically whether or not it is inside a client boundary', () => {
    const asServer = render(<BlockRenderer blocks={EVERY_BLOCK_TYPE} />).container.innerHTML;
    const asClient = render(
      <div data-client-boundary>
        <BlockRenderer blocks={EVERY_BLOCK_TYPE} />
      </div>
    ).container.firstElementChild!.innerHTML;

    expect(asClient).toBe(asServer);
  });
});
