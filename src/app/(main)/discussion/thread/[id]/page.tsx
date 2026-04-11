'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { useAuth, useUser } from '@clerk/nextjs';
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
  useDeleteThread,
  useDeleteReply,
  useUpvoteReply,
  useVoteOnPoll,
  useClosePoll,
  useUpdateThread,
  useUpdateReply,
} from '@/hooks/useDiscussions';
import ThreadEditModal from '@/components/discussions/ThreadEditModal';
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
        {
          "The thread you're looking for doesn't exist or may have been removed."
        }
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

  const { isLoaded: authLoaded } = useAuth();
  const { user } = useUser();
  const currentUserId = user?.id;

  const { data: thread, isLoading: threadLoading, error: threadError } = useThread(threadId);
  const { data: replies = [], isLoading: repliesLoading } = useReplies(threadId);
  /** Avoid empty/error flash before Clerk is ready; public thread fetch runs once loaded (signed out OK). */
  const isLoading = !authLoaded || threadLoading || repliesLoading;

  // Mutations
  const upvoteThreadMutation = useUpvoteThread();
  const bookmarkThreadMutation = useBookmarkThread();
  const createReplyMutation = useCreateReply();
  const deleteThreadMutation = useDeleteThread();
  const deleteReplyMutation = useDeleteReply();
  const upvoteReplyMutation = useUpvoteReply();
  const voteOnPollMutation = useVoteOnPoll();
  const closePollMutation = useClosePoll();
  const updateThreadMutation = useUpdateThread();
  const updateReplyMutation = useUpdateReply();

  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Handlers
  const handleUpvoteThread = () => {
    upvoteThreadMutation.mutate(threadId);
  };

  const handleBookmark = () => {
    bookmarkThreadMutation.mutate(threadId);
  };

  const handleEditThread = async (data: {
    title: string;
    body: string;
    imageIds?: string[];
    pollOptions?: string[];
    allowMultiple?: boolean;
    removePoll?: boolean;
  }) => {
    try {
      await updateThreadMutation.mutateAsync({ id: threadId, data });
      toast.success('Thread updated');
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Update thread error:', error);
      toast.error('Failed to update thread');
      throw error;
    }
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

  const handleUpvoteReply = (replyId: string) => {
    upvoteReplyMutation.mutate({ id: replyId, threadId });
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

  const handleEditReply = async (replyId: string, body: string) => {
    try {
      await updateReplyMutation.mutateAsync({ id: replyId, threadId, body });
      toast.success('Comment updated');
    } catch (error) {
      console.error('Edit reply error:', error);
      toast.error('Failed to update comment');
      throw error;
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
  };

  const handlePollClose = () => {
    closePollMutation.mutate(threadId);
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
          eyebrowIconKey="messageSquare"
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
        eyebrowIconKey="messageSquare"
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
            canEditThread={thread.author.clerkUserId === currentUserId}
            onUpvote={handleUpvoteThread}
            onBookmark={handleBookmark}
            isBookmarked={thread.isBookmarked}
            onReply={handleReply}
            onShare={handleShare}
            onDeleteThread={handleDeleteThread}
            onEditThread={() => setIsEditModalOpen(true)}
            onDeleteReply={handleDeleteReply}
            onEditReply={handleEditReply}
            onUpvoteReply={handleUpvoteReply}
            isSubmittingReply={isSubmittingReply}
            onPollVote={handlePollVote}
            onPollClose={handlePollClose}
            isPollVotePending={voteOnPollMutation.isPending}
          />
        ) : null}

        {/* Edit Modal */}
        {thread && (
          <ThreadEditModal
            thread={thread}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSave={handleEditThread}
            isSaving={updateThreadMutation.isPending}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  );
}
