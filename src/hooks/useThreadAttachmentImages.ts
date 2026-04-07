'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { ApiError } from '@/lib/api/client';
import { STALE_TIMES } from '@/lib/cache-config';
import { getDiscussionAttachmentDownloadUrl } from '@/lib/api/discussions';
import type { DiscussionAttachmentMeta, ThreadImage } from '@/types';

/**
 * Resolves presigned GET URLs for thread-level ADR 005 attachments for use in ImageGallery.
 */
export function useThreadAttachmentImages(attachments: DiscussionAttachmentMeta[] | undefined) {
  const { getToken } = useAuth();
  const list = attachments ?? [];

  const results = useQueries({
    queries: list.map((att) => ({
      queryKey: ['discussion-attachment-download', att.id] as const,
      queryFn: () => getDiscussionAttachmentDownloadUrl(att.id, getToken),
      staleTime: STALE_TIMES.SHORT,
      enabled: !!att.id,
      // Presigned GET + R2: avoid retrying 503/502; reduces noisy duplicate failures in console.
      retry: (failureCount: number, err: unknown) => {
        if (err instanceof ApiError && (err.status === 503 || err.status === 502)) return false;
        return failureCount < 1;
      },
    })),
  });

  const images: ThreadImage[] = useMemo(() => {
    const out: ThreadImage[] = [];
    for (let i = 0; i < list.length; i++) {
      const att = list[i];
      const url = results[i]?.data?.download_url;
      if (!url) {
        continue;
      }
      out.push({
        id: att.id,
        url,
        thumbnail: url,
        alt: att.contentType.startsWith('image/') ? 'Thread image' : 'Attachment',
      });
    }
    return out;
  }, [list, results]);

  const isLoading = list.length > 0 && results.some((r) => r.isLoading);
  const isError = results.some((r) => r.isError);

  return { images, isLoading, isError };
}
