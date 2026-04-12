import { describe, it, expect } from 'vitest';
import { buildLeafletRasterTileOptions } from '@/components/map/BaseMap';

describe('buildLeafletRasterTileOptions', () => {
  it('omits subdomains when not set so Leaflet defaults apply', () => {
    const opts = buildLeafletRasterTileOptions(
      { attribution: 'A', crossOrigin: 'anonymous' },
      { maxZoom: 21, maxNativeZoom: 20 },
    );
    expect(opts).not.toHaveProperty('subdomains');
    expect(opts.maxZoom).toBe(21);
    expect(opts.maxNativeZoom).toBe(20);
  });

  it('includes subdomains when provided (e.g. LDS tiles-{s}.host)', () => {
    const opts = buildLeafletRasterTileOptions(
      { subdomains: ['a', 'b', 'c', 'd'], attribution: 'B' },
      { maxZoom: 21, maxNativeZoom: 18 },
    );
    expect(opts.subdomains).toEqual(['a', 'b', 'c', 'd']);
  });

  it('includes opacity when set (overlay blend)', () => {
    const opts = buildLeafletRasterTileOptions(
      { attribution: 'C', opacity: 0.65 },
      { maxZoom: 21, maxNativeZoom: 18 },
    );
    expect(opts.opacity).toBe(0.65);
  });
});
