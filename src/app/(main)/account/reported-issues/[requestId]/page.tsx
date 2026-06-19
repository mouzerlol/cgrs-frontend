'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addTaskComment, deleteTaskComment, updateTaskComment } from '@/lib/api/work-tasks';
import { getRequestWithTask, withdrawRequest } from '@/lib/api/management-requests';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { formatTaskMutationError } from '@/lib/api/mutation-errors';
import { cn, formatRelativeDate } from '@/lib/utils';
import { toast } from '@/lib/sonner';
import { categoryLabel } from '@/lib/reported-issue-display';
import StatusBadge from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { DeleteCommentDialog } from '@/components/work-management/DeleteCommentDialog';
import ConfirmActionModal from '@/components/work-management/ConfirmActionModal';
import { useTaskAttachmentImages } from '@/hooks/useTaskAttachmentImages';
import ReadonlyTaskImageGallery from '@/components/work-management/ReadonlyTaskImageGallery';

const eyebrow = 'text-xs font-semibold uppercase tracking-widest text-forest/40';

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
  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

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
    onError: (e) => toast.error(formatTaskMutationError(e)),
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
    onError: (e) => toast.error(formatTaskMutationError(e)),
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

  const handleConfirmWithdraw = async () => {
    setWithdrawError(null);
    try {
      await withdrawMutation.mutateAsync();
      toast.success('Request withdrawn');
      setWithdrawConfirmOpen(false);
    } catch (e) {
      const message = formatTaskMutationError(e);
      setWithdrawError(message);
      toast.error(message);
      throw e; // keep the confirm dialog open so the error stays visible
    }
  };

  const canWithdraw = query.data?.request.status === 'open';
  const myUserId = currentUserPayload?.user.id;
  const taskImages = query.data?.task.images ?? [];
  const { displayImages, isResolving } = useTaskAttachmentImages(taskImages);

  if (!isLoaded || query.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-40" />
        <div className="space-y-4 rounded-none border border-sage/20 bg-white p-6">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-7 w-48 rounded-full" />
          <div className="grid gap-6 pt-4 md:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="rounded-none border border-sage/20 bg-white p-8 text-forest">
        Please sign in to view this request.
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="rounded-none border border-terracotta/20 bg-terracotta/5 p-8 text-forest">
        We couldn&apos;t load this request right now. Please try again shortly.
      </div>
    );
  }

  const { request, task } = query.data;

  return (
    <div className="space-y-5">
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

      <ConfirmActionModal
        isOpen={withdrawConfirmOpen}
        onClose={() => {
          if (!withdrawMutation.isPending) {
            setWithdrawConfirmOpen(false);
            setWithdrawError(null);
          }
        }}
        title="Withdraw this request?"
        message={
          <>
            Withdrawing tells the society you no longer need this looked at. You can&apos;t undo it.
            {withdrawError ? (
              <span className="mt-3 block rounded-lg bg-terracotta/10 px-3 py-2 text-terracotta" role="alert">
                {withdrawError}
              </span>
            ) : null}
          </>
        }
        confirmLabel="Withdraw request"
        intent="danger"
        onConfirm={handleConfirmWithdraw}
      />

      <Link
        href="/account/reported-issues"
        className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-forest/60 transition-colors hover:text-forest"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
        Back to reported issues
      </Link>

      {/* Request detail: the hero. Status is promoted directly under the title. */}
      <div className="rounded-none border border-sage/20 bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
          {categoryLabel(request.category)}
        </p>
        <h2 className="mt-2 font-display text-3xl text-forest">{task.title}</h2>
        <p className="mt-2 text-sm text-forest/70">
          Submitted {formatRelativeDate(request.submitted_at)} by {request.full_name}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <StatusBadge
            status={request.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
            label={`Request ${request.status.replace(/_/g, ' ')}`}
            surface="community"
          />
          <StatusBadge
            status={task.status as 'open' | 'in_progress' | 'closed' | 'withdrawn'}
            label={`Task ${task.status.replace(/_/g, ' ')}`}
            surface="community"
          />
        </div>

        <div className="mt-6 grid gap-6 rounded-none bg-bone-light p-5 md:grid-cols-2">
          <div className="space-y-2">
            <h3 className={eyebrow}>Contact</h3>
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
          <div className="space-y-2">
            <h3 className={eyebrow}>Task</h3>
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

        <div className="mt-6 space-y-2">
          <h3 className={eyebrow}>Description</h3>
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-forest/80">
            {task.description}
          </p>
        </div>

        {task.location && (
          <div className="mt-6 space-y-2">
            <h3 className={eyebrow}>Location</h3>
            <p className="flex items-center gap-1.5 text-sm text-forest/80">
              <MapPin className="h-4 w-4 shrink-0 text-forest/40" aria-hidden />
              {task.location.label
                ? task.location.label
                : `Pinned at ${task.location.lat.toFixed(5)}, ${task.location.lng.toFixed(5)}`}
            </p>
          </div>
        )}

        {task.images.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className={eyebrow}>Images</h3>
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
              onClick={() => {
                setWithdrawError(null);
                setWithdrawConfirmOpen(true);
              }}
              className={cn(
                'inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold',
                'border border-terracotta text-terracotta transition-colors hover:bg-terracotta hover:text-bone',
              )}
            >
              Withdraw request
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div className="rounded-none border border-sage/20 bg-white p-6">
        <h3 className="font-display text-2xl text-forest">Comments</h3>
        <div className="mt-4 space-y-4">
          {task.comments && task.comments.length > 0 ? (
            task.comments.map((item) => {
              const isMine = myUserId !== undefined && item.author_id === myUserId;
              const isEditing = editingCommentId === item.id;

              return (
                <div key={item.id} className="rounded-none border border-sage/20 bg-bone p-4">
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
                            className="min-h-[44px] px-1 text-xs font-semibold uppercase tracking-wide text-forest/60 hover:text-forest hover:underline"
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
                            className="min-h-[44px] px-1 text-xs font-semibold uppercase tracking-wide text-forest/50 hover:text-terracotta hover:underline disabled:opacity-50"
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
                        className="min-h-[100px] w-full rounded-lg border border-sage px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-terracotta"
                      />
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateCommentMutation.mutate({ commentId: item.id, content: editDraft })}
                          disabled={!editDraft.trim() || updateCommentMutation.isPending}
                          className={cn(
                            'min-h-[44px] rounded-lg px-4 py-2 text-xs font-semibold text-bone',
                            'bg-forest transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-70',
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
                          className="min-h-[44px] rounded-lg border border-sage px-4 py-2 text-xs font-semibold text-forest hover:bg-sage/10"
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
          <label htmlFor="task-comment" className={eyebrow}>
            Leave a comment
          </label>
          <textarea
            id="task-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            className="min-h-[120px] w-full rounded-lg border border-sage px-4 py-3 text-sm text-forest outline-none transition-colors focus:border-terracotta"
            placeholder="Add extra context or an update for management."
          />
          <button
            type="button"
            onClick={() => addCommentMutation.mutate()}
            disabled={!comment.trim() || addCommentMutation.isPending}
            className={cn(
              'inline-flex min-h-[44px] items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold text-bone',
              'bg-forest transition-colors hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-70',
            )}
          >
            {addCommentMutation.isPending ? 'Sending…' : 'Send comment'}
          </button>
        </div>
      </div>

      {/* Activity: quieter than the cards above (timeline dots, not a side-stripe). */}
      <div className="rounded-none border border-sage/20 bg-bone-light p-6">
        <h3 className="font-display text-2xl text-forest">Activity</h3>
        <div className="mt-4 space-y-4">
          {task.activity && task.activity.length > 0 ? (
            task.activity.map((item) => (
              <div key={item.id} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sage" aria-hidden />
                <div>
                  <p className="text-sm text-forest">
                    <span className="font-semibold">{item.actor_name}</span> {item.message}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-forest/40">
                    {formatRelativeDate(item.created_at)}
                  </p>
                </div>
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
