import { CalendarClock, CalendarDays, Tag, type LucideIcon } from 'lucide-react';
import type { PostSummary } from '@/lib/blog/types';
import { cn, formatDateShort } from '@/lib/utils';

/**
 * When it was published, whether it has been revised, and what it is filed
 * under.
 *
 * One presentation of the set at every width. There used to be two — the plaque
 * beside the body from `xl`, and below that a run of small caps inside the hero
 * card — on the reasoning that a stack of labelled rows would push a phone
 * reader's first paragraph down the page. The plaque is about 130px tall and it
 * lands under the print, above the copy, where it costs nothing the print did
 * not already cost; what the compact line actually bought was a second voice for
 * the same facts and no home for the article's own controls.
 *
 * `updated` appears only when the post carries one. A date labelled "updated"
 * that repeats the publication date says the post was revised on the day it went
 * out, which is not what it means.
 */

interface MetaRailProps {
  post: PostSummary;
  /**
   * Hung under the rows, inside the plaque. The article's actions live there:
   * they are things done to the piece the plaque describes, so they belong to it
   * rather than floating beside it.
   */
  footer?: React.ReactNode;
  className?: string;
}

interface Entry {
  label: string;
  value: string;
  /**
   * The glyph ahead of the value.
   *
   * Two calendars and a tag: the pair of dates are the same kind of fact and
   * should carry the same kind of mark, but they are not the same fact, and one
   * icon on both would leave the two rows differing only by a word. The clock on
   * the second is the difference — a revision is a date that happened *after*
   * another one.
   */
  icon: LucideIcon;
}

function entries(post: PostSummary): Entry[] {
  // The byline is not here, and neither is the reading time. Both live on the
  // hero card's third line, where a reader meets them before they start: who
  // wrote this, and have I got time for it. Repeating either in the rail would
  // answer a question already answered.
  const rows: Entry[] = [
    { label: 'Published', value: formatDateShort(post.date), icon: CalendarDays },
  ];
  if (post.updated) {
    rows.push({ label: 'Updated', value: formatDateShort(post.updated), icon: CalendarClock });
  }
  if (post.categoryLabel) {
    rows.push({ label: 'Filed under', value: post.categoryLabel, icon: Tag });
  }
  return rows;
}

export default function MetaRail({ post, footer, className }: MetaRailProps) {
  const rows = entries(post);

  return (
    /*
     * Forest-light rather than bone, so the rail reads as a plaque beside the
     * article instead of a second sheet of the same paper the body is printed
     * on. The print above it in this column already carries bone; two bone
     * surfaces stacked read as one object cut in half.
     *
     * The rows run label-left / value-right on one line, the pattern the
     * account pages use for a record's fields (`SocietySection`'s `Field`).
     * The stacked version this replaced spent two lines and a 12px gap on
     * every fact, which for four facts is most of the print's height again.
     *
     * A shadow rather than a hairline. The `forest-light-edge` line it carried
     * was doing the separating while the article was a page of bone panels; the
     * plaque sits on open photograph, where a line one shade off its own fill is
     * the least reliable edge available — it disappears against a dark frame and
     * reads as a scratch against a bright one. `shadow-sheet` is the same pair
     * the body sheet and the print above it wear, so the three objects in this
     * column are lit the same way instead of each ending differently.
     *
     * Two surfaces, not one. The root is the tray; the facts sit on a forest
     * panel laid in it, and the tabs hang off that panel's bottom edge into the
     * tray's own colour.
     *
     * `forest-light-edge`, a step *lighter* than the `forest-light` panel and
     * tabs, and flat — no paper. The tray is only ever seen as a margin, a few
     * millimetres under the tabs and beside them, and at that width a texture is
     * detail nobody can resolve; what the margin has to do is put the panel and
     * the tabs in front of it, which one shade of the same green does on its own.
     * Lighter rather than darker for the reason the token was cut in the first
     * place — green on green only shows if the surround is the lit one; a darker
     * tray behind a dark panel is two shadows meeting.
     *
     * `shadow-bezel` rather than `shadow-sheet`: same cast shadow, plus a rim
     * turned inward, so the frame has a near lip and a far one instead of being a
     * flat band of colour. See the token.
     *
     * The root carries the radius and the shadow because it is the object's
     * silhouette. No `overflow-hidden` on it: everything inside rounds its own
     * corners, and a clip here would trap the share menu, which opens downward
     * out of the last tab.
     */
    <div className={cn('relative rounded-card bg-forest-light-edge shadow-bezel', className)}>
      {/*
       * The facts' panel. Rounded on all four corners — the top two are the
       * object's own and coincide with the root's, the bottom two are what make
       * the panel read as a card sitting in the tray rather than as the top half
       * of one box.
       *
       * The panel's own padding does the framing; the rows are tight inside it.
       * `py-1.5` a row puts 12px between one fact and the next, close enough
       * that the three read as one block rather than as three separate
       * statements — and `pt-3`/`pb-5` here add back exactly what the rows gave
       * up, so the space above "Published" and below the last fact is unchanged
       * (18px and 26px). The tabs butt against the bottom edge, which is why
       * that gutter is the larger of the two.
       *
       * `relative`, so the panel paints above the root's own inset rim, and
       * `shadow-tray` so it sits on the tray rather than being inlaid into it.
       * The same light as `shadow-sheet` at the strength a surface of the site's
       * own needs — see the token. The widget's outer edge keeps `sheet`'s pair,
       * because that edge is the one falling on the photograph.
       *
       * `border-bone/[0.12]`, the rule `SidebarTabs` draws its folder tabs with
       * — and on the bottom edge only.
       *
       * The rule is for the widget's internal divisions, not for its silhouette.
       * This panel is flush to the root on three sides, so a border there would
       * be an outline round the whole object; the bottom is the one edge with
       * another of the widget's own surfaces below it, which is the only place a
       * line has something to divide.
       *
       * The tabs hang off that edge and paint a bridge of their own fill over
       * the length of it they cover, so the rule shows where the panel meets the
       * tray and disappears where it meets a tab. See `ArticleActions`' `TAB`.
       */}
      <div className="relative rounded-card border-b border-bone/[0.12] bg-forest-light px-7 pb-5 pt-3 shadow-tray">
        <dl>
          {rows.map((row) => (
            <div
              key={row.label}
              /*
               * Centred, not baseline-aligned. Baselines were right while the row
               * was two runs of type — the label is small caps and the value is
               * not, and a shared baseline was the only thing holding them
               * together. Now the value sits in a chip whose height is set by an
               * object rather than by text, and hanging the label off the chip's
               * baseline left it riding low in a taller row. Centring puts both on
               * the chip's own axis, which is what the eye reads the row against.
               */
              className="flex items-center justify-between py-1.5"
            >
              {/*
               * The label alone, and set down rather than up. It is the question,
               * not the answer — a reader scanning this plaque wants the date and
               * the category, and "Published" is only there to say which is which.
               * Sage rather than sage-light, one step off the fill instead of near
               * bone, so it recedes behind the chip beside it.
               */}
              <dt className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-sage/75">
                {row.label}
              </dt>

              {/*
               * The leader between the label and its answer, in place of the rules
               * that used to run under each row.
               *
               * A horizontal divider separates one fact from the next; what this
               * row actually needs is the opposite — something joining the question
               * to its answer across the gap the flush-left/flush-right layout
               * opens up. It carries the chip's own fill and runs into the chip's
               * left edge with no gap, so it reads as the chip stretched back
               * towards its label rather than as a rule laid between them. The gap
               * is on the label's side only, where it keeps the type off the mark.
               */}
              <div
                className="ml-3 h-0.5 min-w-4 flex-1 bg-bone/[0.08]"
                aria-hidden="true"
              />
              {/*
               * The value in a chip, with its glyph inside it.
               *
               * The tile the icon used to wear — `bone/[0.12]` on the forest fill,
               * the same one `ProfileSideNav` gives its nav items — has grown to
               * hold the value too. A tile around the mark alone made the icon the
               * object on the row and left the fact as loose type beside it; one
               * container around both makes the answer the object, which is the
               * right way round.
               *
               * The glyph leads, so the marks line up down the rail's right column
               * and a value that wraps keeps its mark with the words it belongs to.
               */}
              <dd className="min-w-0">
                <span className="inline-flex items-center gap-2 rounded-lg bg-bone/[0.08] px-2.5 py-1.5">
                  <row.icon
                    className="h-4 w-4 shrink-0 text-sage-light"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 text-sm leading-snug text-bone/80">{row.value}</span>
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/*
       * The tabs, hung off the panel's bottom edge into the tray.
       *
       * The tabs carry the panel's own `forest-light` and the tray behind them is
       * a step lighter, so what separates them from their ground is depth rather
       * than a change of material: they read as the panel carrying on past its
       * edge, across a lit frame, which is what a tab is. The gap either side of
       * the pair is the only place that frame is seen, and it is the whole reason
       * the tray is a different value at all.
       *
       * `pr-7` is the panel's own gutter, so the tab set ends on the line the
       * values above it are hung off, clear of the corner's 20px curve rather
       * than part way round it. `pb-2` leaves the tray showing under the tabs,
       * which is what lets their bottom corners be seen at all.
       *
       * No rule anywhere. The colour change is the division; a hairline on top of
       * it would be the boundary stated twice.
       */}
      {footer && <div className="relative flex justify-end pb-2 pr-7">{footer}</div>}
    </div>
  );
}
