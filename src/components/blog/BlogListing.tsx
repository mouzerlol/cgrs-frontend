'use client';

import { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import type { CategorySummary, PostSummary } from '@/lib/blog/types';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/sections/PageHeader';
import { SiteBreadcrumbs } from '@/components/ui/breadcrumb';
import DrawerShell from '@/components/shared/DrawerShell';
import SidebarDrawerNav from '@/components/shared/SidebarDrawerNav';
import BlogPostCell from './BlogPostCell';
import DuotoneFilter from './DuotoneFilter';
import {
  ALL_CATEGORIES_ICON,
  ALL_CATEGORIES_ICON_NAME,
  categoryIcon,
  categoryIconName,
  categoryLabel,
  inCanonicalOrder,
} from './categories';

interface BlogListingProps {
  posts: PostSummary[];
  /**
   * Categories as the manifest supplies them: only ones with published posts,
   * already ordered by post count then label. The listing renders that order
   * rather than imposing one, so a chip can never filter to nothing.
   */
  categories: CategorySummary[];
}

/** A category slug, or every post. */
type Filter = string;
const ALL: Filter = 'all';

function CategoryChips({
  categories,
  active,
  onChange,
}: {
  categories: CategorySummary[];
  active: Filter;
  onChange: (next: Filter) => void;
}) {
  const options = [{ slug: ALL, label: 'All posts', count: 0 }, ...categories];

  return (
    /*
     * The discussion's filter row, verbatim: white surface, sage hairline,
     * `rounded-xl`, icon then label, terracotta tint when pressed. The two
     * pages sit one click apart in the same nav, and a reader should not have
     * to learn a second control language crossing between them.
     *
     * Two departures, both forced. Opaque fills, because these float on the
     * hero photograph and a translucent surface would hand the label's contrast
     * to whatever is behind it — which is also why the old chips' shadow stays,
     * as it is what separates a white button from a bright patch of sky.
     *
     * And forest, not terracotta, for the pressed state. The forum's pressed
     * chip is terracotta on a terracotta wash, which measures about 3.4:1 —
     * fine there, where it is one control in a row of many and the label
     * repeats on screen. Here the pressed chip is the only thing saying which
     * slice of the archive is on screen, so it has to clear AA on its own.
     */
    <div
      // Desktop only — its caller hides the aside below `lg`, where the same
      // categories are reached through the drawer instead. So it can simply
      // wrap; there is no narrow viewport left for it to squeeze into.
      className="flex flex-wrap justify-end gap-2"
      role="group"
      aria-label="Filter posts by category"
    >
      {options.map((option) => {
        const isActive = option.slug === active;
        const OptionIcon = option.slug === ALL ? ALL_CATEGORIES_ICON : categoryIcon(option.slug);

        return (
          <button
            key={option.slug}
            type="button"
            onClick={() => onChange(option.slug)}
            aria-pressed={isActive}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2.5',
              'rounded-xl border text-sm font-medium text-forest',
              'shadow-[0_2px_10px_rgba(26,34,24,0.18)]',
              'transition-all duration-200',
              'focus:outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/10',
              isActive
                ? 'border-forest bg-forest text-bone'
                : 'border-sage/30 bg-white hover:border-sage'
            )}
          >
            <OptionIcon className="size-4 shrink-0" aria-hidden />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyState({
  activeLabel,
  onClear,
}: {
  /** The active category's label, or null when nothing is filtered. */
  activeLabel: string | null;
  onClear: () => void;
}) {
  const isFiltered = activeLabel !== null;

  return (
    // The cell surface without its hover half: nothing here is a click target.
    <div className="rounded-card border border-sage/40 bg-white/60 px-5 py-16 md:py-24">
      <p className="font-display text-heading-md text-forest">
        {isFiltered ? `Nothing filed under ${activeLabel} yet.` : 'No posts yet.'}
      </p>
      <p className="mt-3 max-w-[48ch] text-forest/70">
        {isFiltered
          ? 'The committee has not published in this category. Another category may have what you are after.'
          : 'The committee has not published anything here yet. Check back after the next meeting.'}
      </p>

      {isFiltered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-8 inline-flex min-h-[44px] items-center rounded-xl border border-forest px-5 text-sm font-medium text-forest transition-colors duration-200 ease-out-custom hover:bg-forest hover:text-bone focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-bone"
        >
          Show all posts
        </button>
      )}
    </div>
  );
}

/**
 * The category picker for narrow screens: a trigger below the breadcrumbs
 * opening the same drawer the discussion uses for its topics.
 *
 * The chips this replaces sat in the hero, above the heading card, and a
 * five-category set spent two rows of the fold there to say something a reader
 * mostly wants once. A trigger states the current filter in one line and keeps
 * the rest behind a tap — and it is the pattern already learned one click away
 * in the same nav.
 */
function MobileCategoryPicker({
  categories,
  active,
  onChange,
}: {
  categories: CategorySummary[];
  active: Filter;
  onChange: (next: Filter) => void;
}) {
  const [open, setOpen] = useState(false);

  const activeCategory = categories.find((category) => category.slug === active);
  const activeLabel = activeCategory?.label ?? 'All posts';
  const activeIcon =
    active === ALL ? ALL_CATEGORIES_ICON_NAME : categoryIconName(active);

  return (
    <div className="container lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={cn(
          'flex w-full min-w-0 items-center gap-sm rounded-xl px-md py-sm',
          'min-h-[56px] bg-forest-light font-body text-base font-medium text-bone',
          'transition-colors duration-[250ms] ease-out-custom hover:bg-forest',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50'
        )}
      >
        <Icon icon="lucide:menu" width={22} height={22} className="shrink-0 text-bone" />
        <Icon icon={activeIcon} width={20} height={20} className="shrink-0 text-sage-light" />
        <span className="min-w-0 flex-1 truncate text-left">{activeLabel}</span>
      </button>

      <DrawerShell
        open={open}
        onClose={() => setOpen(false)}
        title="Categories"
        ariaLabel="Blog categories"
      >
        <SidebarDrawerNav
          categories={categories.map((category) => ({
            id: category.slug,
            name: category.label,
            icon: categoryIconName(category.slug),
            count: category.count,
          }))}
          activeCategory={active === ALL ? null : active}
          onCategoryChange={(id) => onChange(id ?? ALL)}
          showAllOption
          allOptionLabel="All posts"
          allOptionIcon={ALL_CATEGORIES_ICON_NAME}
          onSelect={() => setOpen(false)}
        />
      </DrawerShell>
    </div>
  );
}

export default function BlogListing({ posts, categories: manifestCategories }: BlogListingProps) {
  const [active, setActive] = useState<Filter>(ALL);

  /*
   * The manifest decides *which* categories have posts — a chip that filters to
   * nothing is worse than a missing one. This decides their order and their
   * wording: canonical order so the row does not reshuffle every time something
   * is published, and the vocabulary's label so an edit to it takes effect
   * without republishing every post.
   */
  const categories = useMemo(
    () =>
      inCanonicalOrder(manifestCategories).map((category) => ({
        ...category,
        label: categoryLabel(category.slug, category.label),
      })),
    [manifestCategories]
  );

  // The manifest is already sorted newest-first, so filtering is all that is
  // left to do here — re-sorting would only be a chance to disagree with it.
  const visible = useMemo(
    () => (active === ALL ? posts : posts.filter((post) => post.categorySlug === active)),
    [posts, active]
  );

  const activeLabel = categories.find((category) => category.slug === active)?.label ?? null;

  // One lead, then an index rail two abreast from md. Every following post is
  // the same cell, so the list holds its shape at three posts or thirty.
  const [lead, ...rest] = visible;

  return (
    /*
     * `isolate` so the paper below can sit at `-z-10` — behind the cards and the
     * hero, but still above the page's own bone fill rather than behind it.
     */
    <div className="relative isolate">
      {/*
       * Graph paper as the blog's ground. It used to live on the cards, which
       * made every cell look like a sheet of it; on the page it does the job the
       * texture was ever meant to do — say "this section is long-form" once,
       * quietly, behind everything. Unmasked and dialled back with opacity, so
       * it reads as paper stock rather than as a pattern with an edge.
       */}
      <div
        className="texture-grid-page pointer-events-none absolute inset-0 -z-10 opacity-50"
        aria-hidden="true"
      />

      <DuotoneFilter />

      {/* Same hero as discussion and management-request. The category filter
          floats opposite the card, so it reads as page-level chrome rather than
          as the first row of the list. */}
      <PageHeader
        title="Committee Blog"
        description="Updates, reminders, and notices from the people running the society."
        eyebrow="Updates"
        eyebrowIconKey="newspaper"
        variant="compact"
        backgroundImage="/images/mangere-mountain.jpg"
        showBreadcrumbs={false}
        heroAside={
          categories.length > 1 ? (
            <CategoryChips categories={categories} active={active} onChange={setActive} />
          ) : undefined
        }
        heroAsideClassName="hidden lg:block"
      />

      <SiteBreadcrumbs variant="belowHero" />

      {categories.length > 1 && (
        <MobileCategoryPicker categories={categories} active={active} onChange={setActive} />
      )}

      {/* `pt` on top of whatever the trail brings: the crumbs and the lead card
          were landing near enough to each other to read as one block. */}
      <div className="container pb-24 pt-4 md:pb-32 md:pt-6">
        {visible.length === 0 ? (
          <EmptyState activeLabel={activeLabel} onClear={() => setActive(ALL)} />
        ) : (
          /*
           * Cards on a gutter, not rows on rules. The old grid drew the regions
           * with hairlines and no gaps, which meant an odd tail left a rule
           * running out halfway across the page and every cell had to know its
           * own column to place its vertical line. A surface carries the same
           * separation without any of that bookkeeping, and it is the shape the
           * discussion's thread list already uses.
           */
          /*
           * A sage tray under the whole set. The cards used to float straight
           * on the page's bone paper, which left the list with no outer edge —
           * at two columns it read as loose cards on a table rather than as one
           * archive. The tint gives the group a boundary and pushes the white
           * cells forward off it.
           *
           * Radius is the card's 20px plus the tray's own padding, so the
           * corners stay concentric rather than the outer one looking tighter
           * than the cards it holds.
           */
          <div className="rounded-[1.75rem] bg-sage-light p-4 md:p-6">
            <div className="grid gap-5 md:gap-6">
              <BlogPostCell post={lead} variant="lead" />

              <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
                {rest.map((post) => (
                  <BlogPostCell key={post.slug} post={post} variant="index" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
