/**
 * The reader's half of the blog content contract.
 *
 * Canonical definition: `cgrs-api/docs/blog-content-contract.md`. The writer's
 * mirror is `cgrs-api/modules/blog/blocks.py`. Neither may drift from the
 * document — the shared fixtures in `__fixtures__/` are what catches it when one
 * does.
 *
 * These are the *only* shapes the public site knows about. There is no markdown
 * parser here and no HTML: a body is an ordered list of blocks, and rendering is
 * a map from block type to component.
 */

/** Bumped by the writer on any breaking change. Every version in the bucket must render. */
export const BLOCK_SCHEMA_VERSION = 1;

/**
 * A span of inline text. Attributes are omitted when unset rather than set
 * false, and there is no nesting — a bold link is one run carrying both.
 */
export interface Run {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export type ColumnAlign = 'left' | 'center' | 'right';
export type CalloutVariant = 'note' | 'warning' | 'success';

export interface ParagraphBlock {
  type: 'paragraph';
  runs: Run[];
}

export interface HeadingBlock {
  type: 'heading';
  /** 2 and 3 only. The article title is the page's sole h1. */
  level: 2 | 3;
  runs: Run[];
}

export interface ListBlock {
  type: 'list';
  items: Run[][];
}

export interface OrderedListBlock {
  type: 'orderedList';
  items: Run[][];
  start: number;
}

export interface QuoteBlock {
  type: 'quote';
  runs: Run[];
  attribution: string | null;
}

export interface FigureBlock {
  type: 'figure';
  url: string;
  alt: string;
  /** Intrinsic, so the image reserves its space before loading. */
  width: number;
  height: number;
  caption: string | null;
  credit: string | null;
}

export interface TableBlock {
  type: 'table';
  head: Run[][] | null;
  rows: Run[][][];
  /** One entry per column; null means unspecified. */
  align: (ColumnAlign | null)[];
}

export interface CalloutBlock {
  type: 'callout';
  variant: CalloutVariant;
  title: string | null;
  /** Paragraphs and lists only. A callout never nests a callout. */
  blocks: Block[];
}

export interface ThematicBreakBlock {
  type: 'thematicBreak';
}

export type Block =
  | ParagraphBlock
  | HeadingBlock
  | ListBlock
  | OrderedListBlock
  | QuoteBlock
  | FigureBlock
  | TableBlock
  | CalloutBlock
  | ThematicBreakBlock;

/** A body artifact, stored at `posts/<slug>-<hash>.json`. */
export interface BlockDocument {
  schemaVersion: number;
  slug: string;
  blocks: Block[];
}

export interface PostHero {
  url: string;
  width: number;
  height: number;
  alt: string;
  caption: string | null;
  credit: string | null;
}

/**
 * A published post as the manifest carries it — everything a listing needs and
 * no body content at all.
 */
export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  /** `YYYY-MM-DD`. */
  date: string;
  updated: string | null;
  author: string;
  categorySlug: string;
  /**
   * The label as the manifest was written with. A fallback only — the vocabulary
   * in `components/blog/categories.ts` is what a category is actually drawn as.
   */
  categoryLabel: string;
  /**
   * `public` or `owners`. Which manifest carries the post already says this, so
   * it is here for the merged listing: a gated post has to be markable once the
   * two lists are one.
   *
   * Optional because a manifest written before the gate existed has no such
   * field, and an absent one means public.
   */
  visibility?: 'public' | 'owners';
  featured: boolean;
  /** Whole minutes, minimum 1. Computed by the writer so the reader never counts. */
  readingTime: number;
  bodyKey: string;
  hero: PostHero | null;
}

export interface CategorySummary {
  slug: string;
  label: string;
  count: number;
}

/**
 * A manifest — the only way the site discovers what exists, because a public
 * bucket cannot be listed.
 *
 * There are two of this shape: `index.json` for posts anyone may see, and
 * `members-index.json` for posts gated to owners. They partition the published
 * set; a viewer who passes the gate reads a merge of the two.
 */
export interface Manifest {
  schemaVersion: number;
  generatedAt: string;
  /** Pre-sorted newest first, slug breaking ties. */
  posts: PostSummary[];
  /** Ordered by post count descending, then label. */
  categories: CategorySummary[];
}

/** Plain text of a run list. */
export function runsText(runs: Run[]): string {
  return runs.map((run) => run.text).join('');
}

/** Block types that can open an article on a drop cap: the ones that are set as text. */
type CappableBlock = ParagraphBlock | HeadingBlock;

/**
 * Whether the body opens on a drop cap, and by implication where: the very first
 * character of the very first block, in the plate's top-left corner. There is
 * only ever the one position.
 *
 * That is the whole rule, and it is deliberately blunter than what came before.
 * The cap used to hunt down the first paragraph *long enough to wrap around it*,
 * which meant an article opening on a heading — or on a short lede — put the
 * letter somewhere in the middle of the page while `BodyPlate` painted the
 * coloured block up in the corner regardless. Two rules, two positions, and on a
 * real post they landed several blocks apart.
 *
 * A cap marks where the reading starts. Where the reading starts is the top of
 * the body, so that is where it goes, and the letter it shows is whatever
 * character is actually there — the `T` of a heading as readily as the `L` of a
 * paragraph.
 *
 * A body opening on a figure, a table, a quote, or a list gets none: those carry
 * their own furniture, and a reversed capital cut into the first cell of a table
 * is not a drop cap, it is a mistake. Their articles simply open without one, and
 * `BodyPlate` leaves the corner as paper.
 */
export function hasDropCap(blocks: Block[]): boolean {
  return capBlock(blocks) !== null;
}

/** The opening block when it can carry a cap, else null. */
export function capBlock(blocks: Block[]): CappableBlock | null {
  const first = blocks[0];
  if (!first) return null;
  if (first.type !== 'paragraph' && first.type !== 'heading') return null;

  return runsText(first.runs).trim().length > 0 ? first : null;
}
