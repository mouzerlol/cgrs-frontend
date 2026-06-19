import { describe, it, expect } from 'vitest';
import {
  buildSlides,
  projectToPercent,
  resolveSwipe,
  titleSlideIndex,
  windowIndices,
  wrapIndex,
  type GeoBounds,
} from '@/lib/ground-report/reel';
import type { MemberZoneReportResponse } from '@/types/ground-report';

function zone(id: string, label: string, nImages: number): MemberZoneReportResponse {
  return {
    zone_id: id,
    label,
    precinct_keys: [],
    report_id: `r-${id}`,
    period_type: 'week',
    period_start: '2026-06-15',
    period_end: '2026-06-21',
    images: Array.from({ length: nImages }, (_, i) => ({
      id: `${id}-img-${i}`,
      url: `https://x/${id}/${i}`,
      lat: -36.95,
      lng: 174.79,
      caption: null,
      sort_order: i,
    })),
  };
}

describe('buildSlides', () => {
  it('emits a title slide then the zone images, across zones', () => {
    const slides = buildSlides([zone('a', 'A', 2), zone('b', 'B', 1)]);
    expect(slides.map((s) => s.kind)).toEqual(['title', 'image', 'image', 'title', 'image']);
    expect(slides[0]).toMatchObject({ kind: 'title', zoneId: 'a', label: 'A' });
    expect(slides[3]).toMatchObject({ kind: 'title', zoneId: 'b' });
  });

  it('locates a zone title slide for seeking', () => {
    const slides = buildSlides([zone('a', 'A', 2), zone('b', 'B', 1)]);
    expect(titleSlideIndex(slides, 'b')).toBe(3);
    expect(titleSlideIndex(slides, 'missing')).toBe(-1);
  });
});

describe('wrapIndex', () => {
  it('loops past the end back to the start', () => {
    expect(wrapIndex(5, 5)).toBe(0);
    expect(wrapIndex(-1, 5)).toBe(4);
    expect(wrapIndex(2, 5)).toBe(2);
  });
});

describe('windowIndices', () => {
  it('returns current ± radius with wrap, de-duplicated', () => {
    expect(windowIndices(0, 5, 1).sort()).toEqual([0, 1, 4]);
    expect(windowIndices(2, 5, 1).sort()).toEqual([1, 2, 3]);
  });
});

describe('resolveSwipe', () => {
  const T = 60;

  it('returns 0 when neither axis clears the threshold', () => {
    expect(resolveSwipe({ x: 0, y: 0 }, T)).toBe(0);
    expect(resolveSwipe({ x: 59, y: -40 }, T)).toBe(0);
    expect(resolveSwipe({ x: -59, y: 59 }, T)).toBe(0);
  });

  it('advances (next, +1) on a swipe up or a swipe left', () => {
    expect(resolveSwipe({ x: 0, y: -120 }, T)).toBe(1); // up
    expect(resolveSwipe({ x: -120, y: 0 }, T)).toBe(1); // left
  });

  it('rewinds (prev, -1) on a swipe down or a swipe right', () => {
    expect(resolveSwipe({ x: 0, y: 120 }, T)).toBe(-1); // down
    expect(resolveSwipe({ x: 120, y: 0 }, T)).toBe(-1); // right
  });

  it('picks the dominant axis on a diagonal swipe', () => {
    // mostly-horizontal, leftward → next
    expect(resolveSwipe({ x: -100, y: 30 }, T)).toBe(1);
    // mostly-vertical, downward → prev
    expect(resolveSwipe({ x: 30, y: 100 }, T)).toBe(-1);
  });

  it('treats exactly-threshold magnitude as a trigger', () => {
    expect(resolveSwipe({ x: 0, y: -60 }, T)).toBe(1);
    expect(resolveSwipe({ x: 60, y: 0 }, T)).toBe(-1);
  });
});

describe('projectToPercent', () => {
  const bounds: GeoBounds = { south: -37, west: 174, north: -36, east: 175 };

  it('maps the NW corner to (0,0) and SE corner to (100,100)', () => {
    expect(projectToPercent(-36, 174, bounds)).toEqual({ xPct: 0, yPct: 0 });
    expect(projectToPercent(-37, 175, bounds)).toEqual({ xPct: 100, yPct: 100 });
  });

  it('maps the centre to (50,50)', () => {
    expect(projectToPercent(-36.5, 174.5, bounds)).toEqual({ xPct: 50, yPct: 50 });
  });

  it('clamps out-of-bounds coordinates to the edge', () => {
    const p = projectToPercent(-40, 180, bounds);
    expect(p.xPct).toBe(100);
    expect(p.yPct).toBe(100);
  });
});
