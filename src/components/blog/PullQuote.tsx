import { cn } from '@/lib/utils';

interface PullQuoteProps {
  /** The quoted words. Written without surrounding quote marks; they are added here. */
  children: React.ReactNode;
  /** Who said it, e.g. "Jane Doe, Chairperson". Omit for an unattributed quote. */
  attribution?: string;
  className?: string;
}

/**
 * A quote lifted out of the running text and set on graph paper.
 *
 * Insertable from article content with a `>` block:
 *
 *     > We are not trying to replace the noticeboard. We are trying to make one
 *     > that everybody can read.
 *     > Jane Doe, Chairperson
 *
 * The last line of the block becomes the attribution when it has no trailing
 * full stop.
 *
 * Bone, against the white sheet the article is set on. It is the one region in
 * the body that is meant to be lifted out of the reading, and the page's own
 * paper is the obvious thing to lift it with: the quote reads as a piece of the
 * surrounding page laid into the sheet, which is what a pull quote is.
 *
 * The surface runs at full strength through the middle and fades out at the
 * perimeter (`.surface-edge-fade`), over the outer 5% of each axis. The fill
 * and the graph paper share one mask by nesting inside it, so they thin
 * together.
 *
 * No border, and nothing else drawing the boundary: the fade is what says where
 * the panel stops. It carried a sage hairline while the surface was the other
 * way round — full against the line and thinning toward the middle — which
 * needed the line to hold a panel whose middle had dissolved. With the paper
 * solid where the words are, the panel is legible as an object on its own, and
 * a line round it only re-drew an edge the fade had just softened.
 */
export default function PullQuote({ children, attribution, className }: PullQuoteProps) {
  return (
    <figure
      className={cn(
        'relative my-10 overflow-hidden rounded-card md:my-14',
        className
      )}
    >
      <div
        className="surface-edge-fade pointer-events-none absolute inset-0 bg-bone"
        aria-hidden="true"
      >
        <div className="texture-grid-page absolute inset-0" />
      </div>

      <blockquote
        className={cn(
          'relative px-5 pt-8 md:px-8 md:pt-12',
          attribution ? 'pb-5 md:pb-6' : 'pb-8 md:pb-12'
        )}
      >
        <p className="font-display text-heading-md leading-[1.35] text-forest">
          &ldquo;{children}&rdquo;
        </p>
      </blockquote>

      {attribution && (
        <figcaption className="relative px-5 pb-8 font-body text-xs font-semibold uppercase tracking-[0.15em] text-forest/70 md:px-8 md:pb-12">
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
