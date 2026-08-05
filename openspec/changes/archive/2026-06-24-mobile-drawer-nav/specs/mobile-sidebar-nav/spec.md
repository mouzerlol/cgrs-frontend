## ADDED Requirements

### Requirement: Shared accessible drawer shell

The system SHALL provide a reusable `DrawerShell` component that renders a slide-in-from-left panel for screens below the `lg` (1024px) breakpoint. It SHALL accept `open`, `onClose`, `title`, and `children`, and SHALL encapsulate the overlay, backdrop, animated panel, and accessibility behaviour so all drawer surfaces share one implementation.

#### Scenario: Opening the drawer

- **WHEN** `open` becomes `true`
- **THEN** the backdrop and panel animate in (slide from `x: -100%` to `0`), body scroll is locked, and focus moves into the panel

#### Scenario: Dismissing the drawer

- **WHEN** the user clicks the backdrop, presses Escape, or clicks the close (X) button
- **THEN** `onClose` is invoked, the panel animates out, body scroll is restored, and focus returns to the trigger element

#### Scenario: Focus is trapped while open

- **WHEN** the drawer is open and the user presses Tab or Shift+Tab past the last/first focusable element
- **THEN** focus wraps within the panel and never leaves it

#### Scenario: Auto-close at desktop breakpoint

- **WHEN** the drawer is open and the viewport grows to `≥ lg` (1024px)
- **THEN** the drawer closes and its scroll lock is released, yielding to the persistent desktop sidebar

#### Scenario: Reduced motion

- **WHEN** the user has `prefers-reduced-motion` set
- **THEN** the slide animation is suppressed in favour of a non-motion transition

### Requirement: Account drawer reuses the shell

The system SHALL render `MobileAccountNav` using `DrawerShell` so the account navigation drawer's appearance and behaviour are unchanged while its accessibility logic is single-sourced.

#### Scenario: Account drawer behaviour preserved

- **WHEN** a user opens the account navigation on mobile
- **THEN** the same items, icons, badges, feature-flag gating, navigation-on-select, and dismissal behaviour as before are present, now provided through `DrawerShell`

### Requirement: Category drawer body

The system SHALL provide a `SidebarDrawerNav` body that renders category navigation as a vertical list of rows. Each row SHALL show the category's Iconify icon, its name, an active-state highlight for the selected category, and an optional `count` badge when present. When `showAllOption` is enabled, an "All" row SHALL render first using the provided all-option label and icon.

#### Scenario: Selecting a category

- **WHEN** the user taps a category row in the drawer
- **THEN** `onCategoryChange` is called with that category id and the drawer closes

#### Scenario: Selecting the All option

- **WHEN** `showAllOption` is enabled and the user taps the "All" row
- **THEN** `onCategoryChange` is called with `null` and the drawer closes

#### Scenario: Active highlight

- **WHEN** the drawer renders with a non-null active category
- **THEN** the matching row is visually highlighted as active

### Requirement: Mobile sidebar trigger replaces dropdown

For pages using `SidebarLayout`, the system SHALL replace the legacy `SidebarDropdown` on mobile (`<lg`) with a sticky header bar containing a hamburger control and the active category's label and icon. Activating the control SHALL open the drawer. The desktop `SidebarTabs` sidebar SHALL remain unchanged.

#### Scenario: Header bar shows active context

- **WHEN** the mobile sidebar header bar renders
- **THEN** it displays the active category's name and icon, or the all-option label when the active category is `null`

#### Scenario: Sticky while scrolling

- **WHEN** the user scrolls the content panel
- **THEN** the header bar remains pinned to the top of the panel and reachable

#### Scenario: Opening from the header bar

- **WHEN** the user taps the hamburger control
- **THEN** the `DrawerShell` opens with `SidebarDrawerNav` as its body

#### Scenario: Desktop unaffected

- **WHEN** the viewport is `≥ lg`
- **THEN** the header bar and drawer are hidden and the persistent `SidebarTabs` sidebar is shown

### Requirement: Per-page drawer title

`SidebarLayout` SHALL accept an optional `drawerTitle` prop defaulting to `"Menu"`, used as the drawer and header context label. `/discussion` SHALL pass `"Topics"` and `/management-request` SHALL pass `"Categories"`.

#### Scenario: Default title

- **WHEN** a page renders `SidebarLayout` without `drawerTitle`
- **THEN** the drawer header reads `"Menu"`

#### Scenario: Page-specific title

- **WHEN** `/discussion` or `/management-request` renders
- **THEN** the drawer header reads `"Topics"` or `"Categories"` respectively
