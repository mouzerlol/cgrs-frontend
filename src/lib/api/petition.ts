/**
 * API client for petition endpoints.
 * Count, thread, and replies are public (no auth required).
 * Sign requires Turnstile token (no CGRS auth).
 */

import { apiRequest } from '@/lib/api/client';
import { getApiUrl, getServerFetchHeaders } from '@/lib/api/api-url';
import type { Reply, ForumUser, ForumUserStats } from '@/types';
import type { AdminSignaturesListResponse } from '@/types/admin';

// =============================================================================
// Types
// =============================================================================

export interface PetitionCountResponse {
  supporter_count: number;
}

export interface SignPetitionInput {
  first_name: string;
  last_name: string;
  email: string;
  resident_type: 'tenant' | 'owner';
  address?: string;
  turnstile_token: string;
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
}

interface ApiPaginatedReplies {
  items: ApiReplyResponse[];
  total: number;
  offset: number;
  limit: number;
  has_more: boolean;
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
  };
}

// =============================================================================
// API functions
// =============================================================================

/** Fetch supporter count — for server-side use on the petition page. */
export async function getPetitionCount(): Promise<number> {
  try {
    const res = await fetch(`${getApiUrl()}/api/v1/petition/count`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...getServerFetchHeaders() },
    });
    if (!res.ok) return 0;
    const data: PetitionCountResponse = await res.json();
    return data.supporter_count ?? 0;
  } catch {
    return 0;
  }
}

/** Fetch the petition thread detail (public). */
export async function getPetitionThread(getToken: () => Promise<string | null>) {
  return apiRequest<{ id: string; title: string }>('/api/v1/petition/thread', getToken);
}

/** Fetch replies for the petition thread (public). Returns flat Reply[]. */
export async function getPetitionReplies(getToken: () => Promise<string | null>): Promise<Reply[]> {
  const response = await apiRequest<ApiPaginatedReplies>(
    '/api/v1/petition/thread/replies',
    getToken,
  );
  return response.items.map(mapReplyResponse);
}

/** Fetch all petition signatures (superadmin only). */
export async function getAdminSignatures(
  getToken: () => Promise<string | null>,
): Promise<AdminSignaturesListResponse> {
  return apiRequest<AdminSignaturesListResponse>(
    '/api/v1/petition/signatures/list',
    getToken,
  );
}

/** Download all signatures as a CSV file (superadmin only). */
export async function downloadSignaturesCsv(
  getToken: () => Promise<string | null>,
): Promise<void> {
  const token = await getToken();
  const res = await fetch(`${getApiUrl()}/api/v1/petition/signatures`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!res.ok) {
    throw new Error(`Failed to download signatures (${res.status})`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'signatures.csv';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Submit a petition signature (public — Turnstile protected). */
export async function signPetition(input: SignPetitionInput): Promise<void> {
  const res = await fetch(`${getApiUrl()}/api/v1/petition/sign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = (body as { detail?: string }).detail ?? `Error ${res.status}`;
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }
}
