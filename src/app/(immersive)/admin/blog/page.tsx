'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, FileText, Lock, Pencil, Plus } from 'lucide-react';
import WorkManagementNavBar from '@/components/work-management/WorkManagementNavBar';
import { Modal } from '@/components/ui/Modal';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { canAccessManagement } from '@/lib/auth';
import { ApiError } from '@/lib/api/client';
import { useBlogPostsQuery, useCreateBlogPost } from '@/hooks/useBlogAdmin';
import { cn } from '@/lib/utils';
import type { BlogPostStatus, BlogPostSummary } from '@/types/blog-admin';

/*
 * Management surfaces run square. The rounded Card and Button defaults belong to
 * the community side; this is the same treatment the other admin sections use.
 */
const sq = 'rounded-none';
const inputClass =
  'w-full rounded-none border border-sage/40 bg-white px-3 py-2 text-sm text-forest focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest';
const labelClass = 'block text-xs font-semibold uppercase tracking-[0.15em] text-forest/50';

function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

/**
 * Status at a glance.
 *
 * Amber for published, following the management side's convention that amber
 * means live. A draft is the quiet one — it exists only here and has no bucket
 * presence at all — and an unpublished post reads as withdrawn rather than as
 * never-written, because those are different things to an administrator.
 */
function StatusBadge({ status }: { status: BlogPostStatus }) {
  const style: Record<BlogPostStatus, string> = {
    published: 'bg-amber/20 text-amber-dark',
    draft: 'bg-forest/10 text-forest/60',
    unpublished: 'bg-terracotta/15 text-terracotta-dark',
  };
  const dot: Record<BlogPostStatus, string> = {
    published: 'bg-amber-dark',
    draft: 'bg-forest/40',
    unpublished: 'bg-terracotta',
  };
  const label: Record<BlogPostStatus, string> = {
    published: 'Live',
    draft: 'Draft',
    unpublished: 'Withdrawn',
  };

  return (
    <span
      role="status"
      className={cn(
        'inline-flex items-center gap-1.5 rounded-none px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em]',
        style[status],
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', dot[status])} />
      {label[status]}
    </span>
  );
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatWhen(value: string): string {
  return new Date(value).toLocaleString('en-NZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function NewPostModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const create = useCreateBlogPost();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      const created = await create.mutateAsync({ title, author: author || undefined });
      router.push(`/admin/blog/${created.post.id}`);
    } catch (caught) {
      setError(apiErrorMessage(caught, 'The post could not be created.'));
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="New post" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="new-title" className={labelClass}>
            Title
          </label>
          <input
            id="new-title"
            className={inputClass}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
          />
          {/* The slug is derived from this and stays editable for as long as the
              post has never been published. */}
          <p className="text-xs text-forest/50">
            The URL is derived from the title and can be changed until the post is first
            published.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="new-author" className={labelClass}>
            Byline
          </label>
          <input
            id="new-author"
            className={inputClass}
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="The Committee"
          />
        </div>

        {error && <p className="text-sm text-terracotta-dark">{error}</p>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(sq, 'border border-sage/40 px-4 py-2 text-sm text-forest')}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!title.trim() || create.isPending}
            className={cn(
              sq,
              'bg-forest px-4 py-2 text-sm text-bone disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            {create.isPending ? 'Creating…' : 'Create draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function PostRow({ post }: { post: BlogPostSummary }) {
  return (
    <tr className="border-b border-sage/20 last:border-b-0">
      <td className="px-4 py-3">
        <Link
          href={`/admin/blog/${post.id}`}
          className="font-medium text-forest underline-offset-2 hover:underline"
        >
          {post.title || 'Untitled'}
        </Link>
        <p className="mt-0.5 font-mono text-[11px] text-forest/40">/blog/{post.slug}</p>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={post.status} />
      </td>
      <td className="px-4 py-3 text-sm text-forest/70">
        <span className="flex flex-wrap items-center gap-1.5">
          {post.categoryLabel || '—'}
          {/* So an administrator can audit what is gated without opening each post. */}
          {post.visibility === 'owners' && (
            <span
              data-testid="admin-owners-only"
              className="inline-flex items-center gap-1 rounded-none bg-forest-light px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-bone"
            >
              <Lock className="h-2.5 w-2.5 shrink-0" strokeWidth={2.25} aria-hidden="true" />
              Owners
            </span>
          )}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-forest/70">{formatDate(post.date)}</td>
      <td className="px-4 py-3 text-sm text-forest/50">{formatWhen(post.updatedAt)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-3">
          {/* Only a published post has somewhere live to point at. */}
          {post.publicUrl && (
            <a
              href={post.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-forest/60 hover:text-terracotta"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View live
            </a>
          )}
          <Link
            href={`/admin/blog/${post.id}`}
            className="inline-flex items-center gap-1 text-xs text-forest/60 hover:text-terracotta"
          >
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}

export default function AdminBlogPage() {
  const { data: currentUser } = useCurrentUser();
  const isSuperadmin = currentUser?.is_superadmin ?? false;
  const canManage = canAccessManagement(currentUser?.membership?.role, isSuperadmin);

  const { data: posts, isLoading, error } = useBlogPostsQuery(canManage);
  const [creating, setCreating] = useState(false);

  const renderBody = () => {
    if (!canManage) {
      return (
        <div className={cn(sq, 'border border-sage/30 bg-white p-8 text-center')}>
          <p className="text-sm text-forest/60">
            You do not have permission to manage blog posts.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return <p className="text-sm text-forest/50">Loading posts…</p>;
    }

    if (error) {
      return (
        <div className={cn(sq, 'border border-terracotta/40 bg-white p-6')}>
          <p className="text-sm text-terracotta-dark">
            {apiErrorMessage(error, 'The post list could not be loaded.')}
          </p>
        </div>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <div className={cn(sq, 'border border-sage/30 bg-white p-10 text-center')}>
          <p className="font-display text-lg text-forest">Nothing written yet.</p>
          <p className="mt-2 text-sm text-forest/60">
            Start a draft. Nothing is public until you publish it.
          </p>
        </div>
      );
    }

    return (
      <div className={cn(sq, 'border border-sage/30 bg-white')}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-sage/30 bg-sage-light/40 text-left">
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">
                Post
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">
                Status
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">
                Category
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">
                Date
              </th>
              <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-forest/50">
                Last edited
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          {/* The API returns them most-recently-edited first; that order is the
              one an administrator is looking for and is not re-derived here. */}
          <tbody>
            {posts.map((post) => (
              <PostRow key={post.id} post={post} />
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-bone">
      <WorkManagementNavBar
        title="Blog"
        showBackButton
        backHref="/admin"
        backLabel="Administration"
      />
      <main className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl p-6 md:p-8 lg:p-10">
          <div className="mb-6 flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  sq,
                  'flex h-11 w-11 shrink-0 items-center justify-center bg-forest text-bone',
                )}
              >
                <FileText className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
                  Blog
                </p>
                <h1 className="font-display text-2xl text-forest">Posts</h1>
                <p className="mt-0.5 text-sm text-forest/60">
                  Write, preview, and publish to the community noticeboard. Publishing needs no
                  deployment.
                </p>
              </div>
            </div>

            {canManage && (
              <button
                type="button"
                onClick={() => setCreating(true)}
                className={cn(sq, 'inline-flex items-center gap-2 bg-forest px-4 py-2 text-sm text-bone')}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                New post
              </button>
            )}
          </div>

          {renderBody()}
        </div>
      </main>

      {creating && <NewPostModal onClose={() => setCreating(false)} />}
    </div>
  );
}
