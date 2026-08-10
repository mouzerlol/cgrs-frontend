import { cn } from '@/lib/utils';
import type { Block, CalloutBlock, Run } from '@/lib/blog/types';
import { hasDropCap, runsText } from '@/lib/blog/types';
import PullQuote from '../PullQuote';
import Callout from './Callout';
import ContentTable from './ContentTable';
import Figure from './Figure';
import InlineRuns from './InlineRuns';

/**
 * The body renderer: one component per block type, and no parser anywhere.
 *
 * Two callers, and they constrain the whole file. The public article page is a
 * server component; the admin preview pane is interactive and lives on the
 * client. So nothing here may touch a server-only API, and nothing may require
 * the client boundary — no hooks, no effects, no `use client`. Discovering that
 * late would mean rewriting the renderer, which is why it is stated here rather
 * than left to be inferred.
 */

/*
 * The cap, set in a filled block rather than wrapped into the text.
 *
 * The block is the unit that aligns, not the glyph: a forest-light rectangle
 * with the letter reversed out of it in sage-light, sized to the paragraph's own
 * lines so its edges land on the grid whichever letter the article opens on.
 * That is why the letter is centred inside a fixed box instead of hung off the
 * text's edge — an `A` and a `W` are 40px apart in width, so a rectangle cut to
 * the glyph would change shape article to article.
 *
 * On a phone it is the old float: the measure is too narrow to give a column of
 * text away to a gutter, so the first two lines wrap around a block that sits
 * inside the paragraph. From `md` the block leaves the flow entirely and fills
 * the gutter the whole body is indented past, so every line of the article
 * starts on one edge and the block is the only thing to the left of it.
 *
 * The span paints its own fill. It used to paint none, and rely on `BodyPlate`
 * putting a forest rectangle in the panel's top-left corner for the letter to
 * land in — which only worked on an article whose first block was the capped
 * paragraph, and only in the one place that plate exists. Anywhere else — an
 * article opening on a heading, the admin preview pane, which has no plate at
 * all — the letter came out as bare sage-light type on paper, which is close to
 * invisible and was the reported bug.
 *
 * `BodyPlate` still paints the corner when the cap *is* the opening block, so
 * the colour runs up to the panel's top edge rather than starting 2.5rem below
 * it. The two are the same fill and their edges coincide exactly (the block's
 * bottom is this span's bottom), so the overlap has no seam — but keep them in
 * step: the plate's figures are derived from this span's height.
 *
 * Rounded on the two corners that are the block's own, the same pair and the
 * same 20px radius `BodyPlate` uses. Under the plate's corner both of these are
 * covered by identical colour, so one rule serves both positions.
 */
const DROP_CAP =
  'float-left -ml-4 mr-3 flex h-[3.25rem] w-[3.25rem] items-center justify-center ' +
  'rounded-br-[20px] bg-forest-light ' +
  'font-display text-[2.375rem] leading-none text-sage-light ' +
  'md:absolute md:right-full md:top-[-0.5rem] md:float-none md:m-0 md:mr-4 md:h-[4.875rem] md:w-[6rem] ' +
  'md:rounded-tl-[20px] md:text-[4.25rem]';

/*
 * How far the body is held off the cap's block.
 *
 * From `md` that is a real gutter — 7rem, the block's 6rem plus its 1rem of
 * air — that the whole column is indented past, so every line of the article
 * starts on one edge and the block is the only thing to the left of it.
 *
 * On a phone there is no gutter and no indent: the plate is full-bleed there, so
 * the copy sits on the container's own 1rem gutter like everything else on the
 * page, and the cap is pulled out by that same 1rem to land on the screen's
 * edge — which is where the plate's corner now is. It used to be `ml-5` against
 * a `-ml-5` float, which put both a rem further in, against a plate that was
 * itself inset.
 */
const BODY_INDENT = 'md:ml-[7rem] md:pt-2';

const PARAGRAPH = 'mt-6 leading-relaxed text-forest/80 first:mt-0';

/**
 * A list marker as a hairline rather than a bullet, which is the mark the rest
 * of the system uses to separate one thing from the next.
 */
const RULED_ITEM =
  'relative pl-6 leading-relaxed text-forest/80 before:absolute before:left-0 ' +
  'before:top-[0.7em] before:h-px before:w-3 before:bg-sage';

interface BlockRendererProps {
  blocks: Block[];
  /**
   * Whether the body's first block opens on a drop cap. Off inside a callout and
   * in any context that is not the article's own opening.
   */
  dropCap?: boolean;
  /** Indent the body past the drop cap's gutter. Off for nested content. */
  indent?: boolean;
  className?: string;
}

/** Reported rather than swallowed, so an unmodelled type is visible in a log. */
function reportUnknown(type: string): void {
  console.warn(`[blog] unknown block type "${type}" was skipped`);
}

/**
 * The cap's letter, in its block.
 *
 * The letter stays the body's own first character rather than a decorative copy,
 * so the opening still reads — and still copies — whole.
 *
 * Upper-cased for the block, though. A cap is a capital by definition, and a
 * body that opens mid-sentence — a quoted fragment, a lower-case brand name, an
 * author who simply did not — otherwise put a lower-case glyph in a 4.25rem box
 * cut for a capital, sitting well short of its top edge. What copies out is the
 * opening with its first letter capitalised, which is what a printed drop cap
 * does too.
 */
function DropCapLetter({ runs }: { runs: Run[] }) {
  return <span className={DROP_CAP}>{runsText(runs).slice(0, 1).toLocaleUpperCase()}</span>;
}

/**
 * The block's runs with the cap's letter removed from the first one.
 *
 * Done on the runs rather than on the joined text so the rest of the first run
 * keeps whatever formatting it carried.
 */
function runsAfterCap(runs: Run[]): Run[] {
  const [first, ...rest] = runs;
  return [{ ...first, text: first.text.slice(1) }, ...rest];
}

function CalloutContents({ block }: { block: CalloutBlock }) {
  return (
    <Callout block={block}>
      <BlockRenderer blocks={block.blocks} dropCap={false} indent={false} />
    </Callout>
  );
}

export default function BlockRenderer({
  blocks,
  dropCap = false,
  indent = false,
  className,
}: BlockRendererProps) {
  /*
   * The cap is the body's first block or it is nothing — one rule, shared with
   * `BodyPlate` through `@/lib/blog/types`, so the corner the plate paints and
   * the letter that sits in it cannot end up on different blocks.
   */
  const capped = dropCap && hasDropCap(blocks);

  return (
    <div className={cn(indent && `max-w-[68ch] ${BODY_INDENT}`, className)}>
      {blocks.map((block, index) => {
        const carriesCap = capped && index === 0;

        switch (block.type) {
          case 'paragraph':
            return carriesCap ? (
              <p key={index} className={cn('relative', PARAGRAPH)}>
                <DropCapLetter runs={block.runs} />
                <InlineRuns runs={runsAfterCap(block.runs)} />
              </p>
            ) : (
              <p key={index} className={PARAGRAPH}>
                <InlineRuns runs={block.runs} />
              </p>
            );

          case 'heading': {
            // Level 2 and 3 only; the article title is the page's sole h1.
            const Heading = block.level === 3 ? 'h3' : 'h2';
            return (
              <Heading
                key={index}
                className={cn(
                  'font-display text-forest first:mt-0',
                  // `relative` only when this heading opens the article: the cap
                  // is positioned against its own block from `md`, and every
                  // other heading has nothing to position.
                  carriesCap && 'relative',
                  block.level === 3
                    ? 'mt-9 text-xl md:mt-10'
                    : 'mt-12 text-heading-md md:mt-14'
                )}
              >
                {carriesCap ? (
                  <>
                    <DropCapLetter runs={block.runs} />
                    <InlineRuns runs={runsAfterCap(block.runs)} />
                  </>
                ) : (
                  <InlineRuns runs={block.runs} />
                )}
              </Heading>
            );
          }

          case 'list':
            return (
              <ul key={index} className="mt-5 space-y-3">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className={RULED_ITEM}>
                    <InlineRuns runs={item} />
                  </li>
                ))}
              </ul>
            );

          case 'orderedList':
            return (
              <ol
                key={index}
                start={block.start}
                className="mt-5 list-decimal space-y-3 pl-6"
              >
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className="pl-2 leading-relaxed text-forest/80 marker:font-mono marker:text-sm marker:font-semibold marker:text-terracotta"
                  >
                    <InlineRuns runs={item} />
                  </li>
                ))}
              </ol>
            );

          case 'quote':
            return (
              <PullQuote key={index} attribution={block.attribution ?? undefined}>
                <InlineRuns runs={block.runs} />
              </PullQuote>
            );

          case 'figure':
            return <Figure key={index} block={block} />;

          case 'table':
            return <ContentTable key={index} block={block} />;

          case 'callout':
            return <CalloutContents key={index} block={block} />;

          case 'thematicBreak':
            return <hr key={index} className="my-12 border-t border-sage/30 md:my-16" />;

          default: {
            // An artifact written by a newer schema version than this renderer
            // knows. The rest of the article still renders — the alternative is
            // a blank page for one unfamiliar block.
            reportUnknown((block as { type: string }).type);
            return null;
          }
        }
      })}
    </div>
  );
}
