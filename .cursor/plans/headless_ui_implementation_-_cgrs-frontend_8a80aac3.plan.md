---
name: Headless UI Implementation - cgrs-frontend
overview: "Implement Headless UI components to improve accessibility and reduce boilerplate code in the cgrs-frontend project. Focus on high-value components: mobile menu dialog, design system tabs, and events filtering."
todos: []
---

# Headless UI Implementation - cgrs-frontend

## Decisions

### Decision 1: Install Headless UI

**Status:** Approved

**Rationale:** The project has manual state management for accessibility-critical components. Headless UI provides:

- Built-in focus trapping
- Keyboard navigation (Arrow keys, Escape, Tab)
- ARIA attribute management
- Reduced boilerplate code
- Pairs well with existing framer-motion installation

### Decision 2: Component Implementation Priority

| Priority | Component | File | Effort |

|----------|-----------|------|--------|

| High | Mobile Menu Dialog | `src/components/layout/Header.tsx` | Medium |

| High | Design System Tabs | `src/app/design-system/page.tsx` | Low |

| Medium | Events Page Tabs | `src/components/events/EventsContent.tsx` | Low |

---

## Implementation Plan

### Phase 1: High Priority (Worth Implementing)

#### 1.1 Install Headless UI

```bash
npm install @headlessui/react
```

#### 1.2 Refactor Mobile Menu - Header.tsx

**Current:** Lines 12-104 implement manual dialog state

**Replacement:** Use Headless UI Dialog component

```tsx
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'

export default function Header() {
  let [isOpen, setIsOpen] = useState(true)  // rename from isMenuOpen

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1000]" onClose={() => setIsOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-xs transform bg-forest/[0.98] backdrop-blur-xl p-8 transition-all">
                {/* Navigation items here - focus trap automatic */}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

**Benefits:**

- Remove ~40 lines of manual state management
- Automatic focus trap on open
- Escape key closes dialog
- Click outside closes dialog
- Built-in accessibility

#### 1.3 Refactor Design System Navigation - design-system/page.tsx

**Current:** Lines 71-138 use manual IntersectionObserver for active state

**Replacement:** Use Headless UI Tabs

```tsx
import { Tab } from '@headlessui/react'

export default function DesignSystemPage() {
  return (
    <Tab.Group>
      <Tab.List className="flex gap-2">
        {sections.map((section) => (
          <Tab key={section.id} className={({ selected }) =>
            `px-3 py-1.5 text-sm rounded transition-colors ${
              selected ? 'bg-bone/10 text-bone' : 'text-bone/60 hover:text-bone'
            }`
          }>
            {section.label}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels>
        {/* Content panels switch automatically */}
      </Tab.Panels>
    </Tab.Group>
  )
}
```

**Benefits:**

- Remove manual IntersectionObserver setup (lines 74-91)
- Keyboard navigation (arrow keys)
- Automatic active state
- Built-in focus management

---

### Phase 2: Medium Priority (Nice to Have)

#### 2.1 Add Accordion Component for FAQ

**File:** `src/components/ui/Accordion.tsx`

```tsx
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'

interface AccordionItem {
  title: string
  content: React.ReactNode
}

export function Accordion({ items }: { items: AccordionItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <Disclosure key={i}>
          <DisclosureButton className="flex w-full justify-between px-4 py-3 bg-sage-light rounded-lg text-left">
            {item.title}
            <span className="transition-transform ui-open:rotate-180">▼</span>
          </DisclosureButton>
          <DisclosurePanel className="px-4 py-3">{item.content}</DisclosurePanel>
        </Disclosure>
      ))}
    </div>
  )
}
```

**Usage:** Guidelines FAQ section, expandable details on About page

#### 2.2 Add Dropdown Menu Component

**File:** `src/components/ui/Dropdown.tsx`

```tsx
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'

interface DropdownItem {
  label: string
  onClick?: () => void
  href?: string
}

export function Dropdown({ trigger, items }: { trigger: React.ReactNode, items: DropdownItem[] }) {
  return (
    <Menu as="div" className="relative">
      <MenuButton>{trigger}</MenuButton>
      <MenuItems className="absolute right-0 mt-2 w-48 bg-white border border-sage/20 rounded-lg shadow-lg">
        {items.map((item, i) => (
          <MenuItem key={i}>
            {({ focus }) => (
              <a href={item.href} className={`block px-4 py-2 ${focus ? 'bg-sage-light' : ''}`}>
                {item.label}
              </a>
            )}
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>
  )
}
```

**Usage:** Future user account menu, settings dropdown

#### 2.3 Add Switch Component

**File:** `src/components/ui/Switch.tsx`

```tsx
import { Switch as HeadlessSwitch } from '@headlessui/react'

interface SwitchProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      className={`${checked ? 'bg-terracotta' : 'bg-sage'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
    >
      <span className={`${checked ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
    </HeadlessSwitch>
  )
}
```

**Usage:** Future settings (email preferences, notifications)

#### 2.4 Add Modal Component

**File:** `src/components/ui/Modal.tsx`

```tsx
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  return (
    <Transition show={isOpen}>
      <Dialog onClose={onClose} className="relative z-50">
        <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/25" />
        </TransitionChild>
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <TransitionChild enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <DialogPanel className="bg-white rounded-2xl p-6 max-w-md w-full">
              <DialogTitle className="font-display text-xl font-medium mb-4">{title}</DialogTitle>
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  )
}
```

**Usage:** Image lightboxes, confirmation dialogs

---

## File Changes Summary

| File | Action | Lines Changed |

|------|--------|---------------|

| `package.json` | Add dependency | +1 |

| `src/components/layout/Header.tsx` | Refactor with Dialog | -40, +25 |

| `src/app/design-system/page.tsx` | Refactor with Tabs | -25, +15 |

| `src/components/events/EventsContent.tsx` | Add Tabs | +20 |

| `src/components/ui/Accordion.tsx` | New file | +30 |

| `src/components/ui/Dropdown.tsx` | New file | +35 |

| `src/components/ui/Switch.tsx` | New file | +25 |

| `src/components/ui/Modal.tsx` | New file | +40 |

---

## Testing Checklist

- [ ] Mobile menu opens/closes on button click
- [ ] Escape key closes mobile menu
- [ ] Click outside closes mobile menu
- [ ] Focus is trapped within mobile menu
- [ ] Keyboard navigation works in design system tabs
- [ ] Design system sections switch on tab click
- [ ] Existing navigation links still work
- [ ] Accessibility: Run aXe audit
- [ ] Visual regression: Check mobile menu animations