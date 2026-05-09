'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { useQuery } from '@tanstack/react-query';
import { useAuth, useUser } from '@clerk/nextjs';
import { STALE_TIMES } from '@/lib/cache-config';
import { queryKeys } from '@/lib/query-keys';
import { getPetitionThread, getPetitionReplies } from '@/lib/api/petition';
import { createReply, upvoteReply, deleteReply, updateReply } from '@/lib/api/discussions';
import { toast } from '@/lib/sonner';
import ReplyList from '@/components/discussions/ReplyList';
import ReplyForm from '@/components/discussions/ReplyForm';

export default function PetitionCommentSection() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const currentUserId = user?.id;
  const [upvotedReplies, setUpvotedReplies] = useState<Set<string>>(new Set());

  const { data: thread } = useQuery({
    queryKey: queryKeys.petitionThread,
    queryFn: () => getPetitionThread(getToken),
    enabled: isLoaded,
    staleTime: STALE_TIMES.CONTENT,
  });

  const { data: replies = [], refetch: refetchReplies } = useQuery({
    queryKey: queryKeys.petitionReplies,
    queryFn: () => getPetitionReplies(getToken),
    enabled: isLoaded,
    staleTime: STALE_TIMES.SHORT,
  });

  async function handleReply(body: string, parentReplyId?: string) {
    if (!thread?.id) return;
    await createReply(thread.id, body, getToken, parentReplyId);
    await refetchReplies();
  }

  async function handleUpvote(replyId: string) {
    await upvoteReply(replyId, getToken);
    setUpvotedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(replyId)) {
        next.delete(replyId);
      } else {
        next.add(replyId);
      }
      return next;
    });
    await refetchReplies();
  }

  async function handleDelete(replyId: string) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteReply(replyId, getToken);
      toast.success('Comment deleted');
      await refetchReplies();
    } catch (error) {
      console.error('Delete reply error:', error);
      toast.error('Failed to delete comment');
    }
  }

  async function handleEdit(replyId: string, body: string) {
    try {
      await updateReply(replyId, body, getToken);
      toast.success('Comment updated');
      await refetchReplies();
    } catch (error) {
      console.error('Edit reply error:', error);
      toast.error('Failed to update comment');
      throw error;
    }
  }

  return (
    <section id="comments" className="mt-12 scroll-mt-24">
      <div className="mb-6 bg-sage-light rounded-xl border border-sage/30 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Icon icon="lucide:reply" className="w-5 h-5 text-terracotta" />
          <h3 className="font-semibold text-forest">Post a comment</h3>
        </div>

        {isLoaded && isSignedIn ? (
          <ReplyForm
            onSubmit={(body) => handleReply(body)}
            placeholder="Share your thoughts on this petition…"
            submitLabel="Post comment"
          />
        ) : (
          <div className="space-y-3">
            <Link
              href="/login?redirect_url=/petition"
              className="block w-full p-3 rounded-lg border border-sage bg-white/60 text-forest/50 hover:text-forest hover:bg-white hover:border-terracotta text-sm min-h-[80px] flex items-center transition-colors"
            >
              Log in to share your thoughts on this petition.
            </Link>
            <div className="flex justify-end">
              <Link
                href="/login?redirect_url=/petition"
                className="inline-flex items-center gap-2 bg-terracotta hover:bg-terracotta-dark text-bone font-body text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                <Icon icon="lucide:log-in" className="w-4 h-4" />
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>

      <ReplyList
        replies={replies}
        onUpvote={isSignedIn ? handleUpvote : undefined}
        onReply={isSignedIn ? handleReply : undefined}
        onDelete={isSignedIn ? handleDelete : undefined}
        onEdit={isSignedIn ? handleEdit : undefined}
        upvotedReplies={upvotedReplies}
        currentUserId={currentUserId}
      />
    </section>
  );
}
