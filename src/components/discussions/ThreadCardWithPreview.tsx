'use client';

import type { ComponentProps } from 'react';
import { useThreadListPreview } from '@/hooks/useThreadListPreview';
import ThreadCard from './ThreadCard';
import ThreadCardCompact from './ThreadCardCompact';

type ThreadCardProps = ComponentProps<typeof ThreadCard>;

/**
 * Resolves ADR 005 attachment preview for thread list cards (client presign or server cover_preview).
 */
export function ThreadCardWithPreview(props: ThreadCardProps) {
  const { thread, ...rest } = props;
  const { previewUrl, imageAttachmentCount, isLoading } = useThreadListPreview(thread.attachments, thread.coverPreview);
  const hasAttachmentMeta = Boolean(thread.attachments?.length);
  return (
    <ThreadCard
      {...rest}
      thread={thread}
      previewUrl={previewUrl}
      previewLoading={isLoading}
      imageAttachmentCount={hasAttachmentMeta ? imageAttachmentCount : undefined}
    />
  );
}

type ThreadCardCompactProps = ComponentProps<typeof ThreadCardCompact>;

/**
 * Compact list row with the same preview resolution as ThreadCardWithPreview.
 */
export function ThreadCardCompactWithPreview(props: ThreadCardCompactProps) {
  const { thread, ...rest } = props;
  const { previewUrl, imageAttachmentCount, isLoading } = useThreadListPreview(thread.attachments, thread.coverPreview);
  const hasAttachmentMeta = Boolean(thread.attachments?.length);
  return (
    <ThreadCardCompact
      {...rest}
      thread={thread}
      previewUrl={previewUrl}
      previewLoading={isLoading}
      imageAttachmentCount={hasAttachmentMeta ? imageAttachmentCount : undefined}
    />
  );
}
