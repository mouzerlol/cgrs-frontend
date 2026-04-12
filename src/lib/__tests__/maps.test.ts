import { describe, it, expect, vi } from 'vitest';
import {
  LINZ_CONFIG,
  ARCGIS_CONFIG,
  LINZ_LDS_PROPERTY_TITLES_LAYER_ID,
  getLINZTileOptions,
  getArcGISTileOptions,
  getLINZPropertyTitlesTileOptions,
  getCommunityMapBaseTileUrl,
  getCommunityMapBaseTileOptions,
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

describe('Community map basemap (cartographic)', () => {
  it('getCommunityMapBaseTileUrl points at Stadia Outdoors', () => {
    const url = getCommunityMapBaseTileUrl();
    expect(url).toContain('tiles.stadiamaps.com');
    expect(url).toContain('/outdoors/');
  });

  it('getCommunityMapBaseTileOptions allows over-zoom past native tiles', () => {
    const options = getCommunityMapBaseTileOptions();
    expect(options.maxNativeZoom).toBe(20);
    expect(options.maxZoom).toBe(21);
    expect(options.attribution).toContain('Stadia Maps');
  });
});

describe('LINZ tile configuration', () => {
  describe('LINZ_CONFIG', () => {
    it('has correct URL structure for WebMercatorQuad tiles', () => {
      expect(LINZ_CONFIG.url).toContain('basemaps.linz.govt.nz');
      expect(LINZ_CONFIG.url).toContain('WebMercatorQuad');
      expect(LINZ_CONFIG.url).toContain('{z}/{x}/{y}.webp');
    });

    it('has maxZoom of 21 to support deep zooming', () => {
      expect(LINZ_CONFIG.maxZoom).toBe(21);
    });

    it('has proper attribution for LINZ CC BY 4.0 license', () => {
      expect(LINZ_CONFIG.attribution).toContain('LINZ');
      expect(LINZ_CONFIG.attribution).toContain('CC BY 4.0');
    });
  });

  describe('getLINZTileOptions', () => {
    it('returns correct maxZoom configuration', () => {
      const options = getLINZTileOptions();
      expect(options.maxZoom).toBe(21);
    });

    it('returns maxNativeZoom matching maxZoom for real tiles at full resolution', () => {
      const options = getLINZTileOptions();
      expect(options.maxNativeZoom).toBe(21);
    });

    it('includes crossOrigin for CORS compatibility', () => {
      const options = getLINZTileOptions();
      expect(options.crossOrigin).toBe('anonymous');
    });

    it('includes attribution string', () => {
      const options = getLINZTileOptions();
      expect(options.attribution).toContain('LINZ');
    });
  });
});

describe('LINZ Data Service — NZ Property Titles (layer 50804)', () => {
  it('uses catalogue layer id 50804', () => {
    expect(LINZ_LDS_PROPERTY_TITLES_LAYER_ID).toBe(50804);
  });

  it('tile options include LDS subdomain pattern and attribution link', () => {
    const options = getLINZPropertyTitlesTileOptions();
    expect(options.subdomains).toEqual(['a', 'b', 'c', 'd']);
    expect(options.attribution).toContain('50804');
    expect(options.attribution).toContain('data.linz.govt.nz');
    expect(options.maxNativeZoom).toBe(18);
    expect(options.opacity).toBe(0.65);
  });

  it('getLINZPropertyTitlesTileUrl builds LDS XYZ template when LDS API key is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_LINZ_LDS_API_KEY', 'lds-test-key');
    vi.stubEnv('NEXT_PUBLIC_LINZ_API_KEY', '');
    vi.resetModules();
    try {
      const { getLINZPropertyTitlesTileUrl: getUrl } = await import('@/lib/maps');
      const url = getUrl();
      expect(url).toContain('tiles-{s}.data-cdn.linz.govt.nz');
      expect(url).toContain('services;key=lds-test-key');
      expect(url).toContain('layer=50804');
      expect(url).toContain('EPSG:3857');
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });

  it('getLINZPropertyTitlesTileUrl returns null when only Basemaps key is set (LDS key is separate)', async () => {
    vi.stubEnv('NEXT_PUBLIC_LINZ_LDS_API_KEY', '');
    vi.stubEnv('NEXT_PUBLIC_LINZ_API_KEY', 'basemap-key-only');
    vi.resetModules();
    try {
      const { getLINZPropertyTitlesTileUrl: getUrl } = await import('@/lib/maps');
      expect(getUrl()).toBeNull();
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});

describe('ArcGIS tile configuration', () => {
  describe('ARCGIS_CONFIG', () => {
    it('has correct URL for World Imagery service', () => {
      expect(ARCGIS_CONFIG.url).toContain('arcgisonline.com');
      expect(ARCGIS_CONFIG.url).toContain('World_Imagery');
    });

    it('supports high maxZoom for deep zooming', () => {
      expect(ARCGIS_CONFIG.maxZoom).toBe(23);
    });

    it('has maxNativeZoom of 19 for real tile availability', () => {
      expect(ARCGIS_CONFIG.maxNativeZoom).toBe(19);
    });
  });

  describe('getArcGISTileOptions', () => {
    it('returns maxZoom of 23', () => {
      const options = getArcGISTileOptions();
      expect(options.maxZoom).toBe(23);
    });

    it('returns maxNativeZoom of 19', () => {
      const options = getArcGISTileOptions();
      expect(options.maxNativeZoom).toBe(19);
    });

    it('includes proper attribution', () => {
      const options = getArcGISTileOptions();
      expect(options.attribution).toContain('Esri');
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

describe('Tile provider zoom comparison', () => {
  it('LINZ supports higher native zoom than ArcGIS for NZ coverage', () => {
    const linzOptions = getLINZTileOptions();
    const arcgisOptions = getArcGISTileOptions();
    expect(linzOptions.maxNativeZoom).toBeGreaterThan(arcgisOptions.maxNativeZoom);
  });

  it('ArcGIS allows deeper overall zoom via maxZoom', () => {
    const linzOptions = getLINZTileOptions();
    const arcgisOptions = getArcGISTileOptions();
    expect(arcgisOptions.maxZoom).toBeGreaterThan(linzOptions.maxZoom);
  });
});
