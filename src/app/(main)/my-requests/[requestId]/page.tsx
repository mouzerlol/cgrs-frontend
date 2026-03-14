'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '@/components/sections/PageHeader';
import { addTaskComment } from '@/lib/api/work-tasks';
import { getRequestWithTask, withdrawRequest } from '@/lib/api/management-requests';
import { cn, formatRelativeDate } from '@/lib/utils';

export default function ManagementRequestDetailPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');

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
      if (!query.data) {
        throw new Error('Request data unavailable');
      }
      return await addTaskComment(query.data.task.id, comment.trim(), getToken);
    },
    onSuccess: async () => {
      setComment('');
      await query.refetch();
    },
  });

  const canWithdraw = useMemo(() => query.data?.request.status === 'open', [query.data?.request.status]);

  return (
    <div>
      <PageHeader
        title="Request Detail"
        description="View the request you submitted, the linked task, and the work history."
        eyebrow="Resident Portal"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
      />

      <section className="section bg-bone">
        <div className="container max-w-5xl">
          <div className="mb-6">
            <Link href="/my-requests" className="text-sm font-semibold uppercase tracking-widest text-terracotta">
              Back to My Requests
            </Link>
          </div>

          {!isLoaded || query.isLoading ? (
            <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              Loading request details...
            </div>
          ) : !isSignedIn ? (
            <div className="rounded-card bg-white p-8 text-forest shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              Please sign in to view this request.
            </div>
          ) : query.error || !query.data ? (
            <div className="rounded-card bg-white p-8 text-terracotta shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
              We couldn&apos;t load this request right now.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-terracotta">
                      {query.data.request.category.replace('_', ' ')}
                    </p>
                    <h2 className="font-display text-3xl text-forest">{query.data.task.title}</h2>
                    <p className="text-sm text-forest/70">
                      Submitted {formatRelativeDate(query.data.request.submittedAt)} by {query.data.request.fullName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-sage-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
                      Task {query.data.task.status.replace('_', ' ')}
                    </span>
                    <span className="rounded-full bg-bone px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest">
                      Request {query.data.request.status}
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Contact</h3>
                    <p className="text-sm text-forest">
                      <span className="font-semibold">Full name:</span> {query.data.request.fullName}
                    </p>
                    <p className="text-sm text-forest">
                      <span className="font-semibold">Email:</span> {query.data.request.email}
                    </p>
                    <p className="text-sm text-forest">
                      <span className="font-semibold">Priority:</span> {query.data.task.priority}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Task</h3>
                    <p className="text-sm text-forest">
                      <span className="font-semibold">Reporter:</span> {query.data.task.reporterName || 'System'}
                    </p>
                    <p className="text-sm text-forest">
                      <span className="font-semibold">Assignee:</span> {query.data.task.assigneeName || 'Unassigned'}
                    </p>
                    {query.data.request.closedReason && (
                      <p className="text-sm text-forest">
                        <span className="font-semibold">Closed reason:</span> {query.data.request.closedReason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Description</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-forest/80">
                    {query.data.task.description}
                  </p>
                </div>

                {query.data.task.location && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Location</h3>
                    <p className="text-sm text-forest/80">
                      {query.data.task.location.lat.toFixed(5)}, {query.data.task.location.lng.toFixed(5)}
                    </p>
                  </div>
                )}

                {query.data.task.images.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-terracotta">Images</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {query.data.task.images.map((image) => (
                        <img
                          key={image.id}
                          src={image.thumbnail || image.url}
                          alt={image.alt || query.data.task.title}
                          className="h-40 w-full rounded-xl object-cover"
                        />
                      ))}
                    </div>
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

              <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
                <h3 className="font-display text-2xl text-forest">Comments</h3>
                <div className="mt-4 space-y-4">
                  {query.data.task.comments && query.data.task.comments.length > 0 ? (
                    query.data.task.comments.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-sage/20 bg-bone p-4">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-forest">
                            {item.authorName || 'System'}
                          </span>
                          <span className="text-xs uppercase tracking-wide text-forest/40">
                            {formatRelativeDate(item.createdAt)}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed text-forest/80">{item.content}</p>
                      </div>
                    ))
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

              <div className="rounded-card bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]">
                <h3 className="font-display text-2xl text-forest">Activity</h3>
                <div className="mt-4 space-y-4">
                  {query.data.task.activity && query.data.task.activity.length > 0 ? (
                    query.data.task.activity.map((item) => (
                      <div key={item.id} className="border-l-2 border-sage pl-4">
                        <p className="text-sm text-forest">
                          <span className="font-semibold">{item.actorName}</span> {item.message}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-wide text-forest/40">
                          {formatRelativeDate(item.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-forest/50">No activity recorded yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
