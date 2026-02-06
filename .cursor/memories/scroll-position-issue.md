# Scroll Position Issue: Thread Detail Page

**Issue:** When loading `/discussion/thread/thread-intro-002/`, the page opens with scroll position set to middle/bottom instead of top.

**Date:** Monday Jan 26, 2026
**Status:** RESOLVED - Root Cause Found

---

## Root Cause Identified

**The actual culprit:** `ReplyForm.tsx` auto-focuses on mount (lines 45-48)

```typescript
// Focus on mount
useEffect(() => {
  textareaRef.current?.focus();
}, []);
```

When the `ReplyForm` component mounts at the bottom of the thread page, this `useEffect` calls `focus()` on the textarea. Modern browsers automatically scroll to bring focused elements into view (accessibility feature).

**Sequence:**
1. Page loads
2. `ReplyForm` mounts at the bottom of the page
3. `useEffect` triggers `focus()` on the textarea
4. Browser auto-scrolls to bring the focused textarea into view
5. User sees the page scrolled down to the reply form instead of the top

---

## Fix Applied

Removed the auto-focus on mount from `ReplyForm`. The textarea should NOT be focused on initial page load - users need to read the thread first before replying.
