/**
 * Where the article's cover print sits, as CSS expressions.
 *
 * `ArticleCoverPlate` is the only consumer now. The breadcrumb band used to end
 * its surface on the column's right edge, which is why the geometry was lifted
 * out of the component in the first place; the band is full-bleed since, so
 * there is nothing left to keep in step. Kept here rather than inlined because
 * the terms below still derive from `BlockRenderer` and `BodyPlate` and are worth
 * naming.
 *
 * Every percentage resolves against `.container`'s content box, which is the
 * containing block for the rail and the same reference the body plate measures
 * from.
 */

/**
 * The body plate's right edge, and so the print column's left.
 *
 * Three terms, the same ones `BodyPlate` ends up with: `BlockRenderer`'s
 * 7rem indent (the gutter the drop cap's block sits in), then the measure
 * (`max-w-[68ch]`, capped by what the indent leaves), then the 3rem hang the
 * plate plants past it so the last glyph of a long line sits inside a surface.
 * 7 + 3 is the 10rem.
 */
const PLATE_EDGE = 'min(68ch, 100% - 7rem) + 10rem';

/**
 * The body plate's own width, for anything that has to line up with it.
 *
 * The plate is flush to the container's left gutter, so its right edge and its
 * width are the same number. The hero card takes this from `md` up so the panel
 * the article opens on and the panel it is set on end on one line, rather than
 * the card stopping 3rem short of the copy it introduces.
 *
 * `ch` resolves against the element it is applied to — keep this on something
 * inheriting the body font at base size, which is what `BlockRenderer` measures
 * its 68ch in.
 */
export const PLATE_WIDTH = `calc(${PLATE_EDGE})`;

/** Clearance between the print and the column's two sides. */
const RAIL_INSET = '1rem';

/**
 * The widest the print goes.
 *
 * `.container` caps at 1400px, so the column tops out around 34rem and this is
 * what stops the print eating all of it. Past this width the picture starts
 * competing with the copy for the page rather than sitting beside it.
 */
const RAIL_MAX = '27rem';

/** The print's width: the column less its clearance, capped. */
export const RAIL_WIDTH = `min(100% - (${PLATE_EDGE}) - 2 * ${RAIL_INSET}, ${RAIL_MAX})`;

/** The print's left edge, centred in what the body plate leaves. */
export const RAIL_LEFT = `calc((${PLATE_EDGE}) + (100% - (${PLATE_EDGE}) - ${RAIL_WIDTH}) / 2)`;
