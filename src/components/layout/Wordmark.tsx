/**
 * Canonical "CORONATION GARDENS" wordmark.
 *
 * Single source of truth for the brand wordmark so every surface (top nav,
 * mobile drawer, footer) renders identical type treatment. See the spec at
 * docs/design/wordmark.md.
 *
 * Treatment (do not override per-surface):
 *  - Fraunces (font-display), default weight (400). NEVER font-medium/bold —
 *    Fraunces' medium optical weight reads thin and off-brand at small sizes.
 *  - Two stacked lines, no tracking on CORONATION.
 *  - GARDENS is text-[1.15em] tracking-wider so it optically spans the same
 *    width as CORONATION above it.
 *  - leading-[0.95], text-bone.
 *
 * Size is the ONLY thing a caller varies — pass it via `className`
 * (e.g. "text-base", "text-3xl", "text-[clamp(2rem,4vw,3rem)]").
 */
interface WordmarkProps {
  /** Size + any layout utilities for the root. Size token is required here. */
  className?: string;
  /** Render the "Residents Society" sub-label (used in the mobile drawer). */
  subtitle?: boolean;
}

export default function Wordmark({ className = 'text-base', subtitle = false }: WordmarkProps) {
  return (
    <span className={`font-display leading-[0.95] text-bone flex flex-col ${className}`}>
      <span className="block whitespace-nowrap">CORONATION</span>
      <span className="block whitespace-nowrap text-[1.15em] tracking-wider">GARDENS</span>
      {subtitle && (
        <span className="text-xs tracking-widest text-bone/50 mt-1">Residents Society</span>
      )}
    </span>
  );
}
