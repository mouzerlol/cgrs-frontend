/**
 * API client for blog authoring.
 *
 * Every operation requires the `manageBlogPosts` capability server-side. Nothing
 * on the public reading path calls any of this — the public site reads the
 * published bucket, and `src/lib/blog/` is the only module that touches it.
 *
 * Goes through `apiRequest` like every other admin surface, so authentication,
 * base-URL resolution, and error decoding are inherited rather than reinvented.
 */

import { apiRequest } from '@/lib/api/client';
import type {
  BlogAsset,
  BlogCategoryOption,
  BlogPostSaveResponse,
  BlogPostSummary,
  BlogPostUpdateRequest,
  BlogPreviewResponse,
  BlogPublishResponse,
  BlogRevision,
} from '@/types/blog-admin';

type GetToken = () => Promise<string | null>;

const BASE = '/api/v1/blog';

/** Mirror of the server-side cap. The server is what enforces it. */
export const MAX_BLOG_IMAGE_BYTES = 10_485_760;

/** Mirror of the server-side allowlist. SVG is excluded — it can carry script. */
export const ALLOWED_BLOG_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export async function listBlogPosts(getToken: GetToken): Promise<BlogPostSummary[]> {
  return apiRequest<BlogPostSummary[]>(`${BASE}/posts`, getToken);
}

export async function getBlogPost(id: string, getToken: GetToken): Promise<BlogPostSaveResponse> {
  return apiRequest<BlogPostSaveResponse>(`${BASE}/posts/${id}`, getToken);
}

export async function createBlogPost(
  body: { title: string; author?: string; bodyMarkdown?: string },
  getToken: GetToken,
): Promise<BlogPostSaveResponse> {
  return apiRequest<BlogPostSaveResponse>(`${BASE}/posts`, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function updateBlogPost(
  id: string,
  body: BlogPostUpdateRequest,
  getToken: GetToken,
): Promise<BlogPostSaveResponse> {
  return apiRequest<BlogPostSaveResponse>(`${BASE}/posts/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function deleteBlogPost(id: string, getToken: GetToken): Promise<void> {
  return apiRequest<void>(`${BASE}/posts/${id}`, getToken, { method: 'DELETE' });
}

/**
 * The block document publishing would produce, plus what validation has to say.
 *
 * Persists nothing. Unsaved edits are sent with the call so the preview reflects
 * what the author is looking at rather than what was last saved.
 */
export async function previewBlogPost(
  id: string,
  body: BlogPostUpdateRequest,
  getToken: GetToken,
): Promise<BlogPreviewResponse> {
  return apiRequest<BlogPreviewResponse>(`${BASE}/posts/${id}/preview`, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function publishBlogPost(
  id: string,
  getToken: GetToken,
): Promise<BlogPublishResponse> {
  return apiRequest<BlogPublishResponse>(`${BASE}/posts/${id}/publish`, getToken, {
    method: 'POST',
  });
}

export async function unpublishBlogPost(
  id: string,
  getToken: GetToken,
): Promise<BlogPublishResponse> {
  return apiRequest<BlogPublishResponse>(`${BASE}/posts/${id}/unpublish`, getToken, {
    method: 'POST',
  });
}

export async function listBlogAssets(id: string, getToken: GetToken): Promise<BlogAsset[]> {
  return apiRequest<BlogAsset[]>(`${BASE}/posts/${id}/assets`, getToken);
}

/**
 * Upload an image, proxied through the API.
 *
 * The file goes into the *private* bucket. It becomes public only if a published
 * body references it, and even then under a content-hashed key the API derives.
 */
export async function uploadBlogAsset(
  id: string,
  file: File,
  getToken: GetToken,
): Promise<BlogAsset> {
  const form = new FormData();
  form.append('file', file);
  return apiRequest<BlogAsset>(`${BASE}/posts/${id}/assets`, getToken, {
    method: 'POST',
    body: form,
  });
}

export async function listBlogRevisions(id: string, getToken: GetToken): Promise<BlogRevision[]> {
  return apiRequest<BlogRevision[]>(`${BASE}/posts/${id}/revisions`, getToken);
}

export async function getBlogRevision(
  id: string,
  revisionId: string,
  getToken: GetToken,
): Promise<BlogRevision> {
  return apiRequest<BlogRevision>(`${BASE}/posts/${id}/revisions/${revisionId}`, getToken);
}

/** Loads a revision into the working state. This does not publish it. */
export async function restoreBlogRevision(
  id: string,
  revisionId: string,
  getToken: GetToken,
): Promise<BlogPostSaveResponse> {
  return apiRequest<BlogPostSaveResponse>(
    `${BASE}/posts/${id}/revisions/${revisionId}:restore`,
    getToken,
    { method: 'POST' },
  );
}

/** Categories already in use, so the editor suggests reuse over invention. */
export async function listBlogCategories(getToken: GetToken): Promise<BlogCategoryOption[]> {
  return apiRequest<BlogCategoryOption[]>(`${BASE}/categories`, getToken);
}
