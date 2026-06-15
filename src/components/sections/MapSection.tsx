'use client';

import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { POINTS_OF_INTEREST, POI_TYPES, PRECINCTS, PRECINCT_STAGES, PRECINCT_STYLES, FACILITIES, FACILITY_TYPES, FACILITY_STYLES, ENTRANCES, ENTRANCE_STYLE, BOUNDARY_COORDINATES } from '@/data/map-data';
import { PROPERTY_DATA } from '@/data/property-addresses';
import { cn } from '@/lib/utils';
import { getFixedSiteHeaderHeight } from '@/lib/site-layout';
import BaseMap from '@/components/map/BaseMap';
import { track } from '@/lib/analytics/events';
import {
  SHARE_MAX_ZOOM,
  PLACE_FLOOR,
  buildShareUrl,
  describeLocation,
  placeLabel,
  roundCoord,
} from '@/lib/share-location';

const MAP_CENTER: [number, number] = [-36.9497, 174.7918];
const MAP_ZOOM = 17;

const OSM_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const OSM_TILE_OPTIONS = {
  maxZoom: 19,
  subdomains: ['a', 'b', 'c'] as ['a', 'b', 'c'],
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
};

// Zoom 18 → scale bar ≈ 30 m; zoom 19 → scale bar ≈ 20 m (at ~37° S)
const INITIAL_MAX_ZOOM = 18;
const PRECINCT_ZOOM = 19;

interface MapSectionProps {
  className?: string;
  /** Deep-link share target parsed server-side from `/map?lat&lng&from`. */
  shareLat?: number;
  shareLng?: number;
  shareFrom?: string;
}

function computeCentroid(coords: [number, number][]): [number, number] {
  let lngSum = 0;
  let latSum = 0;
  const n = coords.length - 1;
  for (let i = 0; i < n; i++) {
    lngSum += coords[i][0];
    latSum += coords[i][1];
  }
  return [lngSum / n, latSum / n];
}

const BIN_GLYPH = `<g fill="none" stroke="#fff" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 7.5 H14"/>
    <path d="M8.5 7.5 V6 H11.5 V7.5"/>
    <path d="M7.2 7.5 L7.9 14.5 H12.1 L12.8 7.5"/>
    <path d="M9 9.7 V12.5 M11 9.7 V12.5"/>
  </g>`;

// Tree (rounded canopy + trunk) — marks parks / green space.
const TREE_GLYPH = `<path fill="#fff" stroke="none" d="M10 3.2c-2.7 0-4.8 2-4.8 4.5 0 2.1 1.5 3.8 3.6 4.3v3.3c0 .55.55 1 1.2 1s1.2-.45 1.2-1v-3.3c2.1-.5 3.6-2.2 3.6-4.3 0-2.5-2.1-4.5-4.8-4.5z"/>`;

// Width of a bin marker: 20px icon cell plus a number cell when a label is present.
// Visitor parking is a touch wider to seat the "P" and the guest badge side by side.
function facilityMarkerWidth(icon: string, label?: string): number {
  if (icon === 'bin' && label) return 20 + label.length * 7 + 8;
  if (icon === 'parking-visitor') return 24;
  return 20;
}

// A small "guest" person silhouette (head + shoulders) cut into a white badge, drawn in the
// chip colour `c`, centred at (cx, cy). Marks parking reserved for visitors rather than a
// general public "P".
function guestBadge(cx: number, cy: number, c: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="5" fill="${c}"/>
    <circle cx="${cx}" cy="${cy}" r="4.1" fill="#fff"/>
    <circle cx="${cx}" cy="${cy - 1.6}" r="1.2" fill="${c}"/>
    <path d="M${cx - 2.3} ${cy + 2.2} A2.3 2.3 0 0 1 ${cx + 2.3} ${cy + 2.2} Z" fill="${c}"/>`;
}

// Map marker for facilities: a "P" square for parking; for bin enclosures a rectangle
// with the bin icon on the left and the enclosure number to its right.
function facilityMarkerHtml(color: string, icon: string, label?: string): string {
  if (icon === 'bin') {
    const w = facilityMarkerWidth(icon, label);
    const numText = label
      ? `<line x1="20" y1="4.5" x2="20" y2="15.5" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
         <text x="${20 + (w - 20) / 2}" y="14.2" text-anchor="middle" font-size="11" font-weight="700" font-family="system-ui,sans-serif" fill="#fff">${label}</text>`
      : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="20" viewBox="0 0 ${w} 20">
      <rect x="1" y="1" width="${w - 2}" height="18" rx="3" fill="${color}" stroke="none"/>
      ${BIN_GLYPH}
      ${numText}
    </svg>`;
  }
  if (icon === 'tree') {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <rect x="1" y="1" width="18" height="18" rx="3" fill="${color}" stroke="none"/>
      ${TREE_GLYPH}
    </svg>`;
  }
  if (icon === 'no-parking') {
    // Dark "P" struck through by an orange prohibition circle on the yellow warning chip.
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <rect x="1" y="1" width="18" height="18" rx="3" fill="${color}" stroke="none"/>
      <text x="10" y="14.2" text-anchor="middle" font-size="11" font-weight="700" font-family="system-ui,sans-serif" fill="#1F2937">P</text>
      <circle cx="10" cy="10" r="7.3" fill="none" stroke="#EA580C" stroke-width="1.8"/>
      <line x1="4.8" y1="4.8" x2="15.2" y2="15.2" stroke="#EA580C" stroke-width="1.8" stroke-linecap="round"/>
    </svg>`;
  }
  if (icon === 'parking-visitor') {
    // "P" with a guest badge: still reads as parking, but flags it as visitor-only.
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20">
      <rect x="1" y="1" width="22" height="18" rx="3" fill="${color}" stroke="none"/>
      <text x="8.5" y="14.4" text-anchor="middle" font-size="12" font-weight="700" font-family="system-ui,sans-serif" fill="#fff">P</text>
      ${guestBadge(16.5, 10, color)}
    </svg>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="3" fill="${color}" stroke="none"/>
    <text x="10" y="14.5" text-anchor="middle" font-size="12" font-weight="700" font-family="system-ui,sans-serif" fill="#fff">P</text>
  </svg>`;
}

// "Enter" arrow (arrow passing through a gatepost) — marks development entrances.
const ENTRANCE_GLYPH = `<g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 5 V15"/>
    <path d="M5 10 H12"/>
    <path d="M9 6.5 L12.5 10 L9 13.5"/>
  </g>`;

function entranceMarkerHtml(color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <rect x="1" y="1" width="18" height="18" rx="3" fill="${color}" stroke="none"/>
    ${ENTRANCE_GLYPH}
  </svg>`;
}

// --- CG selection seal ------------------------------------------------------
// A single terracotta wax-seal medallion dropped at the centre of whatever the
// resident selects in the sidebar, to anchor attention after the map flies in.

const SEAL_CX = 32;
const SEAL_CY = 25;
const SEAL_R = 19;
const SEAL_TIP_Y = 72;

// A scalloped (wax-seal) circle: convex arcs between evenly spaced rim points.
function scallopPath(cx: number, cy: number, r: number, bumps: number): string {
  const bumpR = r * Math.sin(Math.PI / bumps) * 1.25; // slightly > half-chord => gentle bulge
  let d = '';
  for (let i = 0; i <= bumps; i++) {
    const a = (i / bumps) * Math.PI * 2 - Math.PI / 2;
    const x = (cx + r * Math.cos(a)).toFixed(2);
    const y = (cy + r * Math.sin(a)).toFixed(2);
    d += i === 0 ? `M${x},${y}` : `A${bumpR.toFixed(2)},${bumpR.toFixed(2)} 0 0 1 ${x},${y}`;
  }
  return `${d}Z`;
}

const SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="80" viewBox="0 0 64 80" fill="none">
  <path d="M${SEAL_CX - 6},39 L${SEAL_CX},${SEAL_TIP_Y} L${SEAL_CX + 6},39 Z" fill="#1A2218"/>
  <path d="${scallopPath(SEAL_CX, SEAL_CY, SEAL_R, 18)}" fill="#2C3E2D"/>
  <circle cx="${SEAL_CX}" cy="${SEAL_CY}" r="${SEAL_R - 4}" fill="none" stroke="#F4F1EA" stroke-opacity="0.55" stroke-width="1"/>
  <circle cx="${SEAL_CX}" cy="${SEAL_CY}" r="${SEAL_R - 6.5}" fill="none" stroke="#F4F1EA" stroke-opacity="0.16" stroke-width="1"/>
</svg>`;

const SELECTION_PIN_HTML = `<span class="cg-seal__shadow"></span><span class="cg-seal__ripple"></span><span class="cg-seal__body">${SEAL_SVG}<span class="cg-seal__mono">CG</span></span>`;

const precinctsByStage = PRECINCT_STAGES.map((stage) => ({
  ...stage,
  precincts: PRECINCTS.filter((p) => p.stage === stage.id),
})).filter((group) => group.precincts.length > 0);

const propertyByPrecinct = new Map(
  PROPERTY_DATA.map((p) => [p.precinctId, p])
);

const allAddresses = PROPERTY_DATA.flatMap((p) =>
  p.addresses.map((a) => ({ ...a, precinctId: p.precinctId, precinctName: p.name }))
);

// Which precinct a point falls within (ray casting), with nearest-centroid fallback.
function pointInRing(pt: [number, number], ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const intersect =
      ((yi > pt[1]) !== (yj > pt[1])) &&
      (pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function precinctForPoint(pt: [number, number]): typeof PRECINCTS[number] | null {
  for (const p of PRECINCTS) {
    if (pointInRing(pt, p.coordinates)) return p;
  }
  let best: typeof PRECINCTS[number] | null = null;
  let bestDist = Infinity;
  for (const p of PRECINCTS) {
    const c = computeCentroid(p.coordinates);
    const d = (c[0] - pt[0]) ** 2 + (c[1] - pt[1]) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }
  return best;
}

interface BinEnclosure {
  id: string;
  name: string;
  coordinates: [number, number][];
  centroid: [number, number];
  precinctName: string;
  number: string;
  label: string;
}

// Bin enclosures labelled by the precinct they sit in (e.g. "Huri 1"), sorted by precinct then number.
const BIN_ENCLOSURES: BinEnclosure[] = FACILITIES
  .filter((f) => FACILITY_TYPES[f.type as keyof typeof FACILITY_TYPES]?.icon === 'bin')
  .map((f) => {
    const centroid = computeCentroid(f.coordinates);
    const precinct = precinctForPoint(centroid);
    const number = f.name.match(/\d+/)?.[0] ?? '';
    const shortName = precinct ? precinct.name.split(' ')[0] : '';
    return {
      id: f.id,
      name: f.name,
      coordinates: f.coordinates,
      centroid,
      precinctName: precinct?.name ?? '',
      number,
      label: `${shortName} ${number}`.trim(),
    };
  })
  .sort(
    (a, b) =>
      a.precinctName.localeCompare(b.precinctName) || Number(a.number) - Number(b.number)
  );

interface BinEnclosureGroup {
  precinctName: string;
  subheading: string; // precinct name without the street/lane suffix, e.g. "Whai Hua"
  bins: BinEnclosure[];
}

// Bins grouped under a per-precinct subheading (Huri, Tima, Tukari, Whai Hua).
const BIN_ENCLOSURE_GROUPS: BinEnclosureGroup[] = (() => {
  const byPrecinct = new Map<string, BinEnclosure[]>();
  BIN_ENCLOSURES.forEach((b) => {
    const arr = byPrecinct.get(b.precinctName) ?? [];
    arr.push(b);
    byPrecinct.set(b.precinctName, arr);
  });
  return Array.from(byPrecinct.entries()).map(([precinctName, bins]) => ({
    precinctName,
    subheading: precinctName.split(' ').slice(0, -1).join(' ') || precinctName,
    bins,
  }));
})();

interface StreetParkingGroup {
  name: string;
  count: number;
  serves?: string; // for visitor parking: the stage whose visitors it's reserved for
  rings: [number, number][][]; // every polygon belonging to this location
  centroid: [number, number];
}

// Parking polygons grouped by location name (e.g. all "Huri Street Parking" polygons → one entry),
// carrying the number of car parks available at that location. Used for both street parking and
// private visitor parking — they render identically, only the colour differs.
const groupParkingByType = (type: string): StreetParkingGroup[] => {
  const byName = new Map<string, typeof FACILITIES>();
  FACILITIES.filter((f) => f.type === type).forEach((f) => {
    const arr = byName.get(f.name) ?? [];
    arr.push(f);
    byName.set(f.name, arr);
  });
  return Array.from(byName.entries())
    .map(([name, members]) => {
      const rings = members.map((m) => m.coordinates);
      const centroids = rings.map((r) => computeCentroid(r));
      const centroid: [number, number] = [
        centroids.reduce((s, c) => s + c[0], 0) / centroids.length,
        centroids.reduce((s, c) => s + c[1], 0) / centroids.length,
      ];
      const count = Math.max(...members.map((m) => m.count ?? 0));
      const serves = members.find((m) => m.serves)?.serves;
      return { name, count, serves, rings, centroid };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

// Facility types that render as grouped, clickable parking locations with a car-park count.
const PARKING_GROUPS: Record<string, StreetParkingGroup[]> = {
  'street-parking': groupParkingByType('street-parking'),
  'private-visitor-parking': groupParkingByType('private-visitor-parking'),
};

// Info-card subtitle for a parking location. Private visitor parking spells out the restriction
// so it isn't mistaken for general public parking; street parking just states availability.
const parkingSubtitle = (type: string, count: number, serves?: string): string =>
  type === 'private-visitor-parking'
    ? `For ${serves ?? 'private'} visitors only · ${count} space${count === 1 ? '' : 's'}`
    : `${count} car park${count === 1 ? '' : 's'} available`;

export default function MapSection({ className, shareLat, shareLng, shareFrom }: MapSectionProps) {
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  const precinctLayerRefs = useRef<Map<string, L.GeoJSON>>(new Map());
  const addressMarkerLayerRef = useRef<L.LayerGroup | null>(null);
  const selectionPinRef = useRef<L.Marker | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<string | null>(null);
  const [selectedPrecinct, setSelectedPrecinct] = useState<string | null>(null);
  const selectedPrecinctRef = useRef<string | null>(null);
  const selectPrecinctFnRef = useRef<(id: string) => void>(() => {});
  const resetAllPrecinctsFnRef = useRef<() => void>(() => {});
  const dropSelectionPinFnRef = useRef<(lat: number, lng: number) => void>(() => {});
  const [infoCard, setInfoCard] = useState<{ title: string; subtitle?: string; dotColor?: string } | null>(null);
  const setInfoCardRef = useRef(setInfoCard);
  const [mapReady, setMapReady] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'precincts' | 'pois' | 'facilities' | null>('precincts');
  const facilityLayerRefs = useRef<Map<string, L.GeoJSON>>(new Map());
  const [facilityVisibility, setFacilityVisibility] = useState<Record<string, boolean>>({});
  const [stageVisibility, setStageVisibility] = useState<Record<string, boolean>>({});
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [addressSearch, setAddressSearch] = useState('');

  // --- Share a point on the map ---
  const [shareMode, setShareMode] = useState(false);
  const shareModeRef = useRef(false);
  const [shareCard, setShareCard] = useState<{
    lat: number;
    lng: number;
    isView?: boolean;
    /** Resolved place name ("Whai Hua", "Mount Roskill"); undefined while still resolving. */
    name?: string;
    /** Specifier under the name ("near 38 Huri Street"). */
    detail?: string;
    /** True while the reverse geocode is in flight and no local name was available yet. */
    resolving?: boolean;
  } | null>(null);
  const [shareCardPos, setShareCardPos] = useState<{ x: number; y: number } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const shareUrlInputRef = useRef<HTMLInputElement>(null);
  // Monotonic guard: a newer card open invalidates an older geocode response (race-safe).
  const shareGeocodeSeqRef = useRef(0);
  const placeSharePinFnRef = useRef<(lat: number, lng: number) => void>(() => {});
  // The deep-link target is read once on mount; handleMapReady consumes it to land.
  const shareTargetRef = useRef<{ lat: number; lng: number; from?: string } | null>(
    shareLat != null && shareLng != null
      ? { lat: shareLat, lng: shareLng, from: shareFrom }
      : null
  );

  const sectionRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const [mapHeight, setMapHeight] = useState<number>(600);

  const calculateMapHeight = useCallback(() => {
    if (typeof window === 'undefined') return 600;
    const headerHeight = getFixedSiteHeaderHeight();
    const bottomPadding = 40;
    const availableHeight = window.innerHeight - headerHeight - bottomPadding;
    return Math.max(400, availableHeight);
  }, []);

  const scrollToFullView = useCallback(() => {
    if (hasScrolledRef.current || !sectionRef.current) return;
    hasScrolledRef.current = true;
    document.documentElement.classList.add('map-immersive-mode');
    const headerHeight = getFixedSiteHeaderHeight();
    const rect = sectionRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const targetY = rect.top + scrollTop - headerHeight;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handleResize = () => setMapHeight(calculateMapHeight());
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateMapHeight]);

  useEffect(() => {
    if (mapInstance) {
      const timeoutId = setTimeout(() => mapInstance.invalidateSize(), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [mapHeight, mapInstance]);

  useEffect(() => {
    if (!mapReady || !sectionRef.current || hasScrolledRef.current) return;

    const scrollMapBelowHeader = () => {
      const el = sectionRef.current;
      if (!el) return;
      const headerHeight = getFixedSiteHeaderHeight();
      const rect = el.getBoundingClientRect();
      const y = window.scrollY || document.documentElement.scrollTop;
      const targetY = rect.top + y - headerHeight;
      window.scrollTo({ top: Math.max(0, targetY), behavior: 'instant' });
    };

    scrollMapBelowHeader();
    const rafId = requestAnimationFrame(scrollMapBelowHeader);
    const t1 = window.setTimeout(scrollMapBelowHeader, 100);
    const t2 = window.setTimeout(scrollMapBelowHeader, 300);
    hasScrolledRef.current = true;

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [mapReady]);

  const applyPrecinctStyle = useCallback((
    layer: L.GeoJSON,
    precinct: typeof PRECINCTS[number],
    state: 'default' | 'hover' | 'selected' | 'dimmed'
  ) => {
    const style = PRECINCT_STYLES[state];
    layer.setStyle({
      color: precinct.strokeColor,
      weight: style.weight,
      dashArray: style.dashArray,
      opacity: style.opacity,
      fillColor: precinct.color,
      fillOpacity: style.fillOpacity,
    });
  }, []);

  const clearAddressMarkers = useCallback(() => {
    if (addressMarkerLayerRef.current) {
      addressMarkerLayerRef.current.clearLayers();
    }
  }, []);

  const showAddressMarkers = useCallback(async (precinctId: string) => {
    if (!mapInstance) return;
    const L = (await import('leaflet')).default;

    clearAddressMarkers();

    if (!addressMarkerLayerRef.current) {
      addressMarkerLayerRef.current = L.layerGroup().addTo(mapInstance);
    }

    const precinctProps = propertyByPrecinct.get(precinctId);
    if (!precinctProps) return;

    for (const addr of precinctProps.addresses) {
      const num = addr.streetNumber || '?';
      const isWide = num.length >= 3;
      const w = isWide ? 30 : 24;
      const h = 32;
      const icon = L.divIcon({
        className: 'address-pin',
        iconSize: [w, h],
        iconAnchor: [w / 2, h],
        popupAnchor: [0, -h + 4],
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
          <path d="${isWide
            ? 'M15 1C8.1 1 2.5 5.8 2.5 12c0 8.5 12.5 19 12.5 19s12.5-10.5 12.5-19C27.5 5.8 21.9 1 15 1z'
            : 'M12 1C6.5 1 2 5.8 2 12c0 8.5 10 19 10 19s10-10.5 10-19C22 5.8 17.5 1 12 1z'
          }" fill="#2d5a3d" stroke="none"/>
          <text x="${w / 2}" y="14" text-anchor="middle" font-size="${isWide ? 9 : 10}" font-weight="700" font-family="system-ui,sans-serif" fill="#fff">${num}</text>
        </svg>`,
      });
      const marker = L.marker(addr.coordinates, { icon });
      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (shareModeRef.current) {
          placeSharePinFnRef.current(e.latlng.lat, e.latlng.lng);
          return;
        }
        dropSelectionPinFnRef.current(addr.coordinates[0], addr.coordinates[1]);
        setInfoCardRef.current({ title: addr.fullAddress, dotColor: '#2d5a3d' });
      });
      addressMarkerLayerRef.current!.addLayer(marker);
    }
  }, [mapInstance, clearAddressMarkers]);

  // Drop the single CG seal at a [lat, lng] point, replacing any existing one.
  // Recreating the marker remounts the element so the drop animation replays.
  const dropSelectionPin = useCallback(async (lat: number, lng: number) => {
    if (!mapInstance) return;
    const L = (await import('leaflet')).default;
    if (selectionPinRef.current) {
      selectionPinRef.current.remove();
      selectionPinRef.current = null;
    }
    const icon = L.divIcon({
      className: 'cg-seal',
      html: SELECTION_PIN_HTML,
      iconSize: [64, 80],
      iconAnchor: [32, SEAL_TIP_Y],
    });
    selectionPinRef.current = L.marker([lat, lng], {
      icon,
      interactive: false,
      keyboard: false,
      zIndexOffset: 2000,
    }).addTo(mapInstance);
  }, [mapInstance]);
  dropSelectionPinFnRef.current = dropSelectionPin;

  const clearSelectionPin = useCallback(() => {
    if (selectionPinRef.current) {
      selectionPinRef.current.remove();
      selectionPinRef.current = null;
    }
  }, []);

  const resetAllPrecincts = useCallback(() => {
    PRECINCTS.forEach((p) => {
      const layer = precinctLayerRefs.current.get(p.id);
      if (layer) applyPrecinctStyle(layer, p, 'default');
    });
    setSelectedPrecinct(null);
    selectedPrecinctRef.current = null;
    setInfoCard(null);
    clearAddressMarkers();
    clearSelectionPin();
    mapInstance?.closePopup();
  }, [mapInstance, applyPrecinctStyle, clearAddressMarkers, clearSelectionPin]);
  resetAllPrecinctsFnRef.current = resetAllPrecincts;

  // --- Share a point on the map -------------------------------------------------

  // Open the share card for a point and name it. Shows the precise CGRS label instantly
  // (precinct / nearby address); otherwise it resolves a suburb / street via the same
  // reverse-geocode ladder the link unfurl uses, so a point outside the development still
  // names somewhere real instead of a bare "Shared location".
  const openShareCard = useCallback((lat: number, lng: number, isView: boolean) => {
    const local = placeLabel(describeLocation(lat, lng));
    setShareCard({
      lat,
      lng,
      isView,
      name: local.resolved ? local.name : undefined,
      detail: local.resolved ? local.detail : undefined,
      resolving: !local.resolved,
    });

    const seq = ++shareGeocodeSeqRef.current;
    fetch(`/api/geocode/share?lat=${lat}&lng=${lng}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (seq !== shareGeocodeSeqRef.current || !data?.name) return;
        setShareCard((prev) =>
          prev && prev.lat === lat && prev.lng === lng
            ? { ...prev, name: data.name, detail: data.detail, resolving: false }
            : prev
        );
      })
      .catch(() => {
        if (seq !== shareGeocodeSeqRef.current) return;
        setShareCard((prev) =>
          prev && prev.lat === lat && prev.lng === lng
            ? { ...prev, name: prev.name ?? PLACE_FLOOR, resolving: false }
            : prev
        );
      });
  }, []);

  // Drop the seal at a clicked point and open the share card (author flow). Sticky:
  // each call repositions the single pin (dropSelectionPin already replaces it).
  const placeSharePin = useCallback(async (lat: number, lng: number) => {
    await dropSelectionPin(lat, lng);
    openShareCard(lat, lng, false);
    track('share_pin_placed', {
      lat: roundCoord(lat),
      lng: roundCoord(lng),
      precinct_id: describeLocation(lat, lng).precinctId ?? null,
    });
  }, [dropSelectionPin, openShareCard]);
  placeSharePinFnRef.current = placeSharePin;

  const disarmShareMode = useCallback(() => {
    shareModeRef.current = false;
    setShareMode(false);
  }, []);

  const armShareMode = useCallback(() => {
    // Clear any prior precinct/POI selection so the seal unambiguously marks the
    // share point (this also clears an existing seal/info-card).
    resetAllPrecincts();
    shareModeRef.current = true;
    setShareMode(true);
    track('share_mode_armed', { source: 'map_control' });
  }, [resetAllPrecincts]);

  const toggleShareMode = useCallback(() => {
    if (shareModeRef.current) {
      disarmShareMode();
    } else {
      armShareMode();
    }
  }, [armShareMode, disarmShareMode]);

  // Dismiss the share card via its close button: remove the card + pin and end
  // placement mode (if armed).
  const closeShareCard = useCallback(() => {
    setShareCard(null);
    setShareCopied(false);
    clearSelectionPin();
    disarmShareMode();
  }, [clearSelectionPin, disarmShareMode]);

  const handleCopyShareUrl = useCallback(async () => {
    if (!shareCard) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}${buildShareUrl(shareCard.lat, shareCard.lng, { from: 'share' })}`;

    // Try the async Clipboard API, then fall back to execCommand on the selected
    // field (covers insecure contexts and "document not focused" rejections).
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = shareUrlInputRef.current;
      if (el) {
        el.select();
        try {
          document.execCommand('copy');
        } catch {
          /* nothing more we can do; the field stays selected for manual copy */
        }
      }
    }

    track('share_link_copied', {
      lat: roundCoord(shareCard.lat),
      lng: roundCoord(shareCard.lng),
    });

    // Confirm briefly, then close the card itself — the share action is complete.
    setShareCopied(true);
    disarmShareMode();
    setTimeout(() => {
      setShareCard(null);
      setShareCopied(false);
    }, 800);
  }, [shareCard, disarmShareMode]);

  // Escape disarms placement mode from anywhere on the page (pin + card persist).
  useEffect(() => {
    if (!shareMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') disarmShareMode();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [shareMode, disarmShareMode]);

  // Keep the share card anchored above the pin as the map pans/zooms/resizes.
  useEffect(() => {
    if (!mapInstance || !shareCard) {
      setShareCardPos(null);
      return;
    }
    const update = () => {
      const pt = mapInstance.latLngToContainerPoint([shareCard.lat, shareCard.lng]);
      setShareCardPos({ x: pt.x, y: pt.y });
    };
    update();
    mapInstance.on('move', update);
    mapInstance.on('zoom', update);
    mapInstance.on('resize', update);
    return () => {
      mapInstance.off('move', update);
      mapInstance.off('zoom', update);
      mapInstance.off('resize', update);
    };
  }, [mapInstance, shareCard]);

  const selectPrecinct = useCallback((precinctId: string) => {
    if (!mapInstance || !mapReady) return;

    const precinct = PRECINCTS.find(p => p.id === precinctId);
    if (!precinct) return;

    scrollToFullView();

    if (selectedPrecinctRef.current === precinctId) {
      return;
    }

    PRECINCTS.forEach((p) => {
      const layer = precinctLayerRefs.current.get(p.id);
      if (!layer) return;
      applyPrecinctStyle(layer, p, p.id === precinctId ? 'selected' : 'dimmed');
    });

    setSelectedPrecinct(precinctId);
    selectedPrecinctRef.current = precinctId;
    setSelectedPOI(null);
    mapInstance.closePopup();

    const count = propertyByPrecinct.get(precinctId)?.count ?? 0;
    setInfoCard({
      title: precinct.name,
      subtitle: count > 0 ? `${count} properties` : undefined,
      dotColor: precinct.color,
    });

    const targetLayer = precinctLayerRefs.current.get(precinctId);
    if (targetLayer) {
      const centroid = computeCentroid(precinct.coordinates);
      dropSelectionPin(centroid[1], centroid[0]);
      mapInstance.flyTo([centroid[1], centroid[0]], PRECINCT_ZOOM, {
        duration: 0.4,
      });

      mapInstance.once('moveend', () => {
        showAddressMarkers(precinctId);
      });
    }
  }, [mapInstance, mapReady, scrollToFullView, applyPrecinctStyle, showAddressMarkers, dropSelectionPin]);
  selectPrecinctFnRef.current = selectPrecinct;

  const handleMapReady = useCallback(async (map: L.Map) => {
    const L = (await import('leaflet')).default;

    const scrollTriggerEvents = ['movestart', 'zoomstart', 'dragstart'];
    scrollTriggerEvents.forEach((eventName) => {
      map.once(eventName, scrollToFullView);
    });

    // Development boundary — outline only, no fill
    const boundaryFeature: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [BOUNDARY_COORDINATES.map(coord => [...coord])],
      },
    };
    L.geoJSON(boundaryFeature as GeoJSON.GeoJsonObject, {
      style: {
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        dashArray: undefined, // solid line
        fill: false,
      },
      interactive: false,
    }).addTo(map);

    // Render precinct polygons
    PRECINCTS.forEach((precinct) => {
      const feature: GeoJSON.Feature = {
        type: 'Feature',
        properties: { id: precinct.id },
        geometry: {
          type: 'Polygon',
          coordinates: [precinct.coordinates],
        },
      };

      const layer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
        style: {
          color: precinct.strokeColor,
          weight: PRECINCT_STYLES.default.weight,
          dashArray: PRECINCT_STYLES.default.dashArray,
          opacity: PRECINCT_STYLES.default.opacity,
          fillColor: precinct.color,
          fillOpacity: PRECINCT_STYLES.default.fillOpacity,
        },
      }).addTo(map);

      layer.on('mouseover', () => {
        if (selectedPrecinctRef.current !== precinct.id) {
          applyPrecinctStyle(layer, precinct, 'hover');
        }
      });

      layer.on('mouseout', () => {
        if (selectedPrecinctRef.current !== precinct.id) {
          const stateToRestore = selectedPrecinctRef.current ? 'dimmed' : 'default';
          applyPrecinctStyle(layer, precinct, stateToRestore);
        }
      });

      layer.on('click', () => {
        // In placement mode, let the map-level click handler drop the pin (the
        // vector-layer click bubbles up to it) — don't select the precinct.
        if (shareModeRef.current) return;
        selectPrecinctFnRef.current(precinct.id);
      });

      precinctLayerRefs.current.set(precinct.id, layer);
    });

    // Reset on background click — unless placement mode is armed, in which case the
    // click drops/repositions the share pin and must NOT reset precincts.
    map.on('click', (e: L.LeafletMouseEvent) => {
      if (shareModeRef.current) {
        placeSharePinFnRef.current(e.latlng.lat, e.latlng.lng);
        return;
      }
      if (!(e.originalEvent.target as HTMLElement)?.closest('.leaflet-interactive')) {
        resetAllPrecinctsFnRef.current();
      }
    });

    // Render facility polygons + [P] markers
    FACILITIES.forEach((facility) => {
      const facilityType = FACILITY_TYPES[facility.type as keyof typeof FACILITY_TYPES];
      if (!facilityType) return;

      const feature: GeoJSON.Feature = {
        type: 'Feature',
        properties: { id: facility.id, name: facility.name },
        geometry: {
          type: 'Polygon',
          coordinates: [facility.coordinates],
        },
      };

      // The emergency clearway is a warning zone: stronger yellow fill + a dashed orange border.
      const isWarning = facilityType.icon === 'no-parking';
      // Parking areas (street + private visitor) get a crisp solid outline so they stay legible
      // even when sitting on top of another coloured area (e.g. a park) rather than the grey road.
      // A stronger fill so the blue reads clearly even on top of a coloured area (e.g. a park).
      const isParkingArea = facility.type === 'street-parking' || facility.type === 'private-visitor-parking';
      const baseFillOpacity = isWarning ? 0.5 : isParkingArea ? 0.6 : FACILITY_STYLES.default.fillOpacity;
      const hoverFillOpacity = isWarning ? 0.62 : isParkingArea ? 0.72 : FACILITY_STYLES.hover.fillOpacity;
      const facilitySubtitle = isWarning
        ? 'No parking — keep clear at all times'
        : isParkingArea && facility.count
          ? parkingSubtitle(facility.type, facility.count, facility.serves)
          : undefined;

      const layer = L.geoJSON(feature as GeoJSON.GeoJsonObject, {
        style: {
          color: isWarning ? '#EA580C' : facilityType.color,
          weight: isWarning ? 2 : isParkingArea ? 1.5 : FACILITY_STYLES.default.weight,
          dashArray: isWarning ? '5,4' : undefined,
          fillColor: facilityType.color,
          fillOpacity: baseFillOpacity,
          stroke: isWarning || isParkingArea,
        },
      }).addTo(map);

      layer.on('mouseover', () => {
        layer.setStyle({ fillOpacity: hoverFillOpacity });
      });

      layer.on('mouseout', () => {
        layer.setStyle({ fillOpacity: baseFillOpacity });
      });

      layer.on('click', () => {
        // In placement mode, defer to the map-level click handler (the polygon
        // click bubbles up) so a share pin drops where the user clicked.
        if (shareModeRef.current) return;
        const centroid = computeCentroid(facility.coordinates);
        dropSelectionPinFnRef.current(centroid[1], centroid[0]);
        map.flyTo([centroid[1], centroid[0]], PRECINCT_ZOOM, { duration: 0.4 });
        setInfoCardRef.current({
          title: facility.name,
          subtitle: facilitySubtitle,
          dotColor: facilityType.color,
        });
      });

      // Add centered marker at polygon centroid (P for parking, bin icon + number for enclosures).
      // Skipped where it would collide with a neighbour's marker (facility.hideMarker).
      if (!facility.hideMarker) {
        const centroid = computeCentroid(facility.coordinates);
        const enclosureNum = facilityType.icon === 'bin' ? (facility.name.match(/\d+/)?.[0] ?? '') : '';
        const markerW = facilityMarkerWidth(facilityType.icon, enclosureNum);
        const pIcon = L.divIcon({
          className: 'facility-p-marker',
          iconSize: [markerW, 20],
          iconAnchor: [markerW / 2, 10],
          html: facilityMarkerHtml(facilityType.color, facilityType.icon, enclosureNum),
        });
        const pMarker = L.marker([centroid[1], centroid[0]], { icon: pIcon }).addTo(map);
        pMarker.on('click', (e: L.LeafletMouseEvent) => {
          if (shareModeRef.current) {
            placeSharePinFnRef.current(e.latlng.lat, e.latlng.lng);
            return;
          }
          dropSelectionPinFnRef.current(centroid[1], centroid[0]);
          setInfoCardRef.current({
            title: facility.name,
            subtitle: facilitySubtitle,
            dotColor: facilityType.color,
          });
        });
        facilityLayerRefs.current.set(`${facility.id}-marker`, pMarker as unknown as L.GeoJSON);
      }

      facilityLayerRefs.current.set(facility.id, layer);
    });

    // Render development entrance markers ("enter" arrow chip)
    ENTRANCES.forEach((entrance) => {
      const icon = L.divIcon({
        className: 'facility-p-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        html: entranceMarkerHtml(ENTRANCE_STYLE.color),
      });
      const marker = L.marker([entrance.coordinates[1], entrance.coordinates[0]], {
        icon,
        zIndexOffset: 500,
      }).addTo(map);
      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (shareModeRef.current) {
          placeSharePinFnRef.current(e.latlng.lat, e.latlng.lng);
          return;
        }
        dropSelectionPinFnRef.current(entrance.coordinates[1], entrance.coordinates[0]);
        setInfoCardRef.current({
          title: entrance.name,
          subtitle: `Serves ${entrance.serves}`,
          dotColor: ENTRANCE_STYLE.color,
        });
      });
    });

    // Add POI markers
    POINTS_OF_INTEREST.forEach((poi) => {
      const poiType = POI_TYPES[poi.type as keyof typeof POI_TYPES];
      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" style="
          color: ${poiType.color};
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
        ">
          <circle cx="12" cy="12" r="10" fill="currentColor" fill-opacity="0.9"/>
          <circle cx="12" cy="12" r="5" fill="white"/>
          <circle cx="12" cy="12" r="3" fill="${poiType.color}"/>
        </svg>
      `;

      const customIcon = L.divIcon({
        className: 'poi-marker',
        html: iconHtml,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -25],
      });

      const marker = L.marker(poi.coordinates, {
        icon: customIcon,
        zIndexOffset: 1000,
      }).addTo(map);

      marker.bindPopup(`
        <div class="poi-popup">
          <strong>${poi.name}</strong>
          <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8;">${poi.description}</p>
        </div>
      `, { className: 'custom-popup' });

      marker.on('click', (e: L.LeafletMouseEvent) => {
        if (shareModeRef.current) {
          placeSharePinFnRef.current(e.latlng.lat, e.latlng.lng);
          return;
        }
        dropSelectionPinFnRef.current(poi.coordinates[0], poi.coordinates[1]);
      });

      markerRefs.current.set(poi.id, marker);
    });

    const shareTarget = shareTargetRef.current;
    if (shareTarget) {
      // Deep-link landing: skip the fit-to-bounds overview, jump straight to the
      // shared point at max zoom (instant), drop the pin, and open the card.
      const { lat, lng, from } = shareTarget;
      const landZoom = Math.min(map.getMaxZoom(), SHARE_MAX_ZOOM);
      map.setView([lat, lng], landZoom, { animate: false });

      const icon = L.divIcon({
        className: 'cg-seal',
        html: SELECTION_PIN_HTML,
        iconSize: [64, 80],
        iconAnchor: [32, SEAL_TIP_Y],
      });
      selectionPinRef.current = L.marker([lat, lng], {
        icon,
        interactive: false,
        keyboard: false,
        zIndexOffset: 2000,
      }).addTo(map);

      openShareCard(lat, lng, from === 'share');
      track('shared_link_opened', {
        lat: roundCoord(lat),
        lng: roundCoord(lng),
        from: from ?? null,
      });

      // Once the user does anything to the map, the share params no longer describe the
      // view — strip lat/lng/from from the address bar (replaceState, no reload). We
      // listen for native input on the Leaflet container (pointer/wheel/keyboard), which
      // fires reliably for drag, zoom buttons, wheel-zoom, and keyboard pan. The share
      // card is a sibling of this container, so interacting with the card won't trigger
      // it. Armed on the next tick so the programmatic landing setView doesn't count.
      const container = map.getContainer();
      let cleared = false;
      const clearShareParams = () => {
        if (cleared) return;
        cleared = true;
        container.removeEventListener('pointerdown', clearShareParams);
        container.removeEventListener('wheel', clearShareParams);
        container.removeEventListener('keydown', clearShareParams);
        if (typeof window === 'undefined') return;
        const url = new URL(window.location.href);
        let touched = false;
        ['lat', 'lng', 'from'].forEach((p) => {
          if (url.searchParams.has(p)) {
            url.searchParams.delete(p);
            touched = true;
          }
        });
        if (touched) {
          window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        }
      };
      setTimeout(() => {
        container.addEventListener('pointerdown', clearShareParams);
        container.addEventListener('wheel', clearShareParams, { passive: true });
        container.addEventListener('keydown', clearShareParams);
      }, 0);
    } else {
      const allBounds = L.latLngBounds([]);
      precinctLayerRefs.current.forEach((layer) => {
        allBounds.extend(layer.getBounds());
      });
      map.setView(allBounds.getCenter(), INITIAL_MAX_ZOOM);
    }

    L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    map.invalidateSize();

    setMapInstance(map);
    setMapReady(true);
  }, [scrollToFullView, applyPrecinctStyle, openShareCard]);

  const handlePOIClick = useCallback((poi: (typeof POINTS_OF_INTEREST)[number]) => {
    scrollToFullView();
    if (!mapInstance || !mapReady) return;

    resetAllPrecincts();
    setSelectedPOI(poi.id);
    mapInstance.closePopup();
    dropSelectionPin(poi.coordinates[0], poi.coordinates[1]);
    mapInstance.flyTo(poi.coordinates, 17, { duration: 1.2, easeLinearity: 0.25 });
    mapInstance.once('moveend', () => {
      const marker = markerRefs.current.get(poi.id);
      if (marker) marker.openPopup();
    });
  }, [mapInstance, mapReady, scrollToFullView, resetAllPrecincts, dropSelectionPin]);

  const toggleFacilityType = useCallback((type: string) => {
    if (!mapInstance) return;
    const newVisible = !(facilityVisibility[type] ?? true);
    setFacilityVisibility((prev) => ({ ...prev, [type]: newVisible }));
    FACILITIES.filter((f) => f.type === type).forEach((f) => {
      [facilityLayerRefs.current.get(f.id), facilityLayerRefs.current.get(`${f.id}-marker`)].forEach((layer) => {
        if (!layer) return;
        if (newVisible) {
          layer.addTo(mapInstance);
        } else {
          layer.removeFrom(mapInstance);
        }
      });
    });
  }, [facilityVisibility, mapInstance]);

  // Show/hide all precinct fills for one stage at once.
  const togglePrecinctStage = useCallback((stageId: string) => {
    if (!mapInstance) return;
    const newVisible = !(stageVisibility[stageId] ?? true);
    setStageVisibility((prev) => ({ ...prev, [stageId]: newVisible }));
    PRECINCTS.filter((p) => p.stage === stageId).forEach((p) => {
      const layer = precinctLayerRefs.current.get(p.id);
      if (!layer) return;
      if (newVisible) {
        layer.addTo(mapInstance);
      } else {
        layer.removeFrom(mapInstance);
      }
    });
  }, [stageVisibility, mapInstance]);

  // Zoom to max and centre on a single facility (used by the bin-enclosure list)
  const handleFacilityClick = useCallback((facility: BinEnclosure) => {
    if (!mapInstance || !mapReady) return;
    scrollToFullView();
    setSelectedFacility(facility.id);
    setSelectedPOI(null);
    mapInstance.closePopup();
    dropSelectionPin(facility.centroid[1], facility.centroid[0]);
    const maxZoom = mapInstance.getMaxZoom();
    mapInstance.flyTo([facility.centroid[1], facility.centroid[0]], maxZoom, { duration: 0.8 });
    setInfoCard({
      title: `Bin Enclosure ${facility.number}`,
      subtitle: facility.precinctName || undefined,
      dotColor: FACILITY_TYPES['bin-enclosure'].color,
    });
  }, [mapInstance, mapReady, scrollToFullView, dropSelectionPin]);

  // Fit to all polygons of a parking location (street or private visitor) and show its park count.
  const handleStreetParkingClick = useCallback(async (group: StreetParkingGroup, type: string) => {
    if (!mapInstance || !mapReady) return;
    scrollToFullView();
    setSelectedFacility(group.name);
    setSelectedPOI(null);
    mapInstance.closePopup();
    const L = (await import('leaflet')).default;
    const bounds = L.latLngBounds([]);
    group.rings.forEach((ring) => ring.forEach(([lng, lat]) => bounds.extend([lat, lng])));
    if (bounds.isValid()) {
      mapInstance.flyToBounds(bounds, { padding: [70, 70], maxZoom: mapInstance.getMaxZoom(), duration: 0.8 });
    }
    dropSelectionPin(group.centroid[1], group.centroid[0]);
    setInfoCard({
      title: group.name,
      subtitle: parkingSubtitle(type, group.count, group.serves),
      dotColor: FACILITY_TYPES[type as keyof typeof FACILITY_TYPES].color,
    });
  }, [mapInstance, mapReady, scrollToFullView, dropSelectionPin]);

  const groupedFacilities = Object.entries(FACILITY_TYPES)
    .filter(([type]) => type !== 'no-parking-zone')
    .map(([type, { color, label, icon }]) => ({
      type,
      color,
      label,
      icon,
      facilities: FACILITIES.filter(f => f.type === type),
    })).filter(group => group.facilities.length > 0);

  const groupedPOIs = Object.entries(POI_TYPES).map(([type, { color, label }]) => ({
    type,
    color,
    label,
    pois: POINTS_OF_INTEREST.filter(poi => poi.type === type),
  })).filter(group => group.pois.length > 0);

  return (
    <div
      ref={sectionRef}
      className={cn('map-section-wrapper', className)}
      data-testid="map-section-wrapper"
      data-share-arming={shareMode ? '' : undefined}
    >
      {/* Sidebar */}
      <aside className="map-sidebar">
        <div className="sidebar-header">
          <h3>Coronation Gardens</h3>
          <p>Click to navigate</p>
        </div>

        <div className="sidebar-accordions">
          {/* Precincts accordion — grouped by stage */}
          <div data-open={openAccordion === 'precincts' ? '' : undefined}>
            <button
              type="button"
              className="accordion-trigger"
              data-open={openAccordion === 'precincts' ? '' : undefined}
              aria-expanded={openAccordion === 'precincts'}
              onClick={() => setOpenAccordion(openAccordion === 'precincts' ? null : 'precincts')}
            >
              <span>Precincts</span>
              <span className="accordion-count">{PRECINCTS.length}</span>
              <ChevronIcon />
            </button>
            {openAccordion === 'precincts' && (
              <div className="accordion-panel">
                {precinctsByStage.map((stageGroup) => {
                  const stageVisible = stageVisibility[stageGroup.id] ?? true;
                  return (
                  <div key={stageGroup.id} className={cn('poi-group', !stageVisible && 'layer-hidden')}>
                    <div className="poi-group-header">
                      <span
                        className="poi-group-color"
                        style={{ backgroundColor: stageGroup.color.fill }}
                      />
                      <span>{stageGroup.label}</span>
                      <span className="poi-count">
                        ({stageGroup.precincts.reduce(
                          (sum, precinct) =>
                            sum + (propertyByPrecinct.get(precinct.id)?.count ?? 0),
                          0
                        )})
                      </span>
                      <VisibilityToggle visible={stageVisible} onClick={() => togglePrecinctStage(stageGroup.id)} label={stageGroup.label} />
                    </div>
                    <ul className="poi-list">
                      {stageGroup.precincts.map((precinct) => (
                        <li key={precinct.id}>
                          <button
                            type="button"
                            onClick={() => selectPrecinct(precinct.id)}
                            disabled={!mapReady || !stageVisible}
                            className={cn(
                              'poi-button',
                              selectedPrecinct === precinct.id && 'selected',
                              !mapReady && 'loading'
                            )}
                            style={{ '--poi-color': precinct.color } as React.CSSProperties}
                          >
                            <span
                              className="poi-group-color"
                              style={{ backgroundColor: precinct.color }}
                            />
                            <span className="poi-name">{precinct.name}</span>
                            {(propertyByPrecinct.get(precinct.id)?.count ?? 0) > 0 && (
                              <span className="poi-count property-count">
                                {propertyByPrecinct.get(precinct.id)!.count}
                              </span>
                            )}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Facilities accordion */}
          <div data-open={openAccordion === 'facilities' ? '' : undefined}>
            <button
              type="button"
              className="accordion-trigger"
              data-open={openAccordion === 'facilities' ? '' : undefined}
              aria-expanded={openAccordion === 'facilities'}
              onClick={() => setOpenAccordion(openAccordion === 'facilities' ? null : 'facilities')}
            >
              <span>Facilities</span>
              <span className="accordion-count">{FACILITIES.length}</span>
              <ChevronIcon />
            </button>
            {openAccordion === 'facilities' && (
              <div className="accordion-panel">
                {groupedFacilities.map(({ type, color, label, icon, facilities }) => {
                  const isVisible = facilityVisibility[type] ?? true;
                  return (
                    <div key={type} className={cn('poi-group', !isVisible && 'layer-hidden')}>
                      <div className="poi-group-header">
                        <span className="poi-group-color" style={{ backgroundColor: color }} />
                        <span>{label}</span>
                        <span className="poi-count">({PARKING_GROUPS[type] ? PARKING_GROUPS[type].length : facilities.length})</span>
                        <VisibilityToggle visible={isVisible} onClick={() => toggleFacilityType(type)} label={label} />
                      </div>
                      {icon === 'bin' && (
                        <div className="bin-groups">
                          {BIN_ENCLOSURE_GROUPS.map((grp) => (
                            <div key={grp.precinctName} className="bin-group">
                              <div className="bin-subheading">{grp.subheading}</div>
                              <ul className="poi-list bin-grid">
                                {grp.bins.map((bin) => (
                                  <li key={bin.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleFacilityClick(bin)}
                                      disabled={!mapReady}
                                      className={cn(
                                        'poi-button',
                                        selectedFacility === bin.id && 'selected',
                                        !mapReady && 'loading'
                                      )}
                                      style={{ '--poi-color': color } as React.CSSProperties}
                                    >
                                      <span className="poi-name">Bin {bin.number}</span>
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      )}
                      {PARKING_GROUPS[type] && (
                        <ul className="poi-list">
                          {PARKING_GROUPS[type].map((group) => (
                            <li key={group.name}>
                              <button
                                type="button"
                                onClick={() => handleStreetParkingClick(group, type)}
                                disabled={!mapReady}
                                className={cn(
                                  'poi-button',
                                  selectedFacility === group.name && 'selected',
                                  !mapReady && 'loading'
                                )}
                                style={{ '--poi-color': color } as React.CSSProperties}
                              >
                                <span className="poi-name">{group.name}</span>
                                <span className="parking-count">
                                  <span className="parking-count-num">{group.count}</span>
                                  <span className="parking-count-unit">{group.count === 1 ? 'park' : 'parks'}</span>
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Neighborhood Features accordion */}
          <div data-open={openAccordion === 'pois' ? '' : undefined}>
            <button
              type="button"
              className="accordion-trigger"
              data-open={openAccordion === 'pois' ? '' : undefined}
              aria-expanded={openAccordion === 'pois'}
              onClick={() => setOpenAccordion(openAccordion === 'pois' ? null : 'pois')}
            >
              <span>Māngere Bridge Points of Interest</span>
              <span className="accordion-count">{POINTS_OF_INTEREST.length}</span>
              <ChevronIcon />
            </button>
            {openAccordion === 'pois' && (
              <div className="accordion-panel">
                {groupedPOIs.map(({ type, color, label, pois }) => (
                  <div key={type} className="poi-group">
                    <div className="poi-group-header">
                      <span className="poi-group-color" style={{ backgroundColor: color }} />
                      <span>{label}</span>
                      <span className="poi-count">({pois.length})</span>
                    </div>
                    <ul className="poi-list">
                      {pois.map((poi) => (
                        <li key={poi.id}>
                          <button
                            type="button"
                            onClick={() => handlePOIClick(poi)}
                            disabled={!mapReady}
                            className={cn(
                              'poi-button',
                              selectedPOI === poi.id && 'selected',
                              !mapReady && 'loading'
                            )}
                            style={{ '--poi-color': color } as React.CSSProperties}
                          >
                            <span className="poi-name">{poi.name}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Address search */}
          <div className="address-search-section">
            <label htmlFor="address-search" className="address-search-label">Search Addresses</label>
            <input
              id="address-search"
              type="text"
              className="address-search"
              placeholder="Start typing a street address..."
              value={addressSearch}
              onChange={(e) => setAddressSearch(e.target.value)}
            />
            {addressSearch.length >= 2 && (() => {
              const query = addressSearch.toLowerCase();
              const matches = allAddresses.filter((a) =>
                a.fullAddress.toLowerCase().includes(query)
              ).slice(0, 20);
              return matches.length > 0 ? (
                <ul className="address-results">
                  {matches.map((addr) => (
                    <li key={addr.id}>
                      <button
                        type="button"
                        className="address-result-button"
                        onClick={() => {
                          if (mapInstance && mapReady) {
                            scrollToFullView();
                            selectPrecinct(addr.precinctId);
                            mapInstance.closePopup();
                            dropSelectionPin(addr.coordinates[0], addr.coordinates[1]);
                            mapInstance.flyTo(addr.coordinates, 19, { duration: 0.8 });
                            // Show the address in the top-right info card rather than a
                            // map popup, so it never overlaps the dropped CG pin.
                            setInfoCard({
                              title: addr.fullAddress,
                              subtitle: addr.precinctName,
                              dotColor: '#2d5a3d',
                            });
                          }
                          setAddressSearch('');
                        }}
                      >
                        <span className="address-result-name">{addr.fullAddress}</span>
                        <span className="address-result-precinct">{addr.precinctName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="address-hint">No matching addresses</p>
              );
            })()}
          </div>
        </div>
      </aside>

      {/* Map Container */}
      <div className="map-container" style={{ height: mapHeight }}>
        <BaseMap
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          tileUrl={OSM_TILE_URL}
          tileOptions={OSM_TILE_OPTIONS}
          zoomControl={true}
          scrollWheelZoom={true}
          dragging={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
          attributionControl={true}
          preferCanvas={true}
          maxZoom={19}
          minZoom={12}
          onMapReady={handleMapReady}
          showShareControl={true}
          shareActive={shareMode}
          onShareClick={toggleShareMode}
          className="interactive-map"
          style={{ height: '100%' }}
        />

        {/* Placement-mode banner — primary affordance (esp. on touch, where there is
            no pin cursor). Cancel ends the mode; the pin/card persist. */}
        {shareMode && (
          <div className="share-banner" role="status">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Share a point on the map</span>
            <button
              type="button"
              className="share-banner-cancel"
              aria-label="Cancel sharing"
              onClick={disarmShareMode}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Share card — anchored above the dropped pin (re-anchored on map move). */}
        {shareCard && shareCardPos && (
          <div
            className="share-card"
            style={{ left: shareCardPos.x, top: shareCardPos.y }}
          >
            <button
              type="button"
              className="share-card-close"
              aria-label="Close"
              onClick={closeShareCard}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span className="share-card-eyebrow">
              {shareCard.isView ? 'Shared location' : 'Share this location'}
            </span>
            {shareCard.resolving ? (
              <span className="share-card-name share-card-name--loading">
                Pinpointing location
                <span className="share-card-dots" aria-hidden="true" />
              </span>
            ) : (
              <strong className="share-card-name">{shareCard.name}</strong>
            )}
            {!shareCard.resolving && shareCard.detail && (
              <span className="share-card-detail">{shareCard.detail}</span>
            )}
            {/* Re-share affordance only on the author flow; on a link-arrival the visitor
                already followed a link, so the card stays a clean place label. */}
            {!shareCard.isView && (
              <div className="share-card-row">
                <input
                  ref={shareUrlInputRef}
                  className="share-card-url"
                  type="text"
                  readOnly
                  value={
                    typeof window !== 'undefined'
                      ? `${window.location.origin}${buildShareUrl(shareCard.lat, shareCard.lng, { from: 'share' })}`
                      : buildShareUrl(shareCard.lat, shareCard.lng, { from: 'share' })
                  }
                  onFocus={(e) => e.currentTarget.select()}
                  aria-label="Shareable link"
                />
                <button
                  type="button"
                  className="share-card-copy"
                  onClick={handleCopyShareUrl}
                >
                  {shareCopied ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
            )}
          </div>
        )}

        {infoCard && (
          <div className="precinct-info-card" key={infoCard.title}>
            {infoCard.dotColor && (
              <span className="precinct-info-dot" style={{ backgroundColor: infoCard.dotColor }} />
            )}
            <div>
              <strong>{infoCard.title}</strong>
              {infoCard.subtitle && <span className="precinct-info-count">{infoCard.subtitle}</span>}
            </div>
          </div>
        )}

        {/* Legend — three columns: development, precincts, facilities */}
        <div className="map-legend">
          <div className="legend-group">
            <h4>Map</h4>
            <ul className="legend-list">
              <li className="legend-item">
                <span className="legend-marker" style={{ backgroundColor: '#ffffff', width: '14px', height: '3px', borderRadius: '2px', border: 'none', boxShadow: 'none' }} />
                <span className="legend-label">Boundary</span>
              </li>
              <li className="legend-item">
                <span className="legend-marker legend-marker-p" style={{ backgroundColor: ENTRANCE_STYLE.color }}>
                  <EntranceGlyph />
                </span>
                <span className="legend-label">Entrances</span>
              </li>
              <li className="legend-item">
                <span className="legend-marker legend-marker-p" style={{ backgroundColor: FACILITY_TYPES['no-parking-zone'].color }}>
                  <NoParkingGlyph />
                </span>
                <span className="legend-label legend-label-wrap">{FACILITY_TYPES['no-parking-zone'].label}</span>
              </li>
            </ul>
          </div>
          <div className="legend-group">
            <h4>Precincts</h4>
            <ul className="legend-list">
              {PRECINCT_STAGES.map((stage) => (
                <li key={stage.id} className="legend-item">
                  <span className="legend-marker" style={{ backgroundColor: stage.color.fill }} />
                  <span className="legend-label">{stage.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="legend-group">
            <h4>Facilities</h4>
            <ul className="legend-list">
              {Object.entries(FACILITY_TYPES)
                .filter(([type]) => type !== 'no-parking-zone')
                .map(([type, { color, label, icon }]) => (
                <li key={type} className="legend-item">
                  <span className="legend-marker legend-marker-p" style={{ backgroundColor: color }}>
                    {icon === 'bin' ? <BinGlyph /> : icon === 'tree' ? <TreeGlyph /> : icon === 'no-parking' ? <NoParkingGlyph /> : icon === 'parking-visitor' ? <VisitorParkingGlyph color={color} /> : 'P'}
                  </span>
                  <span className="legend-label">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function BinGlyph() {
  return (
    <svg
      width={9}
      height={9}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#fff"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 7.5 H14" />
      <path d="M8.5 7.5 V6 H11.5 V7.5" />
      <path d="M7.2 7.5 L7.9 14.5 H12.1 L12.8 7.5" />
      <path d="M9 9.7 V12.5 M11 9.7 V12.5" />
    </svg>
  );
}

function TreeGlyph() {
  return (
    <svg width={10} height={10} viewBox="0 0 20 20" fill="#fff" stroke="none">
      <path d="M10 3.2c-2.7 0-4.8 2-4.8 4.5 0 2.1 1.5 3.8 3.6 4.3v3.3c0 .55.55 1 1.2 1s1.2-.45 1.2-1v-3.3c2.1-.5 3.6-2.2 3.6-4.3 0-2.5-2.1-4.5-4.8-4.5z" />
    </svg>
  );
}

function NoParkingGlyph() {
  return (
    <svg width={12} height={12} viewBox="0 0 20 20">
      <text x="10" y="14.2" textAnchor="middle" fontSize="11" fontWeight={700} fontFamily="system-ui,sans-serif" fill="#1F2937">P</text>
      <circle cx="10" cy="10" r="7.3" fill="none" stroke="#EA580C" strokeWidth={1.8} />
      <line x1="4.8" y1="4.8" x2="15.2" y2="15.2" stroke="#EA580C" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

// "P" with a guest badge — marks visitor-only parking on the legend chip. Drawn directly on the
// chip's coloured background (the badge person is filled in the chip colour against a white disc).
function VisitorParkingGlyph({ color }: { color: string }) {
  return (
    <svg width={17} height={14} viewBox="0 0 20 16" fill="none">
      <text x="6" y="12.4" textAnchor="middle" fontSize="11" fontWeight={700} fontFamily="system-ui,sans-serif" fill="#fff">P</text>
      <circle cx="14" cy="8" r="4" fill="#fff" />
      <circle cx="14" cy="6.5" r="1.15" fill={color} />
      <path d="M11.8 10.1 A2.2 2.2 0 0 1 16.2 10.1 Z" fill={color} />
    </svg>
  );
}

function EntranceGlyph() {
  return (
    <svg
      width={9}
      height={9}
      viewBox="0 0 20 20"
      fill="none"
      stroke="#fff"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 5 V15" />
      <path d="M5 10 H12" />
      <path d="M9 6.5 L12.5 10 L9 13.5" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// Eye toggle pinned to the right of a layer-group label: open eye = shown, slashed = hidden.
function VisibilityToggle({ visible, onClick, label }: { visible: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className="layer-toggle"
      onClick={onClick}
      aria-pressed={visible}
      aria-label={`${visible ? 'Hide' : 'Show'} ${label} on the map`}
      title={visible ? 'Hide from map' : 'Show on map'}
    >
      {visible ? <EyeIcon /> : <EyeOffIcon />}
    </button>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="accordion-chevron"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      width={16}
      height={16}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}


