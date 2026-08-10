import { cn } from '@/lib/utils';
import type { ColumnAlign, TableBlock } from '@/lib/blog/types';
import InlineRuns from './InlineRuns';

/**
 * A table from the body, scrolling inside its own container.
 *
 * The scroll is on the wrapper rather than the page: a table wider than the
 * measure is normal in a levies or budget post, and letting the document scroll
 * horizontally to accommodate it would move every other line on the page too.
 */

const ALIGNMENT: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function alignmentClass(align: ColumnAlign | null | undefined): string {
  return align ? ALIGNMENT[align] : 'text-left';
}

export default function ContentTable({ block }: { block: TableBlock }) {
  return (
    <div className="my-10 overflow-x-auto rounded-card border border-bone-edge md:my-12">
      <table className="w-full min-w-[28rem] border-collapse text-sm">
        {block.head && (
          <thead>
            <tr className="border-b border-bone-edge bg-sage-light/60">
              {block.head.map((cell, index) => (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    'px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-forest',
                    alignmentClass(block.align[index])
                  )}
                >
                  <InlineRuns runs={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}

        <tbody>
          {block.rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-bone-edge/60 last:border-b-0">
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className={cn(
                    'px-4 py-3 leading-relaxed text-forest/80',
                    alignmentClass(block.align[cellIndex])
                  )}
                >
                  <InlineRuns runs={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
