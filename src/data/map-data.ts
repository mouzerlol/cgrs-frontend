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

// Points of Interest - passive markers (just shown on map)
export const POINTS_OF_INTEREST = [
  {
    id: 'park-entry',
    name: 'Park Entry',
    coordinates: [174.7908, -36.9492] as [number, number],
    type: 'park',
    description: 'Main park entrance'
  },
  {
    id: 'community-garden',
    name: 'Community Garden',
    coordinates: [174.7915, -36.9498] as [number, number],
    type: 'garden',
    description: 'Shared garden space'
  },
  {
    id: 'parking-area',
    name: 'Visitor Parking',
    coordinates: [174.7902, -36.9495] as [number, number],
    type: 'parking',
    description: 'Short-term visitor parking'
  },
  {
    id: 'recycling-station',
    name: 'Recycling Station',
    coordinates: [174.7912, -36.9491] as [number, number],
    type: 'facility',
    description: 'Community recycling facilities'
  },
  {
    id: 'mail-area',
    name: 'Mail Collection',
    coordinates: [174.7918, -36.9494] as [number, number],
    type: 'facility',
    description: 'Central mail collection point'
  },
] as const;

export const POI_TYPES = {
  park: { color: '#4CAF50', label: 'Park' },
  garden: { color: '#8BC34A', label: 'Garden' },
  parking: { color: '#607D8B', label: 'Parking' },
  facility: { color: '#2196F3', label: 'Facility' },
} as const;
