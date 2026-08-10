import type { Block } from '@/lib/blog/types';

/**
 * The authoring API's wire shapes.
 *
 * Distinct from `src/lib/blog/types.ts`, which is the *published* contract the
 * public site reads. These cross the authenticated admin boundary and carry
 * things the public artifacts deliberately do not: drafts, markdown source,
 * validation diagnostics, revisions.
 */

export type BlogPostStatus = 'draft' | 'published' | 'unpublished';

/** A message addressed to the field that produced it. */
export interface BlogFieldIssue {
  field: string;
  message: string;
}

export interface BlogDiagnostics {
  errors: BlogFieldIssue[];
  warnings: BlogFieldIssue[];
  /** Distinct fields holding publishing up, so the page can name them. */
  blockingFields: string[];
}

/**
 * Who a published post is for.
 *
 * `owners` keeps a post off every public surface — listing, sitemap, search,
 * share previews. It does not encrypt it: the published body stays in the public
 * bucket, readable by anyone holding its URL.
 */
export type BlogPostVisibility = 'public' | 'owners';

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  status: BlogPostStatus;
  categoryLabel: string;
  /** Who the published post is for. On the summary so the list can mark what is gated. */
  visibility: BlogPostVisibility;
  date: string | null;
  updatedAt: string;
  publishedAt: string | null;
  featured: boolean;
  /** Site-relative, and present only for a published post. */
  publicUrl: string | null;
}

export interface BlogPostDetail extends BlogPostSummary {
  excerpt: string | null;
  author: string;
  categorySlug: string;
  bodyMarkdown: string;
  updated: string | null;
  heroAssetId: string | null;
  heroAlt: string | null;
  heroCaption: string | null;
  heroCredit: string | null;
  /** False once published — the slug freezes so a live URL cannot rot. */
  slugEditable: boolean;
}

export interface BlogPostSaveResponse {
  post: BlogPostDetail;
  diagnostics: BlogDiagnostics;
}

export interface BlogPostUpdateRequest {
  title?: string;
  slug?: string;
  excerpt?: string | null;
  author?: string;
  category?: string;
  visibility?: BlogPostVisibility;
  date?: string | null;
  updated?: string | null;
  bodyMarkdown?: string;
  heroAssetId?: string | null;
  heroAlt?: string | null;
  heroCaption?: string | null;
  heroCredit?: string | null;
  featured?: boolean;
}

export interface BlogPreviewResponse {
  schemaVersion: number;
  slug: string;
  blocks: Block[];
  excerpt: string;
  /**
   * True when no excerpt was authored and this one was cut from the opening
   * paragraph. Reported by the API rather than inferred from a warning's wording,
   * so the editor's badge does not break on a copy edit.
   */
  excerptDerived: boolean;
  readingTime: number;
  diagnostics: BlogDiagnostics;
}

export interface BlogAsset {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width: number;
  height: number;
  /** Short-lived and credentialed. A draft's imagery has no public URL. */
  url: string;
}

export interface BlogRevision {
  id: string;
  publishedAt: string;
  publishedBy: string | null;
  title: string;
  bodyMarkdown?: string | null;
}

export interface BlogPublishResponse {
  post: BlogPostDetail;
  warnings: string[];
  /**
   * Tri-state on purpose. `false` means the reading site was not reached and the
   * change appears once the freshness window elapses; `null` means no signal is
   * configured for this environment, which is not a fault.
   */
  revalidated: boolean | null;
  bodyKey: string | null;
}

export interface BlogCategoryOption {
  slug: string;
  label: string;
}
