# Forum Navigation Investigation & Observations

## Executive Summary

**Status**: The forum navigation is WORKING CORRECTLY after bug fix.

**Bug Description**: When clicking between category tabs (not "All Categories" or "Events"), the thread list would not display properly. The view appeared "broken" - threads were visible but rendering incorrectly or not animating properly.

**Reproduction Steps**:
1. Click "All Categories" → shows all threads
2. Click "Introductions" → shows introductions
3. Click "Announcements" → view breaks, threads not displayed correctly

**Root Cause**: Framer Motion animation state not resetting when filtered thread list changed. The `motion.div` containers retained their previous animation state, causing elements to appear stuck or invisible.

**Fix Applied**: Added dynamic `key` to `motion.div` elements in `ThreadList.tsx` based on thread IDs and view mode. This forces React/Framer Motion to remount animation elements when list content changes.

---

## Bug Fix Details (January 26, 2026)

### Root Cause Analysis

The `ThreadList` component used Framer Motion for staggered list animations. When filtering between categories:

1. Category click → `activeCategory` state updates
2. `filteredThreads` recomputed in parent component
3. `ThreadList` receives new thread array
4. **Bug**: `motion.div` retained animation state from previous render
5. Result: List appeared broken/invisible

### The Fix

**File**: `src/components/discussions/ThreadList.tsx`

**Change**: Added dynamic key generation to force re-animation:

```typescript
// Generate unique key based on thread IDs to force re-animation when list changes
const threadIdsKey = threads.map(t => t.id).join(',');
const motionKey = `motion-${viewMode}-${threadIdsKey}`;
```

Applied to both `motion.div` containers (card view and compact view):

```typescript
<motion.div
  key={motionKey}  // Forces remount when thread list changes
  variants={listVariants}
  initial="hidden"
  animate="visible"
>
```

### Why This Works

- React's key prop tells the reconciler this is a new element
- Framer Motion sees new element → starts animation from `initial="hidden"`
- Staggered animation plays correctly for each category switch

---

## Historical Investigation (January 26, 2026 - Earlier)

### Test Results (Initial Investigation)

All category filtering tests passed during initial investigation:

| Category | Expected Threads | Actual Threads | Status |
|----------|-----------------|----------------|--------|
| All Categories | 10-15 | 10 | ✓ PASS |
| Introductions | 3 | 3 | ✓ PASS |
| Announcements | 1 | 1 | ✓ PASS |
| Parking | 1 | 1 | ✓ PASS |
| Waste Management | 1 | 1 | ✓ PASS |
| Questions & Help | 1 | 1 | ✓ PASS |
| Neighborhood Watch | 1 | 1 | ✓ PASS |
| Events | 0 | 0 | ✓ PASS |
| General Discussion | 2 | 2 | ✓ PASS |

### View Toggle Tests
- Card view: Shows threads correctly
- Compact view: Shows threads correctly

### CSS Analysis
The CSS in `globals.css` (lines 5883-6133) is correctly configured:
- `.discussions-sidebar-layout`: flex container with proper layout
- `.discussions-content-wrapper`: flex: 1 with min-width: 0
- `.discussions-content-panel`: flex: 1 with white background and proper padding
- Media queries at 1023px and 639px work correctly for responsive design

### Framer Motion Animation (Initial Finding - Now Known Incorrect)
- `motion.div` elements render correctly
- Opacity: 1 (fully visible)
- Transform: none (no off-screen positioning)
- **Note**: Earlier investigation concluded animation was working. This was incorrect - the bug manifests intermittently and only when switching between specific categories.

---

## Technical Observations

### What Works Correctly

1. **Category Tab Navigation**
   - Active tab state updates correctly
   - `category-tab-active` class applied to selected tab
   - `aria-selected` attribute updates correctly
   - `onCategoryChange` callback fires with correct category slug

2. **Thread Filtering**
   - React state (`activeCategory`) updates correctly
   - `useMemo` filtering works as expected
   - `filteredThreads` array contains correct threads for each category
   - DOM updates reflect filter changes within ~500ms

3. **View Mode Toggle**
   - Card view renders with grid layout
   - Compact view renders with space-y layout
   - Thread count maintained across view changes

4. **Search Functionality**
   - Filters by title and body content
   - Shows appropriate empty state for no results

5. **Thread Actions**
   - Upvote, Share, Report buttons visible and interactive
   - Callbacks fire with correct thread IDs

### Component Structure (Verified Working)

```
DiscussionsSidebarLayout
├── DiscussionCategorySidebar (desktop)
│   └── category-tabs (hidden lg:flex)
│       └── category-tab buttons
├── category-dropdown (mobile only, lg:hidden)
└── discussions-content-wrapper
    └── discussions-content-panel
        └── ThreadList
            └── motion.div (Framer Motion)
                └── ThreadCard / ThreadCardCompact
```

---

## Lessons Learned

### When Using Framer Motion with Dynamic Lists

1. **Always add key to motion containers** when list content changes
2. **Use unique identifier** (like thread IDs) rather than just list length
3. **Include view mode** in key if animations differ between modes
4. **Test switching between states** - not just initial render

### Related Pattern

This is a common pattern when animating filtered/sorted lists:

```typescript
// Good: Key based on actual content
const listKey = items.map(i => i.id).join(',');

return (
  <motion.div key={listKey} initial="hidden" animate="visible">
    {items.map(item => (
      <motion.div key={item.id} variants={itemVariants}>
        <ItemComponent item={item} />
      </motion.div>
    ))}
  </motion.div>
);
```

---

## Test Coverage Added

### Vitest Unit Tests
- `src/components/discussions/__tests__/ThreadList.test.tsx`
  - Rendering tests (compact/card view, empty state)
  - Filtering logic tests
  - Interaction tests (upvote, share)
  - Category badge visibility tests

- `src/components/discussions/__tests__/DiscussionsSidebarLayout.test.tsx`
  - Sidebar rendering tests
  - Category tab interaction tests
  - Accessibility tests (ARIA attributes)

### Playwright E2E Tests
- `tests/e2e/discussion.spec.ts`
  - Page load tests
  - Category filtering (all categories)
  - View mode toggle
  - Search functionality
  - Sort functionality
  - Thread actions
  - Responsive behavior (mobile/desktop)
  - Empty state handling

---

## Commands for Running Tests

```bash
# Unit tests
make test_unit
npx vitest run

# E2E tests
make test_e2e
npx playwright test --reporter=list

# All tests
make test
make test_all
```

---

## Files Modified

### Bug Fix
1. `src/components/discussions/ThreadList.tsx` - Added dynamic key to motion.div elements

### Historical (Earlier Investigation)
2. `src/components/discussions/__tests__/ThreadList.test.tsx` (NEW)
3. `src/components/discussions/__tests__/DiscussionsSidebarLayout.test.tsx` (NEW)
4. `tests/e2e/discussion.spec.ts` (NEW)
5. `playwright.config.ts` (NEW)
6. `Makefile` - Added test commands
7. `package.json` - Added test scripts

---

## References

- **Framer Motion docs**: https://www.framer.com/motion/
- **React key prop**: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
- **Related issue**: cgrs-frontend-ej5 (completed)
