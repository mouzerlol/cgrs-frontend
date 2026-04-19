import { describe, it, expect } from 'vitest';
import { sortDiscussionCategoriesByName } from '../discussion-category-order';

describe('sortDiscussionCategoriesByName', () => {
  it('orders by name case-insensitively', () => {
    const input = [
      { slug: 'z', name: 'Zebra' },
      { slug: 'a', name: 'apples' },
      { slug: 'm', name: 'Middle' },
    ];
    expect(sortDiscussionCategoriesByName(input).map((c) => c.slug)).toEqual(['a', 'm', 'z']);
  });

  it('does not mutate the original array', () => {
    const input = [{ name: 'B' }, { name: 'A' }];
    sortDiscussionCategoriesByName(input);
    expect(input[0].name).toBe('B');
  });
});
