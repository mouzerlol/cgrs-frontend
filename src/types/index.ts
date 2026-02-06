export interface CommitteeMember {
  name: string;
  role: string;
  email?: string;
  bio: string;
  image: string;
}

export interface Committee {
  chairperson: CommitteeMember;
  members: CommitteeMember[];
}

export interface NewsArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: 'general' | 'guidelines' | 'events' | 'maintenance' | 'policy';
  image: string;
  featured: boolean;
  author: string;
  readTime?: string;
}

export interface EventOrganizer {
  name: string;
  avatar?: string;
  title: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  description: string;
  fullContent?: string;
  rsvp: boolean;
  featured: boolean;
  image: string;
  eventType: string;
  hasMap: boolean;
  mapDestination?: {
    lat: number;
    lng: number;
    label: string;
  };
  discussionThreadId?: string;
  organizer?: EventOrganizer;
}

export type RsvpStatus = 'attending' | 'maybe' | 'interested';

export interface EventRsvp {
  eventId: string;
  status: RsvpStatus;
  createdAt: string;
}

export interface MiniCalendarEvent {
  slug: string;
  title: string;
  date: string;
  eventType: string;
}

export interface SiteConfig {
  siteName: string;
  domain: string;
  description: string;
  mission: string;
  values: string[];
  contact: {
    email: string;
    chairperson: string;
  };
  socialMedia: {
    facebook: string;
    twitter: string;
    instagram: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Calendar Types
export type CalendarItemType = 'notice' | 'event' | 'news';

export interface CalendarItemAuthor {
  name: string;
  avatar: string;
}

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  title: string;
  description: string;
  date: string; // ISO: YYYY-MM-DD
  time?: string; // e.g., "6:00 PM - 8:00 PM"
  category: string;
  image?: string; // Optional, falls back to category default
  author: CalendarItemAuthor;
  slug?: string; // URL slug for linking to full page
}

export interface DateGrouping {
  date: string;
  items: CalendarItem[];
}

export interface MonthData {
  year: number;
  month: number; // 0-indexed
  firstDayOfWeek: number;
  daysInMonth: number;
  daysInPrevMonth: number;
}

// =============================================================================
// Discussion Forum Types
// =============================================================================

/**
 * Category slugs for organizing discussion threads.
 * These map to the categories defined in forum-categories.json
 */
export type DiscussionCategorySlug =
  | 'announcements'
  | 'parking'
  | 'waste-management'
  | 'questions-help'
  | 'neighborhood-watch'
  | 'general'
  | 'events'
  | 'introductions';

/**
 * Discussion category with metadata for display.
 * Categories group related threads together (like subreddits).
 */
export interface DiscussionCategory {
  slug: DiscussionCategorySlug;
  name: string;
  description: string;
  icon: string; // Iconify icon name (e.g., "lucide:megaphone")
  color: 'terracotta' | 'forest' | 'sage';
  isDefault?: boolean;
  /** Maximum body length in characters (e.g., 300 for introductions) */
  maxBodyLength?: number;
  /** Whether this category has special thread behavior */
  isSpecial?: boolean;
}

/**
 * User statistics for calculating titles and badges.
 */
export interface ForumUserStats {
  upvotesReceived: number;
  repliesCount: number;
  threadsCreated: number;
}

/**
 * Forum user with identity and gamification data.
 * Users are anonymous with display names.
 */
export interface ForumUser {
  id: string;
  displayName: string;
  avatar?: string;
  title: string; // Current garden-themed title
  badges: string[]; // Array of badge IDs
  stats: ForumUserStats;
  createdAt: string; // ISO date
}

/**
 * Garden-themed title earned through contribution.
 * Titles progress based on cumulative stats.
 */
export interface UserTitle {
  id: string;
  name: string; // e.g., "Seedling", "Budding Gardener", "Garden Guardian"
  description: string;
  icon: string; // Garden-themed emoji
  minUpvotes: number;
  minReplies: number;
  minThreads: number;
}

/**
 * Collectible badge earned through specific achievements.
 */
export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon
  rarity: 'common' | 'uncommon' | 'rare';
}

/**
 * Single option in a poll.
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[]; // User IDs who voted for this option
}

/**
 * Poll attached to a thread.
 * Can be single or multiple choice.
 */
export interface Poll {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  isClosed: boolean;
  closedAt?: string; // ISO date
  creatorId: string;
}

/**
 * Image attached to a thread or reply.
 */
export interface ThreadImage {
  id: string;
  url: string;
  thumbnail: string;
  alt?: string;
}

/**
 * Link attached to a thread.
 * Can be internal (to other CGRS pages) or external.
 */
export interface ThreadLink {
  url: string;
  title?: string;
  isInternal: boolean;
}

/**
 * Discussion thread (the main post that starts a conversation).
 * Threads belong to categories and contain replies.
 */
export interface Thread {
  id: string;
  title: string; // Required, max 150 chars
  body?: string; // Optional, max 2000 chars
  category: DiscussionCategorySlug;
  author: ForumUser;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date

  // Optional rich content
  images?: ThreadImage[]; // Max 5
  poll?: Poll;
  links?: ThreadLink[];

  // Engagement metrics
  upvotes: number;
  upvotedBy: string[]; // User IDs
  replyCount: number;

  // Admin features
  isPinned: boolean;
  pinnedAt?: string;
  pinnedBy?: string;

  // User actions
  bookmarkedBy: string[]; // User IDs
  reportedBy: string[]; // User IDs
}

/**
 * Reply to a thread or another reply.
 * Supports 2-level nesting maximum.
 */
export interface Reply {
  id: string;
  threadId: string;
  parentReplyId?: string; // For nested replies
  body: string; // Required, max 2000 chars
  author: ForumUser;
  createdAt: string; // ISO date
  updatedAt?: string; // ISO date

  // Optional rich content
  images?: ThreadImage[];

  // Engagement
  upvotes: number;
  upvotedBy: string[];

  // Reports
  reportedBy: string[];

  // Nesting depth (0 = direct reply to thread, 1 = reply to reply)
  depth: 0 | 1;
}

/**
 * Sort options for thread listings.
 */
export type ThreadSortOption = 'newest' | 'oldest' | 'most-replies' | 'most-upvotes' | 'most-upvoted' | 'most-discussed';

/**
 * Filter options for thread queries.
 */
export interface ThreadFilters {
  category?: DiscussionCategorySlug;
  search?: string;
  sort?: ThreadSortOption;
  pinnedOnly?: boolean;
}

/**
 * Latest reply info for compact thread cards.
 * Used to show who replied most recently without loading all replies.
 */
export interface LatestReply {
  author: {
    id: string;
    displayName: string;
    avatar?: string;
  };
  createdAt: string;
  replyId: string;
}

/**
 * Thread with computed latest reply.
 * Extended type for thread list views that show recent activity.
 */
export interface ThreadWithLatestReply extends Thread {
  latestReply?: LatestReply;
}
