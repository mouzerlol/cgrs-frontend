/**
 * Sync label resolution for breadcrumb dynamic URL segments (JSON-backed routes).
 */

import newsData from '@/data/news.json';
import eventsData from '@/data/events.json';
import portfoliosData from '@/data/portfolios.json';
import boardsData from '@/data/boards.json';
import type { NewsArticle, Event } from '@/types';

/** Shorten opaque IDs when no friendly title exists. */
function shortId(value: string): string {
  return value.length > 12 ? `${value.slice(0, 12)}…` : value;
}

export type DynamicLabelKind = 'blog' | 'calendar' | 'thread' | 'board' | 'portfolio' | 'request';

/**
 * Resolve a human-readable label for a dynamic path segment (sync; JSON data only).
 */
export function resolveDynamicLabel(kind: DynamicLabelKind, value: string): string {
  if (kind === 'blog') {
    const articles = newsData.articles as NewsArticle[];
    return articles.find((a) => a.slug === value)?.title ?? value;
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
  return shortId(value);
}
