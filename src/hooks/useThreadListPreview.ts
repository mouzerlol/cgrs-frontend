'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { ApiError } from '@/lib/api/client';
import { getDiscussionAttachmentDownloadUrl } from '@/lib/api/discussions';
import type { DiscussionAttachmentMeta, ThreadCoverPreview } from '@/types';

/** Stay below typical presigned GET TTL (API default 300s); refetch before expiry. */
const DEFAULT_STALE_MS = 120_000;

/**
 * Returns thread-level image attachments (opening post) for preview metadata.
 */
export function filterThreadImageAttachments(attachments: DiscussionAttachmentMeta[] | undefined): DiscussionAttachmentMeta[] {
  return (attachments ?? []).filter((a) => a.contentType.startsWith('image/'));
}

/**
 * Resolves a list-preview image URL: prefers server-embedded cover_preview from list API,
 * otherwise fetches presigned GET for the first image attachment (same auth as thread detail).
 */
export function useThreadListPreview(
  attachments: DiscussionAttachmentMeta[] | undefined,
  serverCover: ThreadCoverPreview | null | undefined,
) {
  const { getToken } = useAuth();
  const imageMeta = useMemo(() => filterThreadImageAttachments(attachments), [attachments]);
  const imageAttachmentCount = imageMeta.length;
  const firstImageId = imageMeta[0]?.id;

  const serverUrl = serverCover?.downloadUrl ?? null;

  const query = useQuery({
    queryKey: ['discussion-thread-list-preview', firstImageId] as const,
    queryFn: () => getDiscussionAttachmentDownloadUrl(firstImageId!, getToken),
    enabled: Boolean(firstImageId) && !serverUrl,
    staleTime: DEFAULT_STALE_MS,
    retry: (failureCount: number, err: unknown) => {
      if (err instanceof ApiError && (err.status === 503 || err.status === 502)) {
        return false;
      }
      return failureCount < 1;
    },
  });

  const previewUrl = serverUrl ?? query.data?.download_url ?? null;
  const isLoading = !serverUrl && Boolean(firstImageId) && query.isLoading;
  const isError = !serverUrl && query.isError;

  return { previewUrl, imageAttachmentCount, isLoading, isError };
}
