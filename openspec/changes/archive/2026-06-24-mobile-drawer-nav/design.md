## Context

`/account/profile` already has a strong mobile pattern: `MobileAccountNav.tsx` — a framer-motion slide-in left drawer with backdrop, scroll-lock, focus trap, Escape handling, focus restore, `prefers-reduced-motion` support, and auto-close when the viewport crosses `lg` (1024px). It wraps `ProfileSideNav` (mobile variant) as its body.

`/discussion` and `/management-request` instead use `SidebarLayout`, which on mobile renders `SidebarDropdown` (an inline dropdown) and on desktop renders `SidebarTabs` (folder-tab sidebar). Both feed `SidebarLayout` a `SidebarCategory[]` (`{ id, name, icon (Iconify key), count? }`) plus `activeCategory` / `onCategoryChange` and the optional all-option props.

The map page was considered but is explicitly out of scope.

## Goals / Non-Goals

**Goals:**
- One shared, accessible drawer implementation across account + sidebar-layout pages.
- Replace the mobile dropdown on `/discussion` and `/management-request` with the slide-in drawer, with no regression (incl. the "All" option and active-category label).
- Keep the account drawer's behaviour byte-for-byte equivalent after refactor.
- Single integration point (`SidebarLayout`) so both pages benefit with near-zero page edits.

**Non-Goals:**
- Any desktop change — `SidebarTabs` stays as-is.
- Map page navigation (dropped).
- Redesigning category visuals beyond porting to drawer rows.

## Decisions

**1. Extract `DrawerShell` rather than clone.**
The a11y machinery in `MobileAccountNav` (focus trap, scroll-lock, Escape, focus restore, reduced-motion, desktop auto-close) is non-trivial. Cloning it into a new component invites drift (fix one, forget the other). Extract a `DrawerShell` taking `open`, `onClose`, `title`, `children`; refactor `MobileAccountNav` to `<DrawerShell title="Account">{<ProfileSideNav/>}</DrawerShell>`.
*Alternative:* leave `MobileAccountNav` untouched and clone mechanics — rejected for duplication/drift.

**2. Children-based shell, body components per surface.**
`DrawerShell` is content-agnostic. Account passes `ProfileSideNav`; sidebar-layout pages pass a new `SidebarDrawerNav`. Keeps the shell free of surface-specific concerns (identity chip, feature flags) that don't apply to category nav.

**3. Account-style rows for `SidebarDrawerNav`, not folder-tabs.**
Folder-tab markup (`SidebarTabs`) is designed for a fixed sidebar and reads oddly in a drawer. Render a vertical list mirroring the account drawer rows (Iconify icon + name + active highlight + optional `count` badge). Renders the "All" row first when `showAllOption`.

**4. Integrate entirely in `SidebarLayout`; delete `SidebarDropdown`.**
`SidebarLayout` already owns `activeCategory` / `onCategoryChange` and is the only consumer of `SidebarDropdown`. Replace the `lg:hidden` dropdown slot with (a) a sticky header bar (hamburger + active label/icon) and (b) `DrawerShell` + `SidebarDrawerNav`, driven by new internal `drawerOpen` state. Pages need only pass `drawerTitle`.

**5. Sticky header bar.**
`sticky top-0 z-10` inside the scrolling content panel, `bg-sage-light` to read as one surface, with compact-aware vertical padding (honours `SidebarLayout`'s existing `compact` prop). Keeps the hamburger reachable on long topics/forms. The active label resolves to `activeCategory === null ? allOptionLabel : matched category.name`.

**6. `drawerTitle` prop, default `"Menu"`.**
`/discussion` → `"Topics"`, `/management-request` → `"Categories"`. Two one-line page edits.

## Risks / Trade-offs

- **Account drawer regression during refactor** → Port mechanics verbatim into `DrawerShell`; visually/behaviourally diff the account drawer (open/close, focus, Escape, resize-to-desktop) before/after.
- **Sticky header needs a scroll context** → header bar sticks relative to the content panel; verify the panel (not the window) is the scroll container on both pages, adjusting overflow if needed.
- **Reused z-index (`z-[1100]`)** → keep the same stacking as `MobileAccountNav` so the drawer clears the site header; the two drawers never coexist (different routes).
- **Deleting `SidebarDropdown`** → confirmed sole consumer is `SidebarLayout`; safe removal.

## Migration Plan

Purely additive + internal-refactor; no data or API impact. Ship behind no flag. Rollback = revert the component changes and restore `SidebarDropdown`.
