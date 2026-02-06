# Discussion Threads Visibility Troubleshooting Plan

## Problem Statement
After interacting with the discussion navigational tabs (category filters), thread content exists in the HTML/DOM but is not visible in the viewport. This suggests a CSS rendering issue rather than a data/state problem.

## Investigation Summary

Three parallel code explorations revealed:
1. **Component structure is correct** - data flows properly, threads are being rendered
2. **CSS architecture is sound** - flexbox layout properly configured
3. **Multiple potential CSS conflicts** identified at responsive breakpoints

---

## Root Cause Hypotheses (Ranked by Likelihood)

### 🔴 **Hypothesis #1: CSS Media Query Conflicts**
**Likelihood: HIGH**

**Evidence:**
- Multiple `@media (max-width: 1023px)` rules in globals.css affecting the same element
- Line 6048-6051: Duplicate media query for `.discussions-content-panel`
- Potential rule override where later declarations hide content

**File:** `/src/app/globals.css` lines 6035-6123

**Symptoms:**
- Threads visible on initial page load
- Threads disappear after clicking category tabs
- DOM inspection shows threads exist but have `display: none` or similar

### 🟡 **Hypothesis #2: Framer Motion Animation State Stuck**
**Likelihood: MEDIUM**

**Evidence:**
- ThreadList uses Framer Motion with `initial="hidden"` state
- Animations might fail to transition from `hidden` → `visible` on state change
- Line 134-160 (card view) and 164-193 (compact view) in ThreadList.tsx

**File:** `/src/components/discussions/ThreadList.tsx`

**Symptoms:**
- Threads render but have `opacity: 0` or transform off-screen
- Smooth initially, breaks after category changes
- Animation variants not updating with React state

### 🟡 **Hypothesis #3: Z-Index Stacking Context Issues**
**Likelihood: MEDIUM**

**Evidence:**
- Sidebar active tab has `z-index: 10` (line 5945)
- Mobile dropdown lacks explicit z-index
- Content panel might render behind navigation elements

**Files:**
- `/src/app/globals.css` lines 5941-5945, 6054-6099

**Symptoms:**
- Threads physically exist at correct position
- Navigation UI overlays and hides them
- Inspector shows content below nav layers

### 🟢 **Hypothesis #4: Responsive Breakpoint Edge Case (1024px)**
**Likelihood: LOW-MEDIUM**

**Evidence:**
- CSS uses `max-width: 1023px` for mobile
- Tailwind uses `min-width: 1024px` (lg:) for desktop
- Exactly at 1024px viewport, both or neither might apply

**Files:**
- `/src/components/discussions/DiscussionCategorySidebar.tsx` line 39
- `/src/components/discussions/DiscussionCategoryDropdown.tsx` line 81
- `/src/app/globals.css` lines 6102-6105

**Symptoms:**
- Issue only occurs at specific viewport widths
- Sidebar/dropdown switching causes layout collapse
- Content panel width becomes 0 or negative

### 🟢 **Hypothesis #5: Flexbox Layout Collapse**
**Likelihood: LOW**

**Evidence:**
- Content panel has `flex: 1` and `min-width: 0`
- If parent flex container miscalculates, content could collapse
- Mobile `flex-direction: column` switch might not recalculate heights

**File:** `/src/app/globals.css` lines 5883-6045

**Symptoms:**
- Content panel has 0 width or 0 height
- Flexbox doesn't grow to fill available space
- Inspector shows collapsed dimensions

---

## Troubleshooting Procedure

### **Phase 1: Browser DevTools Inspection** (5-10 minutes)

**Objective:** Identify the CSS property causing invisibility

1. **Open the page and trigger the issue:**
   - Navigate to http://localhost:3000/discussion
   - Click a category tab (e.g., "Announcements")
   - Observe threads disappear while DOM shows they exist

2. **Inspect the content panel:**
   ```
   Right-click → Inspect Element on the thread area
   Find: <div class="discussions-content-panel">
   ```

3. **Check computed styles for:**
   - `display` property - should be `flex` or `block`, NOT `none`
   - `visibility` property - should be `visible`, NOT `hidden`
   - `opacity` property - should be `1`, NOT `0`
   - `height` property - should be `> 0px`, NOT `0px` or `auto` with no content height
   - `width` property - should be `> 0px`
   - `overflow` property - if `hidden`, content might be clipped
   - `z-index` and `position` - check stacking context

4. **Check ThreadList element:**
   ```
   Find: <div class="space-y-2"> (compact view)
   or: <div class="grid grid-cols-1 md:grid-cols-2 gap-4"> (card view)
   ```

5. **Check individual thread elements:**
   ```
   Find: <motion.div> wrapping ThreadCard or ThreadCardCompact
   Check for: opacity, transform, display properties
   ```

6. **Document findings:**
   - Screenshot computed styles panel
   - Note which CSS rule is causing the issue (rule source will show file:line)

**Expected Outcomes:**
- ✓ If `display: none` found → Media query conflict (Hypothesis #1)
- ✓ If `opacity: 0` or `transform` off-screen → Animation stuck (Hypothesis #2)
- ✓ If content behind nav → Z-index issue (Hypothesis #3)
- ✓ If width/height = 0 → Flexbox collapse (Hypothesis #5)

---

### **Phase 2: CSS Media Query Audit** (10-15 minutes)

**Objective:** Identify conflicting CSS rules at responsive breakpoints

**File:** `/src/app/globals.css`

1. **Search for duplicate media queries:**
   ```bash
   grep -n "@media (max-width: 1023px)" src/app/globals.css
   ```

   Expected: Multiple matches at lines 6048, 6102, etc.

2. **Review each media query block:**
   - Lines 6048-6051: `.discussions-content-panel` border-radius change
   - Lines 6102-6123: Multiple responsive rules for layout
   - Check if any rule sets `display: none`, `visibility: hidden`, `height: 0`

3. **Check for CSS specificity conflicts:**
   - Does a later rule override an earlier one?
   - Are there multiple rules targeting the same element?

4. **Test media query ranges:**
   - Resize browser to exactly 1024px width
   - Check if issue appears/disappears at breakpoint
   - Test at 1023px, 1024px, 1025px to isolate edge case

**Action Items:**
- [ ] Consolidate duplicate media queries into single blocks
- [ ] Remove conflicting rules that hide content
- [ ] Ensure consistent breakpoint usage (1023px vs 1024px)

---

### **Phase 3: Animation State Testing** (5-10 minutes)

**Objective:** Determine if Framer Motion animations are blocking visibility

**File:** `/src/components/discussions/ThreadList.tsx`

1. **Temporarily disable animations:**

   Edit ThreadList.tsx line 134 (card view) and 164 (compact view):

   ```typescript
   // Before (with animation):
   <motion.div
     initial="hidden"
     animate="visible"
     variants={cardVariants}
   >

   // After (disable animation):
   <div>
   ```

2. **Test category switching:**
   - Refresh page
   - Click different category tabs
   - Check if threads now remain visible

3. **If threads appear after disabling animation:**
   - Animation state is the culprit
   - Check `cardVariants` and `compactVariants` definitions
   - Verify `hidden` and `visible` states are correct
   - Check if `AnimatePresence` is interfering

**Expected Outcomes:**
- ✓ If threads appear → Animation is the issue (Hypothesis #2)
- ✗ If threads still hidden → Animation not the cause, revert changes

---

### **Phase 4: Z-Index Layering Analysis** (5 minutes)

**Objective:** Check if navigation elements are overlaying thread content

1. **Use browser 3D layer view:**
   - Chrome DevTools → More Tools → Layers
   - Identify all positioned elements with z-index
   - Check if content panel is below navigation

2. **Inspect stacking context:**
   ```
   Elements with z-index:
   - .category-tab-active: z-index 10 (line 5945)
   - .category-dropdown-menu: check if z-index set
   - .discussions-content-panel: check if z-index set
   ```

3. **Test z-index override:**
   - In DevTools, add inline style: `z-index: 999 !important;` to `.discussions-content-panel`
   - Check if threads become visible

**Expected Outcomes:**
- ✓ If threads appear with z-index boost → Stacking issue (Hypothesis #3)
- ✗ If no change → Z-index not the problem

---

### **Phase 5: Responsive Layout Testing** (10 minutes)

**Objective:** Isolate viewport-specific rendering issues

1. **Test at multiple viewport widths:**
   - Mobile: 375px, 414px, 768px
   - Tablet: 1023px, 1024px (edge case)
   - Desktop: 1280px, 1440px, 1920px

2. **Document behavior at each size:**
   - Are threads visible on initial load?
   - Do they disappear after clicking tabs?
   - At which viewport does the issue occur?

3. **Check sidebar/dropdown switching:**
   - At < 1024px: Verify sidebar hidden, dropdown visible
   - At ≥ 1024px: Verify sidebar visible, dropdown hidden
   - Check if content panel width adjusts correctly

4. **Inspect flexbox calculations:**
   ```
   .discussions-sidebar-layout (parent):
   - display: flex
   - At desktop: flex-direction: row (default)
   - At mobile: flex-direction: column (< 1024px)

   Check computed width/height of:
   - .discussions-content-wrapper (should be flex: 1)
   - .discussions-content-panel (should be flex: 1)
   ```

**Expected Outcomes:**
- ✓ If issue only at 1024px → Breakpoint edge case (Hypothesis #4)
- ✓ If content-panel width = 0 → Flexbox collapse (Hypothesis #5)

---

### **Phase 6: Build System Check** (5 minutes)

**Objective:** Ensure CSS is properly compiled and loaded

1. **Check CSS bundle in browser:**
   - DevTools → Sources → Look for `globals.css` or bundled CSS file
   - Verify discussions CSS rules are present (lines 5883-6133)
   - Check if media queries are intact (not stripped by minifier)

2. **Clear Next.js cache:**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check for CSS purging issues:**
   - If using Tailwind JIT, verify class names aren't being purged
   - Check `tailwind.config.js` for safelist if needed

4. **Inspect network tab:**
   - Verify CSS files loaded without 404 errors
   - Check CSS file size (should be substantial with all styles)

---

## Verification Checklist

After implementing fixes, verify:

- [ ] **Category switching works:**
  - Click "All Categories" → all threads visible
  - Click "Introductions" → 3 threads visible
  - Click "Announcements" → 1 thread visible
  - Click "Events" → empty state message visible
  - Click back to "All Categories" → all threads visible again

- [ ] **Responsive behavior correct:**
  - Mobile (< 1024px): Dropdown visible, threads visible
  - Desktop (≥ 1024px): Sidebar visible, threads visible
  - Resize browser smoothly transitions between layouts

- [ ] **Visual styling intact:**
  - Thread cards render with correct spacing
  - Dark forest green theme on sidebar
  - White background on content panel
  - Smooth animations (if enabled)

- [ ] **No JavaScript errors:**
  - Check browser console for React errors
  - Verify no state update warnings

---

## Critical Files for Investigation

### CSS Files
1. `/src/app/globals.css`
   - Lines 5883-6133: Discussions layout and sidebar styles
   - Lines 6048-6051: Potentially conflicting media query
   - Lines 6102-6123: Responsive layout rules

### Component Files
2. `/src/components/discussions/DiscussionsSidebarLayout.tsx`
   - Line 42: Root flex container
   - Line 63: Children rendering

3. `/src/components/discussions/ThreadList.tsx`
   - Lines 134-160: Card view with Framer Motion
   - Lines 164-193: Compact view with Framer Motion
   - Lines 102-131: Empty state rendering

4. `/src/app/discussion/page.tsx`
   - Lines 16-17: Data imports
   - Lines 53-87: Filtering logic
   - Line 166: ThreadList invocation

### Responsive Navigation
5. `/src/components/discussions/DiscussionCategorySidebar.tsx`
   - Line 39: `hidden lg:flex` classes

6. `/src/components/discussions/DiscussionCategoryDropdown.tsx`
   - Line 81: `lg:hidden` class

---

## Next Steps

1. **Execute Phase 1 (Browser DevTools)** first to identify the exact CSS property causing invisibility
2. **Based on findings, execute relevant phases:**
   - If display/visibility issue → Phase 2 (CSS audit)
   - If animation issue → Phase 3 (Animation testing)
   - If layering issue → Phase 4 (Z-index analysis)
   - If viewport-specific → Phase 5 (Responsive testing)
3. **Document the root cause** and exact fix applied
4. **Run verification checklist** to ensure issue is fully resolved

---

## Expected Timeline

- **Investigation**: 30-40 minutes (all phases)
- **Fix implementation**: 10-20 minutes (depending on root cause)
- **Verification**: 10 minutes
- **Total**: ~1 hour

## Success Criteria

✅ Threads visible on initial page load
✅ Threads remain visible after clicking any category tab
✅ Threads filter correctly (show only threads in selected category)
✅ Layout responsive at all viewport sizes (mobile, tablet, desktop)
✅ No CSS conflicts or JavaScript errors
✅ Smooth animations (if kept) or instant updates (if disabled)
