/**
 * Shared map data for Coronation Gardens
 * Boundary coordinates extracted from KML file
 */

export const BOUNDARY_COORDINATES = [
  [174.7900801, -36.9489024],
  [174.7902263, -36.9492293],
  [174.7902681, -36.9492826],
  [174.7903204, -36.9493072],
  [174.7903599, -36.9493571],
  [174.7903928, -36.9494321],
  [174.7903867, -36.9494754],
  [174.7903908, -36.949551],
  [174.7904297, -36.9496539],
  [174.7904693, -36.9497508],
  [174.7911881, -36.949543],
  [174.7917173, -36.9496133],
  [174.7919552, -36.9501282],
  [174.791919, -36.9501389],
  [174.7918995, -36.9502415],
  [174.7919599, -36.9503696],
  [174.7920705, -36.9504235],
  [174.7921758, -36.9505397],
  [174.7922019, -36.9506165],
  [174.7927242, -36.9505668],
  [174.7928589, -36.9505679],
  [174.7937233, -36.9506805],
  [174.7937541, -36.9506028],
  [174.7937796, -36.9505727],
  [174.7931789, -36.9488041],
  [174.7913629, -36.9485246],
  [174.7900801, -36.9489024],
] as const;

export interface Precinct {
  id: string;
  name: string;
  stage: string;
  coordinates: [number, number][];
  color: string;
  strokeColor: string;
}

export interface PrecinctStage {
  id: string;
  label: string;
  color: { fill: string; stroke: string };
}

export const PRECINCT_STAGES: PrecinctStage[] = [
  { id: 'stage-0', label: 'Stage 0', color: { fill: '#5FCEC0', stroke: '#2E9C8C' } },
  { id: 'stage-1', label: 'Stage 1', color: { fill: '#A8E6CF', stroke: '#6FCBA0' } },
  { id: 'stage-2-3', label: 'Stage 2 & 3', color: { fill: '#8FBF7A', stroke: '#5A9A56' } },
];

// Non-selected precincts read as a quiet, thin dashed outline with a much lighter
// fill; only the selected precinct gets a solid stroke and the full fill weight.
export const PRECINCT_STYLES = {
  default:  { fillOpacity: 0.15, weight: 1.5, dashArray: '2 4', opacity: 1 },
  hover:    { fillOpacity: 0.22, weight: 1.5, dashArray: '2 4', opacity: 1 },
  selected: { fillOpacity: 0.53, weight: 2.5, dashArray: undefined, opacity: 1 },
  dimmed:   { fillOpacity: 0.07, weight: 1.5, dashArray: '2 4', opacity: 0.4 },
} as const;

export const PRECINCTS: Precinct[] = [
  {
    id: 'huri-street',
    name: 'Huri Street',
    stage: 'stage-2-3',
    color: '#8FBF7A',
    strokeColor: '#5A9A56',
    coordinates: [
      [174.7911881, -36.949543], [174.7917173, -36.9496133], [174.7919506, -36.9501085],
      [174.7919593, -36.9501315], [174.7920697, -36.9501047], [174.7921753, -36.9500747],
      [174.7921142, -36.9499434], [174.7920909, -36.949907], [174.792003, -36.949932],
      [174.7919754, -36.9498697], [174.7920981, -36.9498351], [174.7920679, -36.9497419],
      [174.7920014, -36.9496063], [174.7919544, -36.9494724], [174.7920578, -36.9494335],
      [174.7920016, -36.9494001], [174.7920588, -36.949351], [174.7920716, -36.9493208],
      [174.7921381, -36.9493331], [174.792303, -36.9493625], [174.7923681, -36.9490812],
      [174.7922608, -36.9490613], [174.7922903, -36.9489027], [174.7922427, -36.9488947],
      [174.7921743, -36.9488851], [174.7921066, -36.9488752], [174.7920986, -36.9489182],
      [174.7920386, -36.9489105], [174.7918646, -36.9488872], [174.7918391, -36.9490083],
      [174.7913342, -36.9489343], [174.7911735, -36.9489072], [174.7911463, -36.9490391],
      [174.7910744, -36.9490283], [174.7909938, -36.9490397], [174.7908176, -36.9490764],
      [174.7908364, -36.9491256], [174.7908304, -36.9491954], [174.7906889, -36.949217],
      [174.7907311, -36.9492645], [174.7906272, -36.9492806], [174.7906231, -36.949258],
      [174.7904811, -36.9492794], [174.7903706, -36.9492863], [174.7903659, -36.9493607],
      [174.7903928, -36.9494321], [174.7903867, -36.9494754], [174.7903908, -36.949551],
      [174.7904693, -36.9497508], [174.7911881, -36.949543],
    ],
  },
  {
    id: 'tukari-lane',
    name: 'Tukari Lane',
    stage: 'stage-2-3',
    color: '#A6CD92',
    strokeColor: '#6FAA5C',
    coordinates: [
      [174.7903671, -36.9493172], [174.7903706, -36.9492863], [174.7904644, -36.9492796],
      [174.7906231, -36.949258], [174.7906272, -36.9492806], [174.7907311, -36.9492645],
      [174.7906889, -36.949217], [174.7908304, -36.9491954], [174.7908365, -36.9491291],
      [174.7908176, -36.9490764], [174.7910744, -36.9490283], [174.7911463, -36.9490391],
      [174.7911735, -36.9489072], [174.7918391, -36.9490083], [174.7918646, -36.9488872],
      [174.7920986, -36.9489182], [174.7921066, -36.9488752], [174.7921408, -36.9488804],
      [174.7922903, -36.9489027], [174.7923024, -36.948851], [174.7924049, -36.9488632],
      [174.7924251, -36.9487823], [174.7923895, -36.9487765], [174.7924137, -36.9486864],
      [174.7913629, -36.9485246], [174.7907292, -36.9487127], [174.7905422, -36.9487722],
      [174.7904114, -36.9488049], [174.7900801, -36.9489024], [174.7902062, -36.9491821],
      [174.7902263, -36.9492293], [174.7902672, -36.9492791], [174.7903148, -36.9493027],
      [174.7903671, -36.9493172],
    ],
  },
  {
    id: 'tima-lane',
    name: 'Tima Lane',
    stage: 'stage-2-3',
    color: '#74AC60',
    strokeColor: '#4C8A42',
    coordinates: [
      [174.7923053, -36.9498676], [174.7923554, -36.9498132], [174.7923822, -36.9497548],
      [174.7923916, -36.9496819], [174.7923809, -36.9496321], [174.7923514, -36.9495694],
      [174.793038, -36.949369], [174.7930876, -36.9493856], [174.7930984, -36.9494145],
      [174.7931956, -36.9496991], [174.7934571, -36.9496262], [174.7931789, -36.9488041],
      [174.7924137, -36.9486864], [174.7923895, -36.9487765], [174.7924251, -36.9487823],
      [174.7924049, -36.9488632], [174.7923024, -36.948851], [174.7922903, -36.9489027],
      [174.7922608, -36.9490613], [174.7923681, -36.9490812], [174.792303, -36.9493625],
      [174.7920716, -36.9493208], [174.7920588, -36.949351], [174.7920016, -36.9494001],
      [174.7920698, -36.9494397], [174.7921435, -36.949467], [174.7921261, -36.9495645],
      [174.7921591, -36.9496947], [174.7921558, -36.9498276], [174.7923053, -36.9498676],
    ],
  },
  {
    id: 'whai-hua-lane',
    name: 'Whai Hua Lane',
    stage: 'stage-1',
    color: '#A8E6CF',
    strokeColor: '#6FCBA0',
    coordinates: [
      [174.7935643, -36.9499399], [174.7929052, -36.9501355], [174.792932, -36.9501939],
      [174.7924559, -36.950338], [174.7924398, -36.9503734], [174.7924204, -36.9504281],
      [174.7923982, -36.9504447], [174.7923728, -36.9504463], [174.7922621, -36.9505015],
      [174.7922742, -36.9505181], [174.7923292, -36.9506022], [174.7926068, -36.9505824],
      [174.7927242, -36.9505668], [174.7928589, -36.9505679], [174.7937233, -36.9506805],
      [174.7937541, -36.9506028], [174.7937796, -36.9505727], [174.7935643, -36.9499399],
    ],
  },
  {
    id: 'tanners-rd',
    name: 'Tanners Rd',
    stage: 'stage-0',
    color: '#5FCEC0',
    strokeColor: '#2E9C8C',
    coordinates: [
      [174.7921812, -36.9506043], [174.7921913, -36.9506175], [174.7922012, -36.9506165],
      [174.7923285, -36.9506022], [174.7922614, -36.9505015], [174.7923721, -36.9504463],
      [174.7923975, -36.9504447], [174.7924197, -36.9504281], [174.7924552, -36.950338],
      [174.7927784, -36.9502357], [174.792769, -36.950218], [174.7927592, -36.9501915],
      [174.7926996, -36.9500628], [174.7926834, -36.9500382], [174.7926419, -36.9500436],
      [174.7925594, -36.950043], [174.7923348, -36.9499663], [174.7922912, -36.9499566],
      [174.792269, -36.9499666], [174.7922408, -36.9499024], [174.7921135, -36.9499434],
      [174.7921746, -36.9500747], [174.791927, -36.9501435], [174.7918988, -36.9502415],
      [174.7919592, -36.9503696], [174.7920926, -36.9505047], [174.7921409, -36.950548],
      [174.7921684, -36.9505808], [174.7921812, -36.9506043],
    ],
  },
  {
    id: 'mikoikoi-cres',
    name: 'Mikoikoi Cres',
    stage: 'stage-0',
    color: '#48C0B5',
    strokeColor: '#238A7E',
    coordinates: [
      [174.7922415, -36.9499024], [174.7922697, -36.9499666], [174.7922919, -36.9499566],
      [174.7925601, -36.950043], [174.7926426, -36.9500436], [174.7926841, -36.9500382],
      [174.7926689, -36.9499999], [174.792753, -36.9498512], [174.7926832, -36.9498228],
      [174.7924659, -36.9497462], [174.792472, -36.9496433], [174.7924559, -36.9496095],
      [174.7923809, -36.9496321], [174.7923928, -36.9496733], [174.7923875, -36.9497499],
      [174.7923493, -36.9498239], [174.7923053, -36.9498676], [174.7922661, -36.9498973],
      [174.7922415, -36.9499024],
    ],
  },
  {
    id: 'kaihua-terrace',
    name: 'Kaihua Terrace',
    stage: 'stage-0',
    color: '#7CDBCF',
    strokeColor: '#3CB0A2',
    coordinates: [
      [174.7927687, -36.9498259], [174.7927854, -36.9498081], [174.7929256, -36.9497662],
      [174.7930128, -36.9497432], [174.7931173, -36.9497132], [174.7930342, -36.9494624],
      [174.793002, -36.9493809], [174.7923514, -36.9495694], [174.7923809, -36.9496321],
      [174.7924559, -36.9496095], [174.792472, -36.9496433], [174.7924659, -36.9497462],
      [174.7926832, -36.9498228], [174.792753, -36.9498512], [174.7927687, -36.9498259],
    ],
  },
  {
    id: 'patiti-parade',
    name: 'Patiti Parade',
    stage: 'stage-0',
    color: '#37B6AC',
    strokeColor: '#1C8076',
    coordinates: [
      [174.7935643, -36.9499399], [174.7934571, -36.9496262], [174.7931956, -36.9496991],
      [174.7930984, -36.9494145], [174.7930876, -36.9493856], [174.793038, -36.949369],
      [174.793002, -36.9493809], [174.7931173, -36.9497132], [174.7930128, -36.9497432],
      [174.7930691, -36.949875], [174.7931576, -36.9498527], [174.7932306, -36.9500404],
      [174.7935643, -36.9499399],
    ],
  },
];

export const MAP_CENTER: [number, number] = [-36.9497, 174.7912];

/**
 * Default zoom for community / boundary maps. At MAP_CENTER (~37°S), z=20 is ~0.12 m/px
 * (~12 m per 100 px)—slightly tighter than z=19 for a more zoomed-in first view.
 */
export const MAP_ZOOM = 20;

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

// --- Facilities ---

export interface Facility {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number][];
  /** Number of car parks at this location (street parking). For a location split across
   *  several polygons (e.g. Huri Street), the same location total is set on each. */
  count?: number;
  /** For private visitor parking: which stage's visitors the spaces are reserved for
   *  (e.g. "Stage 0", "Stage 2 & 3"). Surfaced in the info card to deter misuse. */
  serves?: string;
  /** Suppress the centred "P" map marker (keep the polygon fill). Used where a marker would
   *  collide with an adjacent facility's marker, e.g. rcp-18 sits against Tukari visitor parking. */
  hideMarker?: boolean;
}

export const FACILITY_TYPES = {
  'resident-parking': { color: '#D95D39', label: 'Resident Car Parks', icon: 'parking' },
  'street-parking': { color: '#2D8FD6', label: 'Street Parking', icon: 'parking' },
  'private-visitor-parking': { color: '#2B5CA8', label: 'Private Visitor Parking', icon: 'parking-visitor' },
  'bin-enclosure': { color: '#7A5230', label: 'Bin Enclosures', icon: 'bin' },
  'park': { color: '#2E5E3A', label: 'Parks', icon: 'tree' },
  'no-parking-zone': { color: '#F2C94C', label: 'Emergency Access — Keep Clear', icon: 'no-parking' },
} as const;

export const FACILITY_STYLES = {
  default:  { fillOpacity: 0.30, weight: 0 },
  hover:    { fillOpacity: 0.45, weight: 0 },
  selected: { fillOpacity: 0.55, weight: 0 },
} as const;

export const FACILITIES: Facility[] = [
  {
    id: 'rcp-01',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7927036, -36.9504869], [174.7927291, -36.9505357], [174.7930087, -36.9504425],
      [174.7929866, -36.9503948], [174.7927036, -36.9504869],
    ],
  },
  {
    id: 'rcp-02',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.79301, -36.950271], [174.7930288, -36.9503154], [174.7932823, -36.9502404],
      [174.7932635, -36.9501965], [174.79301, -36.950271],
    ],
  },
  {
    id: 'rcp-03',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7932286, -36.950316], [174.7932206, -36.9503599], [174.7933688, -36.9503814],
      [174.7933755, -36.9503363], [174.7934298, -36.9503444], [174.7934513, -36.9502399],
      [174.7933594, -36.9500159], [174.7933064, -36.9500309], [174.7933956, -36.9502463],
      [174.7933762, -36.9503363], [174.7932286, -36.950316],
    ],
  },
  {
    id: 'rcp-04',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7934116, -36.9494803], [174.7932165, -36.9495312], [174.793244, -36.949633],
      [174.7931756, -36.9496496], [174.7931956, -36.9496991], [174.7934571, -36.9496262],
      [174.7934116, -36.9494803],
    ],
  },
  {
    id: 'rcp-05',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7923399, -36.949485], [174.7923305, -36.9495311], [174.792411, -36.9495423],
      [174.7924224, -36.9494962], [174.7923399, -36.949485],
    ],
  },
  {
    id: 'rcp-06',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7923124, -36.9493789], [174.7923024, -36.9494207], [174.792527, -36.9494534],
      [174.7925377, -36.94941], [174.7923124, -36.9493789],
    ],
  },
  {
    id: 'rcp-07',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7923841, -36.9490848], [174.7923472, -36.9492322], [174.7926389, -36.9492788],
      [174.7926473, -36.9492424], [174.7927891, -36.9492649], [174.7928193, -36.9491523],
      [174.7926464, -36.9491274], [174.7926379, -36.94917], [174.792571, -36.9491598],
      [174.7925808, -36.9491153], [174.7923841, -36.9490848],
    ],
  },
  {
    id: 'rcp-08',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7923471, -36.9487988], [174.7923364, -36.9488444], [174.7924055, -36.9488546],
      [174.7924169, -36.948809], [174.7923471, -36.9487988],
    ],
  },
  {
    id: 'rcp-09',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7930344, -36.9487949], [174.7929942, -36.9489546], [174.7930344, -36.9489642],
      [174.7930512, -36.9489316], [174.7932114, -36.9488973], [174.7931853, -36.9488196],
      [174.7930344, -36.9487949],
    ],
  },
  {
    id: 'rcp-10',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7918532, -36.9488284], [174.7918438, -36.9488729], [174.7919551, -36.948889],
      [174.7919625, -36.9488439], [174.7918532, -36.9488284],
    ],
  },
  {
    id: 'rcp-11',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7912285, -36.948815], [174.7911447, -36.9488381], [174.7911675, -36.9488815],
      [174.7912486, -36.9488573], [174.7912285, -36.948815],
    ],
  },
  {
    id: 'rcp-12',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7911085, -36.9487271], [174.7907605, -36.9488273], [174.7907833, -36.9488788],
      [174.7909603, -36.9488263], [174.7911326, -36.9487743], [174.7911085, -36.9487271],
    ],
  },
  {
    id: 'rcp-13',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7907672, -36.9490047], [174.7907457, -36.9489581], [174.7906633, -36.9489816],
      [174.7906847, -36.9490283], [174.7907672, -36.9490047],
    ],
  },
  {
    id: 'rcp-14',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7904353, -36.9489886], [174.7905466, -36.9492319], [174.7906043, -36.9492153],
      [174.7904909, -36.9489731], [174.7904353, -36.9489886],
    ],
  },
  {
    id: 'rcp-15',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7906158, -36.9494196], [174.7907244, -36.9496639], [174.7909061, -36.9496136],
      [174.7908095, -36.949404], [174.7907559, -36.9494191], [174.7907411, -36.9493858],
      [174.7906158, -36.9494196],
    ],
  },
  {
    id: 'rcp-16',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7918675, -36.9499234], [174.7919634, -36.9501389], [174.7921384, -36.9500869],
      [174.7920613, -36.9499154], [174.792003, -36.949932], [174.7919855, -36.949894],
      [174.7919238, -36.9499095], [174.7918675, -36.9499234],
    ],
  },
  {
    id: 'rcp-17',
    name: 'Private Parking',
    type: 'resident-parking',
    coordinates: [
      [174.7911759, -36.9489177], [174.7911444, -36.9490661], [174.7917821, -36.9491599],
      [174.7918176, -36.9490099], [174.7911759, -36.9489177],
    ],
  },
  {
    // Reclaims the bay vacated when Tukari visitor parking moved one car park north —
    // same shape and position the old sp-04 polygon occupied.
    id: 'rcp-18',
    name: 'Private Parking',
    type: 'resident-parking',
    hideMarker: true,
    coordinates: [
      [174.7905577, -36.949253], [174.790612, -36.9492369], [174.7906043, -36.9492153],
      [174.7905466, -36.9492319], [174.7905577, -36.949253],
    ],
  },
  {
    id: 'bin-01',
    name: 'Bin Enclosure 1',
    type: 'bin-enclosure',
    coordinates: [
      [174.7907352, -36.9493714], [174.790754, -36.949409], [174.7908057, -36.9493961],
      [174.7907889, -36.9493575], [174.7907352, -36.9493714],
    ],
  },
  {
    id: 'bin-02',
    name: 'Bin Enclosure 2',
    type: 'bin-enclosure',
    coordinates: [
      [174.790611, -36.9489945], [174.7906318, -36.9490395], [174.7906761, -36.9490272],
      [174.7906573, -36.9489822], [174.790611, -36.9489945],
    ],
  },
  {
    id: 'bin-03',
    name: 'Bin Enclosure 3',
    type: 'bin-enclosure',
    coordinates: [
      [174.791121, -36.9488451], [174.7911425, -36.9488949], [174.7911586, -36.9488917],
      [174.7911371, -36.9488408], [174.791121, -36.9488451],
    ],
  },
  {
    id: 'bin-04',
    name: 'Bin Enclosure 4',
    type: 'bin-enclosure',
    coordinates: [
      [174.7919625, -36.9488439], [174.7919529, -36.9488926], [174.7919817, -36.9488974],
      [174.7919924, -36.9488481], [174.7919625, -36.9488439],
    ],
  },
  {
    id: 'bin-05',
    name: 'Bin Enclosure 5',
    type: 'bin-enclosure',
    coordinates: [
      [174.7917191, -36.9495511], [174.791709, -36.9496052], [174.7917352, -36.9496122],
      [174.7917291, -36.9495527], [174.7917191, -36.9495511],
    ],
  },
  {
    id: 'bin-06',
    name: 'Bin Enclosure 6',
    type: 'bin-enclosure',
    coordinates: [
      [174.7924264, -36.9494969], [174.7924204, -36.9495275], [174.7924781, -36.9495356],
      [174.7924861, -36.949505], [174.7924264, -36.9494969],
    ],
  },
  {
    id: 'bin-07',
    name: 'Bin Enclosure 7',
    type: 'bin-enclosure',
    coordinates: [
      [174.7926088, -36.9491185], [174.7925981, -36.9491646], [174.792633, -36.9491699],
      [174.7926417, -36.9491249], [174.7926088, -36.9491185],
    ],
  },
  {
    id: 'bin-08',
    name: 'Bin Enclosure 8',
    type: 'bin-enclosure',
    coordinates: [
      [174.7930451, -36.9493693], [174.7931162, -36.9493789], [174.7931189, -36.9493628],
      [174.7931008, -36.9493489], [174.7930498, -36.9493559], [174.7930451, -36.9493693],
    ],
  },
  {
    id: 'bin-09',
    name: 'Bin Enclosure 9',
    type: 'bin-enclosure',
    coordinates: [
      [174.7927126, -36.9505182], [174.7926998, -36.9504914], [174.7926442, -36.950507],
      [174.7926589, -36.9505359], [174.7927126, -36.9505182],
    ],
  },
  {
    id: 'bin-10',
    name: 'Bin Enclosure 10',
    type: 'bin-enclosure',
    coordinates: [
      [174.7931607, -36.9503355], [174.7931708, -36.9503558], [174.7932211, -36.9503392],
      [174.7932124, -36.9503194], [174.7931607, -36.9503355],
    ],
  },
  {
    id: 'park-01',
    name: 'Patiti Parade Park',
    type: 'park',
    coordinates: [
      [174.7931173, -36.9497132], [174.7927854, -36.9498081], [174.792692, -36.9500007],
      [174.792798, -36.9502343], [174.792932, -36.9501939], [174.7929052, -36.9501355],
      [174.7931842, -36.9500553], [174.7931185, -36.9499171], [174.793093, -36.9499235],
      [174.7930691, -36.949875], [174.7931173, -36.9497132],
    ],
  },
  {
    id: 'park-02',
    name: 'Huri Street Park',
    type: 'park',
    coordinates: [
      [174.79191, -36.9494602], [174.7919154, -36.9494715], [174.7919455, -36.9494736],
      [174.7919797, -36.9495486], [174.7919703, -36.9495647], [174.7920475, -36.949734],
      [174.7920649, -36.9497319], [174.7920957, -36.9498048], [174.792089, -36.9498235],
      [174.7919697, -36.9498594], [174.7919905, -36.9498787], [174.7920099, -36.9499146],
      [174.7921038, -36.9498889], [174.7921561, -36.9498487], [174.7921648, -36.9497533],
      [174.7921574, -36.9496751], [174.7921261, -36.9495645], [174.7921435, -36.949467],
      [174.7920354, -36.9494254], [174.7919851, -36.94945], [174.7919462, -36.9494591],
      [174.79191, -36.9494602],
    ],
  },
  {
    id: 'eac-01',
    name: 'Emergency Access Clearway',
    type: 'no-parking-zone',
    coordinates: [
      [174.7923554, -36.9488583], [174.7923426, -36.9489087], [174.7929817, -36.94901],
      [174.7929942, -36.9489546], [174.7923554, -36.9488583],
    ],
  },
  {
    id: 'sp-01',
    name: 'Huri Street Parking',
    type: 'street-parking',
    count: 28,
    coordinates: [
      [174.7907289, -36.9493119], [174.7907289, -36.9493167], [174.7907665, -36.9493092],
      [174.7908463, -36.949299], [174.7909442, -36.9492947], [174.7910535, -36.9493049],
      [174.7910709, -36.9493295], [174.7912875, -36.9493612], [174.791315, -36.9493419],
      [174.7914565, -36.9493628], [174.7914753, -36.9493879], [174.7916851, -36.9494174],
      [174.7917193, -36.9493976], [174.7914592, -36.9493633], [174.7914665, -36.9493354],
      [174.7913244, -36.9493183], [174.7913157, -36.9493397], [174.7910555, -36.9493038],
      [174.7910615, -36.9492802], [174.7909797, -36.9492711], [174.7909039, -36.9492674],
      [174.7908215, -36.9492717], [174.7907242, -36.9492915], [174.7907289, -36.9493119],
    ],
  },
  {
    id: 'sp-02',
    name: 'Huri Street Parking',
    type: 'street-parking',
    count: 28,
    coordinates: [
      [174.790975, -36.9492454], [174.7910917, -36.9492583], [174.7913894, -36.9493011],
      [174.791368, -36.9492743], [174.7912178, -36.9492545], [174.7911929, -36.9492722],
      [174.7911842, -36.9492711], [174.7911708, -36.9492465], [174.7910079, -36.949225],
      [174.790975, -36.9492454],
    ],
  },
  {
    id: 'sp-03',
    name: 'Huri Street Parking',
    type: 'street-parking',
    count: 28,
    coordinates: [
      [174.7920788, -36.9492896], [174.792107, -36.9492757], [174.7921331, -36.9491621],
      [174.7921103, -36.9491412], [174.7921499, -36.9489713], [174.7921217, -36.9489681],
      [174.7920795, -36.9491417], [174.792107, -36.9491466], [174.7920788, -36.9492896],
    ],
  },
  {
    id: 'sp-04',
    name: 'Tukari Visitor Parking',
    type: 'private-visitor-parking',
    count: 1,
    serves: 'Stage 2 & 3',
    coordinates: [
      [174.7905466, -36.9492319], [174.7906043, -36.9492153], [174.7905966, -36.9491937],
      [174.7905355, -36.9492108], [174.7905466, -36.9492319],
    ],
  },
  {
    id: 'sp-05',
    name: 'Tanners Visitor Parking',
    type: 'private-visitor-parking',
    count: 7,
    serves: 'Stage 0',
    coordinates: [
      [174.7921336, -36.9499457], [174.7923126, -36.9503364], [174.7923428, -36.9503294],
      [174.7921631, -36.9499361], [174.7921336, -36.9499457],
    ],
  },
  {
    id: 'sp-06',
    name: 'Patiti Visitor Parking',
    type: 'private-visitor-parking',
    count: 6,
    serves: 'Stage 0',
    coordinates: [
      [174.7930691, -36.949875], [174.793093, -36.9499235], [174.7931185, -36.9499171],
      [174.7931842, -36.9500553], [174.793238, -36.9500381], [174.7931576, -36.9498527],
      [174.7930691, -36.949875],
    ],
  },
];

// --- Development entrances ---

export interface Entrance {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  serves: string; // which stages this entrance serves
}

export const ENTRANCE_STYLE = {
  color: '#2B5CA8',
  label: 'Development Entrances',
} as const;

export const ENTRANCES: Entrance[] = [
  { id: 'entrance-1', name: 'Entrance 1', coordinates: [174.7903878, -36.9493674], serves: 'Stage 2 & 3' },
  { id: 'entrance-2', name: 'Entrance 2', coordinates: [174.7921492, -36.9505313], serves: 'Stage 0 & 1' },
];
