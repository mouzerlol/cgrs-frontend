/**
 * Sort discussion categories alphabetically by display name (case- and accent-insensitive).
 * Returns a new array; does not mutate the input.
 */
export function sortDiscussionCategoriesByName<T extends { name: string }>(categories: readonly T[]): T[] {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}
