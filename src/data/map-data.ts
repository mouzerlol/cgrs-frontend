/**
 * Shared map data for Coronation Gardens
 * Boundary coordinates extracted from KML file
 */

export const BOUNDARY_COORDINATES = [
  [174.7922493, -36.9504077],
  [174.7923271, -36.950607],
  [174.7929601, -36.9505577],
  [174.7937406, -36.9506713],
  [174.7937701, -36.9505813],
  [174.793172, -36.9488108],
  [174.7913615, -36.9485321],
  [174.7899479, -36.9489501],
  [174.7901303, -36.949338],
  [174.7902577, -36.9496028],
  [174.790361, -36.9498696],
  [174.7912837, -36.9495781],
  [174.7917155, -36.9496317],
  [174.7919355, -36.9501376],
  [174.792134, -36.9500819],
  [174.7922493, -36.9504077],
] as const;

export const MAP_CENTER: [number, number] = [-36.9497, 174.7912];
export const MAP_ZOOM = 16;

/** Minimum marker size in pixels to meet WCAG 2.1 AA touch target requirement (44px) */
export const MARKER_SIZE = 44;

// Points of Interest - passive markers (just shown on map)
export const POINTS_OF_INTEREST = [
  // Additional POIs
  {
    id: 'mangere-mountain-walkway',
    name: 'Mangere Mountain Walkway',
    coordinates: [-36.9477, 174.7893] as [number, number],
    type: 'walkway',
    description: 'Scenic walkway with volcanic views'
  },
  {
    id: 'bus-stop',
    name: 'Bus Stop',
    coordinates: [-36.9484, 174.7897] as [number, number],
    type: 'transport',
    description: 'Public transport stop'
  },
  {
    id: 'fresh-choice',
    name: 'Fresh Choice Mangere Bridge',
    coordinates: [-36.9426, 174.7869] as [number, number],
    type: 'retail',
    description: 'Grocery store'
  },
  {
    id: 'mangere-bridge-access',
    name: 'Ngā Hau Māngere Bridge',
    coordinates: [-36.9327, 174.7864] as [number, number],
    type: 'walkway',
    description: 'Pedestrian and cycling bridge connecting Onehunga and Māngere Bridge'
  },
  {
    id: 'ambury-farm',
    name: 'Ambury Farm',
    coordinates: [-36.9448, 174.7623] as [number, number],
    type: 'park',
    description: 'Working farm with animal encounters'
  },
  {
    id: 'mangere-bridge-library',
    name: 'Mangere Bridge Library',
    coordinates: [-36.9420, 174.7864] as [number, number],
    type: 'facility',
    description: 'Public library'
  },
  {
    id: 'rose-garden-reserve',
    name: 'Rose Garden Reserve',
    coordinates: [-36.9398, 174.7805] as [number, number],
    type: 'park',
    description: 'Beautifully maintained rose gardens'
  },
  {
    id: 'boating-club-lookout',
    name: 'Boating Club & Lookout',
    coordinates: [-36.9383, 174.7774] as [number, number],
    type: 'facility',
    description: 'Waterfront lookout point'
  },
  {
    id: 'kiwi-esplanade-reserve',
    name: 'Kiwi Esplanade Reserve',
    coordinates: [-36.9401, 174.7724] as [number, number],
    type: 'park',
    description: 'Coastal reserve with bird watching'
  },
  {
    id: 'naomi-bill-kirk-park',
    name: 'Naomi and Bill Kirk Park',
    coordinates: [-36.9424, 174.7873] as [number, number],
    type: 'park',
    description: 'Local community park'
  },
  {
    id: 'burger-green',
    name: 'Burger & Green',
    coordinates: [-36.9414, 174.7868] as [number, number],
    type: 'restaurant',
    description: 'Fresh homemade burgers on Coronation Road'
  },
  {
    id: 'bridge-park-bowling-club',
    name: 'Bridge Park Bowling Club',
    coordinates: [-36.9456, 174.7840] as [number, number],
    type: 'facility',
    description: 'Community bowling club under Māngere Mountain'
  },
] as const;

export const POI_TYPES = {
  park: { color: '#4CAF50', label: 'Park' },
  facility: { color: '#2196F3', label: 'Facility' },
  walkway: { color: '#FF9800', label: 'Walkway' },
  transport: { color: '#9C27B0', label: 'Transport' },
  retail: { color: '#E91E63', label: 'Retail' },
  restaurant: { color: '#FF5722', label: 'Restaurant' },
} as const;
