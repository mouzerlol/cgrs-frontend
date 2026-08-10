'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useAuth, useUser } from '@clerk/nextjs';
import { toast } from '@/lib/sonner';
import { cn } from '@/lib/utils';
import { PageBreadcrumbBar } from '@/components/ui/breadcrumb';
import ThreadDetail from '@/components/discussions/ThreadDetail';
import ThreadBackdrop from '@/components/discussions/ThreadBackdrop';
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

/**
 * Mirrors the real card: title block, author row, body, toolbar, then two replies.
 * A skeleton with different proportions to the content it stands in for just
 * trades a blank screen for a layout shift.
 */
function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      <ThreadBackdrop>
      <div className="rounded-none border border-sage/30 bg-white px-5 pt-6 pb-4 shadow-[0_16px_40px_rgba(26,34,24,0.14)] sm:px-8 sm:pt-8 md:px-10 md:pt-10 md:pb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="h-8 w-3/5 rounded bg-sage/30" />
          <div className="h-7 w-24 shrink-0 rounded-full bg-sage/30" />
        </div>
        <div className="mt-5 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-sage/30" />
          <div className="h-4 w-40 rounded bg-sage/30" />
        </div>
        <div className="mt-6 space-y-2.5">
          <div className="h-4 w-full rounded bg-sage/30" />
          <div className="h-4 w-full rounded bg-sage/30" />
          <div className="h-4 w-4/5 rounded bg-sage/30" />
        </div>
        <div className="mt-6 flex items-center gap-2 border-t border-sage/25 pt-3">
          <div className="h-9 w-16 rounded-md bg-sage/30" />
          <div className="h-9 w-28 rounded-md bg-sage/30" />
          <div className="ml-auto h-9 w-24 rounded bg-sage/30" />
        </div>
      </div>
      </ThreadBackdrop>

      <div className="container mx-auto max-w-4xl space-y-3 px-4 py-8">
        <div className="h-24 rounded-md bg-sage/25" />
        <div className="ml-11 h-24 rounded-md bg-sage/25" />
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-card border border-sage/30 bg-white px-6 py-12 text-center shadow-[0_16px_40px_rgba(26,34,24,0.14)] md:px-10">
      <span
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-forest/[0.07] text-forest"
        aria-hidden
      >
        <Icon icon="lucide:message-square-off" className="h-6 w-6" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-semibold text-forest">
        Thread not found
      </h1>
      <p className="mx-auto mt-2 max-w-md text-forest/60">
        {"The thread you're looking for doesn't exist or may have been removed."}
      </p>
      <Link
        href="/discussion"
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-terracotta hover:text-terracotta-dark transition-colors"
      >
        <Icon icon="lucide:arrow-left" className="w-4 h-4" aria-hidden />
        Back to discussions
      </Link>
    </div>
  );
}

/**
 * Thread detail page - displays a single thread with all its replies.
 * URL: /discussion/thread/[id]
 *
 * No page hero: the thread's own title is the page heading, so the page clears the
 * fixed site chrome itself and mounts the card on the discussion photograph via
 * ThreadBackdrop.
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

  /* 401/403 never reaches here: middleware gates /discussion/thread, so a signed-out
     visitor is sent to sign-in with a return URL before the page renders. */
  const isMissing = !isLoading && (!thread || threadError);

  return (
    /* SiteChromeBar (header + beta banner) is fixed, so page content starts under it.
       The clearance lives in PageBreadcrumbBar below, which is the first thing on the
       page — the blog article does the same, so both clear the chrome identically. */
    <div className="min-h-screen bg-bone">
      {/* Breadcrumbs sit above the photograph on plain bone, so the trail keeps its
          contrast instead of handing it to whatever the image happens to be.
          The blog article mounts the same component, so both bands are one height
          and their labels one size. */}
      <PageBreadcrumbBar />

      {/* No page hero on a thread: the thread's own title is the page heading, and a
          repeated "Community Discussion" band cost a screenful on every thread. The
          section image survives as the mount the thread card sits on. */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isMissing ? (
        <ThreadBackdrop>
          <NotFound />
        </ThreadBackdrop>
      ) : thread ? (
        <ThreadDetail
            mountOnBackdrop
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
  );
}
