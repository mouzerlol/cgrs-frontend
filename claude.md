# CGRS Frontend - Claude Code Context

## Project Overview
Next.js 15 frontend for the Coronation Gardens Residents Society website (Mangere Bridge, Auckland). Community-focused site with news, events, committee info, and interactive maps.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v3 with custom design system
- **Maps**: Leaflet with react-leaflet patterns
- **Animations**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **UI**: Headless UI, Lucide icons, Iconify

## Commands (via Makefile)
Use `make` commands instead of raw npm/npx:
```bash
make help        # Show all available commands
make install     # Install dependencies
make dev         # Start development server (localhost:3000)
make build       # Build for production
make build_static # Build static site export
make start       # Start production server
make lint        # Run ESLint
make test        # Run Vitest tests
make clean       # Remove .next/ build artifacts
```

## Project Structure
```
src/
├── app/              # Next.js App Router pages
│   ├── layout.tsx    # Root layout with fonts
│   ├── page.tsx      # Home page
│   ├── globals.css   # Global styles + Tailwind
│   └── [route]/      # Route directories (about, contact, news, etc.)
├── components/
│   ├── ui/           # Reusable UI components (Button, Card, etc.)
│   ├── layout/       # Layout components (Header, Footer, etc.)
│   ├── map/          # Map-related components
│   └── sections/     # Page section components
├── data/             # JSON content files (committee, news, events)
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── test/             # Test setup and utilities
└── types/            # TypeScript type definitions
```

## Design System

### Colors (defined in tailwind.config.js)
- **bone**: `#F4F1EA` - Light background
- **forest**: `#1A2218` (default), `#2C3E2D` (light) - Dark greens
- **terracotta**: `#D95D39` (default), `#C74E2E` (dark) - Accent orange
- **sage**: `#A8B5A0` (default), `#E8EDE6` (light) - Muted greens

### Typography
- **Display font**: Fraunces (serif)
- **Body font**: Manrope (sans-serif)
- Use `font-display` and `font-body` Tailwind classes

### Spacing Scale
Custom spacing: `xs` (0.5rem), `sm` (1rem), `md` (1.5rem), `lg` (2.5rem), `xl` (4rem), `2xl` (6rem)

## Key Patterns

### Path Aliases
Use `@/*` for imports from src/:
```typescript
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
```

### Component Conventions
- Use `cn()` utility for conditional class merging (clsx + tailwind-merge)
- Prefer named exports for components
- Co-locate component tests in `__tests__/` directories

### Data Files
Content is in `src/data/` as JSON:
- `committee.json` - Committee members
- `news.json` - News articles
- `events.json` - Community events
- `map-data.ts` - Map markers and boundaries

## Testing
- Run tests: `make test`
- Test files: `*.test.ts` or `*.test.tsx`
- Setup file: `src/test/setup.ts`
- Uses jsdom environment for component tests

## Deployment
- Target: Vercel (static export)
- Build output: `.next/` directory
- Static export available via `make build_static`

## State Management

### Current Approach
- **Server State**: TanStack Query (React Query) for data fetching and caching
- **Client State**: React built-in hooks (useState, useRef, useCallback)
- **No global state library** - not needed for current scope

### When to Add Zustand
Consider adding Zustand (lightweight global state) if implementing:
- User authentication (auth state needed across many components)
- Dark mode / theme switching (persisted preferences)
- Complex multi-step forms (wizard state)
- Notification/toast system (global queue)
- Real-time features (presence, live updates)

### State Management Rules
1. TanStack Query owns "server state" (API data, cached responses)
2. Local state stays local (useState for component-specific UI state)
3. Only add global state when genuinely needed across unrelated components
4. Prefer URL state (query params) for shareable/bookmarkable state

## Important Notes
- Mobile-first design (40% mobile users)
- WCAG 2.1 AA accessibility target
- Touch targets: minimum 44px
- Maps use Leaflet (requires window check for SSR)
