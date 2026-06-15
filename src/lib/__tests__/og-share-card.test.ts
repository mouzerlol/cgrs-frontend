import { describe, it, expect } from 'vitest';
import { buildShareCardCopy, buildStadiaStaticMapUrl } from '@/lib/og-share-card';

describe('buildShareCardCopy', () => {
  it('names precinct and short address when both resolve', () => {
    const c = buildShareCardCopy({
      precinctName: 'Whai Hua',
      address: '23 Huri Street, Māngere Bridge, Auckland',
    });
    expect(c.headline).toBe('Whai Hua');
    expect(c.subhead).toBe('near 23 Huri Street'); // suburb + city trimmed
    expect(c.metaTitle).toBe('📍 Whai Hua · near 23 Huri Street — Coronation Gardens');
    expect(c.metaDescription).toContain('live community map');
    expect(c.metaDescription).not.toContain('23 Huri Street'); // no restate of the title
  });

  it('falls back to the society line when only the precinct resolves', () => {
    const c = buildShareCardCopy({ precinctName: 'Whai Hua' });
    expect(c.headline).toBe('Whai Hua');
    expect(c.subhead).toBe('Coronation Gardens');
    expect(c.metaTitle).toBe('📍 Whai Hua — Coronation Gardens');
  });

  it('uses the geocoded suburb as the lead with the street beneath', () => {
    const c = buildShareCardCopy({ area: 'Mount Roskill', street: 'Parau Street' });
    expect(c.headline).toBe('Mount Roskill');
    expect(c.subhead).toBe('near Parau Street');
    expect(c.metaTitle).toBe('📍 Mount Roskill · near Parau Street — Coronation Gardens');
  });

  it('puts a named venue under its suburb', () => {
    const c = buildShareCardCopy({ area: 'Onehunga', venue: 'Interlink Modular' });
    expect(c.headline).toBe('Onehunga');
    expect(c.subhead).toBe('Interlink Modular');
  });

  it('lets a CGRS precinct beat the geocoded suburb for the lead', () => {
    const c = buildShareCardCopy({ precinctName: 'Whai Hua', area: 'Māngere Bridge', street: 'Huri Street' });
    expect(c.headline).toBe('Whai Hua'); // local identity wins
    expect(c.subhead).toBe('near Huri Street');
  });

  it('is never empty: an unresolved point still names Māngere Bridge', () => {
    const c = buildShareCardCopy({});
    expect(c.headline).toBe('Māngere Bridge');
    expect(c.subhead).toBe('Coronation Gardens');
    expect(c.metaTitle).toBe('📍 Māngere Bridge — Coronation Gardens');
    expect(c.metaTitle).not.toContain('A shared location'); // the old dead-end is gone
    expect(c.imageAlt).toContain('Māngere Bridge');
  });
});

describe('buildStadiaStaticMapUrl', () => {
  it('centres on the point with a terracotta marker at @2x', () => {
    const url = buildStadiaStaticMapUrl({
      lat: -36.9497,
      lng: 174.7912,
      apiKey: 'test-key',
      width: 1200,
      height: 448,
    });
    expect(url).toContain('static_cacheable/alidade_smooth.png');
    expect(url).toContain('center=-36.9497%2C174.7912');
    expect(url).toContain('size=600x224%402x'); // half-size @2x => 1200x448
    expect(url).toContain('d95d39'); // brand terracotta marker
    expect(url).toContain('api_key=test-key');
  });
});
