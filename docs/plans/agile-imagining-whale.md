# CGRS Community Forum Implementation Plan

## Overview
Reddit-inspired community discussion forum for Coronation Gardens Residents Society. Anonymous users with display names can create threads, reply (2-level nesting max), upvote, bookmark, share, and report content.

## Routes
- `/discussions` - Landing page with category cards + thread list
- `/discussions/[category]` - Category-filtered thread list
- `/discussions/thread/[id]` - Single thread with replies
- `/discussions/new` - Create new thread form

---

## Phase 1: Data Foundation

### 1.1 TypeScript Types (`src/types/index.ts`)

```typescript
// Categories
export type DiscussionCategorySlug =
  | 'announcements' | 'parking' | 'waste-management'
  | 'questions-help' | 'neighborhood-watch' | 'general';

export interface DiscussionCategory {
  slug: DiscussionCategorySlug;
  name: string;
  description: string;
  icon: string;
  color: 'terracotta' | 'forest' | 'sage';
  isDefault?: boolean;
}

// Users & Gamification
export interface ForumUser {
  id: string;
  displayName: string;
  avatar?: string;
  title: string;
  badges: string[];
  stats: { upvotesReceived: number; repliesCount: number; threadsCreated: number };
}

export interface UserTitle {
  id: string;
  name: string;  // "Seedling", "Budding Gardener", "Garden Guardian"
  icon: string;  // Garden-themed emoji
  minUpvotes: number;
  minReplies: number;
  minThreads: number;
}

export interface UserBadge {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'uncommon' | 'rare';
}

// Polls
export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export interface Poll {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  isClosed: boolean;
  creatorId: string;
}

// Threads & Replies
export interface Thread {
  id: string;
  title: string;           // Max 150 chars, required
  body?: string;           // Max 2000 chars
  category: DiscussionCategorySlug;
  author: ForumUser;
  createdAt: string;
  images?: { id: string; url: string; thumbnail: string }[];  // Max 5
  poll?: Poll;
  links?: { url: string; title?: string; isInternal: boolean }[];
  upvotes: number;
  upvotedBy: string[];
  replyCount: number;
  isPinned: boolean;
  bookmarkedBy: string[];
  reportedBy: string[];
}

export interface Reply {
  id: string;
  threadId: string;
  parentReplyId?: string;  // For nesting (max 2 levels)
  body: string;            // Max 2000 chars
  author: ForumUser;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  depth: 0 | 1;
}

export type ThreadSortOption = 'newest' | 'most-upvoted' | 'most-discussed';
```

### 1.2 Data Files

**`src/data/discussions.json`**
```json
{
  "threads": [...],
  "replies": [...]
}
```

**`src/data/forum-categories.json`**
```json
{
  "categories": [
    { "slug": "announcements", "name": "Announcements", "icon": "lucide:megaphone", "color": "terracotta" },
    { "slug": "parking", "name": "Parking", "icon": "lucide:car", "color": "forest" },
    { "slug": "waste-management", "name": "Waste Management", "icon": "lucide:recycle", "color": "sage" },
    { "slug": "questions-help", "name": "Questions & Help", "icon": "lucide:help-circle", "color": "terracotta" },
    { "slug": "neighborhood-watch", "name": "Neighborhood Watch", "icon": "lucide:eye", "color": "forest" },
    { "slug": "general", "name": "General Discussion", "icon": "lucide:message-circle", "color": "sage", "isDefault": true }
  ]
}
```

**`src/data/user-titles.json`** (Garden-themed progression)
```json
{
  "titles": [
    { "id": "seedling", "name": "Seedling", "icon": "🌱", "minUpvotes": 0, "minReplies": 0, "minThreads": 0 },
    { "id": "budding-gardener", "name": "Budding Gardener", "icon": "🌿", "minUpvotes": 5, "minReplies": 3, "minThreads": 1 },
    { "id": "garden-enthusiast", "name": "Garden Enthusiast", "icon": "🌻", "minUpvotes": 20, "minReplies": 10, "minThreads": 3 },
    { "id": "master-cultivator", "name": "Master Cultivator", "icon": "🌳", "minUpvotes": 50, "minReplies": 25, "minThreads": 10 },
    { "id": "garden-guardian", "name": "Garden Guardian", "icon": "🏆", "minUpvotes": 100, "minReplies": 50, "minThreads": 25 }
  ],
  "badges": [
    { "id": "early-bird", "name": "Early Bird", "icon": "🐦", "rarity": "rare" },
    { "id": "helpful-neighbor", "name": "Helpful Neighbor", "icon": "🤝", "rarity": "uncommon" },
    { "id": "founding-member", "name": "Founding Member", "icon": "⭐", "rarity": "rare" },
    { "id": "committee", "name": "Committee Member", "icon": "🏛️", "rarity": "rare" }
  ]
}
```

### 1.3 API Layer (`src/lib/api/discussions.ts`)
Follow pattern from `src/lib/api/news.ts`:
- `getCategories()`, `getCategory(slug)`
- `getThreads(options)` - filter by category, search, sort; paginate
- `getThread(id)`, `getPinnedThreads(category?)`
- `getRepliesForThread(threadId)` - sorted with nesting
- `getUserTitles()`, `getUserBadges()`, `calculateUserTitle(stats)`
- `getCategoryStats()` - thread/reply counts per category

### 1.4 React Query Hooks (`src/hooks/useDiscussions.ts`)
- `useThreads(options)`, `useThread(id)`, `usePinnedThreads(category?)`
- `useReplies(threadId)`
- `useCategories()`, `useCategory(slug)`, `useCategoryStats()`
- `useUserTitles()`, `useUserBadges()`

---

## Phase 2: Core Components

### Component Structure
```
src/components/discussions/
├── CategoryBadge.tsx       # Small category tag
├── CategoryCard.tsx        # Category preview with stats
├── CategoryList.tsx        # Grid of category cards
├── UserAvatar.tsx          # Avatar + name + title + badges
├── UpvoteButton.tsx        # Upvote with count
├── BookmarkButton.tsx      # Bookmark toggle
├── ShareDropdown.tsx       # Headless UI Menu with "Copy link"
├── ReportButton.tsx        # Report with toast confirmation
├── ThreadCard.tsx          # Card view (default)
├── ThreadCardCompact.tsx   # Compact row view
├── ThreadList.tsx          # List wrapper
├── SearchBar.tsx           # Thread search input
├── SortDropdown.tsx        # Sort by dropdown
├── ViewToggle.tsx          # Card/Compact toggle
└── skeletons/
    └── ThreadCardSkeleton.tsx
```

### Key Component Props
```typescript
// ThreadCard
interface ThreadCardProps {
  thread: Thread;
  onUpvote?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  hasUpvoted?: boolean;
}

// CategoryCard
interface CategoryCardProps {
  category: DiscussionCategory;
  stats?: { threadCount: number; replyCount: number };
}
```

---

## Phase 3: Landing Page (`/discussions`)

### `src/app/discussions/page.tsx`
```typescript
'use client';
import PageHeader from '@/components/sections/PageHeader';
import { DiscussionsLanding } from '@/components/discussions';

export default function DiscussionsPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Community Discussion"
        description="Connect with your neighbors"
        eyebrow="Forum"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <DiscussionsLanding />
    </div>
  );
}
```

### `DiscussionsLanding.tsx` Features
- Category cards grid (6 categories)
- Search bar + Sort dropdown + View toggle
- Thread list (card view default, compact toggle)
- Pinned threads at top
- Fade-up animations via `useIntersectionObserver`

---

## Phase 4: Thread Detail & Replies

### Components
```
├── ThreadDetail.tsx        # Full thread view
├── ThreadHeader.tsx        # Title, author, meta, category
├── ThreadBody.tsx          # Content, images, poll, links
├── ThreadActions.tsx       # Upvote, bookmark, share, report
├── ReplyCard.tsx           # Single reply
├── ReplyList.tsx           # Nested replies (max 2 levels)
├── ReplyForm.tsx           # Reply input
├── ImageGallery.tsx        # Inline thumbnails
├── ImageLightbox.tsx       # Expanded image modal
├── PollDisplay.tsx         # Poll voting/results
└── PinIndicator.tsx        # Pinned badge
```

### `src/app/discussions/thread/[id]/page.tsx`
- Load thread via `useThread(id)`
- Load replies via `useReplies(threadId)`
- Display nested replies (depth 0 = direct, depth 1 = nested)

---

## Phase 5: Category Pages

### `src/app/discussions/[category]/page.tsx`
- Filter threads by category slug
- Reuse `DiscussionsContent` component
- Category-specific PageHeader

---

## Phase 6: Thread Creation

### `src/app/discussions/new/page.tsx`

### Form Components
```
├── ThreadForm/
│   ├── ThreadForm.tsx      # Main container
│   ├── TitleInput.tsx      # 150 char limit + counter
│   ├── BodyInput.tsx       # 2000 char limit + markdown?
│   ├── CategorySelect.tsx  # Headless UI Listbox
│   ├── ImageUploader.tsx   # Max 5, drag-drop, thumbnails
│   ├── LinkInput.tsx       # URL input
│   └── PollBuilder.tsx     # Add poll options
```

### Validation
- Title: required, max 150 chars
- Body: optional, max 2000 chars
- Category: defaults to "general"
- Images: max 5
- Poll: optional, single/multiple choice

---

## Phase 7: Poll System

### `PollBuilder.tsx` (in thread form)
- Add/remove options
- Toggle single vs multiple choice

### `PollDisplay.tsx` (in thread view)
- Show options with vote counts
- Show who voted (list of display names)
- Creator can close poll
- Results visible after voting

---

## Phase 8: Mobile Optimization

### Mobile Components
```
├── mobile/
│   ├── BottomSheet.tsx         # Headless UI Dialog
│   ├── SwipeableThreadCard.tsx # Touch gestures
│   └── MobileNav.tsx           # Category navigation
```

### Requirements
- Touch targets: min 44px
- Swipe gestures for thread actions
- Bottom sheet for action menu
- Card view default (better touch targets)

---

## Phase 9: Polish & Interactions

### Final Components
- `ShareDropdown.tsx` - Copy link with toast
- `ReportButton.tsx` - Report confirmation toast
- Animations: fade-up via intersection observer
- CSS additions to `globals.css`

---

## CSS Classes to Add (`globals.css`)

Key classes needed:
- `.thread-card`, `.thread-card-compact`, `.thread-card-pinned`
- `.category-badge`, `.category-card`
- `.upvote-button`, `.upvote-button-active`
- `.user-avatar`, `.user-avatar-badges`
- `.reply-thread`, `.reply-card`, `.reply-card-nested`
- `.poll-container`, `.poll-option`, `.poll-option-selected`
- `.forum-search`
- `.bottom-sheet` (mobile)

---

## Implementation Order

| Phase | Tasks | Dependencies |
|-------|-------|--------------|
| 1 | Types, JSON data, API, hooks | None |
| 2 | Core components (CategoryBadge, UserAvatar, UpvoteButton, ThreadCard) | Phase 1 |
| 3 | Landing page + DiscussionsLanding | Phase 2 |
| 4 | Thread detail + replies | Phase 2 |
| 5 | Category pages | Phase 3 |
| 6 | Thread creation form | Phase 4 |
| 7 | Poll system | Phase 6 |
| 8 | Mobile optimization | Phases 3-6 |
| 9 | Polish & interactions | All |

---

## Verification Checklist

### After Each Phase
1. `make dev` - Ensure app runs without errors
2. `make lint` - No linting errors
3. `make build` - Production build succeeds

### Manual Testing
- [ ] Navigate to `/discussions` - landing page loads
- [ ] Categories display with correct icons/colors
- [ ] Click category card → filtered view
- [ ] Search threads by title/body
- [ ] Sort by newest/upvoted/discussed
- [ ] Toggle card/compact view
- [ ] Click thread → detail page loads
- [ ] Replies display with correct nesting (max 2 levels)
- [ ] Upvote button toggles state
- [ ] Bookmark button toggles state
- [ ] Share dropdown shows "Copy link"
- [ ] Report shows confirmation toast
- [ ] Create new thread form validates
- [ ] Poll creation and voting works
- [ ] Mobile: swipe gestures work
- [ ] Mobile: bottom sheet opens
- [ ] Mobile: touch targets ≥44px

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces actions
- [ ] Color contrast meets WCAG AA

---

## Critical Files

| File | Purpose |
|------|---------|
| `src/types/index.ts` | Add all discussion types |
| `src/data/discussions.json` | Thread/reply sample data |
| `src/data/forum-categories.json` | Category definitions |
| `src/data/user-titles.json` | Title/badge progression |
| `src/lib/api/discussions.ts` | Data fetching layer |
| `src/hooks/useDiscussions.ts` | React Query hooks |
| `src/app/discussions/page.tsx` | Landing page |
| `src/app/discussions/[category]/page.tsx` | Category page |
| `src/app/discussions/thread/[id]/page.tsx` | Thread detail |
| `src/app/discussions/new/page.tsx` | Create thread |
| `src/components/discussions/` | All forum components |
| `src/app/globals.css` | Forum CSS classes |
