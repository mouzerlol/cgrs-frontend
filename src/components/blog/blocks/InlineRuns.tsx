import Link from 'next/link';
import type { Run } from '@/lib/blog/types';

/**
 * Inline content, rendered from runs.
 *
 * There is no nesting in the contract — a bold link is one run carrying both
 * attributes — so this is a flat map rather than a tree walk. That is the whole
 * reason the writer flattens: an inline renderer that cannot recurse cannot
 * produce unbalanced markup.
 */

function isInternal(href: string): boolean {
  return href.startsWith('/');
}

const LINK_CLASS =
  'underline decoration-sage decoration-1 underline-offset-[3px] transition-colors hover:decoration-terracotta';

function RunContent({ run }: { run: Run }) {
  let content: React.ReactNode = run.text;
  if (run.italic) content = <em>{content}</em>;
  if (run.bold) content = <strong className="font-semibold text-forest">{content}</strong>;
  return <>{content}</>;
}

export default function InlineRuns({ runs }: { runs: Run[] }) {
  return (
    <>
      {runs.map((run, index) => {
        if (!run.href) {
          return <RunContent key={index} run={run} />;
        }

        // Internal links navigate client-side; anything else leaves the site, so
        // it opens with the usual protections rather than handing the opener over.
        if (isInternal(run.href)) {
          return (
            <Link key={index} href={run.href} className={LINK_CLASS}>
              <RunContent run={run} />
            </Link>
          );
        }

        return (
          <a
            key={index}
            href={run.href}
            className={LINK_CLASS}
            rel="noopener noreferrer"
            target="_blank"
          >
            <RunContent run={run} />
          </a>
        );
      })}
    </>
  );
}
