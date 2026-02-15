import { render, screen } from '@testing-library/react';
import FooterMap from '@/components/layout/FooterMap';

// Mock Leaflet
vi.mock('leaflet', () => ({
  default: {
    map: vi.fn().mockReturnValue({
      setView: vi.fn().mockReturnThis(),
      addTo: vi.fn().mockReturnThis(),
    }),
    tileLayer: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
    }),
    divIcon: vi.fn().mockReturnValue({}),
    marker: vi.fn().mockReturnValue({
      addTo: vi.fn().mockReturnThis(),
      setZIndexOffset: vi.fn(),
    }),
  },
}));

describe('FooterMap', () => {
  it('renders wrapper with correct dimensions', () => {
    render(<FooterMap />);

    const wrapper = screen.getByTestId('footer-map-wrapper');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveStyle({ height: '160px' });
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-footer-map';
    render(<FooterMap className={customClass} />);

    const wrapper = screen.getByTestId('footer-map-wrapper');
    const mapContainer = wrapper.firstElementChild;
    expect(mapContainer).toHaveClass(customClass);
  });

  it('renders with placeholder background before map loads', () => {
    render(<FooterMap />);

    const wrapper = screen.getByTestId('footer-map-wrapper');
    expect(wrapper).toHaveStyle({ background: '#1A2218' });
  });

  it('has proper wrapper structure with border radius and overflow hidden', () => {
    render(<FooterMap />);

    const wrapper = screen.getByTestId('footer-map-wrapper');
    expect(wrapper).toHaveStyle({ position: 'relative' });
    expect(wrapper).toHaveStyle({ borderRadius: '8px' });
    expect(wrapper).toHaveStyle({ overflow: 'hidden' });
  });

  it('renders map container with 100% dimensions', () => {
    render(<FooterMap />);

    const wrapper = screen.getByTestId('footer-map-wrapper');
    const mapContainer = wrapper.firstElementChild;
    expect(mapContainer).toHaveStyle({ width: '100%' });
    expect(mapContainer).toHaveStyle({ height: '100%' });
  });
});
