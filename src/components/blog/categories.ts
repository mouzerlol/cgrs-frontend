import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  Landmark,
  LayoutGrid,
  Megaphone,
  Monitor,
  Newspaper,
  Scale,
  ShieldCheck,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/**
 * The category vocabulary.
 *
 * Categories used to be free text, which meant this file could only own glyphs —
 * *which* categories existed was whatever authors had typed, and the manifest
 * carried both the list and its order. That let `test-category` reach production
 * and left no way to promise a category would be drawn with anything.
 *
 * The vocabulary is closed now and this file is its canonical form: the seven
 * slugs, their labels, their glyphs, and the order they appear in. The API holds
 * the same seven slugs in `modules/blog/categories.py` and refuses anything else —
 * a frontend list cannot enforce what a direct API call can bypass. The two are
 * pinned by a test on each side rather than derived from one another, because
 * deriving would couple two services that are otherwise independent, for seven
 * strings.
 *
 * The manifest still carries a label per category, but it is a fallback: posts
 * are rendered by slug through this list, so a label edited here takes effect
 * without republishing anything.
 */

export interface BlogCategory {
  slug: string;
  label: string;
  icon: LucideIcon;
  iconName: string;
}

/**
 * Canonical order — which is also the order the chip row renders in.
 *
 * Ordered by how often the society writes under each, roughly, rather than by
 * live post count. Count ordering reshuffled the row every time something was
 * published, so the chip a reader had learned the position of moved.
 */
export const BLOG_CATEGORIES: readonly BlogCategory[] = [
  { slug: 'notices', label: 'Notices', icon: Megaphone, iconName: 'lucide:megaphone' },
  { slug: 'governance', label: 'Governance', icon: Landmark, iconName: 'lucide:landmark' },
  {
    slug: 'maintenance',
    label: 'Maintenance & Grounds',
    icon: Wrench,
    iconName: 'lucide:wrench',
  },
  { slug: 'safety', label: 'Safety & Security', icon: ShieldCheck, iconName: 'lucide:shield-check' },
  { slug: 'community', label: 'Community', icon: Users, iconName: 'lucide:users' },
  { slug: 'living-here', label: 'Living Here', icon: GraduationCap, iconName: 'lucide:graduation-cap' },
  // Last: a meta category about the site itself rather than about the place,
  // and the lowest-volume of the seven.
  { slug: 'website-updates', label: 'Website Updates', icon: Monitor, iconName: 'lucide:monitor' },
];

const BY_SLUG: ReadonlyMap<string, BlogCategory> = new Map(
  BLOG_CATEGORIES.map((category) => [category.slug, category]),
);

/**
 * Glyphs for categories that no longer exist.
 *
 * Every post was migrated off these, so nothing published should carry one. They
 * are kept because a bucket is not a database: a reader holding a manifest
 * written before the migration will ask for them, and drawing the right glyph
 * costs less than the blank one would.
 */
const RETIRED_ICONS: Record<string, { icon: LucideIcon; iconName: string }> = {
  general: { icon: Newspaper, iconName: 'lucide:newspaper' },
  updates: { icon: Newspaper, iconName: 'lucide:newspaper' },
  policy: { icon: Scale, iconName: 'lucide:scale' },
  events: { icon: CalendarDays, iconName: 'lucide:calendar-days' },
  guidelines: { icon: BookOpen, iconName: 'lucide:book-open' },
};

export const ALL_CATEGORIES_ICON: LucideIcon = LayoutGrid;
export const ALL_CATEGORIES_ICON_NAME = 'lucide:layout-grid';

export function categoryIcon(slug: string): LucideIcon {
  return BY_SLUG.get(slug)?.icon ?? RETIRED_ICONS[slug]?.icon ?? Newspaper;
}

/**
 * The same glyphs as Iconify names, for the shared drawer nav — it renders icons
 * by name rather than by component, since its other caller gets them from the
 * API as strings.
 */
export function categoryIconName(slug: string): string {
  return BY_SLUG.get(slug)?.iconName ?? RETIRED_ICONS[slug]?.iconName ?? 'lucide:newspaper';
}

/** The vocabulary's label for a slug, or the supplied fallback for one outside it. */
export function categoryLabel(slug: string, fallback = ''): string {
  return BY_SLUG.get(slug)?.label ?? fallback;
}

/**
 * Sort manifest-derived categories into canonical order.
 *
 * Categories outside the vocabulary keep their relative order and go last, so a
 * manifest written before the migration still renders rather than losing chips.
 */
export function inCanonicalOrder<T extends { slug: string }>(categories: readonly T[]): T[] {
  const rank = new Map(BLOG_CATEGORIES.map((category, index) => [category.slug, index]));
  return [...categories].sort(
    (a, b) => (rank.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (rank.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );
}
