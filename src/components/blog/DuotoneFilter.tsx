/**
 * SVG duotone filter used by every blog image plate.
 *
 * Collapses the source image to luminance, then maps that single channel onto a
 * forest-shadow / bone-highlight ramp so photographs and placeholder artwork
 * both land inside the CGRS palette. One definition per page; `BlogPlate`
 * references it by id.
 */

export const DUOTONE_FILTER_ID = 'cgrs-duotone-forest';

/** Rec. 709 luminance, replicated across R/G/B so the result is greyscale. */
const LUMINANCE_MATRIX = [
  '0.2126 0.7152 0.0722 0 0',
  '0.2126 0.7152 0.0722 0 0',
  '0.2126 0.7152 0.0722 0 0',
  '0 0 0 1 0',
].join(' ');

/**
 * Contrast stretch applied before the ramp. Source artwork tends to sit in a
 * narrow mid band; without this the ramp returns a single flat tone and the
 * plate reads as a grey slab rather than a treated image.
 */
const CONTRAST = { slope: '1.45', intercept: '-0.22' };

/**
 * Three-stop ramp: forest shadows, an estuary-sage midtone, bone highlights.
 * The midtone is what makes this read as green rather than greyscale; forest and
 * bone are both close to neutral, so a two-stop ramp between them has almost no
 * colour in it.
 */
const RAMP = {
  // forest #1A2218 → sage #66795E → bone #F4F1EA
  r: '0.102 0.400 0.957',
  g: '0.133 0.475 0.945',
  b: '0.094 0.369 0.918',
};

export default function DuotoneFilter() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {/*
          * Region clamped to the element box. The default (-10% to 110%) makes
          * the filtered texture 20% larger than the plate it covers, which is
          * dead weight here — this chain is a colour map with no spill — and one
          * more thing for the compositor to resample on a fractional-width card.
          */}
        <filter
          id={DUOTONE_FILTER_ID}
          colorInterpolationFilters="sRGB"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
        >
          <feColorMatrix type="matrix" values={LUMINANCE_MATRIX} />

          <feComponentTransfer>
            <feFuncR type="linear" slope={CONTRAST.slope} intercept={CONTRAST.intercept} />
            <feFuncG type="linear" slope={CONTRAST.slope} intercept={CONTRAST.intercept} />
            <feFuncB type="linear" slope={CONTRAST.slope} intercept={CONTRAST.intercept} />
          </feComponentTransfer>

          <feComponentTransfer>
            <feFuncR type="table" tableValues={RAMP.r} />
            <feFuncG type="table" tableValues={RAMP.g} />
            <feFuncB type="table" tableValues={RAMP.b} />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
