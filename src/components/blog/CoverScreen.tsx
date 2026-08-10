'use client';

import { useEffect, useRef } from 'react';

interface CoverScreenProps {
  /**
   * The overlay's gradient. Its ramp reads `--screen-hold`, which this component
   * publishes on the element itself.
   */
  gradient: string;
}

/**
 * The screen over the cover photograph, with the top of its ramp pinned to the
 * bottom edge of the hero card.
 *
 * That one stop cannot be written down, which is the whole reason this is a
 * client component. It has to land on the card's bottom edge, and where that
 * edge falls depends on how far the title and lede wrap — which depends on the
 * post, the viewport and the webfont. A constant is right for exactly one
 * article at exactly one width; anywhere else the ramp starts inside the hero
 * or a good way below it, and either way the screen stops being something that
 * begins where the hero ends.
 *
 * So the edge is measured off the laid-out page and published as
 * `--screen-hold`, where it beats the fallback the server rendered. The
 * fallback matters: it is what paints until the effect runs, and it is
 * hand-measured to this page's usual proportions, so the correction is normally
 * sub-pixel and never a visible jump. The ramp's length is a constant — it runs
 * a fixed distance below whatever this measures, so only the start needs
 * finding.
 *
 * Everything is read in one pass and written straight back. The property is a
 * custom property on a `background-image`, so a write costs a repaint of one
 * absolutely-positioned layer — no reflow, and nothing that can feed back into
 * the observer that triggered it.
 */
export default function CoverScreen({ gradient }: CoverScreenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const card = el.closest('article')?.querySelector('[data-article-card]');
    if (!card) return;

    const measure = () => {
      /*
       * An offset from this element's own top edge, which is where the gradient
       * measures from. Taking both from the viewport and subtracting keeps the
       * figure correct at any scroll position and under any transform on an
       * ancestor, which `offsetTop` would not.
       */
      const hold = card.getBoundingClientRect().bottom - el.getBoundingClientRect().top;

      // A layout mid-swap: leave the fallback up rather than start the ramp
      // above the frame's own top edge.
      if (!(hold > 0)) return;

      el.style.setProperty('--screen-hold', `${hold}px`);
    };

    measure();

    /*
     * The card resizes when the title rewraps, and it moves when the chrome
     * above it changes height — so it is watched rather than the window.
     * `ResizeObserver` fires on its own once at observe time, which is the
     * initial measure; the call above is for the case where the card is already
     * at its final size and the first callback lands a frame later.
     */
    const observer = new ResizeObserver(measure);
    observer.observe(card);

    // The webfont swapping in relays the title after layout has settled, which
    // no resize reports.
    document.fonts?.ready.then(measure).catch(() => {});

    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className="absolute inset-0" style={{ backgroundImage: gradient }} />;
}
