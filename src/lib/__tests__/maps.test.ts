import { describe, it, expect } from 'vitest';
import {
  OSM_CONFIG,
  getOSMTileUrl,
  getOSMTileOptions,
  getCommunityMapLeafletBasemap,
  getNzWidgetLeafletBasemap,
  metersPerPixelWebMercator,
  BOUNDARY_STYLE,
  BOUNDARY_STYLE_COMPACT,
  getBoundaryFeature,
} from '@/lib/maps';

describe('metersPerPixelWebMercator', () => {
  it('at Coronation Gardens latitude and z=19 is ~0.24 m/px (~25 m per 100 px)', () => {
    const mpp = metersPerPixelWebMercator(-36.9497, 19);
    expect(mpp).toBeGreaterThan(0.22);
    expect(mpp).toBeLessThan(0.26);
  });
});

describe('OSM tile configuration', () => {
  describe('OSM_CONFIG', () => {
    it('has correct URL for OpenStreetMap Standard', () => {
      expect(OSM_CONFIG.url).toContain('tile.openstreetmap.org');
      expect(OSM_CONFIG.url).toContain('{z}/{x}/{y}.png');
    });

    it('has subdomains a, b, c', () => {
      expect(OSM_CONFIG.subdomains).toEqual(['a', 'b', 'c']);
    });

    it('maxZoom is 19', () => {
      expect(OSM_CONFIG.maxZoom).toBe(19);
    });

    it('has proper attribution', () => {
      expect(OSM_CONFIG.attribution).toContain('OpenStreetMap');
    });
  });

  describe('getOSMTileUrl', () => {
    it('returns the OSM tile URL', () => {
      const url = getOSMTileUrl();
      expect(url).toContain('tile.openstreetmap.org');
    });
  });

  describe('getOSMTileOptions', () => {
    it('returns maxZoom 20 for overzoom capability', () => {
      const opts = getOSMTileOptions();
      expect(opts.maxZoom).toBe(20);
    });

    it('returns maxNativeZoom 19 matching OSM tile availability', () => {
      const opts = getOSMTileOptions();
      expect(opts.maxNativeZoom).toBe(19);
    });

    it('includes attribution', () => {
      const opts = getOSMTileOptions();
      expect(opts.attribution).toContain('OpenStreetMap');
    });
  });
});

describe('Community map basemap', () => {
  describe('getCommunityMapLeafletBasemap', () => {
    it('uses OSM Standard tiles', () => {
      const b = getCommunityMapLeafletBasemap();
      expect(b.tileUrl).toContain('tile.openstreetmap.org');
      expect(b.maxZoom).toBe(20);
    });

    it('returns proper tile options', () => {
      const b = getCommunityMapLeafletBasemap();
      expect(b.tileOptions.maxZoom).toBe(20);
      expect(b.tileOptions.maxNativeZoom).toBe(19);
      expect(b.tileOptions.attribution).toContain('OpenStreetMap');
    });
  });

  describe('getNzWidgetLeafletBasemap', () => {
    it('uses OSM Standard tiles', () => {
      const b = getNzWidgetLeafletBasemap();
      expect(b.tileUrl).toContain('tile.openstreetmap.org');
    });

    it('returns proper tile options', () => {
      const b = getNzWidgetLeafletBasemap();
      expect(b.tileOptions.maxZoom).toBe(20);
      expect(b.tileOptions.maxNativeZoom).toBe(19);
    });
  });
});

describe('Boundary styling', () => {
  describe('BOUNDARY_STYLE', () => {
    it('uses pink color for development boundary', () => {
      expect(BOUNDARY_STYLE.color).toBe('#FF69B4');
      expect(BOUNDARY_STYLE.fillColor).toBe('#FF69B4');
    });

    it('has thinner border weight of 2px', () => {
      expect(BOUNDARY_STYLE.weight).toBe(2);
    });

    it('has light fill opacity of 0.15', () => {
      expect(BOUNDARY_STYLE.fillOpacity).toBe(0.15);
    });

    it('has no dashArray for solid border', () => {
      expect(BOUNDARY_STYLE.dashArray).toBeUndefined();
    });
  });

  describe('BOUNDARY_STYLE_COMPACT', () => {
    it('matches BOUNDARY_STYLE for consistency', () => {
      expect(BOUNDARY_STYLE_COMPACT.color).toBe(BOUNDARY_STYLE.color);
      expect(BOUNDARY_STYLE_COMPACT.weight).toBe(BOUNDARY_STYLE.weight);
      expect(BOUNDARY_STYLE_COMPACT.fillOpacity).toBe(BOUNDARY_STYLE.fillOpacity);
    });
  });
});

describe('getBoundaryFeature', () => {
  it('returns a valid GeoJSON Feature', () => {
    const feature = getBoundaryFeature();
    expect(feature.type).toBe('Feature');
    expect(feature.geometry.type).toBe('Polygon');
  });

  it('has non-empty coordinates array', () => {
    const feature = getBoundaryFeature();
    expect(feature.geometry.coordinates).toBeDefined();
    expect(feature.geometry.coordinates.length).toBeGreaterThan(0);
  });

  it('closes the polygon (first and last coordinates match)', () => {
    const feature = getBoundaryFeature();
    const coords = feature.geometry.coordinates[0] as [number, number][];
    expect(coords[0]).toEqual(coords[coords.length - 1]);
  });
});