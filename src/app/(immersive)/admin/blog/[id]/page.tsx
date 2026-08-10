'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Globe,
  History,
  Loader2,
  Lock,
  Save,
  Upload,
} from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import { Modal } from '@/components/ui/Modal';
import AssetManager from '@/components/blog/admin/AssetManager';
import FieldMessages from '@/components/blog/admin/FieldMessages';
import PreviewPane from '@/components/blog/admin/PreviewPane';
import { BLOG_CATEGORIES } from '@/components/blog/categories';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { canAccessManagement } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import {
  useBlogPostQuery,
  useBlogRevision,
  useBlogRevisionsQuery,
  usePreviewBlogPost,
  usePublishBlogPost,
  useRestoreBlogRevision,
  useUnpublishBlogPost,
  useUpdateBlogPost,
} from '@/hooks/useBlogAdmin';
import { cn } from '@/lib/utils';
import type {
  BlogDiagnostics,
  BlogPostUpdateRequest,
  BlogPreviewResponse,
  BlogPublishResponse,
} from '@/types/blog-admin';

const sq = 'rounded-none';
const inputClass =
  'w-full rounded-none border border-sage/40 bg-white px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest';
const labelClass = 'block text-xs font-semibold uppercase tracking-[0.15em] text-forest/50';

/** How long the author stops typing before the preview is re-rendered. */
const PREVIEW_DEBOUNCE_MS = 600;

/**
 * Category, as a row of chips rather than a `<select>`.
 *
 * The vocabulary is closed and small enough to show whole, and every category is
 * drawn on the reading site with a glyph — which a native option list cannot
 * render. Showing the author the same mark the reader will see is the point;
 * a dropdown of seven words would make the glyph a surprise.
 */
function CategoryChoice({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label="Category" className="flex flex-wrap gap-1.5">
      {BLOG_CATEGORIES.map((category) => {
        const CategoryIcon = category.icon;
        const isActive = category.slug === value;

        return (
          <button
            key={category.slug}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(category.slug)}
            className={cn(
              sq,
              'inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium',
              'transition-colors focus:outline-none focus:ring-1 focus:ring-forest',
              isActive
                ? 'border-forest bg-forest text-bone'
                : 'border-sage/40 bg-white text-forest hover:border-sage'
            )}
          >
            <CategoryIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {category.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Who the post is for.
 *
 * The caveat below it is not boilerplate. `owners` keeps a post out of the
 * public listing, the sitemap, search, and share previews — but the published
 * body still sits in a public bucket under a guessable URL. An author who reads
 * "owners only" and infers confidentiality would be wrong in a way that matters,
 * so the control says what it does and does not do rather than leaving the word
 * to imply it.
 */
function VisibilityChoice({
  value,
  onChange,
}: {
  value: 'public' | 'owners';
  onChange: (next: 'public' | 'owners') => void;
}) {
  const options: { value: 'public' | 'owners'; label: string; icon: typeof Globe }[] = [
    { value: 'public', label: 'Everyone', icon: Globe },
    { value: 'owners', label: 'Owners only', icon: Lock },
  ];

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>Visibility</span>
      <div role="radiogroup" aria-label="Visibility" className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const OptionIcon = option.icon;
          const isActive = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange(option.value)}
              className={cn(
                sq,
                'inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium',
                'transition-colors focus:outline-none focus:ring-1 focus:ring-forest',
                isActive
                  ? 'border-forest bg-forest text-bone'
                  : 'border-sage/40 bg-white text-forest hover:border-sage'
              )}
            >
              <OptionIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {option.label}
            </button>
          );
        })}
      </div>
      {value === 'owners' ? (
        <p className="text-xs text-forest/50">
          Visible to owners, society managers, and committee members. Hidden from tenants,
          other residents, and signed-out visitors, and kept out of search, the sitemap, and
          link previews.{' '}
          <strong className="font-semibold text-forest/70">
            It is not confidential: the published file stays readable by anyone who has its
            direct URL.
          </strong>{' '}
          Do not use it for anything sensitive.
        </p>
      ) : (
        <p className="text-xs text-forest/50">Listed publicly and open to search engines.</p>
      )}
    </div>
  );
}

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/** The editable state of a post, as the form holds it. */
interface Draft {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  visibility: 'public' | 'owners';
  date: string;
  updated: string;
  bodyMarkdown: string;
  heroAssetId: string | null;
  heroAlt: string;
  heroCaption: string;
  heroCredit: string;
  featured: boolean;
}

function toRequest(draft: Draft): BlogPostUpdateRequest {
  return {
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt || null,
    author: draft.author,
    category: draft.category,
    visibility: draft.visibility,
    date: draft.date || null,
    updated: draft.updated || null,
    bodyMarkdown: draft.bodyMarkdown,
    heroAssetId: draft.heroAssetId,
    heroAlt: draft.heroAlt || null,
    heroCaption: draft.heroCaption || null,
    heroCredit: draft.heroCredit || null,
    featured: draft.featured,
  };
}

/**
 * What a publish actually did.
 *
 * A publish whose revalidation signal failed still succeeded — the post is live,
 * and the reading site picks it up once the manifest's freshness window elapses.
 * Showing that as an error would send an administrator chasing a problem that
 * does not exist, so it is reported as success with a note about the delay.
 */
function PublishOutcome({ result }: { result: BlogPublishResponse }) {
  const delayed = result.revalidated === false;

  return (
    <div
      className={cn(
        sq,
        'flex items-start gap-2 border p-3 text-sm',
        delayed ? 'border-amber/50 bg-amber/10 text-forest' : 'border-forest/20 bg-sage-light/50 text-forest',
      )}
      role="status"
    >
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest-light" aria-hidden="true" />
      <div>
        <p className="font-medium">Published.</p>
        {delayed && (
          <p className="mt-0.5 text-forest/70">
            The site could not be signalled, so the post may take a few minutes to appear. Nothing
            further is needed — it will appear on its own.
          </p>
        )}
        {result.warnings.length > 0 && (
          <ul className="mt-1 space-y-0.5 text-forest/60">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminBlogEditorPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: currentUser } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canManage = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const { data, isLoading, error } = useBlogPostQuery(id, canManage);
  const save = useUpdateBlogPost(id);
  const preview = usePreviewBlogPost(id);
  const publish = usePublishBlogPost(id);
  const unpublish = useUnpublishBlogPost(id);

  const [draft, setDraft] = useState<Draft | null>(null);
  const [diagnostics, setDiagnostics] = useState<BlogDiagnostics | null>(null);
  const [previewResult, setPreviewResult] = useState<BlogPreviewResponse | null>(null);
  const [publishResult, setPublishResult] = useState<BlogPublishResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const post = data?.post ?? null;

  // Seed the form once. Re-seeding on every refetch would throw away whatever
  // the author had typed since.
  useEffect(() => {
    if (!post || draft) return;
    setDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      author: post.author,
      // The slug, not the label: the field is now a choice from a closed
      // vocabulary keyed by slug, and the label is only how it is drawn.
      category: post.categorySlug,
      visibility: post.visibility === 'owners' ? 'owners' : 'public',
      date: post.date ?? '',
      updated: post.updated ?? '',
      bodyMarkdown: post.bodyMarkdown,
      heroAssetId: post.heroAssetId,
      heroAlt: post.heroAlt ?? '',
      heroCaption: post.heroCaption ?? '',
      heroCredit: post.heroCredit ?? '',
      featured: post.featured,
    });
    setDiagnostics(data?.diagnostics ?? null);
  }, [post, draft, data]);

  const update = useCallback(<K extends keyof Draft>(key: K, value: Draft[K]) => {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }, []);

  // The preview is debounced rather than fired per keystroke: it is a round trip
  // to the parser, and it persists nothing, so there is no cost to it being a
  // moment behind.
  useEffect(() => {
    if (!draft) return;
    const timer = setTimeout(async () => {
      try {
        const result = await preview.mutateAsync(toRequest(draft));
        setPreviewResult(result);
        setDiagnostics(result.diagnostics);
      } catch {
        // A failed preview leaves the last good one on screen. It saves nothing
        // and blocks nothing, so a blip is not worth an error state.
      }
    }, PREVIEW_DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const handleSave = async () => {
    if (!draft) return;
    setActionError(null);
    try {
      const result = await save.mutateAsync(toRequest(draft));
      setDiagnostics(result.diagnostics);
    } catch (caught) {
      setActionError(apiErrorMessage(caught, 'The post could not be saved.'));
    }
  };

  const handlePublish = async () => {
    if (!draft) return;
    setActionError(null);
    setPublishResult(null);
    try {
      // Saved first, so what is published is what is on screen rather than what
      // was last written to the row.
      await save.mutateAsync(toRequest(draft));
      const result = await publish.mutateAsync();
      setPublishResult(result);
    } catch (caught) {
      setActionError(apiErrorMessage(caught, 'The post could not be published.'));
    }
  };

  const handleUnpublish = async () => {
    setActionError(null);
    setPublishResult(null);
    try {
      await unpublish.mutateAsync();
    } catch (caught) {
      setActionError(apiErrorMessage(caught, 'The post could not be withdrawn.'));
    }
  };

  /** Inserts the stable reference at the cursor — never a URL. */
  const insertAsset = useCallback(
    (assetId: string, alt: string) => {
      const textarea = bodyRef.current;
      setDraft((current) => {
        if (!current) return current;
        const reference = `\n\n![${alt}](asset:${assetId})\n\n`;
        const at = textarea?.selectionStart ?? current.bodyMarkdown.length;
        const next =
          current.bodyMarkdown.slice(0, at) + reference + current.bodyMarkdown.slice(at);
        return { ...current, bodyMarkdown: next };
      });
    },
    [],
  );

  const blockingFields = diagnostics?.blockingFields ?? [];
  const canPublish = blockingFields.length === 0 && !publish.isPending && !save.isPending;

  if (!canManage) {
    return (
      <div className="flex h-full w-full flex-col bg-bone">
        <WorkManagementNavBar title="Blog" showBackButton backHref="/admin" backLabel="Administration" />
        <main className="p-8">
          <p className="text-sm text-forest/60">You do not have permission to manage blog posts.</p>
        </main>
      </div>
    );
  }

  if (isLoading || !draft || !post) {
    return (
      <div className="flex h-full w-full flex-col bg-bone">
        <WorkManagementNavBar title="Blog" showBackButton backHref="/admin/blog" backLabel="Posts" />
        <main className="p-8">
          <p className="text-sm text-forest/50">
            {error ? apiErrorMessage(error, 'The post could not be loaded.') : 'Loading…'}
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bone">
      <WorkManagementNavBar
        title={post.title || 'Untitled'}
        showBackButton
        backHref="/admin/blog"
        backLabel="Posts"
      />

      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[110rem] p-6 md:p-8">
          {/* Actions ------------------------------------------------------ */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={save.isPending}
              className={cn(sq, 'inline-flex items-center gap-1.5 border border-sage/40 bg-white px-3 py-2 text-sm text-forest')}
            >
              {save.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Save
            </button>

            <button
              type="button"
              onClick={handlePublish}
              disabled={!canPublish}
              className={cn(
                sq,
                'inline-flex items-center gap-1.5 bg-forest px-3 py-2 text-sm text-bone disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {publish.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Upload className="h-4 w-4" aria-hidden="true" />
              )}
              {post.status === 'published' ? 'Republish' : 'Publish'}
            </button>

            {post.status === 'published' && (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={unpublish.isPending}
                className={cn(sq, 'border border-terracotta/40 px-3 py-2 text-sm text-terracotta-dark')}
              >
                Withdraw
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowRevisions(true)}
              className={cn(sq, 'inline-flex items-center gap-1.5 border border-sage/40 bg-white px-3 py-2 text-sm text-forest')}
            >
              <History className="h-4 w-4" aria-hidden="true" />
              History
            </button>

            {post.publicUrl && (
              <a
                href={post.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-xs text-forest/60 hover:text-terracotta"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                View live
              </a>
            )}
          </div>

          {/*
           * Why publishing is unavailable, in words. A disabled control that
           * only implies its reason leaves an author hunting the form for it.
           */}
          {blockingFields.length > 0 && (
            <div
              className={cn(sq, 'mb-5 flex items-start gap-2 border border-terracotta/40 bg-white p-3 text-sm')}
              role="alert"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-terracotta-dark" aria-hidden="true" />
              <p className="text-forest">
                Publishing is unavailable until these are resolved:{' '}
                <span className="font-medium">{blockingFields.join(', ')}</span>.
              </p>
            </div>
          )}

          {actionError && (
            <p className={cn(sq, 'mb-5 border border-terracotta/40 bg-white p-3 text-sm text-terracotta-dark')} role="alert">
              {actionError}
            </p>
          )}

          {publishResult && (
            <div className="mb-5">
              <PublishOutcome result={publishResult} />
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            {/* Form ------------------------------------------------------- */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="title" className={labelClass}>
                  Title
                </label>
                <input
                  id="title"
                  className={inputClass}
                  value={draft.title}
                  onChange={(event) => update('title', event.target.value)}
                />
                <FieldMessages diagnostics={diagnostics} field="title" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="slug" className={labelClass}>
                  URL
                </label>
                {/*
                 * Editable while the post has never been published, fixed text
                 * thereafter. A published URL that changed would rot every link
                 * to it, so the field stops being a field rather than becoming
                 * a control that refuses.
                 */}
                {post.slugEditable ? (
                  <>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-sm text-forest/40">/blog/</span>
                      <input
                        id="slug"
                        className={inputClass}
                        value={draft.slug}
                        onChange={(event) => update('slug', event.target.value)}
                      />
                    </div>
                    <p className="text-xs text-forest/50">
                      This freezes when the post is first published.
                    </p>
                  </>
                ) : (
                  <p id="slug" className="font-mono text-sm text-forest/60">
                    /blog/{draft.slug}
                  </p>
                )}
                <FieldMessages diagnostics={diagnostics} field="slug" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="author" className={labelClass}>
                    Byline
                  </label>
                  <input
                    id="author"
                    className={inputClass}
                    value={draft.author}
                    onChange={(event) => update('author', event.target.value)}
                  />
                  <FieldMessages diagnostics={diagnostics} field="author" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="category" className={labelClass}>
                    Category
                  </label>
                  {/*
                   * A closed list, not free text with suggestions. Suggestions
                   * only made reuse convenient; they never stopped anyone typing
                   * past them, which is how `Test Category` reached production.
                   * The reading site draws each category with a glyph it can only
                   * promise for a category it knows about.
                   */}
                  <CategoryChoice
                    value={draft.category}
                    onChange={(next) => update('category', next)}
                  />
                  <FieldMessages diagnostics={diagnostics} field="category" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label htmlFor="date" className={labelClass}>
                    Publication date
                  </label>
                  <input
                    id="date"
                    type="date"
                    className={inputClass}
                    value={draft.date}
                    onChange={(event) => update('date', event.target.value)}
                  />
                  <FieldMessages diagnostics={diagnostics} field="date" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="updated" className={labelClass}>
                    Updated date
                  </label>
                  <input
                    id="updated"
                    type="date"
                    className={inputClass}
                    value={draft.updated}
                    onChange={(event) => update('updated', event.target.value)}
                  />
                  <p className="text-xs text-forest/50">
                    Shown beside the publication date. Leave empty for a typo fix.
                  </p>
                  <FieldMessages diagnostics={diagnostics} field="updated" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="excerpt" className={labelClass}>
                  Excerpt
                </label>
                <textarea
                  id="excerpt"
                  className={cn(inputClass, 'min-h-[4.5rem]')}
                  value={draft.excerpt}
                  onChange={(event) => update('excerpt', event.target.value)}
                  placeholder="Left empty, one is derived from the opening paragraph."
                />
                <FieldMessages diagnostics={diagnostics} field="excerpt" />
              </div>

              <VisibilityChoice
                value={draft.visibility}
                onChange={(next) => update('visibility', next)}
              />
              <FieldMessages diagnostics={diagnostics} field="visibility" />

              <label className="flex items-center gap-2 text-sm text-forest">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(event) => update('featured', event.target.checked)}
                  disabled={draft.visibility === 'owners'}
                />
                Feature on the homepage
              </label>
              {draft.visibility === 'owners' && (
                // The homepage is a public, statically rendered surface reading
                // the public manifest, so a gated post cannot appear there. Saying
                // so beats leaving a ticked box that quietly does nothing.
                <p className="-mt-1 text-xs text-forest/50">
                  An owners-only post cannot be featured — the homepage is public.
                </p>
              )}

              <div className="space-y-1.5">
                <label htmlFor="body" className={labelClass}>
                  Body
                </label>
                <textarea
                  id="body"
                  ref={bodyRef}
                  className={cn(inputClass, 'min-h-[24rem] font-mono text-[13px] leading-relaxed')}
                  value={draft.bodyMarkdown}
                  onChange={(event) => update('bodyMarkdown', event.target.value)}
                />
                <p className="text-xs text-forest/50">
                  Markdown. <code>##</code> and <code>###</code> headings, lists, tables,{' '}
                  <code>&gt;</code> quotes, and <code>::: note</code> / <code>warning</code> /{' '}
                  <code>success</code> callouts.
                </p>
                <FieldMessages diagnostics={diagnostics} field="body" />
              </div>

              <AssetManager
                postId={id}
                heroAssetId={draft.heroAssetId}
                onInsert={insertAsset}
                onSetHero={(assetId) => update('heroAssetId', assetId)}
              />

              {draft.heroAssetId && (
                <div className="space-y-4 border border-sage/30 bg-white p-4">
                  <p className={labelClass}>Hero image</p>

                  <div className="space-y-1.5">
                    <label htmlFor="heroAlt" className={labelClass}>
                      Alt text
                    </label>
                    <input
                      id="heroAlt"
                      className={inputClass}
                      value={draft.heroAlt}
                      onChange={(event) => update('heroAlt', event.target.value)}
                    />
                    <FieldMessages diagnostics={diagnostics} field="heroAlt" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label htmlFor="heroCaption" className={labelClass}>
                        Caption
                      </label>
                      <input
                        id="heroCaption"
                        className={inputClass}
                        value={draft.heroCaption}
                        onChange={(event) => update('heroCaption', event.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="heroCredit" className={labelClass}>
                        Credit
                      </label>
                      <input
                        id="heroCredit"
                        className={inputClass}
                        value={draft.heroCredit}
                        onChange={(event) => update('heroCredit', event.target.value)}
                      />
                    </div>
                  </div>

                  <FieldMessages diagnostics={diagnostics} field="heroAssetId" />
                </div>
              )}
            </div>

            {/* Preview ---------------------------------------------------- */}
            <div className="xl:sticky xl:top-6 xl:self-start">
              <PreviewPane preview={previewResult} isPending={preview.isPending} />
            </div>
          </div>
        </div>
      </main>

      {showRevisions && (
        <RevisionsModal
          postId={id}
          onClose={() => setShowRevisions(false)}
          onRestored={(markdown) => {
            setDraft((current) => (current ? { ...current, bodyMarkdown: markdown } : current));
            setShowRevisions(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * What was live, and when.
 *
 * A revision per publish, not per save: history is what residents actually saw
 * rather than every half-finished draft between. Restoring loads it into the
 * working state and stops there — publishing again is a separate, deliberate
 * step, so an administrator can read a restored version before it goes back out.
 */
function RevisionsModal({
  postId,
  onClose,
  onRestored,
}: {
  postId: string;
  onClose: () => void;
  onRestored: (markdown: string) => void;
}) {
  const { data: revisions, isLoading } = useBlogRevisionsQuery(postId);
  const fetchRevision = useBlogRevision(postId);
  const restore = useRestoreBlogRevision(postId);
  const [viewing, setViewing] = useState<string | null>(null);
  const [body, setBody] = useState<string | null>(null);

  const view = async (revisionId: string) => {
    setViewing(revisionId);
    const revision = await fetchRevision.mutateAsync(revisionId);
    setBody(revision.bodyMarkdown ?? '');
  };

  return (
    <Modal isOpen onClose={onClose} title="Revision history" size="lg">
      {isLoading ? (
        <p className="text-sm text-forest/50">Loading history…</p>
      ) : !revisions || revisions.length === 0 ? (
        <p className="text-sm text-forest/50">
          No revisions yet. One is recorded each time the post is published.
        </p>
      ) : (
        <ul className="space-y-2">
          {revisions.map((revision) => (
            <li
              key={revision.id}
              className={cn(sq, 'flex items-center gap-3 border border-sage/25 p-3')}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-forest">{revision.title}</p>
                <p className="font-mono text-[11px] text-forest/40">
                  Published {new Date(revision.publishedAt).toLocaleString('en-NZ')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => view(revision.id)}
                className="text-xs text-forest/60 hover:text-terracotta"
              >
                View
              </button>
              <button
                type="button"
                onClick={async () => {
                  const result = await restore.mutateAsync(revision.id);
                  onRestored(result.post.bodyMarkdown);
                }}
                className="text-xs text-forest/60 hover:text-terracotta"
              >
                Restore
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewing && body !== null && (
        <div className="mt-4">
          <p className={labelClass}>That version</p>
          <pre className="mt-1 max-h-64 overflow-auto border border-sage/30 bg-white p-3 font-mono text-[12px] leading-relaxed text-forest/80">
            {body}
          </pre>
          <p className="mt-2 text-xs text-forest/50">
            Restoring loads this into the editor. The public site does not change until you
            publish again.
          </p>
        </div>
      )}
    </Modal>
  );
}
