# Implementation Plan: CGRS Frontend Improvements

**Project:** Coronation Gardens Residents Society Website  
**Based On:** Architecture Audit (January 2025)  
**Priority:** Phased implementation over 8 weeks

---

## Quick Reference

| Phase | Timeline | Focus | Effort |
|-------|----------|-------|--------|
| Phase 1 | Weeks 1-2 | Foundation & Security | ~2 days |
| Phase 2 | Weeks 3-4 | Component Refactoring | ~1 week |
| Phase 3 | Weeks 5-6 | State & Data Layer | ~1 week |
| Phase 4 | Weeks 7-8 | Quality Assurance | ~1 week |

---

## Phase 1: Foundation (Weeks 1-2)

### Task 1.1: Security Hardening

**Priority:** P0 - Critical  
**Estimated Time:** 2 hours  
**Status:** Not Started

**Description:** Configure Next.js image optimization to only allow trusted domains and remove debug logging from production code.

**Changes Required:**

```javascript
// next.config.js - Add image domain allowlist
const nextConfig = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'placehold.co',
    }],
  },
};
```

**Files to Modify:**
- `next.config.js`

**Validation:**
- Verify images load from allowed domains only
- No console.log statements in production code

---

### Task 1.2: Debug Logging Removal

**Priority:** P0 - Critical  
**Estimated Time:** 1 hour  
**Status:** Not Started

**Description:** Remove or wrap console.log statements in development checks.

**Files to Review:**
- `src/components/forms/ContactForm.tsx`

**Example Fix:**
```typescript
if (process.env.NODE_ENV === 'development') {
  console.log('Form submitted:', data);
}
```

---

### Task 1.3: Create Icon Library

**Priority:** P1 - High  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Description:** Consolidate 6 inline SVG icon sets into a single, reusable Icon component.

**File to Create:**
- `src/components/ui/Icon.tsx` - Main Icon component
- `src/components/ui/IconLibrary.tsx` - SVG definitions

**Icons to Consolidate:**
1. amenities
2. calendar
3. user
4. document
5. mail
6. lightbulb
7. phone

**API Design:**
```typescript
interface IconProps {
  name: 'amenities' | 'calendar' | 'user' | 'document' | 'mail' | 'lightbulb' | 'phone';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Icon({ name, size = 'md', className }: IconProps)
```

**Files to Update After Creation:**
- `src/components/sections/QuickAccessGrid.tsx` - Replace inline SVGs
- Any other files with inline icon definitions

---

### Task 1.4: Test Infrastructure Setup

**Priority:** P1 - High  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Description:** Configure Vitest and React Testing Library for unit and integration tests.

**File to Create:**
- `vitest.config.ts` - Vitest configuration
- `src/lib/__tests__/utils.test.ts` - Example utility test
- `tsconfig.json` (update) - Add test paths

**Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Package Updates (package.json):**
```json
{
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^24.0.0"
  }
}
```

---

### Task 1.5: API Layer Setup

**Priority:** P1 - High  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Description:** Create abstraction layer for data fetching, enabling future CMS migration.

**Files to Create:**
- `src/lib/api/index.ts` - Main export file
- `src/lib/api/news.ts` - News API functions
- `src/lib/api/events.ts` - Events API functions
- `src/lib/api/committee.ts` - Committee API functions
- `src/lib/api/site-config.ts` - Site config API functions

**API Design:**
```typescript
// lib/api/news.ts
import { NewsArticle } from '@/types';

export async function getNewsArticles(options?: {
  limit?: number;
  category?: string;
  featured?: boolean;
}): Promise<NewsArticle[]> {
  // Currently reads from JSON, can swap to API later
  const data = await import('@/data/news.json');
  let articles = data.default.articles as NewsArticle[];
  
  if (options?.limit) articles = articles.slice(0, options.limit);
  if (options?.category) articles = articles.filter(a => a.category === options.category);
  if (options?.featured) articles = articles.filter(a => a.featured);
  
  return articles;
}
```

**Migration Path:**
- Replace `import` statements with `fetch()` calls
- Add React Query for caching
- Add loading/error states

---

## Phase 2: Component Refactoring (Weeks 3-4)

### Task 2.1: Extract CalendarCard Component

**Priority:** P1 - High  
**Estimated Time:** 3 hours  
**Status:** Not Started

**Description:** Move embedded CalendarCard from EventsSection.tsx to standalone component.

**File to Create:**
- `src/components/ui/CalendarCard.tsx`

**Current Location:**
- `src/components/sections/EventsSection.tsx` (embedded, ~50 lines)

**Interface:**
```typescript
interface CalendarCardProps {
  event: Event;
  showTime?: boolean;
  showLocation?: boolean;
  variant?: 'default' | 'featured';
}
```

**Benefits:**
- Reusable across events list and detail views
- Testable in isolation
- Consistent with Card component pattern

---

### Task 2.2: Extract EventCard Component

**Priority:** P1 - High  
**Estimated Time:** 3 hours  
**Status:** Not Started

**Description:** Create standalone EventCard component if different from CalendarCard.

**File to Create:**
- `src/components/ui/EventCard.tsx`

**To Determine:**
- Review EventsSection.tsx and events page for usage patterns
- Decide if CalendarCard and EventCard can share a base component

---

### Task 2.3: Standardize Card Usage

**Priority:** P2 - Medium  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Description:** Extend Card component with variants for news, events, committee members, and CTAs.

**File to Modify:**
- `src/components/ui/Card.tsx`

**New Interface:**
```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'news' | 'event' | 'committee' | 'cta';
  image?: string;
  imageAlt?: string;
  date?: { day: string; month: string };
  category?: string;
  hover?: boolean;
}
```

**Components to Update:**
- CalendarCard (use Card as base)
- EventCard (use Card as base)
- NewsGrid items (use Card)
- CommitteeCard (if exists)

---

### Task 2.4: Add Loading Skeletons

**Priority:** P2 - Medium  
**Estimated Time:** 2 hours  
**Status:** Not Started

**Description:** Create skeleton components for loading states.

**Files to Create:**
- `src/components/ui/Skeleton.tsx` - Base skeleton
- `src/components/ui/NewsCardSkeleton.tsx`
- `src/components/ui/EventCardSkeleton.tsx`

**Example:**
```typescript
export function NewsCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-sage-light" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-sage-light w-3/4" />
        <div className="h-4 bg-sage-light w-1/2" />
      </div>
    </div>
  );
}
```

---

## Phase 3: State & Data (Weeks 5-6)

### Task 3.1: React Query Setup

**Priority:** P2 - Medium  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Description:** Add React Query provider for data caching and loading states.

**Files to Create/Modify:**
- `src/lib/providers.tsx` - Add QueryProvider
- `src/app/layout.tsx` - Wrap with Providers

**Configuration:**
```typescript
// lib/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### Task 3.2: Create Custom Query Hooks

**Priority:** P2 - Medium  
**Estimated Time:** 3 hours  
**Status:** Not Started

**Description:** Replace direct API calls with React Query hooks.

**Files to Create:**
- `src/hooks/useNews.ts`
- `src/hooks/useEvents.ts`
- `src/hooks/useCommittee.ts`

**Example:**
```typescript
// hooks/useNews.ts
import { useQuery } from '@tanstack/react-query';
import { getNewsArticles } from '@/lib/api/news';

export function useNews(options?: { limit?: number; category?: string }) {
  return useQuery({
    queryKey: ['news', options],
    queryFn: () => getNewsArticles(options),
  });
}
```

---

### Task 3.3: Add Error Boundary

**Priority:** P2 - Medium  
**Estimated Time:** 2 hours  
**Status:** Not Started

**Description:** Create ErrorBoundary component for graceful error handling.

**File to Create:**
- `src/components/ui/ErrorBoundary.tsx`

**Usage:**
```typescript
// In layout or page
<ErrorBoundary fallback={<ErrorFallback />}>
  <NewsGrid />
</ErrorBoundary>
```

---

### Task 3.4: Update Components with Loading States

**Priority:** P2 - Medium  
**Estimated Time:** 3 hours  
**Status:** Not Started

**Description:** Update pages to use Suspense boundaries with skeleton loaders.

**Pages to Update:**
- Homepage (events, news sections)
- Events page
- News page
- About page (committee section)

---

## Phase 4: Quality Assurance (Weeks 7-8)

### Task 4.1: Write Unit Tests

**Priority:** P2 - Medium  
**Estimated Time:** 6 hours  
**Status:** Not Started

**Coverage Target:** 80% on utility functions and UI components

**Files to Create:**
- `src/lib/__tests__/utils.test.ts` - Test formatDate, cn utility
- `src/components/__tests__/Button.test.tsx`
- `src/components/__tests__/Card.test.tsx`
- `src/components/__tests__/Icon.test.tsx`

**Example Test:**
```typescript
// utils.test.ts
import { formatDate } from '@/lib/utils';

describe('formatDate', () => {
  it('formats ISO date strings correctly', () => {
    expect(formatDate('2024-01-15')).toBe('15 January 2024');
  });
});
```

---

### Task 4.2: Write Integration Tests

**Priority:** P2 - Medium  
**Estimated Time:** 6 hours  
**Status:** Not Started

**Focus Areas:**
- NewsGrid rendering with data
- EventsSection filtering
- Contact form validation

**Files to Create:**
- `src/components/__tests__/NewsGrid.test.tsx`
- `src/components/__tests__/EventsSection.test.tsx`
- `src/components/__tests__/ContactForm.test.tsx`

---

### Task 4.3: Accessibility Audit

**Priority:** P2 - Medium  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Items to Fix:**
1. Add aria-labels to QuickAccessGrid links
2. Review focus styles on all interactive elements
3. Test keyboard navigation
4. Add skip link (verify exists in Layout)

**QuickAccessGrid Fix:**
```typescript
<Link 
  href={card.href}
  aria-label={`Navigate to ${card.title}`}
  className="..."
>
```

---

### Task 4.4: Performance Review

**Priority:** P3 - Low  
**Estimated Time:** 4 hours  
**Status:** Not Started

**Metrics to Verify:**
- First Contentful Paint < 0.8s
- Largest Contentful Paint < 1.2s
- Time to Interactive < 1.5s
- Bundle Size (JS) < 80KB

**Tools:**
- Lighthouse in Chrome DevTools
- next/dynamic for code splitting if needed

---

## Backlog (Future Enhancements)

### Task B1: CMS Integration

**Priority:** P3 - Low  
**Estimated Time:** 2-3 days  
**Status:** Not Started

**Description:** Replace local JSON with headless CMS (Contentful, Sanity, Strapi).

**Steps:**
1. Select CMS provider
2. Create content models
3. Update API layer to fetch from CMS
4. Add webhooks for incremental static regeneration

---

### Task B2: Form Backend Integration

**Priority:** P3 - Low  
**Estimated Time:** 1 week  
**Status:** Not Started

**Description:** Connect contact form to backend service (Formspree, Netlify Forms, or custom).

---

### Task B3: Internationalization (i18n)

**Priority:** P3 - Low  
**Estimated Time:** 2+ weeks  
**Status:** Not Started

**Description:** Add multi-language support for te reo Māori and other community languages.

---

## Progress Tracking

### Completed Tasks

| Task | Date Completed | Notes |
|------|----------------|-------|
| | | |

### In Progress

| Task | Started | ETA |
|------|---------|-----|
| | | |

### Pending

| Task | Priority | ETA |
|------|----------|-----|
| Security Hardening | P0 | 2 hours |
| Debug Logging Removal | P0 | 1 hour |
| Icon Library | P1 | 4 hours |
| Test Infrastructure | P1 | 4 hours |
| API Layer | P1 | 4 hours |
| CalendarCard Extract | P1 | 3 hours |
| EventCard Extract | P1 | 3 hours |
| Card Standardization | P2 | 4 hours |
| Loading Skeletons | P2 | 2 hours |
| React Query Setup | P2 | 4 hours |
| Custom Query Hooks | P2 | 3 hours |
| Error Boundary | P2 | 2 hours |
| Loading States Update | P2 | 3 hours |
| Unit Tests | P2 | 6 hours |
| Integration Tests | P2 | 6 hours |
| Accessibility Audit | P2 | 4 hours |
| Performance Review | P3 | 4 hours |

---

## Dependencies

### Package Additions

```json
{
  "devDependencies": {
    "@tanstack/react-query": "^5.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^24.0.0"
  }
}
```

### File Creation Summary

| File | Phase |
|------|-------|
| `src/components/ui/Icon.tsx` | 1 |
| `src/components/ui/IconLibrary.tsx` | 1 |
| `vitest.config.ts` | 1 |
| `src/test/setup.ts` | 1 |
| `src/lib/api/index.ts` | 1 |
| `src/lib/api/news.ts` | 1 |
| `src/lib/api/events.ts` | 1 |
| `src/lib/api/committee.ts` | 1 |
| `src/lib/api/site-config.ts` | 1 |
| `src/components/ui/CalendarCard.tsx` | 2 |
| `src/components/ui/EventCard.tsx` | 2 |
| `src/components/ui/Skeleton.tsx` | 2 |
| `src/components/ui/NewsCardSkeleton.tsx` | 2 |
| `src/components/ui/EventCardSkeleton.tsx` | 2 |
| `src/lib/providers.tsx` | 3 |
| `src/hooks/useNews.ts` | 3 |
| `src/hooks/useEvents.ts` | 3 |
| `src/hooks/useCommittee.ts` | 3 |
| `src/components/ui/ErrorBoundary.tsx` | 3 |
| `src/lib/__tests__/utils.test.ts` | 4 |
| `src/components/__tests__/Button.test.tsx` | 4 |
| `src/components/__tests__/Card.test.tsx` | 4 |
| `src/components/__tests__/Icon.test.tsx` | 4 |
| `src/components/__tests__/NewsGrid.test.tsx` | 4 |
| `src/components/__tests__/EventsSection.test.tsx` | 4 |
| `src/components/__tests__/ContactForm.test.tsx` | 4 |

---

*Plan created: January 2026*  
*Based on: Architecture Audit (January 2025)*
