/**
 * API client functions for discussion endpoints.
 * Uses real API calls with Clerk authentication.
 */

import { apiRequest } from '@/lib/api/client';
import type {
  Thread,
  Reply,
  DiscussionCategory,
  DiscussionCategorySlug,
  ForumUser,
  ForumUserStats,
  LatestReply,
  ThreadWithLatestReply,
  Poll,
} from '@/types';

const API_PATH = '/api/v1/discussions';
const ATTACHMENTS_API_PATH = `${API_PATH}/attachments`;

/** Matches cgrs-api default `r2_max_upload_bytes` (10 MiB). */
export const DISCUSSION_IMAGE_MAX_BYTES = 10_485_760;

/** ADR 005: max attachments per thread opening post or reply. */
export const DISCUSSION_ATTACHMENT_MAX_COUNT = 6;

// =============================================================================
// Types
// =============================================================================

interface ApiAttachmentMeta {
  id: string;
  content_type: string;
  byte_size: number;
}

interface ApiUploadSessionResponse {
  attachment_id: string;
  upload_url: string;
  expires_in_seconds: number;
  required_headers: Record<string, string>;
}

interface ApiDownloadUrlResponse {
  download_url: string;
  expires_in_seconds: number;
}

interface ApiCoverPreviewResponse {
  download_url: string;
  expires_in_seconds: number;
}

interface ApiPaginatedThreads {
  items: ApiThreadResponse[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

interface ApiPaginatedReplies {
  items: ApiReplyResponse[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
}

interface ApiPollOptionResponse {
  id: string;
  text: string;
  votes: number;
  voters: ApiForumUser[];
}

interface ApiPollResponse {
  id: string;
  question: string;
  options: ApiPollOptionResponse[];
  allow_multiple: boolean;
  is_closed: boolean;
  closed_at: string | null;
  creator_id: string;
  creator_clerk_user_id: string | null;
  created_at: string;
}

interface ApiThreadResponse {
  id: string;
  title: string;
  body: string;
  category: string;
  author: ApiForumUser;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean;
  upvotes: number;
  reply_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_deleted: boolean;
  is_upvoted: boolean;
  is_bookmarked: boolean;
  visibility: string;
  /** Always present from current API; optional for older responses */
  poll?: ApiPollResponse | null;
  attachments?: ApiAttachmentMeta[];
  /** Presigned GET for first thread image on paginated list (optional) */
  cover_preview?: ApiCoverPreviewResponse | null;
}

interface ApiReplyResponse {
  id: string;
  thread_id: string;
  parent_reply_id: string | null;
  body: string;
  author: ApiForumUser;
  created_at: string;
  updated_at: string | null;
  is_edited: boolean;
  depth: number;
  upvotes: number;
  is_deleted: boolean;
  is_upvoted: boolean;
  attachments?: ApiAttachmentMeta[];
}

interface ApiForumUser {
  id: string;
  user_id?: string | null;
  clerk_user_id?: string | null;
  display_name: string;
  avatar: string | null;
  title: string;
  badges: string[];
  created_at: string;
}

interface ApiCategoryResponse {
  id: string;
  name: string;
  slug: string;
  min_role_to_post: string;
  display_order: number;
  description?: string;
  color?: string;
  icon?: string;
  max_body_length?: number | null;
  is_default?: boolean;
}

interface ApiVisibilityOption {
  value: number;
  label: string;
  description: string;
}

interface ApiDiscussionSettingsResponse {
  visibility_options: ApiVisibilityOption[];
}

interface ApiUpvoteResponse {
  upvoted: boolean;
}

interface ApiBookmarkResponse {
  bookmarked: boolean;
}

interface ApiActionResponse {
  success: boolean;
  message?: string;
}

// =============================================================================
// Mappers
// =============================================================================

function mapForumUser(api: ApiForumUser): ForumUser {
  return {
    id: api.id,
    userId: api.user_id ?? undefined,
    clerkUserId: api.clerk_user_id ?? undefined,
    displayName: api.display_name,
    avatar: api.avatar ?? undefined,
    title: api.title,
    badges: api.badges,
    stats: { upvotesReceived: 0, repliesCount: 0, threadsCreated: 0 } as ForumUserStats,
    createdAt: api.created_at,
  };
}

function mapPollResponse(api: ApiPollResponse): Poll {
  const voterDisplayNames: Record<string, string> = {};
  for (const opt of api.options) {
    for (const v of opt.voters) {
      voterDisplayNames[v.id] = v.display_name;
    }
  }
  return {
    question: api.question,
    options: api.options.map((opt) => ({
      id: opt.id,
      text: opt.text,
      votes: opt.votes,
      voters: opt.voters.map((v) => v.id),
    })),
    allowMultiple: api.allow_multiple,
    isClosed: api.is_closed,
    closedAt: api.closed_at ?? undefined,
    creatorId: api.creator_id,
    creatorClerkUserId: api.creator_clerk_user_id ?? undefined,
    voterDisplayNames,
  };
}

function mapAttachmentMeta(api: ApiAttachmentMeta) {
  return {
    id: api.id,
    contentType: api.content_type,
    byteSize: api.byte_size,
  };
}

function mapThreadResponse(api: ApiThreadResponse): Thread {
  return {
    id: api.id,
    title: api.title,
    body: api.body,
    category: api.category as DiscussionCategorySlug,
    author: mapForumUser(api.author),
    createdAt: api.created_at,
    updatedAt: api.updated_at ?? undefined,
    isEdited: api.is_edited,
    upvotes: api.upvotes,
    upvotedBy: [],
    replyCount: api.reply_count,
    isPinned: api.is_pinned,
    pinnedAt: undefined,
    pinnedBy: undefined,
    bookmarkedBy: [],
    reportedBy: [],
    isUpvoted: api.is_upvoted,
    isBookmarked: api.is_bookmarked,
    isDeleted: api.is_deleted,
    visibility: api.visibility as Thread['visibility'],
    isLocked: api.is_locked,
    poll: api.poll ? mapPollResponse(api.poll) : undefined,
    attachments: api.attachments?.map(mapAttachmentMeta),
    coverPreview: api.cover_preview
      ? {
          downloadUrl: api.cover_preview.download_url,
          expiresInSeconds: api.cover_preview.expires_in_seconds,
        }
      : undefined,
  };
}

function mapReplyResponse(api: ApiReplyResponse): Reply {
  return {
    id: api.id,
    threadId: api.thread_id,
    parentReplyId: api.parent_reply_id ?? undefined,
    body: api.body,
    author: mapForumUser(api.author),
    createdAt: api.created_at,
    updatedAt: api.updated_at ?? undefined,
    isEdited: api.is_edited,
    upvotes: api.upvotes,
    upvotedBy: [],
    reportedBy: [],
    depth: api.depth,
    isUpvoted: api.is_upvoted,
    isDeleted: api.is_deleted,
    attachments: api.attachments?.map(mapAttachmentMeta),
  };
}

const CATEGORY_COLORS = new Set(['terracotta', 'forest', 'sage']);

function mapCategoryResponse(api: ApiCategoryResponse): DiscussionCategory {
  const colorRaw = api.color ?? 'sage';
  const color = CATEGORY_COLORS.has(colorRaw) ? (colorRaw as DiscussionCategory['color']) : 'sage';
  return {
    id: api.id,
    slug: api.slug,
    name: api.name,
    description: api.description ?? '',
    icon: api.icon?.trim() ? api.icon : 'lucide:message-square',
    color,
    maxBodyLength: api.max_body_length ?? 2000,
    isSpecial: api.slug === 'announcements',
    isDefault: api.is_default ?? false,
  };
}

// =============================================================================
// Categories API
// =============================================================================

export async function getCategories(
  getToken: () => Promise<string | null>,
  options?: { postable?: boolean },
): Promise<DiscussionCategory[]> {
  const qs = options?.postable ? '?postable=true' : '';
  const response = await apiRequest<ApiCategoryResponse[]>(
    `${API_PATH}/categories${qs}`,
    getToken,
  );
  return response.map(mapCategoryResponse);
}

export async function getCategory(
  slug: string,
  getToken: () => Promise<string | null>,
): Promise<DiscussionCategory | null> {
  const categories = await getCategories(getToken);
  return categories.find((c) => c.slug === slug) || null;
}

export async function getDefaultCategory(
  getToken: () => Promise<string | null>,
): Promise<DiscussionCategory | null> {
  const categories = await getCategories(getToken, { postable: true });
  return categories.find((c) => c.isDefault) || categories[0] || null;
}

// =============================================================================
// Settings API
// =============================================================================

export interface VisibilityOption {
  value: number;
  label: string;
  description: string;
}

export interface DiscussionSettings {
  visibilityOptions: VisibilityOption[];
}

export async function getDiscussionSettings(
  getToken: () => Promise<string | null>,
): Promise<DiscussionSettings> {
  const response = await apiRequest<ApiDiscussionSettingsResponse>(
    `${API_PATH}/settings`,
    getToken,
  );
  return {
    visibilityOptions: response.visibility_options.map((opt) => ({
      value: opt.value,
      label: opt.label,
      description: opt.description,
    })),
  };
}

// =============================================================================
// Threads API
// =============================================================================

export interface GetThreadsOptions {
  category?: string;
  search?: string;
  pinnedOnly?: boolean;
  sort?: 'newest' | 'oldest' | 'most-upvoted' | 'most-discussed' | 'recent-activity';
  limit?: number;
  offset?: number;
}

export interface GetThreadsResult {
  threads: Thread[];
  total: number;
  hasMore: boolean;
  offset: number;
  limit: number;
}

export async function getThreads(
  options: GetThreadsOptions = {},
  getToken: () => Promise<string | null>,
): Promise<GetThreadsResult> {
  const params = new URLSearchParams();
  if (options.category) params.set('category', options.category);
  if (options.offset !== undefined) params.set('offset', String(options.offset));
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  if (options.sort) params.set('sort', options.sort);

  const queryString = params.toString();
  const path = `${API_PATH}${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<ApiPaginatedThreads>(path, getToken);

  let threads = response.items.map(mapThreadResponse);

  // Client-side filtering for search and pinnedOnly (backend could support these too)
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    threads = threads.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        t.body?.toLowerCase().includes(searchLower),
    );
  }

  if (options.pinnedOnly) {
    threads = threads.filter((t) => t.isPinned);
  }

  return {
    threads,
    total: response.total,
    hasMore: response.has_more,
    offset: response.offset,
    limit: response.limit,
  };
}

export async function getThread(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<Thread | null> {
  try {
    const response = await apiRequest<ApiThreadResponse>(`${API_PATH}/${id}`, getToken);
    return mapThreadResponse(response);
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createThread(
  data: {
    title: string;
    body: string;
    category: string;
    /** VisibilityEnum int (0–40); owner+ only in UI. */
    visibility?: number;
    poll?: { question: string; options: string[]; allowMultiple: boolean };
    attachmentIds?: string[];
  },
  getToken: () => Promise<string | null>,
): Promise<Thread> {
  const payload: Record<string, unknown> = {
    title: data.title,
    body: data.body,
    category: data.category,
  };
  if (data.visibility !== undefined) {
    payload.visibility = data.visibility;
  }
  if (data.poll) {
    payload.poll = {
      question: data.poll.question,
      options: data.poll.options,
      allow_multiple: data.poll.allowMultiple,
    };
  }
  if (data.attachmentIds?.length) {
    payload.attachment_ids = data.attachmentIds;
  }
  const response = await apiRequest<ApiThreadResponse>(API_PATH, getToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return mapThreadResponse(response);
}

/** Upload session context: forum assets vs work-task / management-request assets (R2 key prefix). */
export type CommunityAttachmentUploadPurpose = 'discussion' | 'work_task';

/**
 * Start an ADR 005 direct-to-R2 upload: returns presigned PUT target and attachment id.
 */
export async function createDiscussionUploadSession(
  contentType: string,
  byteSize: number,
  getToken: () => Promise<string | null>,
  options?: { threadId?: string; uploadPurpose?: CommunityAttachmentUploadPurpose },
): Promise<ApiUploadSessionResponse> {
  const body: Record<string, unknown> = {
    content_type: contentType,
    byte_size: byteSize,
  };
  if (options?.threadId) body.thread_id = options.threadId;
  if (options?.uploadPurpose) body.upload_purpose = options.uploadPurpose;
  return apiRequest<ApiUploadSessionResponse>(`${ATTACHMENTS_API_PATH}/upload-sessions`, getToken, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * Confirm the object landed in R2 after client PUT (HEAD verification on server).
 */
export async function completeDiscussionUpload(
  attachmentId: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<void>(`${ATTACHMENTS_API_PATH}/${attachmentId}/complete`, getToken, {
    method: 'POST',
  });
}

/**
 * Short-lived presigned GET for displaying a tier-gated attachment.
 */
export async function getDiscussionAttachmentDownloadUrl(
  attachmentId: string,
  getToken: () => Promise<string | null>,
): Promise<ApiDownloadUrlResponse> {
  return apiRequest<ApiDownloadUrlResponse>(
    `${ATTACHMENTS_API_PATH}/${attachmentId}/download-url`,
    getToken,
  );
}

/** Shown when the browser blocks the presigned PUT (CSP, CORS, offline, TLS, etc.). */
const R2_DIRECT_UPLOAD_CORS_HINT =
  'Check Content-Security-Policy connect-src includes https://*.r2.cloudflarestorage.com for fetch() uploads. ' +
  'If CSP is fine, allow every browser origin you use (e.g. https://www.example.com and https://example.com) on the R2 bucket CORS ' +
  '(PUT, GET, HEAD, OPTIONS; AllowedHeaders e.g. Content-Type or *). ' +
  'https://developers.cloudflare.com/r2/buckets/cors/';

/**
 * Full ADR 005 flow: session → PUT bytes to R2 (exact Content-Type) → complete.
 * Cross-origin PUT fails in the browser if the bucket CORS is not configured (error often: NetworkError / Failed to fetch).
 * @returns Attachment id to pass as `attachment_ids` on create thread / reply.
 */
export async function uploadDiscussionImageFile(
  file: File,
  getToken: () => Promise<string | null>,
  options?: { threadId?: string; uploadPurpose?: CommunityAttachmentUploadPurpose },
): Promise<string> {
  if (file.size < 1 || file.size > DISCUSSION_IMAGE_MAX_BYTES) {
    throw new RangeError(
      `Image size must be between 1 byte and ${DISCUSSION_IMAGE_MAX_BYTES} bytes (server limit)`,
    );
  }
  const session = await createDiscussionUploadSession(file.type, file.size, getToken, options);
  let putRes: Response;
  try {
    putRes = await fetch(session.upload_url, {
      method: 'PUT',
      headers: session.required_headers,
      body: file,
    });
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(`Direct upload to storage failed (${err.message}). ${R2_DIRECT_UPLOAD_CORS_HINT}`);
    }
    throw err;
  }
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '');
    throw new Error(`Direct upload failed (${putRes.status}): ${text || putRes.statusText}`);
  }
  await completeDiscussionUpload(session.attachment_id, getToken);
  return session.attachment_id;
}

/**
 * Presigned R2 upload for work-board / management-request attachments (`work-tasks/{community}/...` keys).
 * Same size limits and CORS requirements as discussion images.
 */
export async function uploadWorkTaskAttachmentFile(
  file: File,
  getToken: () => Promise<string | null>,
): Promise<string> {
  return uploadDiscussionImageFile(file, getToken, { uploadPurpose: 'work_task' });
}

interface ApiVoteResponse {
  success: boolean;
  option_id: string;
  total_votes: number;
  options: { id: string; votes: number }[];
}

export interface PollVoteResult {
  optionId: string;
  totalVotes: number;
  options: { id: string; votes: number }[];
}

/**
 * Cast or toggle a vote on a poll option.
 */
export async function voteOnPoll(
  threadId: string,
  optionId: string,
  getToken: () => Promise<string | null>,
): Promise<PollVoteResult> {
  const response = await apiRequest<ApiVoteResponse>(`${API_PATH}/${threadId}/poll/vote`, getToken, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId }),
  });
  return {
    optionId: response.option_id,
    totalVotes: response.total_votes,
    options: response.options ?? [],
  };
}

/**
 * Close a poll (creator only).
 */
export async function closePoll(threadId: string, getToken: () => Promise<string | null>): Promise<Poll> {
  const response = await apiRequest<ApiPollResponse>(`${API_PATH}/${threadId}/poll/close`, getToken, {
    method: 'POST',
  });
  return mapPollResponse(response);
}

export async function updateThread(
  id: string,
  data: {
    title?: string;
    body?: string;
    imageIds?: string[];
    pollOptions?: string[];
    allowMultiple?: boolean;
    removePoll?: boolean;
  },
  getToken: () => Promise<string | null>,
): Promise<Thread> {
  const payload: Record<string, unknown> = {};
  if (data.title !== undefined) payload.title = data.title;
  if (data.body !== undefined) payload.body = data.body;
  if (data.imageIds !== undefined) payload.image_ids = data.imageIds;
  if (data.pollOptions !== undefined) payload.poll_options = data.pollOptions;
  if (data.allowMultiple !== undefined) payload.allow_multiple = data.allowMultiple;
  if (data.removePoll !== undefined) payload.remove_poll = data.removePoll;

  const response = await apiRequest<ApiThreadResponse>(`${API_PATH}/${id}`, getToken, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapThreadResponse(response);
}

export async function deleteThread(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<void>(`${API_PATH}/${id}`, getToken, {
    method: 'DELETE',
  });
}

export async function upvoteThread(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  const response = await apiRequest<ApiUpvoteResponse>(`${API_PATH}/${id}/upvote`, getToken, {
    method: 'POST',
  });
  return response.upvoted;
}

export async function bookmarkThread(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  const response = await apiRequest<ApiBookmarkResponse>(`${API_PATH}/${id}/bookmark`, getToken, {
    method: 'POST',
  });
  return response.bookmarked;
}

export async function getBookmarkedThreads(
  options: { limit?: number; offset?: number } = {},
  getToken: () => Promise<string | null>,
): Promise<GetThreadsResult> {
  const params = new URLSearchParams();
  if (options.offset !== undefined) params.set('offset', String(options.offset));
  if (options.limit !== undefined) params.set('limit', String(options.limit));

  const queryString = params.toString();
  const path = `${API_PATH}/bookmarks${queryString ? `?${queryString}` : ''}`;

  const response = await apiRequest<ApiPaginatedThreads>(path, getToken);

  return {
    threads: response.items.map(mapThreadResponse),
    total: response.total,
    hasMore: response.has_more,
    offset: response.offset,
    limit: response.limit,
  };
}

export async function reportThread(
  id: string,
  reason: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<ApiActionResponse>(`${API_PATH}/${id}/report`, getToken, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function getPinnedThreads(
  getToken: () => Promise<string | null>,
  category?: DiscussionCategorySlug,
): Promise<Thread[]> {
  const result = await getThreads({ pinnedOnly: true, category, limit: 100 }, getToken);
  return result.threads;
}

export async function getThreadsByUser(
  userId: string,
  getToken: () => Promise<string | null>,
): Promise<Thread[]> {
  // This would need a backend endpoint; for now, fetch all and filter
  const result = await getThreads({ limit: 100 }, getToken);
  return result.threads.filter((t) => t.author.id === userId);
}

export async function getThreadsWithLatestReply(
  options: GetThreadsOptions = {},
  getToken: () => Promise<string | null>,
): Promise<{ threads: ThreadWithLatestReply[]; total: number }> {
  const result = await getThreads(options, getToken);

  // Get replies for each thread to find latest reply
  const threadsWithReply: ThreadWithLatestReply[] = await Promise.all(
    result.threads.map(async (thread) => {
      try {
        const replies = await getRepliesForThread(thread.id, getToken);
        const latestReply = replies[replies.length - 1];
        return {
          ...thread,
          latestReply: latestReply
            ? {
                author: {
                  id: latestReply.author.id,
                  displayName: latestReply.author.displayName,
                  avatar: latestReply.author.avatar,
                },
                createdAt: latestReply.createdAt,
                replyId: latestReply.id,
              }
            : undefined,
        };
      } catch {
        return { ...thread, latestReply: undefined };
      }
    }),
  );

  return { threads: threadsWithReply, total: result.total };
}

// =============================================================================
// Replies API
// =============================================================================

export async function getRepliesForThread(
  threadId: string,
  getToken: () => Promise<string | null>,
): Promise<Reply[]> {
  const response = await apiRequest<ApiPaginatedReplies>(
    `${API_PATH}/${threadId}/replies`,
    getToken,
  );

  // Build tree structure client-side
  const replies = response.items.map(mapReplyResponse);
  return buildReplyTree(replies);
}

function buildReplyTree(replies: Reply[]): Reply[] {
  // Build a lookup of children by parentReplyId
  const childrenMap = new Map<string | undefined, Reply[]>();
  for (const reply of replies) {
    const key = reply.parentReplyId || '__root__';
    const children = childrenMap.get(key) || [];
    children.push(reply);
    childrenMap.set(key, children);
  }

  // Get top-level replies sorted by upvotes
  const topLevel = (childrenMap.get('__root__') || []).sort((a, b) => b.upvotes - a.upvotes);

  // Depth-first traversal
  const result: Reply[] = [];
  const visited = new Set<string>();

  function traverse(parentId: string | undefined, depth: number) {
    const key = parentId || '__root__';
    if (parentId && visited.has(parentId)) return;
    if (parentId) visited.add(parentId);

    const children = childrenMap.get(key) || [];
    const sorted = depth === 0
      ? children
      : [...children].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

    for (const reply of sorted) {
      result.push({ ...reply, depth });
      traverse(reply.id, depth + 1);
    }
  }

  traverse(undefined, 0);
  return result;
}

export async function getReply(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<Reply | null> {
  try {
    // Replies are fetched via thread, but we can try direct access
    const response = await apiRequest<ApiReplyResponse>(`/api/v1/discussions/replies/${id}`, getToken);
    return mapReplyResponse(response);
  } catch (error) {
    if ((error as { status?: number }).status === 404) {
      return null;
    }
    throw error;
  }
}

export async function createReply(
  threadId: string,
  body: string,
  getToken: () => Promise<string | null>,
  parentReplyId?: string,
): Promise<Reply> {
  const payload: Record<string, unknown> = { body };
  if (parentReplyId) payload.parent_reply_id = parentReplyId;

  const response = await apiRequest<ApiReplyResponse>(
    `${API_PATH}/${threadId}/replies`,
    getToken,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );
  return mapReplyResponse(response);
}

export async function updateReply(
  id: string,
  body: string,
  getToken: () => Promise<string | null>,
): Promise<Reply> {
  const response = await apiRequest<ApiReplyResponse>(
    `/api/v1/discussions/replies/${id}`,
    getToken,
    {
      method: 'PATCH',
      body: JSON.stringify({ body }),
    },
  );
  return mapReplyResponse(response);
}

export async function deleteReply(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<void>(`/api/v1/discussions/replies/${id}`, getToken, {
    method: 'DELETE',
  });
}

export async function upvoteReply(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<boolean> {
  const response = await apiRequest<ApiUpvoteResponse>(
    `/api/v1/discussions/replies/${id}/upvote`,
    getToken,
    {
      method: 'POST',
    },
  );
  return response.upvoted;
}

export async function reportReply(
  id: string,
  reason: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  await apiRequest<ApiActionResponse>(`/api/v1/discussions/replies/${id}/report`, getToken, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function getRepliesByUser(
  userId: string,
  getToken: () => Promise<string | null>,
): Promise<Reply[]> {
  // This would need a backend endpoint; for now, return empty
  // The backend doesn't currently support fetching replies by user
  return [];
}

// =============================================================================
// User Titles & Badges API
// =============================================================================

// These are not yet implemented in the backend; using mock data fallback
export async function getUserTitles(): Promise<{ id: string; name: string; minUpvotes: number; minReplies: number; minThreads: number }[]> {
  return [
    { id: '1', name: 'New Member', minUpvotes: 0, minReplies: 0, minThreads: 0 },
    { id: '2', name: 'Active Member', minUpvotes: 10, minReplies: 5, minThreads: 1 },
    { id: '3', name: 'Contributor', minUpvotes: 50, minReplies: 20, minThreads: 5 },
    { id: '4', name: 'Veteran', minUpvotes: 100, minReplies: 50, minThreads: 10 },
  ];
}

export async function getUserBadges(): Promise<{ id: string; name: string; icon: string; description: string }[]> {
  return [
    { id: '1', name: 'First Post', icon: 'MessageCircle', description: 'Created your first thread or reply' },
    { id: '2', name: 'Helpful', icon: 'ThumbsUp', description: 'Received 10 upvotes' },
    { id: '3', name: 'Pinned', icon: 'Pin', description: 'Had a thread pinned by moderators' },
  ];
}

export async function getUserBadge(id: string): Promise<{ id: string; name: string; icon: string; description: string } | null> {
  const badges = await getUserBadges();
  return badges.find((b) => b.id === id) || null;
}

// =============================================================================
// Statistics API
// =============================================================================

export interface CategoryStats {
  threadCount: number;
  replyCount: number;
  latestThread?: Thread;
}

export async function getCategoryStatsAggregated(
  getToken: () => Promise<string | null>,
): Promise<Record<string, CategoryStats>> {
  const data = await apiRequest<{ stats: Record<string, { thread_count: number; reply_count: number }> }>(
    `${API_PATH}/categories/stats`,
    getToken,
  );
  // Normalise snake_case from API into camelCase to match existing CategoryStats interface.
  const stats: Record<string, CategoryStats> = {};
  for (const [slug, val] of Object.entries(data.stats)) {
    stats[slug] = {
      threadCount: val.thread_count,
      replyCount: val.reply_count,
    };
  }
  return stats;
}

export async function getForumStats(
  getToken: () => Promise<string | null>,
): Promise<{
  totalThreads: number;
  totalReplies: number;
  totalUsers: number;
}> {
  const result = await getThreads({ limit: 1 }, getToken);
  return {
    totalThreads: result.total,
    totalReplies: 0, // Would need backend support
    totalUsers: 0, // Would need backend support
  };
}
