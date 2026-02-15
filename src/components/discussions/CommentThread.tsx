'use client';

import { memo, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
import ReplyCard from './ReplyCard';

// =============================================================================
// Tree Data Types
// =============================================================================

export interface TreeNode {
  reply: Reply;
  children: TreeNode[];
  descendantCount: number;
}

// Thread line colors matching the design system palette
const THREAD_COLORS = [
  'var(--thread-color-0)', // sage
  'var(--thread-color-1)', // terracotta
  'var(--thread-color-2)', // amber
  'var(--thread-color-3)', // forest-light
  'var(--thread-color-4)', // sage/50
];

function getThreadColor(depth: number): string {
  return THREAD_COLORS[depth % THREAD_COLORS.length];
}

/** Max visual nesting depth — deeper replies render at this level */
const MAX_RENDER_DEPTH = 5;

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
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void;
  onReport?: (replyId: string) => void;
  upvotedReplies?: Set<string>;
}

const CommentThread = memo(function CommentThread({
  node,
  depth = 0,
  onUpvote,
  onReply,
  onReport,
  upvotedReplies = new Set(),
}: CommentThreadProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const childrenId = useId();
  const { reply, children } = node;

  const visualDepth = Math.min(depth, MAX_RENDER_DEPTH);
  const hasChildren = children.length > 0;
  const totalDescendants = node.descendantCount;

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsCollapsed((prev) => !prev);
    }
  }, []);

  return (
    <article
      className={cn(
        'relative thread-indent',
        depth > 0 && 'pl-[var(--thread-indent)]',
        depth > 0 && 'mt-2'
      )}
    >
      {/* Thread line — vertical connector for nested comments */}
      {depth > 0 && (
        <div
          className="thread-line"
          style={{ backgroundColor: getThreadColor(depth - 1) }}
          {...(hasChildren && {
            onClick: toggleCollapse,
            onKeyDown: handleKeyDown,
            role: 'button',
            tabIndex: 0,
            'aria-expanded': !isCollapsed,
            'aria-controls': childrenId,
            'aria-label': `${isCollapsed ? 'Expand' : 'Collapse'} thread by ${reply.author.displayName}`,
          })}
        />
      )}

      {/* Horizontal connector stub */}
      {depth > 0 && (
        <div
          className="thread-connector"
          style={{ backgroundColor: getThreadColor(depth - 1) }}
        />
      )}

      {/* Reply content — generous padding from thread line for clarity */}
      <div className={cn(depth > 0 && 'pl-7 thread-content-pad')}>
        <ReplyCard
          reply={reply}
          isUpvoted={upvotedReplies.has(reply.id)}
          onUpvote={onUpvote ? () => onUpvote(reply.id) : undefined}
          onReply={onReply}
          onReport={onReport ? () => onReport(reply.id) : undefined}
          depth={visualDepth}
          showReplyForm
        />
      </div>

      {/* Children — collapsible */}
      {hasChildren && (
        <>
          <div
            id={childrenId}
            className="thread-children"
            data-collapsed={isCollapsed}
          >
            <div className="thread-children-inner">
              <div
                className="mt-1"
                role="group"
                aria-label={`Replies to ${reply.author.displayName}`}
              >
                {children.map((child) => (
                  <CommentThread
                    key={child.reply.id}
                    node={child}
                    depth={depth + 1}
                    onUpvote={onUpvote}
                    onReply={onReply}
                    onReport={onReport}
                    upvotedReplies={upvotedReplies}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Collapsed indicator pill */}
          {isCollapsed && (
            <button
              type="button"
              onClick={toggleCollapse}
              className="thread-collapsed-pill mt-1.5 ml-7 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium text-forest/60 bg-sage-light rounded-full hover:bg-sage/30 transition-colors"
            >
              <span aria-hidden="true">&#9656;</span>
              {totalDescendants} {totalDescendants === 1 ? 'reply' : 'replies'}{' '}
              hidden
            </button>
          )}
        </>
      )}

      {/* "Continue thread" link for max depth */}
      {depth >= MAX_RENDER_DEPTH && hasChildren && (
        <button
          type="button"
          className="mt-1.5 ml-7 text-[11px] font-medium text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Continue thread &rarr;
        </button>
      )}
    </article>
  );
});

export default CommentThread;
