'use client';

/**
 * Nav Identity Card experiments.
 *
 * Twelve production-realistic ways to lift the account identity (avatar, name,
 * role) out of the page-top ProfileHero and into a card pinned to the TOP of the
 * left account nav rail, reclaiming vertical page space.
 *
 * Each variant is shown in context: the real dark `forest-light` folder-tab rail
 * with live nav buttons beneath, a stubbed content panel to the right, plus the
 * mobile treatment (identity chip on the menu trigger + full card atop the open
 * drawer). Nothing here is wired to production; it lives in /design-experiments
 * so winners can be picked and iterated before touching ProfileSideNav.
 */

import type { LucideIcon } from 'lucide-react';
import { Bookmark, Building2, ChevronRight, Menu, ShieldCheck, User } from 'lucide-react';
import { cn } from '@/lib/utils';

/** One sample identity used across every variant so they compare fairly. */
const USER = {
  name: 'Marcus Holloway',
  role: 'Owner-Occupier',
  initials: 'MH',
};

// --- Shared building blocks ------------------------------------------------

type Tone = 'forest' | 'terracotta' | 'sage' | 'bone-outline';
type Radius = 'full' | 'lg' | 'square';

const TONE_CLASS: Record<Tone, string> = {
  forest: 'bg-forest text-bone',
  terracotta: 'bg-terracotta text-bone',
  sage: 'bg-sage-light text-forest',
  'bone-outline': 'border border-bone/30 bg-bone/[0.06] text-bone',
};

const RADIUS_CLASS: Record<Radius, string> = {
  full: 'rounded-full',
  lg: 'rounded-lg',
  square: 'rounded-none',
};

function Initials({
  size = 44,
  tone = 'forest',
  radius = 'full',
  ring = false,
}: {
  size?: number;
  tone?: Tone;
  radius?: Radius;
  ring?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={cn(
        'inline-flex shrink-0 items-center justify-center font-display font-medium leading-none',
        TONE_CLASS[tone],
        RADIUS_CLASS[radius],
        ring && 'ring-2 ring-bone/15',
      )}
    >
      {USER.initials}
    </span>
  );
}

/** Faithful copy of the four leading rows from the real ProfileSideNav. */
const NAV: Array<{ icon: LucideIcon; label: string; active?: boolean; pending?: boolean }> = [
  { icon: User, label: 'Profile Details', active: true },
  { icon: Building2, label: 'My Property' },
  { icon: Bookmark, label: 'Bookmarks' },
  { icon: ShieldCheck, label: 'Verification', pending: true },
];

function NavButtons({ mobile = false }: { mobile?: boolean }) {
  return (
    <ul className="flex flex-col gap-1">
      {NAV.map(({ icon: Icon, label, active, pending }) => (
        <li key={label}>
          <span
            className={cn(
              'group flex w-full items-center border border-bone/[0.12]',
              mobile ? 'rounded-xl' : 'rounded-l-xl border-r-0',
              'gap-sm px-md py-3 min-h-[48px] text-[0.875rem]',
              'bg-bone/[0.08] font-body font-medium text-bone',
              active && 'bg-sage-light font-semibold text-forest',
            )}
          >
            <span
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
                active ? 'bg-terracotta text-bone' : 'bg-bone/[0.12] text-sage-light',
              )}
            >
              <Icon className="h-4 w-4" aria-hidden strokeWidth={2} />
            </span>
            <span className="flex-1 leading-snug">{label}</span>
            {pending && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-terracotta text-[9px] font-bold text-bone shrink-0">
                <span aria-hidden="true">!</span>
              </span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ContentStub() {
  return (
    <div className="hidden min-w-[180px] flex-1 rounded-r-2xl bg-sage-light p-5 sm:block">
      <div className="h-3 w-28 rounded bg-forest/15" />
      <div className="mt-4 space-y-2.5">
        <div className="h-2.5 w-full rounded bg-forest/10" />
        <div className="h-2.5 w-5/6 rounded bg-forest/10" />
        <div className="h-2.5 w-2/3 rounded bg-forest/10" />
      </div>
      <div className="mt-6 h-16 rounded-xl border border-forest/10 bg-white/40" />
    </div>
  );
}

/** Default mobile trigger: identity chip (avatar + name) that opens the drawer. */
function DefaultTrigger() {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-forest-light px-3 py-2.5 text-bone">
      <Initials size={26} tone="sage" />
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{USER.name}</span>
      <Menu className="h-4 w-4 shrink-0 text-bone/70" aria-hidden />
    </div>
  );
}

function Phone({ Card, Trigger }: Pick<Variant, 'Card' | 'Trigger'>) {
  const TriggerEl = Trigger ?? DefaultTrigger;
  return (
    <div className="flex flex-wrap gap-4">
      <div className="w-[152px]">
        <p className="mb-2 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-forest/40">
          Collapsed
        </p>
        <div className="rounded-[26px] border border-sage/30 bg-bone p-2.5">
          <TriggerEl />
          {/* Faux page content sitting where the ProfileHero used to be. */}
          <div className="mt-2.5 space-y-2 px-0.5 pb-1">
            <div className="h-2 w-3/4 rounded bg-forest/12" />
            <div className="h-2 w-full rounded bg-forest/10" />
            <div className="h-2 w-5/6 rounded bg-forest/10" />
            <div className="h-10 rounded-lg border border-sage/30 bg-white" />
          </div>
        </div>
      </div>
      <div className="w-[172px]">
        <p className="mb-2 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-forest/40">
          Drawer open
        </p>
        <div className="rounded-[26px] border border-forest/30 bg-forest-light p-2.5">
          <Card mobile />
          <NavButtons mobile />
        </div>
      </div>
    </div>
  );
}

// --- The twelve variants ---------------------------------------------------

interface Variant {
  id: string;
  label: string;
  note: string;
  Card: (props: { mobile?: boolean }) => React.ReactNode;
  Trigger?: () => React.ReactNode;
}

const NAME = USER.name;
const ROLE = USER.role;

const VARIANTS: Variant[] = [
  {
    id: 'horizontal-classic',
    label: 'Horizontal classic',
    note: 'Safe default. Avatar left, name and role stacked beside it, a hairline rule separating identity from the nav below.',
    Card: () => (
      <div className="mb-3 flex items-center gap-3 border-b border-bone/15 pb-4">
        <Initials size={44} tone="forest" ring />
        <div className="min-w-0">
          <p className="truncate font-display text-[0.95rem] leading-tight text-bone" title={NAME}>
            {NAME}
          </p>
          <p className="mt-0.5 text-[0.6875rem] uppercase tracking-[0.12em] text-sage-light">{ROLE}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'centered-masthead',
    label: 'Centered masthead',
    note: 'Most identity presence, tallest option. Role rendered as the rail’s single terracotta accent badge.',
    Card: () => (
      <div className="mb-3 flex flex-col items-center border-b border-bone/15 pb-5 text-center">
        <Initials size={56} tone="forest" ring />
        <p className="mt-3 font-display text-base text-bone">{NAME}</p>
        <span className="mt-2 rounded-md bg-terracotta px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-bone">
          {ROLE}
        </span>
      </div>
    ),
  },
  {
    id: 'role-pill-right',
    label: 'Inline, role pill right',
    note: 'Single row. Name flexes, role sits as an outline pill pushed to the far edge. Compact, reads left-to-right.',
    Card: () => (
      <div className="mb-3 flex items-center gap-2.5 border-b border-bone/15 pb-4">
        <Initials size={38} tone="sage" />
        <p className="min-w-0 flex-1 truncate font-display text-[0.9rem] text-bone" title={NAME}>
          {NAME}
        </p>
        <span className="shrink-0 whitespace-nowrap rounded-full border border-bone/25 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-sage-light">
          Owner
        </span>
      </div>
    ),
  },
  {
    id: 'compact-chip',
    label: 'Compact chip',
    note: 'Tightest footprint, maximum space reclaimed. Sans-serif name, mono role, no divider, small avatar.',
    Card: () => (
      <div className="mb-2 flex items-center gap-2.5 pb-3">
        <Initials size={32} tone="forest" />
        <div className="min-w-0">
          <p className="truncate font-body text-[0.8125rem] font-semibold leading-tight text-bone" title={NAME}>
            {NAME}
          </p>
          <p className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-sage-light/80">{ROLE}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'unified-item-zero',
    label: 'Unified item zero',
    note: 'Identity wears the same surface and icon-plate as the nav buttons, reading as a non-interactive “item zero”. Cohesive, low contrast between who and where.',
    Card: ({ mobile }) => (
      <div
        className={cn(
          'mb-1 flex items-center gap-sm border border-bone/[0.12] bg-bone/[0.08] px-md py-3',
          mobile ? 'rounded-xl' : 'rounded-l-xl border-r-0',
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-terracotta font-display text-sm text-bone">
          {USER.initials}
        </span>
        <div className="min-w-0">
          <p className="truncate font-body text-[0.875rem] font-medium text-bone" title={NAME}>
            {NAME}
          </p>
          <p className="text-[0.625rem] uppercase tracking-[0.1em] text-sage-light">{ROLE}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'monogram-wrap',
    label: 'Sage monogram, wrapping',
    note: 'Larger sage monogram; the name is allowed to wrap to two lines rather than truncate. Warmer, more editorial than the forest plate.',
    Card: () => (
      <div className="mb-3 flex items-center gap-3 border-b border-bone/15 pb-4">
        <Initials size={52} tone="sage" />
        <div className="min-w-0">
          <p className="font-display text-[0.95rem] leading-tight text-bone">{NAME}</p>
          <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.12em] text-sage-light/90">{ROLE}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'eyebrow-signed-in',
    label: 'Editorial eyebrow',
    note: 'Publication framing: a terracotta “Signed in as” eyebrow states context above the identity, per the eyebrow-and-title pairing rule.',
    Card: () => (
      <div className="mb-3 border-b border-bone/15 pb-4">
        <p className="mb-2 text-[0.5625rem] font-semibold uppercase tracking-[0.18em] text-terracotta/90">
          Signed in as
        </p>
        <div className="flex items-center gap-3">
          <Initials size={40} tone="forest" />
          <div className="min-w-0">
            <p className="truncate font-display text-[0.95rem] text-bone" title={NAME}>
              {NAME}
            </p>
            <p className="text-[0.6875rem] uppercase tracking-[0.12em] text-sage-light">{ROLE}</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'bordered-set-apart',
    label: 'Bordered, set apart',
    note: 'Identity as its own bordered card, separated from the nav by a clear gap. Strongest split between “who” and “where”.',
    Card: ({ mobile }) => (
      <div
        className={cn(
          'mb-4 border border-bone/15 bg-bone/[0.05] p-3',
          mobile ? 'rounded-xl' : 'rounded-xl',
        )}
      >
        <div className="flex items-center gap-3">
          <Initials size={42} tone="forest" ring />
          <div className="min-w-0">
            <p className="truncate font-display text-[0.9rem] text-bone" title={NAME}>
              {NAME}
            </p>
            <p className="text-[0.625rem] uppercase tracking-[0.12em] text-sage-light">{ROLE}</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'role-forward',
    label: 'Role-forward',
    note: 'Status reads first: role badge on top, name as the headline beneath, avatar demoted to a corner token. For when the role matters more than the face.',
    Card: () => (
      <div className="mb-3 border-b border-bone/15 pb-4">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-md bg-terracotta px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-bone">
            {ROLE}
          </span>
          <Initials size={34} tone="sage" />
        </div>
        <p className="mt-3 font-display text-lg leading-tight text-bone">{NAME}</p>
      </div>
    ),
  },
  {
    id: 'portrait-calm',
    label: 'Portrait, calm',
    note: 'Large centered avatar, role as a quiet caption, no accent colour. The calmest of the centered options.',
    Card: () => (
      <div className="mb-3 flex flex-col items-center border-b border-bone/15 pb-5 text-center">
        <Initials size={64} tone="forest" ring />
        <p className="mt-3 font-display text-[0.95rem] text-bone">{NAME}</p>
        <p className="mt-1 text-[0.625rem] uppercase tracking-[0.14em] text-sage-light">{ROLE}</p>
      </div>
    ),
  },
  {
    id: 'account-row',
    label: 'Account row (interactive)',
    note: 'A tappable account row in the Linear / Things idiom; the chevron hints at profile or settings. The only interactive identity option here.',
    Card: ({ mobile }) => (
      <button
        type="button"
        className={cn(
          'group mb-3 flex w-full items-center gap-3 rounded-xl border border-bone/[0.12] bg-bone/[0.08] px-3 py-2.5 text-left',
          'transition-colors duration-200 hover:bg-bone/[0.14]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-terracotta',
          mobile && 'rounded-xl',
        )}
      >
        <Initials size={36} tone="forest" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-body text-[0.8125rem] font-semibold text-bone" title={NAME}>
            {NAME}
          </p>
          <p className="text-[0.625rem] uppercase tracking-[0.1em] text-sage-light/80">{ROLE}</p>
        </div>
        <ChevronRight
          className="h-4 w-4 shrink-0 text-bone/50 transition-colors group-hover:text-bone/80"
          aria-hidden
        />
      </button>
    ),
  },
  {
    id: 'square-record',
    label: 'Square record plate',
    note: 'Management-identity take: square card, square avatar plate, mono role in amber. Reads as a filed ID, matching the square account tabs. Intentionally breaks the round-avatar convention.',
    Card: () => (
      <div className="mb-4 border border-bone/15 bg-bone/[0.05] p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-forest font-display text-base text-bone">
            {USER.initials}
          </span>
          <div className="min-w-0">
            <p className="truncate font-body text-[0.875rem] font-semibold text-bone" title={NAME}>
              {NAME}
            </p>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.1em] text-amber">{ROLE}</p>
          </div>
        </div>
      </div>
    ),
  },
];

// --- Showcase --------------------------------------------------------------

function VariantCell({ variant, index }: { variant: Variant; index: number }) {
  const { label, note, Card, Trigger } = variant;
  return (
    <section className="rounded-2xl border border-sage/20 bg-white p-6 shadow-[0_8px_22px_rgba(26,34,24,0.06)]">
      <div className="mb-1.5 flex items-baseline gap-3">
        <span className="font-mono text-[0.6875rem] tracking-[0.15em] text-forest/40">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className="font-display text-xl text-forest">{label}</h3>
      </div>
      <p className="mb-6 max-w-[64ch] text-sm leading-relaxed text-forest/60">{note}</p>

      <div className="flex flex-wrap items-start gap-x-12 gap-y-8">
        <div>
          <p className="mb-3 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-forest/40">
            Desktop rail
          </p>
          <div className="flex">
            <div className="flex w-64 flex-col rounded-l-2xl bg-forest-light p-md">
              <Card />
              <NavButtons />
            </div>
            <ContentStub />
          </div>
        </div>

        <div>
          <p className="mb-3 font-mono text-[0.5625rem] uppercase tracking-[0.15em] text-forest/40">
            Mobile
          </p>
          <Phone Card={Card} Trigger={Trigger} />
        </div>
      </div>
    </section>
  );
}

export default function NavCardExperiments() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-sage/20 bg-white p-6">
        <div className="mb-3 flex items-center gap-3">
          <h2 className="font-display text-2xl text-forest">Nav Identity Card</h2>
          <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sage-light text-forest">
            Exploration
          </span>
        </div>
        <p className="max-w-[68ch] text-sm leading-relaxed text-forest/70">
          Twelve ways to lift the account identity (avatar, name, role) out of the page-top header
          and into a card pinned to the top of the left nav rail, reclaiming the vertical space the
          ProfileHero now occupies. Each variant is shown in context: the real dark rail with live
          nav buttons, plus its mobile treatment, an identity chip on the menu trigger and the full
          card atop the open drawer.
        </p>
        <p className="mt-3 font-mono text-[0.6875rem] text-forest/50">
          Sample identity: {USER.name} · {USER.role}. Initials plate stands in for a real avatar.
        </p>
      </div>

      {VARIANTS.map((variant, index) => (
        <VariantCell key={variant.id} variant={variant} index={index} />
      ))}
    </div>
  );
}
