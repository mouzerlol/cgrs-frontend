'use client';

import { Bookmark, BookmarkCheck, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import ShareDropdown from '@/components/discussions/ShareDropdown';
import { useArticleEngagement } from '@/lib/blog/engagement';

interface ArticleActionsProps {
  slug: string;
  title: string;
  className?: string;
}

/**
 * What a reader can do with an article once they have it: keep it, or pass it
 * on.
 *
 * Two controls, not three. The vote is gone — see `lib/blog/engagement.ts`: the
 * public blog reads from R2 with nothing behind it to count against, so the mark
 * was this device's own and stated a total that did not exist. Saving and
 * sharing both do something a reader can verify; a vote nobody receives does
 * not.
 *
 * One presentation of them, cut into the meta plaque's bottom edge. There used
 * to be a second — a row of chips inside the hero card, for the widths at which
 * the plaque was not rendered — and now that the plaque runs at every width,
 * that row was the same two controls stated twice.
 */

/**
 * The tab: the plaque's own panel, stepping down out of its bottom edge into the
 * lighter tray below it.
 *
 * The relationship `SidebarTabs` runs, turned a quarter and read from the other
 * side. Its tabs are cut into a forest sidebar and step sideways into the
 * content; these are cut into a forest panel and step down into the tray. Same
 * statement about which layer is which — the tab is a piece of the object behind
 * the surface, not a button parked on it.
 *
 * Square on top, rounded below. The top edge is where it is still attached, so
 * it has no corners there, and the bottom is where it ends in open tray, so both
 * of those corners are its own.
 *
 * The rule follows that exactly — `bone/[0.12]` on the three free edges and
 * `border-t-0` on the attached one, which is `SidebarTabs`' `border-r-0` read
 * from the other side. A rule right round the tab would draw it as a separate
 * object laid in the tray; a rule on three sides draws the outline of one shape
 * that happens to step down out of the panel.
 *
 * Those three edges are all internal to the widget — tray on every side of them
 * — which is the only place this rule is used. The plaque's own outer edges take
 * none; see `MetaRail`.
 *
 * One width for both, wide enough for the longer of the two labels. They are a
 * set of equal choices, and a tab sized to its own word says the shorter one is
 * the lesser of them — the account and discussion sidebars set their tabs to one
 * width for the same reason.
 *
 * On hover the tab extends — it does not move, and it does not change colour. A
 * tab is attached along its top edge, so the only thing it can do is reach
 * further out of the panel it belongs to; sliding it would detach it, and
 * lighting it up would say it had become a different object. See `TAB_REACH`.
 *
 * `justify-end`, so the tile and its label are hung off the tab's bottom edge
 * rather than centred in it. That is what makes the extension read as the tab
 * moving rather than as a box getting taller with its contents stranded at the
 * top: whatever the height, the mark stays the same distance from the end.
 */
const TAB = [
  'group relative flex w-[5.5rem] flex-col items-center justify-end gap-1 rounded-b-xl px-2 py-2.5',
  'border border-t-0 border-bone/[0.12]',
  /*
   * The bridge: a hairline of the tab's own fill laid over the panel's bottom
   * rule, across exactly the width this tab covers.
   *
   * `MetaRail`'s panel is ruled along its bottom edge, which is right everywhere
   * it meets the tray and wrong for the ~11rem of that edge these two tabs hang
   * off — a line drawn across the join says the tab is a thing resting under the
   * panel rather than a piece of it. Painting over it is the same device
   * `SidebarTabs` uses at its own seam, and it beats dropping the panel's
   * `border-b`, which would give up the rule along the whole edge to fix a
   * fraction of it.
   *
   * The footer row comes after the panel in the DOM with both positioned, so
   * this paints above the rule without either needing a `z-index`.
   */
  'after:absolute after:-top-px after:inset-x-0 after:h-px after:bg-forest-light after:content-[""]',
  /*
   * `shadow-tray`, the same pair the panel above wears. Its offsets are
   * downward, so what it puts on screen is a contact edge under the tab and
   * nothing across the top — which is the only place a shadow could do harm
   * here, since that edge is where the tab is still part of the panel.
   */
  'bg-forest-light text-bone shadow-tray',
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta',
].join(' ');

/**
 * The reach, on each tab's own wrapper rather than on the button.
 *
 * `-mb-2` against the row's `pb-2`: the tab's outer box shrinks by exactly the
 * gap it is reaching into, so the line the two tabs share does not grow and the
 * widget's height never changes. Flexbox then stretches the tab's border box to
 * the line *plus* the negative margin, which is the 8px of extension — downward
 * only, because the top edge is where the line starts.
 *
 * On the wrapper because the wrapper is the flex item, not the button: the
 * bookmark tab is wrapped in an `inline-flex` div and `ShareDropdown`'s `Menu`
 * is its own. Growing the button instead would have it press against a wrapper
 * that had not moved — which is exactly the bug the share tab had while its
 * tooltip sat in between, holding an auto height the button then measured
 * itself against.
 */
const TAB_REACH = 'transition-[margin] duration-[250ms] ease-out-custom hover:-mb-2';

/** The glyph's tile: the sidebar's own, at its own 32px. */
const TAB_TILE =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta text-bone';

/**
 * The label under the tile.
 *
 * 9px, which is below where Manrope stays reliable — hence `font-micro`
 * (Atkinson Hyperlegible; see `app/layout.tsx`). At this size the face is doing
 * the work the size is taking away, and 700 rather than 600 because a hairline
 * stem at 9px is the first thing a screen loses.
 *
 * Upper case and tracked, following every other label on this plaque. It costs a
 * little of the word-shape a reader uses to recognise a word without reading it
 * — sentence case would win on that alone — but these are two known words under
 * two known marks, and matching the rail's own label voice matters more than
 * saving a glance on a word nobody has to parse.
 */
const TAB_LABEL = [
  'relative font-micro text-[0.5625rem] font-bold uppercase leading-none tracking-[0.08em] text-bone/85',
  /*
   * The top nav's own hover, verbatim: a hairline of `currentColor` drawn under
   * the word, growing from nothing to the word's full width over 250ms. The nav
   * runs it off `hover:` because the link is the hovered element; here the
   * hovered thing is the tab, so it runs off `group-hover:` instead.
   *
   * `-bottom-1` rather than the nav's `bottom-0`. There it sits inside the
   * link's own `py-1.5`; this label has none, and a rule flush to a 9px
   * cap-height line touches the glyphs.
   */
  'after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:content-[""]',
  'after:transition-[width] after:duration-[250ms] after:ease-out-custom group-hover:after:w-full',
].join(' ');

export default function ArticleActions({ slug, title, className }: ArticleActionsProps) {
  const { isBookmarked, toggleBookmark } = useArticleEngagement(slug);
  const Icon = isBookmarked ? BookmarkCheck : Bookmark;

  return (
      /*
       * A real gap now that both tabs round their own bottom corners. The
       * hairline this used to run was right while they were one strip cut in two;
       * with each one ending in its own curve, a single pixel between two rounded
       * shapes reads as a printing fault rather than as a division.
       *
       * `min-h` is what keeps the widget still while a tab reaches. Without it
       * the flex line is `max(outer heights)`, and `TAB_REACH`'s negative margin
       * makes a reaching tab's outer height *smaller* — fine while exactly one
       * tab is at rest to hold the line up, and not fine for the 250ms after the
       * pointer crosses from one tab to the other, when both are part way through
       * their transitions and every outer height in the row is short. The line
       * collapsed by whatever the smaller of the two shortfalls was and sprang
       * back, which is the jolt you see travelling up the tray.
       *
       * The figure is the resting tab, and every term in it is a class above:
       * `py-2.5` (1.25rem) + the tile's `h-8` (2rem) + `gap-1` (0.25rem) + the
       * label's own line at `leading-none` (0.5625rem) + the `border-b` (1px, and
       * only the one — the attached edge carries no rule). Keep it equal to that
       * height — larger and it sets the resting height itself, smaller and the
       * line can dip under it again.
       */
      <div className={cn('flex min-h-[4.125rem] items-stretch gap-1', className)}>
        {/*
         * No tooltip on either tab. Both carry their word under the mark, so a
         * hover bubble only repeats the label it is pointing at — and on a
         * control that reaches on hover, the bubble lands over the thing the
         * reach is meant to show.
         */}
        <div className={cn('inline-flex', TAB_REACH)}>
          <button
            type="button"
            onClick={toggleBookmark}
            aria-label={isBookmarked ? 'Unsave article' : 'Save article'}
            aria-pressed={isBookmarked}
            className={TAB}
          >
            {/*
             * Saved says so by filling the mark, not by recolouring the tab.
             * Both tabs already wear the selected treatment, so a second use of
             * the same colours for a second meaning would say nothing; a solid
             * bookmark against an outlined one is the difference readers know
             * from every other place the mark appears.
             */}
            <span className={TAB_TILE}>
              <Icon
                className={cn('h-5 w-5 shrink-0', isBookmarked && 'fill-current')}
                strokeWidth={2}
                aria-hidden
              />
            </span>
            <span className={TAB_LABEL}>Save</span>
          </button>
        </div>

        {/*
         * The share control keeps its own menu, so it stays `ShareDropdown`
         * rather than a button drawn to match: the copy-link and native-share
         * behaviour is the part worth reusing, and the tab is only its trigger.
         */}
        <ShareDropdown
          shareUrl={`/blog/${slug}`}
          threadTitle={title}
          itemLabel="article"
          unstyledTrigger
          /* The tab has "Share" set under the mark; a tooltip saying the same
             word is noise on top of a label. */
          showTooltip={false}
          className={TAB_REACH}
          /*
           * `h-full` on the trigger rather than `flex` on the wrapper. The
           * wrapper is a flex item of the tab row and stretches on its own;
           * making it a flex *container* as well moves the menu's static position
           * from "below the button" to the container's content start, which drops
           * the panel on top of the tabs instead of under them.
           */
          buttonClassName={cn(TAB, 'h-full')}
          triggerContent={
            <>
              <span className={TAB_TILE}>
                <Share2 className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
              </span>
              <span className={TAB_LABEL}>Share</span>
            </>
          }
        />
      </div>
  );
}
