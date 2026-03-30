'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { ApiError } from '@/lib/api/client';
import { getDiscussionAttachmentDownloadUrl } from '@/lib/api/discussions';
import type { TaskImage } from '@/types/work-management';

const STALE_TIME_MS = 120_000;

/**
 * Resolves presigned GET URLs for R2-backed task images (API returns empty url/thumbnail + attachment_id).
 */
export function useTaskAttachmentImages(images: TaskImage[]) {
  const { getToken } = useAuth();

  const results = useQueries({
    queries: images.map((img) => ({
      queryKey: ['task-attachment-download', img.attachmentId ?? 'none'] as const,
      queryFn: () => getDiscussionAttachmentDownloadUrl(img.attachmentId!, getToken),
      staleTime: STALE_TIME_MS,
      enabled: Boolean(img.attachmentId) && !img.url,
      retry: (failureCount: number, err: unknown) => {
        if (err instanceof ApiError && (err.status === 503 || err.status === 502)) return false;
        return failureCount < 1;
      },
    })),
  });

  const displayImages: TaskImage[] = useMemo(() => {
    return images.map((img, i) => {
      if (!img.attachmentId || img.url) {
        return img;
      }
      const url = results[i]?.data?.download_url;
      if (!url) {
        return img;
      }
      return { ...img, url, thumbnail: url || img.thumbnail };
    });
  }, [images, results]);

  const isResolving = images.some((img, i) => img.attachmentId && !img.url && results[i]?.isLoading);

  return { displayImages, isResolving };
}
