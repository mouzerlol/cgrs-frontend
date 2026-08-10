import type { FigureBlock } from '@/lib/blog/types';
import { toTitleCase } from '@/lib/blog/title-case';
import FigureImage from '../FigureImage';

/**
 * An in-article image, set on the body's own measure.
 *
 * The print and its way into the lightbox live in `FigureImage`, which is a
 * client component: this file is under `blocks/`, where nothing may carry the
 * client boundary, because a `use client` here would force the server-rendered
 * article page onto the client. The caption stays here, in the server half — it
 * is copy, not a control.
 */
export default function Figure({ block }: { block: FigureBlock }) {
  return (
    <figure className="my-10 md:my-12">
      <FigureImage block={block} />

      {(block.caption || block.credit) && (
        <figcaption className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm leading-snug text-forest/70">
          {/* Title-cased so the line under the print matches the one the print
              opens onto in the lightbox, and the rail's ledge above it. */}
          {block.caption && <span>{toTitleCase(block.caption)}</span>}
          {block.credit && (
            <span className="text-xs uppercase tracking-[0.1em] text-forest/50">{block.credit}</span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
