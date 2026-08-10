'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * A reader's own mark on an article: saved.
 *
 * On this device only, and deliberately so for now. The public blog's read path
 * is the R2 bucket — no Cloud Run, no database — so a bookmark is something this
 * browser remembers rather than something the site holds.
 *
 * A vote used to live here beside it, and that is exactly the mark the same fact
 * ruled out: with nothing on the server to record against, an upvote was a
 * gesture the reader made to themselves, and a count the site could never state.
 * A bookmark is still useful under that constraint — it is for the reader, and
 * they are the one who reads it back. Both the control and its store are gone.
 *
 * The shape here is what an API would replace. `useArticleEngagement` returns
 * state plus a toggle; swapping `localStorage` for a mutation hook later changes
 * this file and nothing that renders.
 */

const BOOKMARKS_KEY = 'cgrs.blog.bookmarks';

/**
 * Fired on every write, because the `storage` event only reaches *other* tabs.
 * Two components reading the same slug in one document — the rail's toolbar at
 * `xl` and the hero card's below it — have to agree, and they only will if a
 * write in one is heard by the other.
 */
const CHANGED = 'cgrs:blog-engagement';

function read(key: string): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    // A corrupt or unavailable store is an empty one. Private-mode Safari
    // throws on read as readily as on write, and neither is worth a crash over
    // a bookmark.
    return new Set();
  }
}

function write(key: string, slugs: Set<string>): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(Array.from(slugs)));
  } catch {
    // Quota or private mode: the toggle still shows in this session's state,
    // it just will not outlive the tab.
  }
  window.dispatchEvent(new Event(CHANGED));
}

function toggle(key: string, slug: string): boolean {
  const slugs = read(key);
  const next = !slugs.has(slug);
  if (next) slugs.add(slug);
  else slugs.delete(slug);
  write(key, slugs);
  return next;
}

export interface ArticleEngagement {
  isBookmarked: boolean;
  toggleBookmark: () => void;
}

export function useArticleEngagement(slug: string): ArticleEngagement {
  /*
   * Starts false and is corrected after mount rather than read during render.
   * The article is prerendered — the server has no idea what this reader has
   * saved — so reading storage in the initial state is a hydration mismatch
   * waiting for the first reader who has.
   */
  const [isBookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    const sync = () => {
      setBookmarked(read(BOOKMARKS_KEY).has(slug));
    };

    sync();
    window.addEventListener(CHANGED, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(CHANGED, sync);
      window.removeEventListener('storage', sync);
    };
  }, [slug]);

  const toggleBookmark = useCallback(() => {
    setBookmarked(toggle(BOOKMARKS_KEY, slug));
  }, [slug]);

  return { isBookmarked, toggleBookmark };
}
