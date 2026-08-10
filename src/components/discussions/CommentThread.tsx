'use client';

import { memo, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import type { ForumUser, Reply } from '@/types';
import ReplyCard from './ReplyCard';
import UserAvatar from './UserAvatar';

// =============================================================================
// Tree Data Types
// =============================================================================

export interface TreeNode {
  reply: Reply;
  children: TreeNode[];
  descendantCount: number;
}

/** Max visual nesting depth on desktop — deeper replies render at this level */
const MAX_RENDER_DEPTH = 5;

/**
 * Mobile indents exactly one level. Even 32px gutters eat a 375px screen fast, so
 * past the first step the tree goes flat and the "in reply to" chip carries the
 * parentage instead. Handled in CSS (`max-sm:`) rather than a JS breakpoint so
 * there is no hydration mismatch and no resize listener.
 */
const MOBILE_MAX_INDENT_DEPTH = 1;

// =============================================================================
// Tree Builder — converts flat reply list into tree nodes
// =============================================================================

export function buildReplyTree(replies: Reply[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  // Create nodes for all replies
  for (const reply of replies) {
    nodeMap.set(reply.id, { reply, children: [], descendantCount: 0 });
  }

  // Build parent-child relationships
  for (const reply of replies) {
    const node = nodeMap.get(reply.id)!;
    if (reply.parentReplyId) {
      const parent = nodeMap.get(reply.parentReplyId);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  // Compute descendant counts bottom-up
  function computeDescendants(node: TreeNode): number {
    let count = 0;
    for (const child of node.children) {
      count += 1 + computeDescendants(child);
    }
    node.descendantCount = count;
    return count;
  }
  roots.forEach(computeDescendants);

  return roots;
}

// =============================================================================
// CommentThread Component
// =============================================================================

interface CommentThreadProps {
  node: TreeNode;
  depth?: number;
  /** Author of the reply this one answers. Feeds the "in reply to" chip. */
  parentAuthor?: ForumUser;
  hasMoreSiblingsBelow?: boolean;
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void | Promise<void>;
  onDelete?: (replyId: string) => void;
  onEdit?: (replyId: string, body: string) => void | Promise<void>;
  upvotedReplies?: Set<string>;
  currentUserId?: string;
}

const CommentThread = memo(function CommentThread({
  node,
  depth = 0,
  parentAuthor,
  hasMoreSiblingsBelow = false,
  onUpvote,
  onReply,
  onDelete,
  onEdit,
  upvotedReplies = new Set(),
  currentUserId,
}: CommentThreadProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const childrenId = useId();
  const { reply, children } = node;

  const hasChildren = children.length > 0;
  const totalDescendants = node.descendantCount;
  const isAuthor = Boolean(currentUserId && reply.author.clerkUserId === currentUserId);

  /** This node's own children stop being indented on mobile past the cap. */
  const flattensChildrenOnMobile = depth >= MOBILE_MAX_INDENT_DEPTH;
  /** This node itself sits in a flattened run, so its connector would point at nothing. */
  const isFlattenedOnMobile = depth > MOBILE_MAX_INDENT_DEPTH;
  /** Same, on every size: past the desktop cap the tree stops indenting entirely. */
  const isFlattenedOnDesktop = depth > MAX_RENDER_DEPTH;

  /* "In reply to" is the fallback for parentage, not a restatement of it — the indent
     and connector already say it wherever they exist. So the chip renders only where
     this node is flat against its parent, and below sm only when that flattening is
     mobile-only. */
  const parentChip = isFlattenedOnMobile ? parentAuthor : undefined;

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // `--thread-indent` drives both the child offset and the connector geometry, so the
  // curve stays aligned at any indent. Tighter on mobile (32px) to spare nested width,
  // back to 44px (avatar gutter + gap) from sm+. `16px` is the avatar half-width the
  // connector reaches back to.
  return (
    <article
      className={cn('relative [--thread-indent:32px] sm:[--thread-indent:44px]', depth > 0 && 'mt-1')}
    >
      {/* Thread Connector from Parent (The Curve) */}
      {depth > 0 && (
        <div
          className={cn(
            'absolute pointer-events-none border-sage opacity-40',
            isFlattenedOnMobile && 'max-sm:hidden',
          )}
          style={{
            left: 'calc((var(--thread-indent) - 16px) * -1)',
            top: '-4px',
            width: 'calc(var(--thread-indent) - 16px)',
            height: '28px',
            borderBottomLeftRadius: '20px',
            borderBottomWidth: '1px',
            borderBottomStyle: 'solid',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid',
          }}
        />
      )}

      {/* Continuation Line to next sibling */}
      {depth > 0 && hasMoreSiblingsBelow && (
        <div
          className={cn(
            'absolute pointer-events-none border-sage opacity-40',
            isFlattenedOnMobile && 'max-sm:hidden',
          )}
          style={{
            left: 'calc((var(--thread-indent) - 16px) * -1)',
            top: '16px',
            bottom: '-4px',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid',
          }}
        />
      )}

      {/* Parent row: avatar + ReplyCard — card chrome lives only on ReplyCard */}
      <div className="flex gap-3">
        {/* Left Column: Avatar + Thread Line to bottom of ReplyCard */}
        <div className="flex flex-col items-center shrink-0 w-8">
          <div className="relative">
            <UserAvatar user={reply.author} size="sm" avatarOnly />
            {hasChildren && (
              <button
                type="button"
                onClick={toggleCollapse}
                className="absolute left-[16px] top-[20px] bg-bone-light border border-forest/45 rounded-full w-7 h-7 flex items-center justify-center text-sm font-medium text-forest/90 hover:text-forest hover:bg-sage/10 transition-colors z-10"
                aria-label={
                  isCollapsed
                    ? `Expand ${totalDescendants} ${totalDescendants === 1 ? 'reply' : 'replies'} to ${reply.author.displayName}`
                    : `Collapse replies to ${reply.author.displayName}`
                }
                aria-expanded={!isCollapsed}
                aria-controls={childrenId}
              >
                {isCollapsed ? '+' : '−'}
              </button>
            )}
          </div>

          {/* Thread Line connecting down to children container. Hidden on mobile once
              the children below stop being indented — it would run down to nothing. */}
          {!isCollapsed && hasChildren && (
            <div
              className={cn(
                'w-[1px] grow mt-2 bg-sage opacity-40',
                flattensChildrenOnMobile && 'max-sm:hidden',
              )}
            />
          )}
        </div>

        {/* Right Column: Content */}
        <div className="min-w-0 flex-1">
          {isCollapsed ? (
            <button
              type="button"
              className="flex h-8 items-center gap-2 text-left"
              onClick={toggleCollapse}
              aria-expanded={false}
              aria-controls={childrenId}
            >
              <span className="font-semibold text-forest text-sm">
                {reply.author.displayName}
              </span>
              <span className="text-xs text-forest/40">
                • {totalDescendants} {totalDescendants === 1 ? 'reply' : 'replies'} hidden
              </span>
            </button>
          ) : (
            <ReplyCard
              reply={reply}
              parentAuthor={parentChip}
              parentChipMobileOnly={!isFlattenedOnDesktop}
              isUpvoted={upvotedReplies.has(reply.id)}
              onUpvote={onUpvote ? () => onUpvote(reply.id) : undefined}
              onReply={onReply}
              onDelete={onDelete ? () => onDelete(reply.id) : undefined}
              onEdit={onEdit ? (body: string) => onEdit(reply.id, body) : undefined}
              showReplyForm
              isAuthor={isAuthor}
            />
          )}
        </div>
      </div>

      {/* Children Container */}
      {!isCollapsed && hasChildren && (
        <div
          id={childrenId}
          className={cn(
            'relative flex flex-col',
            // Past the desktop cap the tree goes flat on every size; past the mobile
            // cap it goes flat only below sm. The "in reply to" chip on each child
            // carries the parentage the indent stopped showing.
            depth >= MAX_RENDER_DEPTH
              ? 'ml-0'
              : flattensChildrenOnMobile
                ? 'ml-[var(--thread-indent)] max-sm:ml-0'
                : 'ml-[var(--thread-indent)]',
          )}
          role="group"
          aria-label={`Replies to ${reply.author.displayName}`}
        >
          {children.map((child, index) => (
            <CommentThread
              key={child.reply.id}
              node={child}
              depth={depth + 1}
              parentAuthor={reply.author}
              hasMoreSiblingsBelow={index < children.length - 1}
              onUpvote={onUpvote}
              onReply={onReply}
              onDelete={onDelete}
              onEdit={onEdit}
              upvotedReplies={upvotedReplies}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </article>
  );
});

export default CommentThread;
