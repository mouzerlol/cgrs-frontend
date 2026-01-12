# Community Calendar Implementation Plan

## Overview
Build an interactive dual-pane calendar feature with month grid view (left) and scrollable detail view (right). Calendar displays Notices, Events, and News items with accordion-style expansion and smooth scroll synchronization.

## UX Decisions (Confirmed)
- **Overflow behavior**: "+N more" button scrolls to that date in detail view
- **Item expansion**: Accordion style (auto-collapse previous item)
- **Time display**: Show in both calendar cell and detail card
- **Visual cues**: Highlight today with terracotta border, show empty state message

## Architecture Pattern
Follow existing CGRS patterns:
- **State**: Local state with useState/useRef (no global state)
- **Data**: JSON files → API layer → React Query hooks
- **Components**: Parent owns state, children receive props + callbacks
- **Styling**: Tailwind utilities + custom CSS in globals.css
- **Date handling**: Use `date-fns` library (tree-shakeable, TypeScript-native)

---

## Component Hierarchy

```
CalendarPage (route page)
├── PageHeader (existing)
└── CalendarContent (state owner)
    ├── CalendarViewContainer (two-pane layout)
    │   ├── MonthCalendar
    │   │   ├── MonthNavigationBar
    │   │   └── CalendarGrid
    │   │       └── DateCell (×35-42)
    │   └── CalendarDetailView
    │       └── DateGroup (×N dates)
    │           └── CalendarItemCard (expandable, ×N items)
    └── EmptyState
```

---

## Data Model

### TypeScript Types (add to `src/types/index.ts`)

```typescript
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
```

### Category Configuration (`src/lib/calendar-config.ts`)

```typescript
export const CALENDAR_CATEGORIES = {
  notice: {
    maintenance: { label: 'Maintenance', icon: 'wrench', color: 'terracotta', defaultImage: '/images/calendar/maintenance.svg' },
    announcement: { label: 'Announcement', icon: 'megaphone', color: 'forest', defaultImage: '/images/calendar/announcement.svg' }
  },
  event: {
    social: { label: 'Social Event', icon: 'users', color: 'sage', defaultImage: '/images/events/social.svg' },
    meeting: { label: 'Committee Meeting', icon: 'calendar', color: 'forest', defaultImage: '/images/events/meeting.svg' }
  },
  news: {
    general: { label: 'General News', icon: 'newspaper', color: 'sage', defaultImage: '/images/news/general.svg' }
  }
} as const;

export const MAX_ITEMS_PER_CELL = 2;
```

---

## State Management

### CalendarContent State Variables

```typescript
const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
const [selectedDate, setSelectedDate] = useState<string | null>(null);
const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
const detailViewRef = useRef<HTMLDivElement>(null);

// Derived state
const monthData = useMemo(() => calculateMonthData(currentMonth), [currentMonth]);
const groupedItems = useMemo(() => groupItemsByDate(items, currentMonth), [items, currentMonth]);
const itemsByDate = useMemo(() => createDateItemMap(items, currentMonth), [items, currentMonth]);
```

### Event Handlers

```typescript
// Month navigation
const handlePrevMonth = () => { setCurrentMonth(prev => subMonths(prev, 1)); setExpandedItemId(null); };
const handleNextMonth = () => { setCurrentMonth(prev => addMonths(prev, 1)); setExpandedItemId(null); };

// Date click (cell or "+N more")
const handleDateClick = (dateString: string) => {
  setSelectedDate(dateString);
  // Scroll to date section in detail view
  const targetEl = detailViewRef.current?.querySelector(`[data-date="${dateString}"]`);
  targetEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

// Item click (accordion behavior)
const handleItemClick = (itemId: string) => {
  setExpandedItemId(prev => prev === itemId ? null : itemId);
};
```

---

## Critical Files to Create

### Data Layer
1. **`src/data/calendar-items.json`** - Sample calendar item data
2. **`src/lib/calendar-config.ts`** - Category config, constants
3. **`src/lib/calendar-utils.ts`** - Date utility functions (date-fns wrappers)
4. **`src/lib/api/calendar.ts`** - API layer for loading/filtering items

### Hooks
5. **`src/hooks/useCalendar.ts`** - React Query hook for data fetching
6. **`src/hooks/useScrollToDate.ts`** - Scroll synchronization hook

### Components (create in order)
7. **`src/components/calendar/CategoryIcon.tsx`** - Icon with category color
8. **`src/components/calendar/DateCell.tsx`** - Individual date cell (shows items, "+N more")
9. **`src/components/calendar/CalendarItemCard.tsx`** - Expandable accordion card
10. **`src/components/calendar/DateGroup.tsx`** - Date section with items list
11. **`src/components/calendar/MonthNavigationBar.tsx`** - Prev/next buttons + month label
12. **`src/components/calendar/CalendarGrid.tsx`** - 7×6 grid of DateCells
13. **`src/components/calendar/MonthCalendar.tsx`** - Left pane container
14. **`src/components/calendar/CalendarDetailView.tsx`** - Right pane scrollable view
15. **`src/components/calendar/CalendarViewContainer.tsx`** - Two-pane layout wrapper
16. **`src/components/calendar/CalendarContent.tsx`** - Main state owner
17. **`src/app/calendar/page.tsx`** - Route page

### Files to Modify
18. **`src/types/index.ts`** - Add CalendarItem types
19. **`src/app/globals.css`** - Add calendar-specific CSS
20. **`package.json`** - Add `date-fns` dependency

---

## Key Utility Functions (`src/lib/calendar-utils.ts`)

```typescript
import { format, startOfMonth, endOfMonth, parseISO, /* ... */ } from 'date-fns';
import { enNZ } from 'date-fns/locale';

// Calculate month metadata
export function calculateMonthData(monthStart: Date): MonthData { /* ... */ }

// Generate all calendar days (including prev/next month overflow)
export function generateCalendarDays(monthData: MonthData): Date[] { /* ... */ }

// Group items by date for detail view
export function groupItemsByDate(items: CalendarItem[], currentMonth: Date): DateGrouping[] { /* ... */ }

// Create Map for calendar grid lookup
export function createDateItemMap(items: CalendarItem[], currentMonth: Date): Map<string, CalendarItem[]> { /* ... */ }

// Formatting
export function formatDateHeader(dateString: string): string { /* "Friday, January 15, 2026" */ }
export function formatMonthYear(date: Date): string { /* "January 2026" */ }
export function isTodayDate(dateString: string): boolean { /* ... */ }
```

---

## Layout & Responsive Design

### Desktop (md+)
- Two equal columns (50/50 grid)
- Calendar grid: fixed height, no scroll
- Detail view: scrollable with `max-h-[70vh]`

### Mobile (<md)
- Vertical stack: calendar top, detail below
- Calendar grid: smaller cells (`min-h-[60px]`)
- Detail view: full width, scrollable

### Tailwind Classes
```css
.calendar-view-container {
  @apply grid grid-cols-1 md:grid-cols-2 gap-6 bg-bone;
}

.calendar-grid-column {
  @apply bg-white rounded-2xl p-6 shadow-sm;
}

.calendar-detail-column {
  @apply bg-sage-light rounded-2xl p-6 overflow-y-auto max-h-[70vh];
}
```

---

## Styling Approach

### Reuse Existing Components
- **Card**: Use for item cards with variants
- **Button**: Use for navigation (outline variant)
- **Icon**: Use for category icons (from Lucide)

### Custom CSS (add to `globals.css`)

```css
/* Date Cell Styles */
.date-cell {
  @apply relative p-2 min-h-[80px] md:min-h-[80px] rounded-lg border border-sage/20 bg-white;
  @apply cursor-pointer transition-all duration-200;
  @apply hover:shadow-md hover:border-sage;
}

.date-cell.today {
  @apply border-2 border-terracotta bg-terracotta/5;
}

.date-cell.selected {
  @apply border-2 border-sage bg-sage/10;
}

.date-cell.other-month {
  @apply opacity-40 pointer-events-none;
}

/* Item Indicators (colored dots) */
.item-indicator {
  @apply w-2 h-2 rounded-full inline-block mr-1;
}

.item-indicator.notice { @apply bg-terracotta; }
.item-indicator.event { @apply bg-sage; }
.item-indicator.news { @apply bg-forest; }

/* Category Icons */
.category-icon-wrapper {
  @apply w-10 h-10 rounded-full flex items-center justify-center;
}

.category-icon-wrapper.notice { @apply bg-terracotta/10 text-terracotta; }
.category-icon-wrapper.event { @apply bg-sage/30 text-forest; }
.category-icon-wrapper.news { @apply bg-forest/10 text-forest; }
```

---

## CalendarItemCard Accordion Implementation

Use **Headless UI Disclosure** for accordion behavior:

```typescript
import { Disclosure } from '@headlessui/react';

// In CalendarItemCard component
<Disclosure>
  <Disclosure.Button onClick={() => onItemClick(item.id)}>
    {/* Compact view: icon, title, time */}
    <div className="flex items-center gap-3">
      <CategoryIcon type={item.type} category={item.category} />
      <div className="flex-1">
        <h4 className="font-medium">{item.title}</h4>
        <p className="text-sm opacity-60">{formatTimeRange(item.time)}</p>
      </div>
      <ChevronIcon open={isExpanded} />
    </div>
  </Disclosure.Button>

  <Disclosure.Panel>
    {/* Expanded view: image, description, author */}
    {item.image && <Image src={item.image} alt={item.title} width={400} height={200} />}
    <p>{item.description}</p>
    <div className="flex items-center gap-2 mt-4">
      <Image src={item.author.avatar} alt={item.author.name} width={32} height={32} />
      <span className="text-sm">{item.author.name}</span>
    </div>
  </Disclosure.Panel>
</Disclosure>
```

**Accordion Logic**: Parent (CalendarContent) manages `expandedItemId` state. Clicking item calls `onItemClick(id)`, which toggles expansion (auto-collapses previous).

---

## Testing Strategy

### Unit Tests

**`src/lib/__tests__/calendar-utils.test.ts`**
- `calculateMonthData` returns correct metadata
- `generateCalendarDays` returns 35 or 42 days
- `groupItemsByDate` correctly groups by date
- `createDateItemMap` creates correct Map structure
- `formatDateHeader` returns en-NZ locale format
- `isTodayDate` correctly identifies today

**`src/lib/api/__tests__/calendar.test.ts`**
- `getCalendarItems` with no options returns all
- Filter by type returns only that type
- Filter by month returns only that month's items
- Items sorted by date correctly

### Component Tests

**`src/components/calendar/__tests__/CalendarContent.test.tsx`**
- Month navigation updates displayed month
- Date click calls handler with correct date
- Item click expands it
- Expanding one item collapses previous

**`src/components/calendar/__tests__/DateCell.test.tsx`**
- Renders correct date number
- Shows correct item indicators
- Shows "+N more" when overflow
- Applies today/selected/other-month styling

---

## Implementation Sequence

### Phase 1: Foundation (Data + Utils)
1. Install `date-fns`: `npm install date-fns`
2. Add CalendarItem types to `src/types/index.ts`
3. Create `src/data/calendar-items.json` with 10-15 sample items
4. Create `src/lib/calendar-config.ts`
5. Create `src/lib/calendar-utils.ts`
6. Create `src/lib/api/calendar.ts`
7. Write unit tests for utils and API

### Phase 2: Hooks
8. Create `src/hooks/useCalendar.ts`
9. Create `src/hooks/useScrollToDate.ts`

### Phase 3: Components (Bottom-Up)
10. Create `CategoryIcon.tsx`
11. Create `DateCell.tsx`
12. Create `CalendarItemCard.tsx`
13. Create `DateGroup.tsx`
14. Create `MonthNavigationBar.tsx`
15. Create `CalendarGrid.tsx`
16. Create `MonthCalendar.tsx`
17. Create `CalendarDetailView.tsx`
18. Create `CalendarViewContainer.tsx`
19. Create `CalendarContent.tsx`

### Phase 4: Page + Styling
20. Create `src/app/calendar/page.tsx`
21. Update `src/app/globals.css` with calendar styles
22. Update navigation to add calendar link

### Phase 5: Testing + Polish
23. Write component tests
24. Test responsive layout (mobile/desktop)
25. Add loading skeleton states
26. Add empty state component
27. Accessibility audit (keyboard nav, ARIA)
28. Performance check

---

## Sample Data Structure

**`src/data/calendar-items.json`**

```json
{
  "items": [
    {
      "id": "cal-001",
      "type": "notice",
      "title": "Water Maintenance Scheduled",
      "description": "Water will be shut off from 9am-12pm for routine maintenance in the east wing.",
      "date": "2026-01-15",
      "time": "9:00 AM - 12:00 PM",
      "category": "maintenance",
      "author": {
        "name": "Facilities Team",
        "avatar": "/images/avatars/facilities.png"
      }
    },
    {
      "id": "cal-002",
      "type": "event",
      "title": "Summer Barbecue",
      "description": "Join us for our annual summer barbecue on the rooftop terrace. BYO drinks!",
      "date": "2026-01-15",
      "time": "12:00 PM - 4:00 PM",
      "category": "social",
      "image": "/images/events/barbecue.svg",
      "author": {
        "name": "Events Committee",
        "avatar": "/images/avatars/events.png"
      }
    }
  ]
}
```

---

## Verification Steps

### End-to-End Testing
1. **Navigate to `/calendar`** - Page loads with current month
2. **Click next/prev month** - Calendar updates, items reload
3. **Click date cell** - Detail view scrolls to that date
4. **Click "+N more"** - Detail view scrolls to that date
5. **Click calendar item** - Item expands, shows full details
6. **Click another item** - Previous item collapses (accordion)
7. **Click expanded item** - Item collapses
8. **Resize to mobile** - Layout stacks vertically
9. **Check today's date** - Highlighted with terracotta border
10. **Navigate to empty month** - Shows empty state message

### Unit Test Coverage
- Run `make test` to verify all tests pass
- Target: >80% coverage for utils and API layer
- Ensure date logic handles edge cases (month boundaries, leap years)

### Accessibility
- Tab through calendar grid
- Navigate with keyboard
- Verify ARIA labels on interactive elements
- Test with screen reader (VoiceOver/NVDA)

### Performance
- Verify no lag with 50+ items in a month
- Check calendar grid renders efficiently (35-42 cells)
- Ensure smooth scroll in detail view
- Test on mobile devices (touch interactions)

---

## Success Criteria

✅ Calendar displays current month on page load
✅ Month navigation works (prev/next)
✅ Date cells show up to 2 items + "+N more" for overflow
✅ Clicking date/"+N more" scrolls to detail view section
✅ Items expand on click (accordion style)
✅ Today's date highlighted with terracotta border
✅ Empty state shown when month has no items
✅ Responsive layout (desktop: 2-column, mobile: stacked)
✅ All interactions smooth with CSS transitions
✅ Unit tests pass for date logic and API
✅ Component tests pass for key interactions
✅ Accessible via keyboard navigation

---

## Dependencies

### New
- **date-fns** - Date manipulation library

### Existing (Already Available)
- @headlessui/react - Disclosure for accordion
- @tanstack/react-query - Data fetching
- lucide-react - Icons
- tailwindcss - Styling
- next/image - Image optimization

---

## Future Enhancements (Out of Scope)
- Filter by item type (notice/event/news)
- Search functionality
- Export to ICS calendar file
- Recurring events
- Multi-day events
- Desktop notifications
- Mobile swipe gestures for month navigation
