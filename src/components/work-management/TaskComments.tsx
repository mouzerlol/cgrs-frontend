'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { TaskComment, BoardMember } from '@/types/work-management';
import { cn, formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';
import { Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useAddTaskComment, useUpdateTaskComment, useDeleteTaskComment } from '@/hooks/useTasks';
import { formatTaskMutationError } from '@/lib/api/mutation-errors';
import { DeleteCommentDialog } from './DeleteCommentDialog';

const COMMENT_MAX_LENGTH = 2000;

const commentExitEase = [0.215, 0.61, 0.355, 1] as const;

interface TaskCommentsProps {
  taskId: string;
  comments: TaskComment[];
  readonly?: boolean;
}

export default function TaskComments({ taskId, comments, readonly = false }: TaskCommentsProps) {
  const prefersReducedMotion = useReducedMotion();
  const { user: clerkUser } = useUser();
  const { data: currentUserPayload } = useCurrentUser();
  const myUserId = currentUserPayload?.user.id;

  const addCommentMutation = useAddTaskComment();
  const updateCommentMutation = useUpdateTaskComment();
  const deleteCommentMutation = useDeleteTaskComment();

  const [newComment, setNewComment] = useState('');
  const [composerError, setComposerError] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (editingCommentId && !comments.some((c) => c.id === editingCommentId)) {
      setEditingCommentId(null);
      setEditDraft('');
      setEditError(null);
    }
  }, [comments, editingCommentId]);

  const getAuthorFallback = (authorId: string): BoardMember | undefined => {
    return (mockData.members as BoardMember[]).find((m) => m.id === authorId);
  };

  const currentUserMember = myUserId ? getAuthorFallback(myUserId) : undefined;

  /** Prefer API profile, then mock board member (legacy demos), then Clerk (matches header avatar). */
  const composerAvatarSrc =
    currentUserPayload?.user.avatar_url ?? currentUserMember?.avatar ?? clerkUser?.imageUrl ?? undefined;
  const composerAlt =
    [currentUserPayload?.user.first_name, currentUserPayload?.user.last_name].filter(Boolean).join(' ').trim() ||
    clerkUser?.fullName ||
    clerkUser?.firstName ||
    'You';

  const handleAddComment = () => {
    const trimmed = newComment.trim();
    if (!trimmed || trimmed.length > COMMENT_MAX_LENGTH) return;
    setComposerError(null);
    setNewComment('');

    addCommentMutation.mutate(
      { taskId, content: trimmed },
      {
        onError: (e) => {
          setComposerError(formatTaskMutationError(e));
          setNewComment(trimmed);
        },
      },
    );
  };

  const handleSaveEdit = (commentId: string) => {
    const trimmed = editDraft.trim();
    if (!trimmed || trimmed.length > COMMENT_MAX_LENGTH) return;
    setEditError(null);

    updateCommentMutation.mutate(
      { taskId, commentId, content: trimmed },
      {
        onSuccess: () => {
          setEditingCommentId(null);
          setEditDraft('');
        },
        onError: (e) => {
          setEditError(formatTaskMutationError(e));
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    setDeleteError(null);

    deleteCommentMutation.mutate(
      { taskId, commentId: deleteTargetId },
      {
        onSuccess: () => {
          setDeleteTargetId(null);
        },
        onError: (e) => {
          setDeleteError(formatTaskMutationError(e));
        },
      },
    );
  };

  const composerLen = newComment.length;
  const canSend = newComment.trim().length > 0 && composerLen <= COMMENT_MAX_LENGTH && !addCommentMutation.isPending;

  const commentExitTransition = prefersReducedMotion
    ? { duration: 0.12, ease: commentExitEase }
    : { duration: 0.32, ease: commentExitEase };

  return (
    <div className="space-y-4">
      <DeleteCommentDialog
        isOpen={deleteTargetId !== null}
        onClose={() => {
          if (!deleteCommentMutation.isPending) {
            setDeleteTargetId(null);
            setDeleteError(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        isPending={deleteCommentMutation.isPending}
        error={deleteError}
      />

      {comments.length > 0 ? (
        <AnimatePresence mode="popLayout" initial={false}>
          {comments.map((comment) => {
            const fallback = getAuthorFallback(comment.author_id);
            const authorName = comment.author_name || fallback?.name || 'Unknown User';
            const authorAvatar = comment.author_avatar_url ?? fallback?.avatar;
            const isMine = myUserId !== undefined && comment.author_id === myUserId;
            const isEditing = editingCommentId === comment.id;

            return (
              <motion.div
                key={comment.id}
                initial={false}
                animate={{ opacity: 1 }}
                exit={
                  prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }
                }
                transition={commentExitTransition}
                className="overflow-hidden mb-6 last:mb-0"
              >
                <div className="flex gap-4 group/comment">
                  <Avatar src={authorAvatar} alt={authorName} size="sm" />
                  <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-forest truncate">{authorName}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-medium text-forest/30 uppercase tracking-wider">
                          {formatRelativeDate(comment.created_at)}
                        </span>
                        {isMine && !isEditing && !readonly ? (
                          <div
                            className={cn(
                              'transition-opacity',
                              'opacity-100',
                              'sm:opacity-0 sm:group-hover/comment:opacity-100 sm:group-focus-within/comment:opacity-100',
                            )}
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetId(comment.id);
                                setDeleteError(null);
                              }}
                              className="p-1.5 rounded-none text-forest/50 hover:text-red-700 hover:bg-red-50 transition-colors"
                              aria-label="Delete comment"
                            >
                              <Trash2 className="w-4 h-4" strokeWidth={2} aria-hidden />
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 rounded-none border border-sage/20 bg-white p-3.5 shadow-sm">
                        <textarea
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          maxLength={COMMENT_MAX_LENGTH}
                          autoFocus
                          className="w-full min-h-[100px] text-sm text-forest/80 bg-transparent border border-sage/30 rounded-none p-3 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta/40 resize-y"
                          aria-label="Edit comment"
                        />
                        <div className="flex justify-between items-center gap-2 flex-wrap">
                          <span
                            className={cn(
                              'text-[10px] font-medium',
                              editDraft.length > COMMENT_MAX_LENGTH ? 'text-red-600' : 'text-forest/40',
                            )}
                          >
                            {editDraft.length}/{COMMENT_MAX_LENGTH}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCommentId(null);
                                setEditDraft('');
                                setEditError(null);
                              }}
                              disabled={updateCommentMutation.isPending}
                              className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-none border border-sage/30 text-forest/70 hover:bg-sage-light/30 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={
                                !editDraft.trim() ||
                                editDraft.length > COMMENT_MAX_LENGTH ||
                                updateCommentMutation.isPending
                              }
                              className="text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-none bg-forest text-bone hover:bg-forest-light transition-colors disabled:opacity-40"
                            >
                              {updateCommentMutation.isPending ? 'Saving…' : 'Save'}
                            </button>
                          </div>
                        </div>
                        {editError ? (
                          <p className="text-xs text-red-700" role="alert">
                            {editError}
                          </p>
                        ) : null}
                      </div>
                    ) : isMine && !readonly ? (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditDraft(comment.content);
                          setEditError(null);
                        }}
                        className={cn(
                          'w-full text-left text-sm text-forest/80 bg-white p-3.5 rounded-none border border-sage/20 shadow-sm',
                          'group-hover/comment:border-sage/40 transition-colors whitespace-pre-wrap leading-relaxed',
                          'cursor-text hover:border-sage/50 focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:ring-offset-0',
                        )}
                        aria-label="Edit comment"
                      >
                        {comment.content}
                      </button>
                    ) : (
                      <div className="text-sm text-forest/80 bg-white p-3.5 rounded-none border border-sage/20 shadow-sm group-hover/comment:border-sage/40 transition-colors whitespace-pre-wrap leading-relaxed">
                        {comment.content}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      ) : (
        <div className="py-8 text-center bg-sage-light/20 rounded-none border border-dashed border-sage/30">
          <p className="text-sm text-forest/40 font-medium italic">No comments yet. Start the conversation!</p>
        </div>
      )}

      {!readonly && (
        <div className="flex gap-4 mt-8 pt-6 border-t border-sage/10">
          <Avatar src={composerAvatarSrc} alt={composerAlt} size="sm" />
          <div className="flex-1 relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              maxLength={COMMENT_MAX_LENGTH}
              placeholder="Add a comment…"
              className="w-full bg-white text-sm text-forest/80 rounded-none border border-sage/30 p-4 pb-14 focus:outline-none focus:ring-4 focus:ring-terracotta/5 focus:border-terracotta/30 transition-all resize-none min-h-[110px]"
              aria-label="New comment"
            />
            <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between gap-2">
              <span
                className={cn(
                  'text-[10px] font-medium',
                  composerLen > COMMENT_MAX_LENGTH ? 'text-red-600' : 'text-forest/40',
                )}
              >
                {composerLen}/{COMMENT_MAX_LENGTH}
              </span>
              <button
                type="button"
                onClick={() => handleAddComment()}
                disabled={!canSend}
                className="bg-terracotta text-white text-xs font-bold px-5 py-2 rounded-none shadow-lg shadow-terracotta/20 hover:bg-terracotta/90 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100 disabled:shadow-none"
              >
                {addCommentMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending
                  </span>
                ) : 'Send'}
              </button>
            </div>
            {composerError ? (
              <p className="mt-2 text-xs text-red-700" role="alert">
                {composerError}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
