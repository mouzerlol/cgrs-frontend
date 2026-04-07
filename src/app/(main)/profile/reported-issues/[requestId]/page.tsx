'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTaskComment, deleteTaskComment, updateTaskComment } from '@/lib/api/work-tasks';
import { getRequestWithTask, withdrawRequest } from '@/lib/api/management-requests';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTaskMutationError } from '@/lib/api/mutation-errors';
import { cn, formatRelativeDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { DeleteCommentDialog } from '@/components/work-management/DeleteCommentDialog';
import { useTaskAttachmentImages } from '@/hooks/useTaskAttachmentImages';
import ReadonlyTaskImageGallery from '@/components/work-management/ReadonlyTaskImageGallery';

export default function ReportedIssueDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const { data: currentUserPayload } = useCurrentUser();
  const [comment, setComment] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteDialogError, setDeleteDialogError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['management-requests', requestId],
    queryFn: () => getRequestWithTask(requestId, getToken),
    enabled: isSignedIn && typeof requestId === 'string',
  });

  const withdrawMutation = useMutation({
    mutationFn: () => withdrawRequest(requestId, 'Withdrawn by resident', getToken),
    onSuccess: async (result) => {
      queryClient.setQueryData(['management-requests', requestId], result);
      await queryClient.invalidateQueries({ queryKey: ['management-requests', 'mine'] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      if (!query.data) throw new Error('Request data unavailable');
      return await addTaskComment(query.data.task.id, comment.trim(), getToken);
    },
    onSuccess: async () => {
      setComment('');
      await query.refetch();
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, content }: { commentId: string; content: string }) => {
      if (!query.data) throw new Error('Request data unavailable');
      return await updateTaskComment(query.data.task.id, commentId, content.trim(), getToken);
    },
    onSuccess: async () => {
      setEditingCommentId(null);
      setEditDraft('');
      await query.refetch();
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!query.data) throw new Error('Request data unavailable');
      await deleteTaskComment(query.data.task.id, commentId, getToken);
    },
    onSuccess: async () => {
      await query.refetch();
    },
  });

  const handleConfirmDeleteComment = async () => {
    if (!deleteTargetId) return;
    setDeleteDialogError(null);
    try {
      await deleteCommentMutation.mutateAsync(deleteTargetId);
      setDeleteTargetId(null);
    } catch (e) {
      setDeleteDialogError(formatTaskMutationError(e));
    }
  };

  const canWithdraw = query.data?.request.status === 'open';
  const myUserId = currentUserPayload?.user.id;
  const taskImages = query.data?.task.images ?? [];
  const { displayImages, isResolving } = useTaskAttachmentImages(taskImages);

  if (!isLoaded || query.isLoading) {
    return (
      <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        Loading request details...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        Please sign in to view this request.
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="rounded-card bg-white p-8 text-terracotta shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        We couldn&apos;t load this request right now.
      </div>
    );
  }

  const { request, task } = query.data;

  return (
    <div className="space-y-6">
      <DeleteCommentDialog
        isOpen={deleteTargetId !== null}
        onClose={() => {
          if (!deleteCommentMutation.isPending) {
            setDeleteTargetId(null);
            setDeleteDialogError(null);
          }
        }}
        onConfirm={handleConfirmDeleteComment}
        isPending={deleteCommentMutation.isPending}
        error={deleteDialogError}
      />

      <Link
        href="/profile/reported-issues"
        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-terracotta"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Back to Reported Issues
      </Link>

      {/* Request detail card */}
      <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
              {request.category.replace(/_/g, ' ')}
            </p>
            <h2 className="font-display text-3xl text-forest">{task.title}</h2>
            <p className="text-sm text-forest/70">
              Submitted {formatRelativeDate(request.submitted_at)} by {request.full_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              status={task.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
              label={`Task ${task.status.replace(/_/g, ' ')}`}
            />
            <StatusBadge
              status={request.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
              label={`Request ${request.status}`}
            />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Contact</h3>
            <p className="text-sm text-forest">
              <span className="font-semibold">Full name:</span> {request.full_name}
            </p>
            <p className="text-sm text-forest">
              <span className="font-semibold">Email:</span> {request.email}
            </p>
            <p className="text-sm text-forest">
              <span className="font-semibold">Priority:</span> {task.priority}
            </p>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Task</h3>
            <p className="text-sm text-forest">
              <span className="font-semibold">Reporter:</span> {task.reporter_name || 'System'}
            </p>
            <p className="text-sm text-forest">
              <span className="font-semibold">Assignee:</span> {task.assignee_name || 'Unassigned'}
            </p>
            {request.closed_reason && (
              <p className="text-sm text-forest">
                <span className="font-semibold">Closed reason:</span> {request.closed_reason}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Description</h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-forest/80">
            {task.description}
          </p>
        </div>

        {task.location && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Location</h3>
            <p className="text-sm text-forest/80">
              {task.location.lat.toFixed(5)}, {task.location.lng.toFixed(5)}
            </p>
          </div>
        )}

        {task.images.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Images</h3>
            <ReadonlyTaskImageGallery
              displayImages={displayImages}
              isResolving={isResolving}
              titleFallback={task.title}
            />
          </div>
        )}

        {canWithdraw && (
          <div className="mt-6 border-t border-sage-light pt-6">
            <button
              type="button"
              onClick={() => withdrawMutation.mutate()}
              disabled={withdrawMutation.isPending}
              className={cn(
                'inline-flex items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold text-bone',
                'bg-terracotta transition-colors hover:bg-terracotta-dark disabled:cursor-not-allowed disabled:opacity-70'
              )}
            >
              {withdrawMutation.isPending ? 'Withdrawing...' : 'Withdraw Request'}
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        <h3 className="font-display text-2xl text-forest">Comments</h3>
        <div className="mt-4 space-y-4">
          {task.comments && task.comments.length > 0 ? (
            task.comments.map((item) => {
              const isMine = myUserId !== undefined && item.author_id === myUserId;
              const isEditing = editingCommentId === item.id;

              return (
                <div key={item.id} className="rounded-2xl border border-sage/20 bg-bone p-4">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-forest">
                      {item.author_name || 'System'}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs uppercase tracking-wide text-forest/40">
                        {formatRelativeDate(item.created_at)}
                      </span>
                      {isMine && !isEditing && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(item.id);
                              setEditDraft(item.content);
                            }}
                            className="text-xs font-semibold uppercase tracking-wide text-terracotta hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteTargetId(item.id);
                              setDeleteDialogError(null);
                            }}
                            disabled={deleteCommentMutation.isPending}
                            className="text-xs font-semibold uppercase tracking-wide text-forest/50 hover:text-terracotta hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        className="min-h-[100px] w-full rounded-xl border border-sage px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-terracotta"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateCommentMutation.mutate({ commentId: item.id, content: editDraft })}
                          disabled={!editDraft.trim() || updateCommentMutation.isPending}
                          className={cn(
                            'rounded-[10px] px-4 py-2 text-xs font-semibold text-bone',
                            'bg-forest transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-70'
                          )}
                        >
                          {updateCommentMutation.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditDraft('');
                          }}
                          disabled={updateCommentMutation.isPending}
                          className="rounded-[10px] border border-sage px-4 py-2 text-xs font-semibold text-forest hover:bg-sage/10"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-forest/80">{item.content}</p>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-sm text-forest/50">No comments yet.</p>
          )}
        </div>

        <div className="mt-6 space-y-3 border-t border-sage-light pt-6">
          <label htmlFor="task-comment" className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Leave a Comment
          </label>
          <textarea
            id="task-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-sage px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-terracotta"
            placeholder="Add extra context or an update for management."
          />
          <button
            type="button"
            onClick={() => addCommentMutation.mutate()}
            disabled={!comment.trim() || addCommentMutation.isPending}
            className={cn(
              'inline-flex items-center justify-center rounded-[10px] px-5 py-3 text-sm font-semibold text-bone',
              'bg-forest transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-70'
            )}
          >
            {addCommentMutation.isPending ? 'Sending...' : 'Send Comment'}
          </button>
        </div>
      </div>

      {/* Activity */}
      <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
        <h3 className="font-display text-2xl text-forest">Activity</h3>
        <div className="mt-4 space-y-4">
          {task.activity && task.activity.length > 0 ? (
            task.activity.map((item) => (
              <div key={item.id} className="border-l-2 border-sage pl-4">
                <p className="text-sm text-forest">
                  <span className="font-semibold">{item.actor_name}</span> {item.message}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-forest/40">
                  {formatRelativeDate(item.created_at)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-forest/50">No activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
