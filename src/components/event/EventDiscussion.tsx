'use client';

import { useState } from 'react';
import { Thread, Reply, ForumUser } from '@/types';
import ThreadDetail from '@/components/discussions/ThreadDetail';
import ThreadHeader from '@/components/discussions/ThreadHeader';
import ThreadBody from '@/components/discussions/ThreadBody';
import ReplyList from '@/components/discussions/ReplyList';
import ReplyForm from '@/components/discussions/ReplyForm';

interface EventDiscussionProps {
  threadId: string;
  eventTitle: string;
  eventDescription: string;
}

const MOCK_USER: ForumUser = {
  id: 'user-1',
  displayName: 'Guest User',
  title: 'Seedling',
  badges: [],
  stats: {
    upvotesReceived: 0,
    repliesCount: 0,
    threadsCreated: 0,
  },
  createdAt: new Date().toISOString(),
};

const MOCK_THREAD: Thread = {
  id: 'thread-events-1',
  title: 'Summer Barbecue - Discussion',
  body: 'Join the discussion about this upcoming event! Feel free to ask questions, share ideas, or let us know what you\'d like to see at the barbecue.',
  category: 'events',
  author: {
    id: 'committee-1',
    displayName: 'Events Committee',
    title: 'Garden Guardian',
    badges: ['organizer'],
    stats: {
      upvotesReceived: 15,
      repliesCount: 8,
      threadsCreated: 12,
    },
    createdAt: '2024-01-01T00:00:00Z',
  },
  createdAt: '2024-01-10T00:00:00Z',
  upvotes: 5,
  upvotedBy: [],
  replyCount: 2,
  isPinned: true,
  pinnedAt: '2024-01-10T00:00:00Z',
  pinnedBy: 'committee-1',
  bookmarkedBy: [],
  reportedBy: [],
};

const MOCK_REPLIES: Reply[] = [
  {
    id: 'reply-1',
    threadId: 'thread-events-1',
    body: 'Looking forward to this! Should I bring a salad to share?',
    author: {
      id: 'user-2',
      displayName: 'Green Thumb',
      title: 'Budding Gardener',
      badges: [],
      stats: {
        upvotesReceived: 3,
        repliesCount: 5,
        threadsCreated: 2,
      },
      createdAt: '2024-01-05T00:00:00Z',
    },
    createdAt: '2024-01-11T10:00:00Z',
    upvotes: 2,
    upvotedBy: [],
    reportedBy: [],
    depth: 0,
  },
  {
    id: 'reply-2',
    threadId: 'thread-events-1',
    parentReplyId: 'reply-1',
    body: 'That would be wonderful! We\'re also looking for volunteers to help with setup. Let us know if you\'re interested!',
    author: {
      id: 'committee-1',
      displayName: 'Events Committee',
      title: 'Garden Guardian',
      badges: ['organizer'],
      stats: {
        upvotesReceived: 15,
        repliesCount: 8,
        threadsCreated: 12,
      },
      createdAt: '2024-01-01T00:00:00Z',
    },
    createdAt: '2024-01-11T12:00:00Z',
    upvotes: 1,
    upvotedBy: [],
    reportedBy: [],
    depth: 1,
  },
];

export default function EventDiscussion({ threadId, eventTitle, eventDescription }: EventDiscussionProps) {
  const [replies, setReplies] = useState<Reply[]>(MOCK_REPLIES);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = (body: string, parentReplyId?: string) => {
    setIsSubmitting(true);

    setTimeout(() => {
      const newReply: Reply = {
        id: `reply-${Date.now()}`,
        threadId,
        body,
        parentReplyId,
        author: MOCK_USER,
        createdAt: new Date().toISOString(),
        upvotes: 0,
        upvotedBy: [],
        reportedBy: [],
        depth: parentReplyId ? 1 : 0,
      };

      setReplies((prev) => [...prev, newReply]);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <section className="event-discussion">
      <h2 className="event-discussion-title">Discussion</h2>
      <p className="event-discussion-subtitle">
        Share your thoughts, ask questions, or connect with other attendees.
      </p>

      <ThreadDetail
        thread={MOCK_THREAD}
        replies={replies}
        onReply={handleReply}
        isSubmittingReply={isSubmitting}
      />
    </section>
  );
}
