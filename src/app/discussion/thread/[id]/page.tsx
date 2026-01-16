'use client';

import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/sections/PageHeader';
import { ThreadDetail } from '@/components/discussions';
import { useThread, useReplies, useCategories } from '@/hooks/useDiscussions';
import type { Reply } from '@/types';

interface LoadingSkeletonProps {
  className?: string;
}

function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse space-y-6', className)}>
      <div className="h-8 bg-sage/30 rounded w-3/4" />
      <div className="h-4 bg-sage/30 rounded w-1/2" />
      <div className="h-32 bg-sage/30 rounded" />
      <div className="space-y-3">
        <div className="h-16 bg-sage/30 rounded" />
        <div className="h-16 bg-sage/30 rounded" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center py-16">
      <Icon icon="lucide:message-square-off" className="w-16 h-16 text-sage mb-4" />
      <h1 className="font-display text-2xl font-semibold text-forest mb-2">
        Thread Not Found
      </h1>
      <p className="text-forest/60 max-w-md">
        The thread you're looking for doesn't exist or may have been removed.
      </p>
    </div>
  );
}

/**
 * Thread detail page - displays a single thread with all its replies.
 * URL: /discussion/thread/[id]
 * Uses compact PageHeader variant for functional page styling.
 */
export default function ThreadPage() {
  const params = useParams();
  const threadId = params.id as string;

  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(threadId);
  const { data: replies = [], isLoading: repliesLoading } = useReplies(threadId);
  const { data: categories } = useCategories();

  const isLoading = threadLoading || repliesLoading;

  if (!isLoading && (!thread || threadError)) {
    return (
      <div className="min-h-screen bg-bone">
        <PageHeader
          title="Community Discussion"
          description="Connect with your neighbors"
          eyebrow="Forum"
          backgroundImage="/images/mangere-mountain.jpg"
          variant="compact"
        />
        <div className="container mx-auto px-4 py-8">
          <NotFound />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bone">
      <PageHeader
        title="Community Discussion"
        description="Connect with your neighbors"
        eyebrow="Forum"
        backgroundImage="/images/mangere-mountain.jpg"
        variant="compact"
      />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {isLoading ? (
          <LoadingSkeleton />
        ) : thread ? (
          <ThreadDetail
            thread={thread}
            replies={replies as Reply[]}
            onUpvote={() => console.log('Upvote thread:', threadId)}
            onBookmark={() => console.log('Bookmark thread:', threadId)}
            onReply={(body, parentId) => console.log('Reply:', body, parentId)}
            onReport={() => console.log('Report thread:', threadId)}
            onShare={(platform) => console.log('Share to:', platform)}
          />
        ) : null}
      </div>
    </div>
  );
}
