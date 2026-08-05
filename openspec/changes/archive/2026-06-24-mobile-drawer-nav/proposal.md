## Why

On mobile (`<lg`), `/discussion` and `/management-request` navigate categories through an old inline dropdown (`SidebarDropdown`), while `/account/profile` already uses a polished slide-in left drawer (`MobileAccountNav`) with full accessibility (focus trap, scroll-lock, Escape, reduced motion). The experience is inconsistent and the dropdown is the weaker pattern. We want one shared, accessible drawer across these surfaces.

## What Changes

- Extract a shared `DrawerShell` component from `MobileAccountNav` (overlay, `bg-forest/60` backdrop, animated slide-from-left panel, scroll-lock, focus trap, Escape, focus restore, desktop-breakpoint auto-close, `title` + close (X) header).
- Refactor `MobileAccountNav` to render its existing `ProfileSideNav` body inside `DrawerShell` — behavior unchanged, a11y logic single-sourced.
- Add `SidebarDrawerNav` — a drawer body that renders account-style category rows (Iconify `category.icon` + name + active highlight + optional `count` badge), with the "All" row first when `showAllOption` is set.
- In `SidebarLayout`, replace the mobile `SidebarDropdown` with a sticky `lg:hidden` header bar (hamburger + active category label/icon) plus `DrawerShell` + `SidebarDrawerNav`, driven by internal `drawerOpen` state. Add a `drawerTitle` prop (default `"Menu"`).
- `/discussion` sets `drawerTitle="Topics"`; `/management-request` sets `drawerTitle="Categories"`.
- **BREAKING (internal):** Delete `SidebarDropdown.tsx` (only consumer is `SidebarLayout`).
- Desktop `SidebarTabs` and the map page are untouched / out of scope.

## Capabilities

### New Capabilities
- `mobile-sidebar-nav`: Mobile (`<lg`) category navigation for sidebar-layout pages via a shared accessible slide-in left drawer triggered from a sticky header bar.

### Modified Capabilities
<!-- None: no existing specs in openspec/specs/. -->

## Impact

- **Components:** new `DrawerShell.tsx`, new `SidebarDrawerNav.tsx`; refactor `MobileAccountNav.tsx`, `SidebarLayout.tsx`; delete `SidebarDropdown.tsx`.
- **Pages:** one-line edits to `/discussion` and `/management-request` to pass `drawerTitle`.
- **Scope:** mobile breakpoint (`<lg`, 1024px) only. Desktop and map unaffected.
- **Dependencies:** none added — reuses existing `framer-motion` and `@iconify/react`.
- **Risk:** `MobileAccountNav` refactor must preserve current account-drawer behavior exactly.
