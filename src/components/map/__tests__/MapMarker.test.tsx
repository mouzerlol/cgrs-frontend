import { render } from '@testing-library/react';
import { MARKER_SIZE } from '@/data/map-data';

// Capture calls to L.divIcon
let divIconCalls: Record<string, unknown>[] = [];

vi.mock('leaflet', () => {
  const markerInstance = {
    addTo: vi.fn().mockReturnThis(),
    bindPopup: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    remove: vi.fn(),
    openPopup: vi.fn(),
  };

  return {
    default: {
      divIcon: (config: Record<string, unknown>) => {
        divIconCalls.push(config);
        return { _config: config };
      },
      marker: () => markerInstance,
    },
  };
});

// Import after mock setup
import MapMarker from '@/components/map/MapMarker';

// Minimal mock map object
const mockMap = {
  flyTo: vi.fn(),
  addTo: vi.fn(),
} as unknown as L.Map;

describe('MapMarker', () => {
  beforeEach(() => {
    divIconCalls = [];
  });

  it('uses default size of 44px meeting WCAG 2.1 AA touch target minimum', async () => {
    render(
      <MapMarker
        map={mockMap}
        position={[-36.95, 174.79]}
        popup="Test Marker"
      />
    );

    // Wait for async leaflet import
    await vi.waitFor(() => {
      expect(divIconCalls.length).toBeGreaterThan(0);
    });

    const iconConfig = divIconCalls[0];
    expect((iconConfig.iconSize as number[])[0]).toBeGreaterThanOrEqual(44);
    expect((iconConfig.iconSize as number[])[1]).toBeGreaterThanOrEqual(44);
  });

  it('calculates iconAnchor as center of icon when not explicitly provided', async () => {
    render(
      <MapMarker
        map={mockMap}
        position={[-36.95, 174.79]}
        size={44}
      />
    );

    await vi.waitFor(() => {
      expect(divIconCalls.length).toBeGreaterThan(0);
    });

    const iconConfig = divIconCalls[0];
    // Default anchor should be center: [size/2, size/2]
    expect(iconConfig.iconAnchor).toEqual([22, 22]);
  });

  it('calculates popupAnchor relative to icon size when not explicitly provided', async () => {
    render(
      <MapMarker
        map={mockMap}
        position={[-36.95, 174.79]}
        size={44}
      />
    );

    await vi.waitFor(() => {
      expect(divIconCalls.length).toBeGreaterThan(0);
    });

    const iconConfig = divIconCalls[0];
    // Default popup anchor should be [0, -size/2]
    expect(iconConfig.popupAnchor).toEqual([0, -22]);
  });

  it('respects custom size when provided', async () => {
    render(
      <MapMarker
        map={mockMap}
        position={[-36.95, 174.79]}
        size={48}
      />
    );

    await vi.waitFor(() => {
      expect(divIconCalls.length).toBeGreaterThan(0);
    });

    const iconConfig = divIconCalls[0];
    expect(iconConfig.iconSize).toEqual([48, 48]);
  });

  it('respects custom iconAnchor and popupAnchor when provided', async () => {
    render(
      <MapMarker
        map={mockMap}
        position={[-36.95, 174.79]}
        size={44}
        iconAnchor={[22, 44]}
        popupAnchor={[0, -44]}
      />
    );

    await vi.waitFor(() => {
      expect(divIconCalls.length).toBeGreaterThan(0);
    });

    const iconConfig = divIconCalls[0];
    expect(iconConfig.iconAnchor).toEqual([22, 44]);
    expect(iconConfig.popupAnchor).toEqual([0, -44]);
  });
});

describe('MARKER_SIZE constant', () => {
  it('is at least 44px to meet WCAG 2.1 AA touch target requirement', () => {
    expect(MARKER_SIZE).toBeGreaterThanOrEqual(44);
  });

  it('equals 44', () => {
    expect(MARKER_SIZE).toBe(44);
  });
});
