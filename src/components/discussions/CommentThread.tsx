'use client';

import { memo, useState, useCallback, useId } from 'react';
import { cn } from '@/lib/utils';
import type { Reply } from '@/types';
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
  hasMoreSiblingsBelow?: boolean;
  onUpvote?: (replyId: string) => void;
  onReply?: (body: string, parentReplyId?: string) => void;
  onReport?: (replyId: string) => void;
  upvotedReplies?: Set<string>;
}

const CommentThread = memo(function CommentThread({
  node,
  depth = 0,
  hasMoreSiblingsBelow = false,
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
    <article className={cn('relative', depth > 0 && 'mt-3')}>
      {/* Thread Connector from Parent (The Curve) */}
      {depth > 0 && (
        <div 
          className="absolute pointer-events-none border-sage opacity-40"
          style={{
            left: '-28.5px',
            top: '-12px',
            width: '28.5px',
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
          className="absolute pointer-events-none border-sage opacity-40"
          style={{
            left: '-28.5px',
            top: '16px',
            bottom: '-12px',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid',
          }}
        />
      )}

      {/* Parent Comment Row */}
      <div className="flex gap-3">
        {/* Left Column: Avatar + Thread Line to bottom of ReplyCard */}
        <div className="flex flex-col items-center shrink-0 w-8">
          <div className="relative">
            <UserAvatar user={reply.author} size="sm" avatarOnly />
            {hasChildren && (
              <button
                onClick={toggleCollapse}
                className="absolute -bottom-2 -right-2 bg-[#FDFCF9] border border-sage/30 rounded-full w-5 h-5 flex items-center justify-center text-[12px] text-forest/60 hover:text-forest hover:bg-sage/10 transition-colors z-10"
                aria-label={isCollapsed ? 'Expand' : 'Collapse'}
              >
                {isCollapsed ? '+' : '−'}
              </button>
            )}
          </div>
          
          {/* Thread Line connecting down to children container */}
          {!isCollapsed && hasChildren && (
            <div className="w-[1px] grow mt-2 bg-sage opacity-40" />
          )}
        </div>

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0 pb-1">
          {isCollapsed ? (
            <div className="flex items-center gap-2 h-8 cursor-pointer" onClick={toggleCollapse}>
              <span className="font-semibold text-forest text-sm">
                {reply.author.displayName}
              </span>
              <span className="text-[11px] text-forest/40">
                • {totalDescendants} {totalDescendants === 1 ? 'reply' : 'replies'} hidden
              </span>
            </div>
          ) : (
            <ReplyCard
              reply={reply}
              isUpvoted={upvotedReplies.has(reply.id)}
              onUpvote={onUpvote ? () => onUpvote(reply.id) : undefined}
              onReply={onReply}
              onReport={onReport ? () => onReport(reply.id) : undefined}
              showReplyForm
            />
          )}
        </div>
      </div>

      {/* Children Container */}
      {!isCollapsed && hasChildren && (
        <div 
          id={childrenId}
          className="relative flex flex-col ml-[44px]"
          role="group"
          aria-label={`Replies to ${reply.author.displayName}`}
        >
          {children.map((child, index) => (
            <CommentThread
              key={child.reply.id}
              node={child}
              depth={depth + 1}
              hasMoreSiblingsBelow={index < children.length - 1}
              onUpvote={onUpvote}
              onReply={onReply}
              onReport={onReport}
              upvotedReplies={upvotedReplies}
            />
          ))}
        </div>
      )}
      
      {/* "Continue thread" link for max depth */}
      {!isCollapsed && depth >= MAX_RENDER_DEPTH && hasChildren && (
        <button
          type="button"
          className="mt-2 ml-[44px] text-[11px] font-medium text-terracotta hover:text-terracotta-dark transition-colors"
        >
          Continue thread &rarr;
        </button>
      )}
    </article>
  );
});

export default CommentThread;