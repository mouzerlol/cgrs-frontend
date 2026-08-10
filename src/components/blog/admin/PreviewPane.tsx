'use client';

import { Info, Loader2 } from 'lucide-react';
import BlockRenderer from '@/components/blog/blocks/BlockRenderer';
import DuotoneFilter from '@/components/blog/DuotoneFilter';
import type { BlogDiagnostics, BlogPreviewResponse } from '@/types/blog-admin';

/**
 * The preview, rendered by the same components the public article page uses.
 *
 * That is the whole point of it: the block document comes from the API's preview
 * operation, which runs the identical parser publishing runs, and it is drawn by
 * the identical renderer the public page draws with. A preview that could
 * diverge from the published result would be worse than no preview, because an
 * author would trust it.
 *
 * Two panes, not one. The excerpt used to sit as a lede immediately above the
 * body inside a single frame — honest about where it lands on the article page,
 * but it made the excerpt look like the article's first paragraph rather than
 * the separate artifact it is. It is what the listing card shows, what search
 * engines get as the meta description, and what a shared link previews with; and
 * when the field is left empty it is written by the parser rather than by the
 * author. All of which deserves its own frame and its own label.
 *
 * Nothing is saved. This is a render of what publishing *would* produce.
 */

const PANE = 'relative border border-sage/30 bg-bone';
const PANE_HEADER =
  'flex items-center justify-between border-b border-sage/30 bg-sage-light/40 px-4 py-2';
const PANE_TITLE = 'text-xs font-semibold uppercase tracking-[0.15em] text-forest/50';

/** Warnings the API raised against a given field, drawn under the pane they belong to. */
function PaneWarnings({
  diagnostics,
  fields,
}: {
  diagnostics: BlogDiagnostics;
  fields: readonly string[];
}) {
  const warnings = diagnostics.warnings.filter((warning) => fields.includes(warning.field));
  if (warnings.length === 0) return null;

  return (
    <div className="border-t border-sage/30 bg-white px-4 py-3">
      <ul className="space-y-1">
        {warnings.map((warning) => (
          <li
            key={`${warning.field}-${warning.message}`}
            className="flex items-start gap-1.5 text-xs text-forest/55"
          >
            <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{warning.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PreviewPane({
  preview,
  isPending,
}: {
  preview: BlogPreviewResponse | null;
  isPending: boolean;
}) {
  /*
   * The excerpt pane's own warning is the derived-excerpt one, and the badge in
   * its header already says that in fewer words. Every other warning against the
   * field — a length problem, say — still belongs under the pane.
   */
  const excerptWarningFields = ['excerpt'] as const;
  const bodyWarningFields = ['body', 'heroAlt', 'heroAssetId', 'title', 'slug'] as const;

  return (
    <div className="space-y-4">
      <DuotoneFilter />

      {/* --- Excerpt ------------------------------------------------------- */}
      <div className={PANE}>
        <div className={PANE_HEADER}>
          <p className={PANE_TITLE}>Excerpt</p>
          {preview && (
            <span
              data-testid="excerpt-origin"
              className={
                preview.excerptDerived
                  ? 'rounded-none bg-terracotta/10 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-terracotta-dark'
                  : 'text-xs text-forest/50'
              }
            >
              {/*
               * Named, because a derived excerpt is published under the author's
               * byline without them having written it — and it is what most
               * readers see first, on the card and in search results.
               */}
              {preview.excerptDerived ? 'Derived from opening paragraph' : 'Authored'}
            </span>
          )}
        </div>

        <div className="px-5 py-4">
          {!preview ? (
            <p className="text-sm text-forest/40">
              Start writing and the excerpt will appear here.
            </p>
          ) : preview.excerpt ? (
            <p className="max-w-[52ch] text-base leading-relaxed text-forest/75">
              {preview.excerpt}
            </p>
          ) : (
            <p className="text-sm text-forest/40">
              No excerpt yet — write one, or a body to derive it from.
            </p>
          )}
        </div>

        {preview && !preview.excerptDerived && (
          <PaneWarnings diagnostics={preview.diagnostics} fields={excerptWarningFields} />
        )}
      </div>

      {/* --- Article ------------------------------------------------------- */}
      <div className={PANE}>
        <div className={PANE_HEADER}>
          <p className={PANE_TITLE}>Article</p>
          <div className="flex items-center gap-3 text-xs text-forest/50">
            {preview && <span>{preview.readingTime} min read</span>}
            {isPending && (
              <span className="inline-flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                Updating
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
          {!preview ? (
            <p className="text-sm text-forest/40">Start writing and the preview will appear here.</p>
          ) : preview.blocks.length === 0 ? (
            <p className="text-sm text-forest/40">Nothing to show yet.</p>
          ) : (
            /*
             * `indent` as well as `dropCap`, because the two are one layout on
             * the article page: from `md` the cap leaves the flow and sits in
             * the gutter the body is indented past. Without the indent the
             * preview hung the cap's block off the copy's left edge and out
             * through the pane's own padding, so the one thing an author most
             * needs to check before publishing was the one thing the preview
             * drew differently.
             */
            <BlockRenderer blocks={preview.blocks} dropCap indent />
          )}
        </div>

        {preview && <PaneWarnings diagnostics={preview.diagnostics} fields={bodyWarningFields} />}
      </div>
    </div>
  );
}
