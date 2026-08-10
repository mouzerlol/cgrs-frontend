import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { Block, PostSummary } from '@/lib/blog/types';
import { hasDropCap } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';
import { cn } from '@/lib/utils';
import { PageBreadcrumbBar } from '@/components/ui/breadcrumb';
import ArticleActions from './ArticleActions';
import ArticleCoverPlate from './ArticleCoverPlate';
import { PLATE_WIDTH } from './article-rail-geometry';
import BlockRenderer from './blocks/BlockRenderer';
import BlogPostCell, { OwnersOnlyMark } from './BlogPostCell';
import CoverScreen from './CoverScreen';
import DuotoneFilter from './DuotoneFilter';
import MetaRail from './MetaRail';
import { categoryIcon, categoryLabel } from './categories';

interface ArticleContentProps {
  post: PostSummary;
  blocks: Block[];
  relatedPosts: PostSummary[];
}

/*
 * The gap between the trail's bar and the hero card, which is all this offset
 * is now: the chrome is cleared by the article's root, and the trail sits in
 * between carrying its own bone bar.
 *
 * 1rem/1.75rem. Mobile keeps a whole rem rather than the exact half (10px),
 * which read as the card touching the strip above it rather than sitting under
 * it.
 */
const CARD_TOP = 'pt-4 md:pt-7';

/*
 * The backdrop is `object-cover`, so its height is how much of the frame is on
 * screen rather than how big the picture is: the taller it runs, the less of
 * the photograph is cropped away. 37rem/43rem became 48rem/56rem to reveal a
 * third more of it, then 64rem/77rem to give the dissolve at the bottom room to
 * run twice as long.
 *
 * Two things happen to the picture on the way down, and they are separate
 * layers because they are separate ideas.
 *
 * The screen is the first. The hero runs on open photograph at full strength —
 * the one place on the page nothing is reading through it — and from the hero
 * card's bottom edge the screen comes in over a long, gradual ramp until it
 * settles on a light floor it holds for the rest of the article. It used to be
 * a short step to a flat 50%, and 50% was too much: a cover shot in daylight
 * came out as a pale wash of itself over two thirds of the page, and the print
 * in the right-hand column had to work to read as a different object from the
 * frame behind it. This one lands at 0.28, which takes the glare off the
 * photograph and settles it behind the copy without draining the colour out of
 * it.
 *
 * Long rather than short, and that is the other change. The old ramp was 40-odd
 * pixels wedged into the gap between the card and the content, which made the
 * screen arrive as a step in the light — a second edge under the plate's own.
 * Over 18rem/26rem it reads as the picture settling rather than as a boundary
 * being crossed, which is the right description of what is happening: nothing
 * starts at the point the ramp finishes.
 *
 * The screen is not a scrim at any strength. Anything reading text sits on its
 * own opaque surface — the hero card, `BodyPlate`'s white sheet, the meta rail —
 * each of which holds AA without help from the frame. Do not start leaning on
 * this value for legibility; if copy needs surface, give it surface.
 *
 * The dissolve is the second, over the bottom 20% of the frame: the picture
 * goes progressively out of focus and fades to the page's own white. Defocus
 * alone would still end on an edge, and a fade alone was what the old wash
 * did — the pair reads as the photograph receding rather than as a band laid
 * over its foot.
 */
const SCREEN = '255,255,255'; // white
/*
 * What the foot dissolves into: the article's own ground, which is white.
 *
 * It was bone while the article's ground was, and the two have to stay the same
 * value or the picture finishes fading into a colour the page underneath is not
 * — a band of bone across a white article, which is exactly the visible edge the
 * dissolve exists to avoid.
 */
const WASH = '244,241,234'; // bone — the article's own surface

/**
 * The screen's floor: how much white it holds once the ramp has finished.
 *
 * White rather than bone, because the job here is to take light off the
 * photograph, which plain white does without dragging a hue across it. The
 * dissolve at the foot is the layer that has a destination colour to reach.
 */
const SCREEN_FLOOR = 0.28;

/**
 * Where the ramp starts: the hero card's bottom edge, in px from the frame's
 * own top, published by `CoverScreen` after it has measured the laid-out page.
 *
 * Capped at 42% because it is used raw in the stops below and the frame's
 * height is a crop decision, not a layout one. On a page that pushed the card
 * far enough down, an uncapped start would put the whole ramp inside the foot's
 * 20% and the two would fight; 42% leaves the full run clear of it under any
 * layout, and no real article comes close to reaching the cap.
 */
const HOLD = 'min(var(--screen-hold), 42%)';

/**
 * How far the ramp runs below that edge. A length rather than a fraction of the
 * frame: what it has to feel like is a slow arrival, which is a distance on
 * screen, while the frame's height is how much of the photograph is showing.
 *
 * Shorter on a phone, where the hero card is taller relative to the frame and
 * the desktop run would push the floor down into the foot's dissolve.
 */
const RUN = 'var(--screen-run)';
const SCREEN_RUN = '[--screen-run:18rem] md:[--screen-run:26rem]';

/**
 * The ramp's shape: slow to leave zero, then straightening out into the floor.
 *
 * A linear ramp over this distance shows its own start — the first few percent
 * of white against open photograph is the most visible part of the whole run,
 * and putting it at a constant rate makes the top of the ramp a faint line
 * across the picture. Holding the first third of the distance to a fifth of the
 * strength hides where it begins, which is the point of running it long.
 */
const rampStop = (fraction: number) => `calc(${HOLD} + ${RUN} * ${fraction})`;

const SCREEN_GRADIENT = [
  'linear-gradient(to bottom,',
  `rgba(${SCREEN},0) 0,`,
  `rgba(${SCREEN},0) ${HOLD},`,
  `rgba(${SCREEN},${SCREEN_FLOOR * 0.2}) ${rampStop(0.34)},`,
  `rgba(${SCREEN},${SCREEN_FLOOR * 0.55}) ${rampStop(0.68)},`,
  `rgba(${SCREEN},${SCREEN_FLOOR}) ${rampStop(1)},`,
  `rgba(${SCREEN},${SCREEN_FLOOR}) 100%)`,
].join(' ');

/**
 * The server's guess at the hero card's bottom edge, and only that: `CoverScreen`
 * measures the real one after mount and overwrites it.
 *
 * Measured from the backdrop's own top edge, which is what the gradient measures
 * from — not from the top of the page. The two are 161px apart on a desktop,
 * because the backdrop is absolute at `top-0` inside the article and so hangs
 * off the article's padding box: everything the article's own chrome offset and
 * the breadcrumb bar occupy sits above the gradient's zero. Constants taken off
 * a screenshot's page coordinates put the ramp that far down the picture, which
 * is a mistake worth not repeating — measure against this element.
 *
 * The figures are a two-line title's: the card ends at 388px on a phone and
 * 241px on a desktop. A one-line title puts it 70-odd pixels higher, which the
 * measurement corrects — and which is invisible either way now that the ramp
 * runs 18rem/26rem rather than the 40-odd pixels it used to. That length is
 * what makes a rough fallback survivable; it would not have been before.
 */
const SCREEN_HOLD = '[--screen-hold:24.25rem] md:[--screen-hold:15rem]';

/**
 * How much of the frame the dissolve occupies, measured up from its bottom edge.
 *
 * 20% is roughly 205px on a phone and 245px on a desktop. That is still long
 * enough for the defocus to arrive as a drift rather than as a boundary — the
 * ramp is a gradient the whole way, so the shorter run reads as a faster
 * recession, not a harder one — and it leaves the top 80% of the picture sharp,
 * so the frame stays in focus for most of the article rather than only for its
 * opening.
 */
const FOOT = 'h-[20%]';

/**
 * The blur ramp, as a stack of `backdrop-filter` layers over the foot.
 *
 * A single `blur()` is one radius everywhere it applies, so any mask on it only
 * decides *where* that one radius shows — the picture would step from sharp to
 * fully soft across the mask's own ramp. A progressive blur needs the radius
 * itself to grow down the frame, which CSS has no way to express directly. The
 * standard construction is this one: several layers, each blurring what the
 * layers beneath it have already blurred, each masked to a band a little
 * further down than the last. The radii compound where the bands overlap, so
 * the effective blur roughly doubles per layer while every transition stays a
 * gradient.
 *
 * Six layers from 1px, so the foot ends around 32px before compounding — the
 * point where a photograph reads as light and colour rather than as objects.
 * Fewer layers and the bands are wide enough to see individually; more and each
 * one is another full-width backdrop read for a difference no one can point at.
 *
 * Each band is 12.5% of the foot, held for one step and ramped in and out over
 * one step either side, so consecutive layers overlap by half a band. The last
 * layer holds to the bottom instead of ramping out: there is nothing below it
 * to hand off to, and letting it fade would bring the picture back into focus
 * on the very edge the dissolve is trying to lose.
 *
 * Masked rather than sized to the band, because `backdrop-filter` samples only
 * what is inside the element's own box and clamps at its edges — a short
 * element would blur its band against a duplicated edge row and leave a seam
 * where the next one starts. Every layer covers the whole foot; only the mask
 * decides where it shows.
 */
const FOOT_BLUR_LAYERS = 6;
const FOOT_BLUR_BASE = 1; // px, before compounding
const FOOT_BLUR_STEP = 12.5; // % of the foot

function footBlurLayer(index: number) {
  const start = index * FOOT_BLUR_STEP;
  const stops =
    index === FOOT_BLUR_LAYERS - 1
      ? `transparent ${start}%, #000 ${start + FOOT_BLUR_STEP}%, #000 100%`
      : `transparent ${start}%, #000 ${start + FOOT_BLUR_STEP}%, ` +
        `#000 ${start + FOOT_BLUR_STEP * 2}%, transparent ${start + FOOT_BLUR_STEP * 3}%`;
  const blur = `blur(${FOOT_BLUR_BASE * 2 ** index}px)`;
  const mask = `linear-gradient(to bottom, ${stops})`;

  return {
    backdropFilter: blur,
    WebkitBackdropFilter: blur,
    maskImage: mask,
    WebkitMaskImage: mask,
  } as React.CSSProperties;
}

/**
 * The bone the foot fades into, painted over the blur rather than under it.
 *
 * Over, because a wash beneath the stack is just more picture for the layers to
 * blur — the colour would arrive already smeared and the last layer would be
 * spending its radius on a flat field. Above the stack it is the page's surface
 * closing over a photograph that has already gone soft, which is the order the
 * two read in.
 *
 * The stops are weighted late. The first third of the foot is nearly all
 * defocus and hardly any bone, so the picture is still legibly a picture while
 * it softens; the wash only takes over in the last quarter, where it has to
 * reach solid white by the frame's bottom edge or the whole thing ends on a
 * line.
 */
const FOOT_WASH = [
  'linear-gradient(to bottom,',
  `rgba(${WASH},0) 0%,`,
  `rgba(${WASH},0.12) 40%,`,
  `rgba(${WASH},0.42) 70%,`,
  `rgba(${WASH},0.72) 87%,`,
  `rgba(${WASH},0.9) 95%,`,
  '#F4F1EA 100%)',
].join(' ');

/*
 * The plate under the body copy: the sheet the article is actually read off,
 * laid on the photograph.
 *
 * White, not the page's bone. Bone was the older argument — the plate reading as
 * the page continuing behind the picture rather than as a panel on it — and it
 * lost to the simpler one: this is the single surface on the page whose whole
 * job is long-form reading, and a warm ground under a warm photograph gives the
 * copy less separation than plain paper does. Everything around it stays bone,
 * so the page runs furniture-body-furniture by temperature: the hero card, the
 * cover print's ledge and the `Read next` band are the warm objects, and the
 * sheet between them is white. That is a deliberate two-tone, not a leftover.
 *
 * Opaque, and that is the second half of the same decision. The fill used to
 * ramp to 0.86 across its width so the photograph read a little stronger through
 * the ends of lines than their beginnings, which on bone came through as a warm
 * tint. Under white the same ramp reads as a colour cast — a sky-heavy cover
 * turned the right-hand third of the sheet faintly blue — because there is no
 * warmth in the fill to absorb it. A sheet is a sheet: the picture stops, the
 * surface starts, and every line of copy sits on the same value as every other,
 * whatever the cover happens to be doing behind it. That also means contrast is
 * decided once here rather than being a function of whichever pixel lands under
 * a given line.
 *
 * No hairline round it. It carried a `bone-edge` line for as long as the plate
 * was a bone panel that had to prove it was a different object from the bone
 * page behind it. It is neither now: the article's own ground is white, so below
 * the photograph the sheet and the page are one surface and a line round the
 * plate drew a box on nothing. The drop cap's block keeps its
 * `forest-light-edge` hairline — that one is a boundary between two colours, not
 * between a surface and itself.
 *
 * A shallow `shadow-sheet` in its place, the same pair the cover print and the
 * meta plaque in the next column wear. Where the sheet crosses the photograph it
 * needs *something* — white on a bright frame is a weak edge, and the hero's
 * wash can put a near-white sky directly under the plate's rim — and a shadow
 * says "object resting on a picture" where a line said "box drawn on a page".
 * Below the cover, where the sheet and the ground are the same white, it costs
 * nothing: there is no surface behind it for the shadow to fall on.
 *
 * From `md` the right edge is hung past the measure rather than flush to it, so
 * the last glyph of a long line sits inside a surface instead of against its
 * rim, and the left edge is flush on the container's own gutter line — the same
 * line the hero card and the trail start on — so the page's left margin stays
 * open photograph the whole way down. The two sides are asymmetric on purpose:
 * the left one carries alignment with everything above it, the right one has
 * nothing to line up with and only has to clear the text.
 *
 * Below `md` it is full-bleed instead, edge to edge of the viewport. A phone has
 * no margin worth spending on a strip of photograph either side of the reading
 * column — 16px of picture down a 390px screen is not a view of anything, it is
 * a seam — so the sheet takes the whole width and the copy keeps the container's
 * own gutter as its padding. See `MOBILE_PLATE` for why that one is a separate
 * element rather than a breakpoint on this one.
 *
 * The trail is not on this plate. The two used to share one surface because
 * stacking two screens put a visible step between them; they are separated by
 * open photograph now, which is a gap rather than a step, so there is nothing
 * left to hide.
 */
const PLATE = '#FFFFFF';

/*
 * The phone's plate, as its own element on the full-width wrapper rather than a
 * set of breakpoint overrides on the one below.
 *
 * The `md` plate is positioned against `w-fit` — a wrapper that shrink-wraps the
 * measure — so its horizontal geometry is derived from how wide the copy came
 * out. Full bleed cannot be expressed from inside that box: reaching the
 * viewport's edges from it needs the wrapper's own offset, which is the
 * container's gutter on the left and gutter-plus-whatever-the-measure-left-over
 * on the right. The second of those depends on the `68ch` cap and therefore on
 * font metrics, so any figure written here would be right on one device.
 *
 * The wrapper it hangs off instead is full width already, and its height is the
 * plate's exact intended extent: the container inside it contributes `pt-10` and
 * `pb-56`, which are the same 2.5rem above the first line and 14rem below the
 * last that the `md` plate reaches with `-top-10` and `-bottom-56`. So `inset-0`
 * on that element is the same box, minus the horizontal inset.
 *
 * No border and no corners: the left and right edges are off the side of the
 * screen, and the top and bottom follow the same rule the `md` plate does — the
 * page's own ground is white, so there is nothing here for a line to separate.
 */
const MOBILE_PLATE = 'pointer-events-none absolute inset-0 bg-white shadow-sheet md:hidden';

function BodyPlate({ children, capBlock }: { children: React.ReactNode; capBlock: boolean }) {
  return (
    /*
     * No `overflow-hidden`, deliberately, and it is load-bearing that there
     * isn't. This wrapper's box is exactly the plate's own — the container
     * inside contributes the same `pt-10`/`pb-56` the plate reaches with
     * `-top-10`/`-bottom-56` — so clipping here would cut the shadow off along
     * the plate's top and bottom edges, and the top edge is the one place it
     * matters most: that is where the sheet meets open photograph.
     *
     * It was there to swallow the plate's `-right-12` overhang, which can run
     * past the viewport between `md` and `lg`. `body { overflow-x: hidden }` in
     * `globals.css` already handles that for the whole site, so the clip was
     * doing a job that was already done — and paying for it with the shadow.
     */
    <div className="relative">
      <div aria-hidden="true" className={MOBILE_PLATE} />

      {/*
       * 2.5rem of surface above the first line — with the trail gone the copy
       * would otherwise open hard against the panel's top edge — and 14rem below
       * the last. The panel ends on a line rather than trailing off.
       */}
      <div className="container pb-56 pt-10">
        {/*
         * The measure, plus the plate's right-hand overhang as padding on this
         * wrapper rather than as a negative offset on the plate itself.
         *
         * Same result — the sheet ends 3rem past the last glyph — reached in a
         * way that cannot leave the page. A `-right-12` on the plate escapes the
         * wrapper, and `w-fit` means nobody upstream knows how far: between `md`
         * and `lg` the measure plus 3rem ran about 9px past the viewport, which
         * the wrapper above used to swallow with `overflow-hidden`. That clip is
         * what was cutting the shadow off the plate's top and bottom edges.
         *
         * As padding it is inside the box `max-w-full` clamps, so the overhang
         * simply stops at the container's gutter on a viewport too narrow to
         * hold all of it, and the measure gives up a little width there instead
         * of the page gaining a scroll axis.
         */}
        <div className="relative w-fit max-w-full md:pr-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -bottom-56 -top-10 hidden shadow-sheet md:block"
            style={{ backgroundColor: PLATE }}
          />
          {/*
           * The drop cap's block, carried up to the plate's top edge. The cap sits
           * in a 6rem gutter the body is indented past, three lines (4.875rem)
           * tall, and the plate opens 2.5rem of surface above the first line —
           * so the block runs 7.375rem from the plate's top and stops on the cap's
           * own bottom edge. It fills the corner rather than floating below it:
           * the colour starts where the panel does and ends with the letter.
           *
           * Square on the three corners it shares with the plate, and rounded
           * 20px on the bottom-right — the one corner that is the block's own
           * rather than the plate's. The top-left is the plate's corner, which
           * the block inherits by filling it, so any radius there would leave a
           * crescent of paper showing through the green. The bottom-right sits
           * inside the sheet with nothing behind it but surface, and it is the
           * corner the letter's own span rounds (`DROP_CAP`, same 20px) — leave
           * this one square and the span's radius just shows plate through it.
           * Keep the two figures in step.
           *
           * It carries the plate's hairline on the two sides it inherits — top
           * and left — in `forest-light-edge` rather than `bone-edge`, because
           * this corner of the card is not bone and a warm grey line across it
           * would read as a scratch. The other two sides take none: they are
           * inside the plate, and a line there would draw the block as a tile
           * laid on the paper rather than as part of it.
           *
           * Below `md` the same block at the phone's scale. There is no gutter
           * to give away there, so the cap stays floated into the copy — but the
           * plate still paints its fill rather than the span, for the same reason
           * it does at `md`: the colour has to run up to the panel's top edge.
           * 3.25rem wide, the float's own width, and 5.75rem tall — the 2.5rem
           * of surface above the first line plus the cap's two lines — so it
           * lands on the floated letter's bottom edge.
           *
           * `-left-4` on the phone, not `left-0`: the plate is full-bleed there,
           * so the corner the block is filling is the viewport's own edge rather
           * than the container's gutter line, and 1rem is that gutter. It keeps
           * only the hairline along its top. `BlockRenderer` pulls the
           * floated letter out by the same 1rem so the two still coincide.
           *
           * The cap is always the body's first block, so this corner is the only
           * place it is ever drawn — heading or paragraph, whichever the article
           * opens on. `hasDropCap` is the same answer `BlockRenderer` sets the
           * letter from, so the two cannot land on different blocks. Only a body
           * opening on something that carries its own furniture — a figure, a
           * table, a quote, a list — leaves this corner as paper.
           */}
          {capBlock && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-4 -top-10 h-[5.75rem] w-[3.25rem] rounded-br-[20px] border-t border-forest-light-edge bg-forest-light md:left-0 md:h-[7.375rem] md:w-24 md:border-l"
            />
          )}
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * The cover behind the opening of the page: open photograph through the hero, a
 * light screen easing in from the card's bottom edge and holding through the
 * article, then a foot where the picture goes progressively out of focus and
 * dissolves into the page's own white instead of stopping on an edge.
 *
 * No duotone here, unlike the cards' plates. Running the ramp over a frame this
 * size flattened the photograph to a single green and left nothing of the
 * picture.
 */
function CoverBackdrop({ src }: { src: string }) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 h-[64rem] md:h-[77rem]',
        SCREEN_HOLD,
        SCREEN_RUN,
      )}
      aria-hidden="true"
    >
      <Image src={src} alt="" fill priority sizes="100vw" className="object-cover" />
      {/*
       * The screen is a client component only so it can measure the edge its
       * ramp starts on; the gradient itself is still decided here. It reads the
       * fallback stop off this element until it has.
       */}
      <CoverScreen gradient={SCREEN_GRADIENT} />
      {/*
       * The foot. Its layers are siblings in paint order rather than nested,
       * which is what makes the blur compound: each `backdrop-filter` reads the
       * result of everything painted before it, so layer n blurs what layers
       * 0..n-1 already softened. Nesting them, or giving this wrapper a filter
       * or an `isolation` of its own, would cut each layer off from the picture
       * and leave six identical 1px blurs.
       */}
      <div className={cn('absolute inset-x-0 bottom-0', FOOT)}>
        {Array.from({ length: FOOT_BLUR_LAYERS }, (_, index) => (
          <div key={index} className="absolute inset-0" style={footBlurLayer(index)} />
        ))}
        <div className="absolute inset-0" style={{ backgroundImage: FOOT_WASH }} />
      </div>
    </div>
  );
}

/**
 * Category, set as an eyebrow tag. Geometry copied from
 * `BrutallyMinimalHeroHeadingCard` at `md` — the same `rounded-md` tag with a
 * glyph ahead of the label that the listing's hero carries — so the two hero
 * cards agree on what an eyebrow is instead of one rounding it into a pill.
 *
 * Forest-light, not the accent: this tag names a category rather than a
 * section, and the accent is spent elsewhere on the card (the byline's reading
 * time, the meta line below it). Green keeps the taxonomy tag from competing
 * with the title for the eye's first stop.
 */
function CategoryPill({ slug, label }: { slug: string; label: string }) {
  const CategoryIcon = categoryIcon(slug);
  // The vocabulary's wording, falling back to whatever the manifest was written
  // with — a post published before the vocabulary closed still reads correctly.
  const displayLabel = categoryLabel(slug, label);

  return (
    <span
      data-testid="article-category"
      className="text-eyebrow inline-flex shrink-0 items-center gap-1.5 rounded-md bg-forest-light px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide !text-bone md:text-xs"
    >
      <CategoryIcon className="h-3.5 w-3.5 shrink-0" aria-hidden />
      {displayLabel}
    </span>
  );
}

/**
 * Reading time, beside the byline.
 *
 * It sits in the card rather than in the meta rail because it is the one fact a
 * reader wants *before* they start: whether they have time for this now. The
 * rail beside the body answers questions asked while reading, or after.
 */
function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 font-mono text-xs text-terracotta-dark">
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      {minutes} min read
    </span>
  );
}

/**
 * The byline, on the card's third line: who wrote it, and how long it runs.
 *
 * The two facts share a line because they are asked at the same moment — before
 * the first paragraph, by a reader deciding whether to start — and neither is
 * long enough to justify one of its own. The name is set in the body's own
 * forest at reading size rather than in the small-caps terracotta the meta line
 * below it runs: a person's name is not a label, and it was the one entry in
 * that line that had to break the run's type scale to stay readable.
 *
 * `By` stays, small and quiet. Without it the name reads as a subject rather
 * than an author, which on an article whose title is a place or a person is a
 * real ambiguity rather than a pedantic one.
 */
function Byline({ author, minutes }: { author: string; minutes: number }) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className="text-sm text-forest">
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-forest/45">
          By
        </span>{' '}
        <span className="font-medium">{author}</span>
      </span>
      <span aria-hidden="true" className="text-forest/25">
        &middot;
      </span>
      <ReadingTime minutes={minutes} />
    </div>
  );
}

/**
 * The right-hand column: the post's photograph, then its facts.
 *
 * Both live in the open picture the body plate leaves beside it, so they are
 * placed by the same geometry rather than by a second set of utilities. The
 * print comes first because it is an object rather than a caption — it lands on
 * the reader's eye at the same height as the article's first paragraph — and the
 * facts read as its label, hung under it the way the print's own caption is.
 *
 * A column only from `xl`, the width at which there is one wide enough to hold
 * anything. Below it the same two objects stack in flow between the hero card
 * and the copy, which `ArticleCoverPlate` handles itself.
 */
function ArticleRail({ post, hero }: { post: PostSummary; hero: PostSummary['hero'] }) {
  return (
    <ArticleCoverPlate
      hero={hero}
      railMeta={
        /* No margin of its own: the plate places it, because the gap above it
           depends on whether there is a print for it to hang under. */
        <MetaRail
          post={post}
          footer={<ArticleActions slug={post.slug} title={post.title} />}
        />
      }
    />
  );
}

export default function ArticleContent({ post, blocks, relatedPosts }: ArticleContentProps) {
  const hero = post.hero;
  const hasCover = Boolean(hero);

  return (
    /* No chrome offset on the root: the trail below carries it, so the article
       and the thread page clear the chrome by the same measured value rather
       than by two expressions that were 9px apart. */
    /*
     * Bone ground carrying the listing's graph paper, for the length of the
     * article. The reading sheet stays white, so the page runs paper-sheet-paper
     * by temperature: bone furniture either side of a plain white measure, and
     * the plate below the cover reads as an object on the page rather than as
     * the page continuing.
     *
     * The grid is the same `texture-grid-page` at the same `opacity-50` the blog
     * listing and `BlogGrid` use, so an article and the index it came from are
     * the same paper rather than two warm surfaces that happen to be close.
     *
     * The `Read next` band is bone too, so the tail no longer changes colour —
     * it separates on its border and its own texture instead.
     */
    <article className="relative min-h-screen bg-bone">
      <div
        className="texture-grid-page pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />
      <DuotoneFilter />

      {/*
       * The trail above the hero, on plain bone under the marquee — the same
       * place and the same strip every other section of the site puts it
       * (`/discussion/thread/[id]`). It used to sit between the hero card and
       * the body, on a bone band laid over the photograph, which made it a rule
       * belonging to the article rather than the page's own position line.
       *
       * Above the cover, so the crumbs keep their contrast against the page's
       * surface instead of handing it to whatever the photograph happens to be.
       *
       * `PageBreadcrumbBar` rather than a strip assembled here: the thread page
       * mounts the same component, so the band is one height and the labels one
       * size across both.
       */}
      <PageBreadcrumbBar leafLabel={post.title} />

      {/*
       * The cover starts below the trail, so the backdrop's own top edge is the
       * top of the hero rather than the top of the article.
       */}
      <div className="relative">
        {hero && <CoverBackdrop src={hero.url} />}

        {/*
         * Everything above the backdrop. The title card floats on the cover
         * carrying its own graph paper, so the long-form signal travels with the
         * panel instead of belonging to the page behind it.
         */}
        <div className="relative">
          {/*
           * The opening of the page is held to the backdrop's own height, so the
           * picture always finishes dissolving before the tail begins. Without
           * it, a short article puts the `Read next` panel a third of the way up
           * the photograph — the panel is opaque, so the picture ran behind it and
           * came out the other side. The floor is only ever a floor: a long
           * article pushes the tail down past it on its own.
           */}
          <div className={cn(hasCover && 'min-h-[64rem] md:min-h-[77rem]')}>
            <header>
              {/*
               * Photograph either side of the card, above and below, so the hero
               * is a picture with a card on it rather than a card on a strip.
               */}
              {/*
               * The card owns the air below it now. It used to add none, because
               * the plate's fade-in was the gap; with the trail divorced from the
               * plate there are three surfaces to space instead of two, and the
               * card's own padding is what keeps the first of the two gaps open.
               *
               * Deliberately the smaller of the two: the trail belongs to the
               * article the card names, so it should sit nearer the card than the
               * body does to it.
               */}
              <div
                className={cn(
                  'container',
                  hasCover
                    ? cn(CARD_TOP, 'pb-3.5 md:pb-[1.125rem]')
                    : 'pb-6 pt-10 md:pb-8 md:pt-14',
                )}
              >
                {/*
                 * Opaque, never translucent: the card sits on a photograph, and
                 * glass would hand its contrast to whatever happens to be behind
                 * it.
                 *
                 * A hairline, not a shadow. The tinted drop shadow it used to
                 * carry on a cover was doing the separating, and it read as the
                 * card hovering off the page — a lit edge on one side and a smear
                 * on the other, over a photograph that is already soft. `bone-edge`
                 * is the same paper a shade darker, so the card ends on a line of
                 * its own colour and stays flat on the picture, which is the rule
                 * the rest of the system runs.
                 *
                 * Flush left, on the container's edge, the way every other hero
                 * card on the site sits (`PageHeader`, `EventHero`). The breadcrumb
                 * trail below it starts on that same edge, so a centred card left
                 * the two out of line on the one page that stacks them.
                 */}
                {/*
                 * As wide as the body plate below it, from `md`. The card used to
                 * be capped at 42rem, which was a figure of its own: it stopped
                 * short of the copy's own right edge, so the page opened on two
                 * panels that started on the same line and ended on different
                 * ones. `PLATE_WIDTH` is the plate's measure, so the two agree by
                 * derivation rather than by a number that has to be re-tuned
                 * whenever the measure moves. Below `md` there is no plate
                 * geometry worth borrowing — the copy runs the container's width —
                 * so the card does too.
                 */}
                {/*
                 * `data-article-card` is the screen's anchor: its bottom edge is
                 * the last place the picture is fully clear. See `CoverScreen`.
                 */}
                <div
                  data-article-card
                  className="relative w-full max-w-full overflow-hidden rounded-card border border-bone-edge bg-bone md:w-[var(--plate-width)]"
                  style={{ '--plate-width': PLATE_WIDTH } as React.CSSProperties}
                >
                  <div
                    className="texture-grid pointer-events-none absolute inset-0"
                    aria-hidden="true"
                  />

                  {/*
                   * More air on the sides than top and bottom. The card is wider
                   * than it was, and the same square padding left the copy running
                   * nearly rim to rim; it needs a margin that reads as one.
                   */}
                  <div className="relative px-6 py-5 md:px-10 md:py-7">
                    {/*
                     * The eyebrow line: what this is filed under.
                     *
                     * The reading time used to share it. It reads better beside
                     * the byline, where it is one of two facts about the piece
                     * itself rather than a number sitting next to a taxonomy tag.
                     */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <CategoryPill slug={post.categorySlug} label={post.categoryLabel} />
                      {/*
                       * Beside the category, not tucked in the meta rail: a
                       * reader deciding whether to share this needs to know
                       * before they scroll, and the rail answers questions asked
                       * while reading.
                       */}
                      {post.visibility === 'owners' && <OwnersOnlyMark />}
                    </div>

                    {/*
                     * The hero-card title scale the rest of the community side uses
                     * (`BrutallyMinimalHeroHeadingCard` at `sm`). Page-scale
                     * `heading-lg` grows on viewport width and overshoots a card
                     * that stays 42rem wide. Balanced so a two-line title does not
                     * strand a single word.
                     *
                     * Set in title case rather than as typed, as the listing cards
                     * are: the title runs at display scale here, and `test blog` or
                     * `TEST BLOG` out of the editor should not be able to set it.
                     * Surfaces that use the title as a label — breadcrumbs, metadata,
                     * share cards — still show it verbatim.
                     */}
                    <h1 className="mt-4 text-balance font-display text-3xl leading-[1.1] tracking-[-0.01em] text-forest md:text-4xl">
                      {toTitleCase(post.title)}
                    </h1>

                    {/*
                     * The card's last line. The dates and the category used to
                     * follow it as a run of small caps, and the save/share pair
                     * as a row of chips under a rule — a second, plainer copy of
                     * facts and controls the meta plaque already states properly.
                     * Below `xl` the plaque itself now runs under the print
                     * (`ArticleCoverPlate`), so the card is what it should be:
                     * category, title, who wrote it, how long it takes.
                     */}
                    <Byline author={post.author} minutes={post.readingTime} />
                  </div>
                </div>
              </div>
            </header>

            {/* The card carries the whole byline, so the body needs no meta rail beside it. */}
            {hasCover ? (
              <>
                {/*
                 * Open photograph between the hero card and the body panel's top
                 * edge, so the two read as separate surfaces on a picture rather
                 * than one surface with a seam across it. The plate's top edge
                 * sits flush with this wrapper's, so this margin plus the card's
                 * own bottom padding is the whole of the gap.
                 */}
                {/*
                 * At `xl` the print and the body plate are two items in one grid
                 * cell, so they stack — the print hangs off the container's right
                 * edge and top-aligns with the plate — and the cell grows to
                 * whichever of the two is taller. It used to be absolute, which
                 * meant a column of pictures taller than a short article ran on
                 * through the `Read next` band below.
                 *
                 * Below `xl` the wrapper is a plain block again and the print
                 * renders in flow above the article, as a strip between the trail
                 * and the copy.
                 */}
                {/*
                 * The body plate ends flush with this wrapper — its border box
                 * is pinned to the container's `pb-56` floor — so without air
                 * below, the `Read next` band butts straight onto the plate's
                 * bottom edge. Same figure the coverless branch already uses, so
                 * both layouts close the article on the same gap.
                 */}
                <div
                  className="relative mt-[1.125rem] pb-28 md:mt-6 md:pb-36 xl:grid xl:[&>*]:col-start-1 xl:[&>*]:row-start-1"
                >
                  <ArticleRail post={post} hero={hero} />
                  <BodyPlate capBlock={hasDropCap(blocks)}>
                    <BlockRenderer blocks={blocks} dropCap indent />
                  </BodyPlate>
                </div>
              </>
            ) : (
              <div className="pb-28 md:pb-36">
                {/*
                 * The same stacked cell the cover layout uses, so the rail sits in
                 * the margin beside the copy here too. A post without a photograph
                 * is ordinary — its facts are not conditional on one — and before
                 * this branch shared the geometry, those posts silently lost the
                 * rail at every width.
                 */}
                <div className="relative pt-10 md:pt-12 xl:grid xl:[&>*]:col-start-1 xl:[&>*]:row-start-1">
                  <ArticleRail post={post} hero={null} />
                  <div className="container">
                    <BlockRenderer blocks={blocks} dropCap indent />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/*
           * The tail is sage, and the colour is carried on the section rather
           * than only on the band inside it, so the padding below the band does
           * not leave a strip of the article's ground between the tail and the
           * footer. Everything from the `Read next` rule down is sage.
           */}
          {relatedPosts.length > 0 && (
            <section className="bg-sage-light">
              {/*
               * Sage, and flat: the one band on the page that is not the
               * article's own paper.
               *
               * It used to be bone with graph paper, which was the hero card's
               * surface repeated to close on the surface the page opened on.
               * That reading only worked while the article's ground was white.
               * With bone paper running the length of the page, a bone band
               * carrying the same grid is the ground with a hairline drawn
               * across it — the tail stopped being a different object. A cool
               * flat colour separates on two axes at once, temperature and
               * texture, so the reader is out of the article before the first
               * thumbnail.
               *
               * Full-bleed rather than a card inside the container: the tail is
               * the page's closing band, and a panel that stopped on the
               * container's edge read as a slab dropped on the page. Only the
               * opening rule survives — a border-x on a band that runs to both
               * viewport edges is a line nobody can see the ends of, and a rule
               * on the bottom edge would close the band a second time right
               * where the footer already starts. The band's own bottom padding
               * carries the gap down to the footer.
               */}
              <div className="relative overflow-hidden border-t border-bone-edge bg-sage-light">
                <div className="container relative pt-8 pb-14 md:pt-10 md:pb-20">
                  <h2 className="text-eyebrow">Read next</h2>

                  {/*
                   * Three abreast from `lg` however many posts the tail is
                   * carrying, so the row keeps the same rhythm on every article
                   * rather than widening to two fat columns when only two others
                   * exist. The cells carry their own surface, so a short row just
                   * ends — there is no rule left running past the last one.
                   */}
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {relatedPosts.map((related) => (
                      <BlogPostCell key={related.slug} post={related} variant="tail" />
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}
