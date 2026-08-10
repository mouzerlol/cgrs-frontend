/**
 * Sync label resolution for breadcrumb dynamic URL segments (JSON-backed routes).
 */

import eventsData from '@/data/events.json';
import portfoliosData from '@/data/portfolios.json';
import boardsData from '@/data/boards.json';
import type { Event } from '@/types';

/** A slug read back as words, for a leaf whose real title is not to hand. */
function deslug(value: string): string {
  return value.replace(/-/g, ' ').replace(/^./, (character) => character.toUpperCase());
}

/** Shorten opaque IDs when no friendly title exists. */
function shortId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

export type DynamicLabelKind = 'blog' | 'calendar' | 'thread' | 'board' | 'portfolio' | 'request';

/**
 * Resolve a human-readable label for a dynamic path segment (sync; JSON data only).
 */
export function resolveDynamicLabel(kind: DynamicLabelKind, value: string): string {
  // Blog titles live in the published manifest, which is fetched on the server —
  // there is nothing to look up synchronously here, and reaching for one would
  // put an API call on a public page. The article page knows its own title and
  // passes it as `leafLabel`; this is only what a link to a post rendered
  // somewhere else falls back to.
  if (kind === 'blog') {
    return deslug(value);
  }
  if (kind === 'calendar') {
    const events = eventsData.events as Event[];
    return events.find((e) => e.slug === value)?.title ?? value;
  }
  if (kind === 'portfolio') {
    const p = portfoliosData.portfolios.find((x: { id: string }) => x.id === value);
    return (p as { name?: string } | undefined)?.name ?? shortId(value);
  }
  if (kind === 'board') {
    const b = boardsData.boards.find((x: { id: string }) => x.id === value);
    return (b as { name?: string } | undefined)?.name ?? shortId(value);
  }
  // Thread titles live behind the authed API, not sync JSON. A plain "Thread" leaf reads
  // better than a truncated UUID and stays meaningful on a narrow breadcrumb strip.
  if (kind === 'thread') {
    return 'Thread';
  }
  return shortId(value);
}
