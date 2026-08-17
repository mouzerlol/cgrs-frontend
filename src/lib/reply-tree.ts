/**
 * Reply tree assembly and ordering — the single place a flat reply list from the API
 * becomes the nested, ordered comment tree a member sees.
 *
 * The server returns replies flat, in `created_at` ascending order, and takes no view on
 * presentation. Ordering is decided here and nowhere else: the API client passes the list
 * through untouched, and `ReplyList` renders whatever this returns.
 */

import { useMemo, useRef } from 'react';
import type { Reply } from '@/types';

export interface TreeNode {
  reply: Reply;
  children: TreeNode[];
  descendantCount: number;
}

/**
 * Upvote counts to rank roots by, keyed by reply id. Frozen for as long as a reader has the
 * thread open (see `useFrozenRootRanks`), so a vote changes the number on a reply without
 * moving the reply. Ids absent from the map fall back to their live count.
 */
export type RootRanks = ReadonlyMap<string, number>;

/** Oldest first. Also the tie-break for the root order, so ordering never depends on input order. */
function byCreatedAtAsc(a: TreeNode, b: TreeNode): number {
  return new Date(a.reply.createdAt).getTime() - new Date(b.reply.createdAt).getTime();
}

/** Roots rank by upvotes, most first, ties settled by age. */
function rootComparator(ranks?: RootRanks) {
  const votes = (node: TreeNode) => ranks?.get(node.reply.id) ?? node.reply.upvotes;
  return (a: TreeNode, b: TreeNode) => {
    const byVotes = votes(b) - votes(a);
    return byVotes !== 0 ? byVotes : byCreatedAtAsc(a, b);
  };
}

/**
 * Build the tree from a flat reply list.
 *
 * Every reply in `replies` ends up in the result exactly once. A reply whose `parentReplyId`
 * resolves to nothing — parent deleted, parent beyond the fetched page, or a parent cycle —
 * is promoted to a root rather than dropped: the reply exists, so it renders, and the
 * "in reply to" chip carries the parentage the indent can no longer show.
 *
 * Pass `rootRanks` to rank roots by a snapshot of their upvote counts rather than their
 * live ones. Without it, roots rank by whatever count the replies currently carry.
 *
 * Pure: the input array is not reordered or otherwise touched.
 */
export function buildReplyTree(replies: Reply[], rootRanks?: RootRanks): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const reply of replies) {
    nodeMap.set(reply.id, { reply, children: [], descendantCount: 0 });
  }

  /* A parent chain that loops back on itself would leave both nodes unreachable from any root,
     which is the disappearing-reply bug this builder exists to not have. Walk up first; if the
     node is its own ancestor, treat it as parentless. */
  const isOwnAncestor = (reply: Reply): boolean => {
    const seen = new Set<string>([reply.id]);
    let cursor = reply.parentReplyId;
    while (cursor) {
      if (seen.has(cursor)) return true;
      seen.add(cursor);
      cursor = nodeMap.get(cursor)?.reply.parentReplyId;
    }
    return false;
  };

  for (const reply of replies) {
    const node = nodeMap.get(reply.id)!;
    const parent = reply.parentReplyId ? nodeMap.get(reply.parentReplyId) : undefined;
    if (parent && !isOwnAncestor(reply)) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  // Depth-first: sort each sibling group and total its descendants in the same pass. Every array
  // sorted here was created above, so nothing the caller owns is mutated.
  function order(node: TreeNode): number {
    node.children.sort(byCreatedAtAsc);
    let count = 0;
    for (const child of node.children) {
      count += 1 + order(child);
    }
    node.descendantCount = count;
    return count;
  }

  roots.forEach(order);
  roots.sort(rootComparator(rootRanks));

  return roots;
}

/**
 * Snapshot the upvote count each reply had when it first appeared, and keep returning that
 * snapshot for as long as the list stays mounted.
 *
 * Root replies are ranked by upvotes, so ranking on the live count means a vote reorders the
 * list under the reader — the row they just clicked leaves the pointer, and a vote cast by
 * someone else shuffles the thread mid-read. Freezing the ranks holds the order still while
 * the thread is open; the new order appears the next time it is loaded.
 *
 * Ids not yet seen are captured at their current count, so a reply posted while the thread is
 * open takes its place immediately rather than waiting for a reload.
 */
export function useFrozenRootRanks(replies: Reply[]): RootRanks {
  const ranksRef = useRef<Map<string, number>>(new Map());

  return useMemo(() => {
    const ranks = ranksRef.current;
    const present = new Set<string>();

    for (const reply of replies) {
      present.add(reply.id);
      if (!ranks.has(reply.id)) ranks.set(reply.id, reply.upvotes);
    }
    // A deleted reply that is later restored should re-enter at its current count, not the
    // one it held in a previous life.
    for (const id of ranks.keys()) {
      if (!present.has(id)) ranks.delete(id);
    }

    return new Map(ranks);
  }, [replies]);
}
