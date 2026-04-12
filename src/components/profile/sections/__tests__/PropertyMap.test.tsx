import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PropertyMap from '@/components/profile/sections/PropertyMap';

// Mock BaseMap
vi.mock('@/components/map/BaseMap', () => ({
  default: vi.fn(() => <div data-testid="base-map">Mock Map</div>),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(),
    tileLayer: vi.fn(),
    geoJSON: vi.fn(),
    latLngBounds: vi.fn(),
    marker: vi.fn(() => ({
      addTo: vi.fn(),
      remove: vi.fn(),
    })),
    divIcon: vi.fn(),
    latLng: vi.fn(),
  },
}));

// Mock map-data
vi.mock('@/data/map-data', () => ({
  BOUNDARY_COORDINATES: [
    [174.7912, -36.9497],
    [174.7920, -36.9497],
    [174.7920, -36.9505],
    [174.7912, -36.9505],
  ],
}));

describe('PropertyMap', () => {
  it('renders with address label', () => {
    render(<PropertyMap lat={-36.9497} lng={174.7912} address="41 Huri Street" />);
    expect(screen.getByText('41 Huri Street')).toBeInTheDocument();
  });

  it('renders with null coordinates', () => {
    render(<PropertyMap lat={null} lng={null} address="41 Huri Street" />);
    expect(screen.getByText('41 Huri Street')).toBeInTheDocument();
  });

  it('renders with different address', () => {
    render(<PropertyMap lat={-36.9497} lng={174.7912} address="123 Test Road" />);
    expect(screen.getByText('123 Test Road')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<PropertyMap lat={-36.9497} lng={174.7912} address="41 Huri Street" className="custom-class" />);
    const container = screen.getByTestId('base-map').parentElement;
    expect(container?.className).toContain('custom-class');
  });
});
