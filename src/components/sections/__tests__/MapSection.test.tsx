import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MapSection from '@/components/sections/MapSection';
import { PRECINCTS, PRECINCT_STAGES, POINTS_OF_INTEREST, POI_TYPES } from '@/data/map-data';

const baseMapPropsSpy = vi.fn();

vi.mock('@/components/map/BaseMap', () => ({
  default: (props: Record<string, unknown>) => {
    baseMapPropsSpy(props);
    return <div className={String(props.className ?? '')} data-testid="mock-base-map" />;
  },
}));

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
      getBounds: vi.fn().mockReturnValue({}),
    }),
    latLngBounds: vi.fn().mockReturnValue({
      extend: vi.fn().mockReturnThis(),
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
    popup: vi.fn().mockReturnValue({
      setLatLng: vi.fn().mockReturnThis(),
      setContent: vi.fn().mockReturnThis(),
      openOn: vi.fn().mockReturnThis(),
    }),
  },
}));

describe('MapSection', () => {
  beforeEach(() => {
    baseMapPropsSpy.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('structure', () => {
    it('renders wrapper with correct test id and class', () => {
      render(<MapSection />);
      const wrapper = screen.getByTestId('map-section-wrapper');
      expect(wrapper).toHaveClass('map-section-wrapper');
    });

    it('applies custom className', () => {
      render(<MapSection className="custom-class" />);
      expect(screen.getByTestId('map-section-wrapper')).toHaveClass('custom-class');
    });

    it('renders sidebar, map container, and legend', () => {
      render(<MapSection />);
      expect(document.querySelector('.map-sidebar')).toBeInTheDocument();
      expect(document.querySelector('.map-container')).toBeInTheDocument();
      expect(document.querySelector('.map-legend')).toBeInTheDocument();
    });

    it('renders interactive map via BaseMap', () => {
      render(<MapSection />);
      expect(document.querySelector('.interactive-map')).toBeInTheDocument();
    });
  });

  describe('BaseMap configuration', () => {
    it('uses OSM Standard tiles with maxZoom 19', () => {
      render(<MapSection />);
      expect(baseMapPropsSpy).toHaveBeenCalled();
      const props = baseMapPropsSpy.mock.calls[baseMapPropsSpy.mock.calls.length - 1][0] as {
        tileUrl?: string;
        maxZoom: number;
      };
      expect(props.tileUrl).toContain('tile.openstreetmap.org');
      expect(props.maxZoom).toBe(19);
    });
  });

  describe('sidebar header', () => {
    it('renders Coronation Gardens title and subtitle', () => {
      render(<MapSection />);
      expect(screen.getByText('Coronation Gardens')).toBeInTheDocument();
      expect(screen.getByText('Click to navigate')).toBeInTheDocument();
    });
  });

  describe('precincts accordion', () => {
    it('renders Precincts accordion with correct count', () => {
      render(<MapSection />);
      const sidebar = document.querySelector('.map-sidebar')!;
      const accordionTrigger = within(sidebar).getAllByText('Precincts')[0];
      expect(accordionTrigger).toBeInTheDocument();
      expect(within(sidebar).getByText(`${PRECINCTS.length}`)).toBeInTheDocument();
    });

    it('is open by default showing all precinct names', () => {
      render(<MapSection />);
      PRECINCTS.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
      });
    });

    it('groups precincts by stage with headings', () => {
      render(<MapSection />);
      const sidebar = document.querySelector('.map-sidebar')!;

      PRECINCT_STAGES.forEach((stage) => {
        expect(within(sidebar).getByText(stage.label)).toBeInTheDocument();
      });
    });

    it('renders Stage 0 precincts under Stage 0 heading', () => {
      render(<MapSection />);
      const stage0Precincts = PRECINCTS.filter(p => p.stage === 'stage-0');
      stage0Precincts.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
      });
      expect(stage0Precincts).toHaveLength(4);
    });

    it('renders Stage 1 precincts under Stage 1 heading', () => {
      render(<MapSection />);
      const stage1Precincts = PRECINCTS.filter(p => p.stage === 'stage-1');
      stage1Precincts.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
      });
      expect(stage1Precincts).toHaveLength(1);
    });

    it('renders Stage 2 & 3 precincts', () => {
      render(<MapSection />);
      const stage23Precincts = PRECINCTS.filter(p => p.stage === 'stage-2-3');
      stage23Precincts.forEach((p) => {
        expect(screen.getByText(p.name)).toBeInTheDocument();
      });
      expect(stage23Precincts).toHaveLength(3);
    });

    it('renders precinct buttons as disabled before map is ready', () => {
      render(<MapSection />);
      const precinctButtons = PRECINCTS.map(p => screen.getByText(p.name).closest('button'));
      precinctButtons.forEach((btn) => {
        expect(btn).toBeDisabled();
      });
    });
  });

  describe('POI accordion', () => {
    it('renders POI accordion with correct count', () => {
      render(<MapSection />);
      expect(screen.getByText('Māngere Bridge Points of Interest')).toBeInTheDocument();
      expect(screen.getByText(`${POINTS_OF_INTEREST.length}`)).toBeInTheDocument();
    });

    it('is collapsed by default (POI names not visible)', () => {
      render(<MapSection />);
      const poiPanel = screen.getByText('Māngere Bridge Points of Interest')
        .closest('button')?.nextElementSibling;
      expect(poiPanel).toBeNull();
    });

    it('expands to show POI names when clicked', async () => {
      const user = userEvent.setup();
      render(<MapSection />);

      await user.click(screen.getByText('Māngere Bridge Points of Interest'));

      expect(screen.getByText('Mangere Mountain Walkway')).toBeInTheDocument();
      expect(screen.getByText('Ambury Farm')).toBeInTheDocument();
      expect(screen.getByText('Mangere Bridge Library')).toBeInTheDocument();
      expect(screen.getByText('Fresh Choice Mangere Bridge')).toBeInTheDocument();
    });

    it('shows POI type group headings when expanded', async () => {
      const user = userEvent.setup();
      render(<MapSection />);

      await user.click(screen.getByText('Māngere Bridge Points of Interest'));

      Object.values(POI_TYPES).forEach(({ label }) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });
  });

  describe('legend', () => {
    it('renders legend with stage labels', () => {
      render(<MapSection />);
      const legend = document.querySelector('.map-legend')!;
      expect(within(legend).getByText('Precincts')).toBeInTheDocument();
      PRECINCT_STAGES.forEach((stage) => {
        expect(within(legend).getByText(stage.label)).toBeInTheDocument();
      });
    });
  });

  describe('data integrity', () => {
    it('has 8 precincts total', () => {
      expect(PRECINCTS).toHaveLength(8);
    });

    it('every precinct has a valid stage assignment', () => {
      const stageIds = PRECINCT_STAGES.map(s => s.id);
      PRECINCTS.forEach((p) => {
        expect(stageIds).toContain(p.stage);
      });
    });

    it('every precinct has coordinates that form a closed polygon', () => {
      PRECINCTS.forEach((p) => {
        const first = p.coordinates[0];
        const last = p.coordinates[p.coordinates.length - 1];
        expect(first[0]).toBe(last[0]);
        expect(first[1]).toBe(last[1]);
      });
    });

    it('stage grouping matches expected assignments', () => {
      const stage0 = PRECINCTS.filter(p => p.stage === 'stage-0').map(p => p.id).sort();
      const stage1 = PRECINCTS.filter(p => p.stage === 'stage-1').map(p => p.id).sort();
      const stage23 = PRECINCTS.filter(p => p.stage === 'stage-2-3').map(p => p.id).sort();

      expect(stage0).toEqual(['kaihua-terrace', 'mikoikoi-cres', 'patiti-parade', 'tanners-rd']);
      expect(stage1).toEqual(['whai-hua-lane']);
      expect(stage23).toEqual(['huri-street', 'tima-lane', 'tukari-lane']);
    });
  });
});
