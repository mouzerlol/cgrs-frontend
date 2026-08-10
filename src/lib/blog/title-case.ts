/**
 * Title case for a post title set as typography: the article hero and the cards
 * a post is listed in.
 *
 * These are the places where the title is typeset rather than merely named, and
 * an author typing `test blog`, `TEST BLOG`, or `Test BLOG` in the admin editor
 * should not be able to decide how those lines are set. The stored title is left
 * exactly as typed everywhere it is used as a label — breadcrumbs, metadata,
 * share cards, the admin list — so this changes presentation rather than
 * rewriting the author's copy.
 *
 * The rule is literal: first letter of every word up, the rest of the word down.
 * No small-word exceptions ("of", "the", "and" are capitalised like any other
 * word), because the point is a predictable shape the author cannot fight, and a
 * stop list is a second thing to argue with.
 */

/**
 * Words that are acronyms rather than words, kept as typed.
 *
 * The list is explicit, not inferred from the author's capitalisation — reading
 * "all caps means acronym" would hand the formatting back to whoever typed the
 * title in caps, which is the thing this function exists to prevent.
 */
const ACRONYMS = new Set([
  'AGM',
  'AI',
  'API',
  'CCTV',
  'CGRS',
  'DIY',
  'EV',
  'FAQ',
  'GST',
  'ID',
  'IT',
  'NZ',
  'PDF',
  'Q&A',
  'RSVP',
  'UK',
  'US',
  'USA',
]);

/**
 * A word is a run of letters, digits, apostrophes and ampersands.
 *
 * Everything else — spaces, hyphens, em dashes, slashes, brackets, colons — is a
 * separator, so `well-known` becomes `Well-Known` and `don't` stays `Don't`
 * rather than `Don'T`. Both straight and curly apostrophes count, since the
 * editor produces the curly one.
 */
const WORD = /[\p{L}\p{N}'’&]+/gu;

/** Sets one word: acronyms as listed, otherwise first letter up and the rest down. */
function setWord(word: string): string {
  const upper = word.toUpperCase();
  if (ACRONYMS.has(upper)) return upper;
  return upper.slice(0, 1) + word.slice(1).toLowerCase();
}

/**
 * Returns the title set in title case.
 *
 * Punctuation, spacing and word order are untouched; only the casing of each
 * word changes.
 */
export function toTitleCase(title: string): string {
  return title.replace(WORD, setWord);
}
