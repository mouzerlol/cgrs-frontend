## 1. Extract DrawerShell

- [x] 1.1 Create `src/components/shared/DrawerShell.tsx` with props `open`, `onClose`, `title`, `children`
- [x] 1.2 Port from `MobileAccountNav`: `fixed inset-0 z-[1100] lg:hidden` overlay, `bg-forest/60` backdrop (click to close), animated panel (`bg-forest-light`, `w-[min(20rem,85vw)]`, slide `x:-100%`), framer-motion `AnimatePresence` + `useReducedMotion`
- [x] 1.3 Port effects: body scroll-lock, focus trap (Tab/Shift+Tab wrap), Escape to close, focus restore to trigger, desktop-breakpoint (`min-width:1024px`) auto-close
- [x] 1.4 Render header inside panel: `title` text + close (X) button; render `children` in the scrollable body region

## 2. Refactor MobileAccountNav onto DrawerShell

- [x] 2.1 Replace inline overlay/panel/effects in `MobileAccountNav.tsx` with `<DrawerShell title="Account">{<ProfileSideNav variant="mobile" .../>}</DrawerShell>`
- [x] 2.2 Verify account drawer parity: open/close, backdrop click, Escape, focus trap + restore, resize-to-desktop auto-close, reduced motion, items/icons/badges/flag-gating intact

## 3. Category drawer body

- [x] 3.1 Create `src/components/shared/SidebarDrawerNav.tsx` taking `categories`, `activeCategory`, `onCategoryChange`, `showAllOption`, `allOptionLabel`, `allOptionIcon`, `onSelect`/close callback
- [x] 3.2 Render account-style rows: Iconify `category.icon` (`@iconify/react`) + name + active highlight + optional `count` badge
- [x] 3.3 Render the "All" row first when `showAllOption`, using `allOptionLabel`/`allOptionIcon`; selecting it calls `onCategoryChange(null)`
- [x] 3.4 On any row tap: call `onCategoryChange` then close the drawer

## 4. Integrate into SidebarLayout

- [x] 4.1 Add `drawerTitle?: string` prop (default `"Menu"`) and internal `drawerOpen` state to `SidebarLayout.tsx`
- [x] 4.2 Replace the `SidebarDropdown` render with a sticky `lg:hidden` header bar: `sticky top-0 z-10`, `bg-sage-light`, compact-aware padding, hamburger button + active label/icon (`activeCategory===null ? allOptionLabel : matched category.name`)
- [x] 4.3 Render `<DrawerShell title={drawerTitle} open={drawerOpen} onClose=...>` wrapping `<SidebarDrawerNav .../>`, wiring open/close to the hamburger and selection
- [x] 4.4 Confirm desktop `SidebarTabs` path unchanged (header bar + drawer hidden at `≥lg`)

## 5. Page wiring + cleanup

- [x] 5.1 `/discussion`: pass `drawerTitle="Topics"` to `SidebarLayout`
- [x] 5.2 `/management-request` (ManagementRequestForm): pass `drawerTitle="Categories"` to `SidebarLayout`
- [x] 5.3 Delete `src/components/shared/SidebarDropdown.tsx` and remove its import from `SidebarLayout.tsx`
- [x] 5.4 Grep for any remaining `SidebarDropdown` references; ensure none

## 6. Verify

- [ ] 6.1 Mobile (`<lg`): `/discussion` and `/management-request` open the slide-in drawer; All-option + active label + count badges work; selection closes drawer and updates content
- [x] 6.2 Accessibility: focus trap, Escape, scroll-lock, focus restore, reduced motion on both new drawer and account drawer
- [x] 6.3 Desktop (`≥lg`): both pages show `SidebarTabs` only; no header bar/drawer; account page unchanged
