import { describe, expect, it } from 'vitest';
import {
  BLOG_CATEGORIES,
  categoryIcon,
  categoryIconName,
  categoryLabel,
  inCanonicalOrder,
} from '../categories';

describe('the category vocabulary', () => {
  /**
   * Pinned, and paired with the API's own list.
   *
   * The two are duplicated on purpose — the API owns which slugs it will accept,
   * this file owns their order, labels, and glyphs — so this is what makes a
   * change to one without the other fail rather than produce a category the API
   * rejects or one nothing can draw. Its pair is
   * `test_the_vocabulary_is_exactly_these_seven` in
   * `cgrs-api/tests/test_blog_validation.py`.
   */
  it('is exactly these seven slugs', () => {
    expect([...BLOG_CATEGORIES].map((category) => category.slug).sort()).toEqual([
      'community',
      'governance',
      'living-here',
      'maintenance',
      'notices',
      'safety',
      'website-updates',
    ]);
  });

  it('gives every category a label and a glyph', () => {
    for (const category of BLOG_CATEGORIES) {
      expect(category.label.length).toBeGreaterThan(0);
      expect(category.icon).toBeTypeOf('object');
      expect(category.iconName.startsWith('lucide:')).toBe(true);
    }
  });

  it('resolves a label from the vocabulary rather than the manifest', () => {
    expect(categoryLabel('maintenance', 'Whatever the bucket said')).toBe('Maintenance & Grounds');
  });

  it('falls back to the supplied label for a slug outside the vocabulary', () => {
    expect(categoryLabel('working-bees', 'Working Bees')).toBe('Working Bees');
  });

  it('still draws a retired category, because a stale manifest will ask for one', () => {
    expect(categoryIconName('events')).toBe('lucide:calendar-days');
    expect(categoryIcon('events')).toBeDefined();
  });

  it('falls back rather than failing on a category it has never seen', () => {
    expect(categoryIconName('invented')).toBe('lucide:newspaper');
  });
});

describe('canonical ordering', () => {
  it('orders the chip row by the vocabulary, not by post count', () => {
    const fromManifest = [
      { slug: 'community', count: 9 },
      { slug: 'notices', count: 1 },
      { slug: 'governance', count: 4 },
    ];

    expect(inCanonicalOrder(fromManifest).map((category) => category.slug)).toEqual([
      'notices',
      'governance',
      'community',
    ]);
  });

  it('keeps categories outside the vocabulary rather than dropping them, at the end', () => {
    const fromStaleManifest = [{ slug: 'events', count: 2 }, { slug: 'safety', count: 1 }];

    expect(inCanonicalOrder(fromStaleManifest).map((category) => category.slug)).toEqual([
      'safety',
      'events',
    ]);
  });

  it('does not mutate what it is given', () => {
    const original = [{ slug: 'community' }, { slug: 'notices' }];

    inCanonicalOrder(original);

    expect(original.map((category) => category.slug)).toEqual(['community', 'notices']);
  });
});
