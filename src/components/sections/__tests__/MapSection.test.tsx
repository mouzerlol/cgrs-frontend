import { render, screen, within } from '@testing-library/react';
import MapSection from '@/components/sections/MapSection';
import { POI_TYPES } from '@/data/map-data';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn().mockReturnValue({
      setView: vi.fn().mockReturnThis(),
      flyTo: vi.fn(),
      addTo: vi.fn().mockReturnThis(),
      remove: vi.fn(),
    }),
    tileLayer: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
    }),
    geoJSON: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
    }),
    control: {
      scale: vi.fn().mockReturnValue({
        addTo: vi.fn().mockReturnThis(),
      }),
    },
    divIcon: vi.fn().mockReturnValue({}),
    marker: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      bindPopup: vi.fn().mockReturnThis(),
      setZIndexOffset: vi.fn(),
      openPopup: vi.fn(),
    }),
  },
}));

describe('MapSection', () => {
  it('renders sidebar with Points of Interest header', () => {
    render(<MapSection />);
    
    expect(screen.getByText('Points of Interest')).toBeInTheDocument();
    expect(screen.getByText('Click to navigate')).toBeInTheDocument();
  });

  it('renders interactive map container', () => {
    render(<MapSection />);
    
    const mapContainer = document.querySelector('.interactive-map');
    expect(mapContainer).toBeInTheDocument();
  });

  it('renders legend', () => {
    render(<MapSection />);
    
    expect(screen.getByText('Legend')).toBeInTheDocument();
  });

  it('renders all POI names in sidebar', () => {
    render(<MapSection />);
    
    expect(screen.getByText('Mangere Mountain Walkway')).toBeInTheDocument();
    expect(screen.getByText('Ambury Farm')).toBeInTheDocument();
    expect(screen.getByText('Mangere Bridge Library')).toBeInTheDocument();
    expect(screen.getByText('Fresh Choice Mangere Bridge')).toBeInTheDocument();
    expect(screen.getByText('Kiwi Esplanade Reserve')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-map-section';
    render(<MapSection className={customClass} />);
    
    const wrapper = screen.getByTestId('map-section-wrapper');
    expect(wrapper).toHaveClass(customClass);
  });

  it('has proper wrapper structure with grid layout', () => {
    render(<MapSection />);
    
    const wrapper = screen.getByTestId('map-section-wrapper');
    expect(wrapper).toHaveClass('map-section-wrapper');
  });

  it('contains sidebar element', () => {
    render(<MapSection />);
    
    const sidebar = document.querySelector('.map-sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('contains map container element', () => {
    render(<MapSection />);
    
    const mapContainer = document.querySelector('.map-container');
    expect(mapContainer).toBeInTheDocument();
  });

  it('renders sidebar buttons for POIs', () => {
    render(<MapSection />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders all POI categories in sidebar', () => {
    render(<MapSection />);
    
    const sidebar = document.querySelector('.map-sidebar');
    Object.values(POI_TYPES).forEach(({ label }) => {
      expect(within(sidebar!).getByText(label)).toBeInTheDocument();
    });
  });

  it('renders legend with all POI type labels', () => {
    render(<MapSection />);
    
    const legend = document.querySelector('.map-legend');
    Object.values(POI_TYPES).forEach(({ label }) => {
      expect(within(legend!).getByText(label)).toBeInTheDocument();
    });
  });
});
