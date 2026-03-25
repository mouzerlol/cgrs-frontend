'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useUser } from '@clerk/nextjs';
import { toast } from '@/lib/sonner';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/sections/PageHeader';
import ThreadDetail from '@/components/discussions/ThreadDetail';
import {
  useThread,
  useReplies,
  useUpvoteThread,
  useBookmarkThread,
  useCreateReply,
  useReportThread,
  useDeleteThread,
  useDeleteReply,
  useUpvoteReply,
  useReportReply,
  useVoteOnPoll,
  useClosePoll,
} from '@/hooks/useDiscussions';
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
  const router = useRouter();
  const threadId = params.id as string;

  const { user } = useUser();
  const currentUserId = user?.id;

  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(threadId);
  const { data: replies = [], isLoading: repliesLoading } = useReplies(threadId);
  const isLoading = threadLoading || repliesLoading;

  // Mutations
  const upvoteThreadMutation = useUpvoteThread();
  const bookmarkThreadMutation = useBookmarkThread();
  const createReplyMutation = useCreateReply();
  const reportThreadMutation = useReportThread();
  const deleteThreadMutation = useDeleteThread();
  const deleteReplyMutation = useDeleteReply();
  const upvoteReplyMutation = useUpvoteReply();
  const reportReplyMutation = useReportReply();
  const voteOnPollMutation = useVoteOnPoll();
  const closePollMutation = useClosePoll();

  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Handlers
  const handleUpvoteThread = () => {
    upvoteThreadMutation.mutate(threadId);
  };

  const handleBookmark = () => {
    bookmarkThreadMutation.mutate(threadId);
  };

  const handleReply = async (body: string, parentReplyId?: string) => {
    if (!body.trim()) return;

    setIsSubmittingReply(true);
    try {
      await createReplyMutation.mutateAsync({ threadId, body, parentReplyId });
      toast.success('Reply posted');
    } catch (error) {
      console.error('Reply error:', error);
      toast.error("Couldn't post reply");
      throw error;
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleReportThread = async () => {
    const reason = prompt('Please provide a reason for reporting this thread:');
    if (reason) {
      try {
        await reportThreadMutation.mutateAsync({ id: threadId, reason });
        toast.success('Report submitted. Thanks for helping keep our community safe.');
      } catch (error) {
        console.error('Report error:', error);
        toast.error('Failed to submit report');
      }
    }
  };

  const handleUpvoteReply = (replyId: string) => {
    upvoteReplyMutation.mutate({ id: replyId, threadId });
  };

  const handleReportReply = async (replyId: string) => {
    const reason = prompt('Please provide a reason for reporting this reply:');
    if (reason) {
      try {
        await reportReplyMutation.mutateAsync({ id: replyId, reason });
        toast.success('Report submitted. Thanks for helping keep our community safe.');
      } catch (error) {
        console.error('Report error:', error);
        toast.error('Failed to submit report');
      }
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (confirm('Are you sure you want to delete this reply?')) {
      try {
        await deleteReplyMutation.mutateAsync({ id: replyId, threadId });
        toast.success('Reply deleted');
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete reply');
      }
    }
  };

  const handleDeleteThread = async () => {
    if (!confirm('Are you sure you want to delete this thread?')) return;

    try {
      await deleteThreadMutation.mutateAsync({ id: threadId, threadId });
      router.push('/discussion');
    } catch (error) {
      console.error('Delete thread error:', error);
      toast.error('Failed to delete thread');
    }
  };

  const handlePollVote = (optionId: string) => {
    if (!thread?.poll) return;
    voteOnPollMutation.mutate({
      threadId,
      optionId,
      allowMultiple: thread.poll.allowMultiple,
    });
    toast.success('Vote recorded');
  };

  const handlePollClose = () => {
    closePollMutation.mutate(threadId);
    toast.success('Poll closed');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = thread?.title || '';

    switch (platform) {
      case 'copy':
        void navigator.clipboard.writeText(url).then(
          () => toast.success('Link copied to clipboard'),
          () => toast.error("Couldn't copy link"),
        );
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      default:
        break;
    }
  };

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
            currentUserId={currentUserId}
            canDeleteThread={thread.author.clerkUserId === currentUserId}
            onUpvote={handleUpvoteThread}
            onBookmark={handleBookmark}
            onReply={handleReply}
            onReport={handleReportThread}
            onShare={handleShare}
            onDeleteThread={handleDeleteThread}
            onDeleteReply={handleDeleteReply}
            onUpvoteReply={handleUpvoteReply}
            onReportReply={handleReportReply}
            isSubmittingReply={isSubmittingReply}
            onPollVote={handlePollVote}
            onPollClose={handlePollClose}
          />
        ) : null}
      </div>
    </div>
  );
}
