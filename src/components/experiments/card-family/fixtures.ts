import type { PostSummary } from '@/lib/blog/types';

/**
 * Four posts, chosen to break the layouts rather than flatter them.
 *
 * - `verge-mowing`  the easy case: short title, one-line excerpt.
 * - `footpath`      the wrap case: a title that runs to three lines in a narrow
 *                   cell, and an excerpt long enough to hit every clamp.
 * - `february`      the missing-image case, which is the only cell that ever
 *                   runs as text.
 * - `garden-beds`   the ordinary case, used where a variant needs a second
 *                   plated cell to show rhythm.
 *
 * Imagery is served from `public/`, so this page has no remote host and no
 * manifest dependency: it renders identically with the API down.
 */
export const LAB_POSTS: PostSummary[] = [
  {
    slug: 'verge-mowing-resumes',
    title: 'Verge mowing resumes in March',
    excerpt:
      'The contractor is back on a three-weekly round from the first Monday of the month. Park off the berm the night before if you can.',
    date: '2026-03-02',
    updated: null,
    author: 'Committee',
    categorySlug: 'notices',
    categoryLabel: 'Notices',
    featured: false,
    readingTime: 2,
    bodyKey: 'lab/verge-mowing-resumes.json',
    hero: {
      url: '/images/mangere-mountain.jpg',
      width: 1600,
      height: 1067,
      alt: '',
      caption: null,
      credit: null,
    },
  },
  {
    slug: 'coronation-road-footpath-renewal',
    title: 'Coronation Road footpath renewal starts on the 14th, with detours through the reserve',
    excerpt:
      'Auckland Transport will close the eastern footpath between the shops and the school gate for roughly six weeks. Pedestrians are routed through the reserve, which is unlit past the playground, so the society has asked for temporary lighting and a marked crossing at the Huri Street end. The contractor has agreed to hold noisy work to weekdays between nine and four.',
    date: '2026-02-19',
    updated: null,
    author: 'Society Manager',
    categorySlug: 'works',
    categoryLabel: 'Works',
    featured: true,
    readingTime: 7,
    bodyKey: 'lab/coronation-road-footpath-renewal.json',
    hero: {
      url: '/images/huri-street.png',
      width: 1200,
      height: 800,
      alt: '',
      caption: null,
      credit: null,
    },
  },
  {
    slug: 'february-committee-minutes',
    title: 'Minutes: February committee meeting',
    excerpt:
      'Signed off by the chairperson. Covers the footpath submission, the reserve lighting request, and next year’s levy.',
    date: '2026-02-11',
    updated: null,
    author: 'Chairperson',
    categorySlug: 'minutes',
    categoryLabel: 'Minutes',
    featured: false,
    readingTime: 4,
    bodyKey: 'lab/february-committee-minutes.json',
    hero: null,
  },
  {
    slug: 'garden-beds-open',
    title: 'The garden beds are open for the season',
    excerpt:
      'Six beds are unallocated. Put your name on the sheet in the shed, or send the committee a note and we will do it for you.',
    date: '2026-01-28',
    updated: null,
    author: 'Works Group',
    categorySlug: 'gardens',
    categoryLabel: 'Gardens',
    featured: false,
    readingTime: 3,
    bodyKey: 'lab/garden-beds-open.json',
    hero: {
      url: '/images/discussions/balcony-plants.jpg',
      width: 1200,
      height: 800,
      alt: '',
      caption: null,
      credit: null,
    },
  },
];

/** The post each surface shows by default, so the ten options compare like for like. */
export const HOME_POST = LAB_POSTS[0];
export const READNEXT_POST = LAB_POSTS[3];
export const LISTING_POST = LAB_POSTS[1];
export const TEXTLESS_POST = LAB_POSTS[2];
