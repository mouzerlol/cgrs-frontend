#!/usr/bin/env node

/**
 * Fetch NZ Street Address data from LINZ Data Service and assign
 * each address to a Coronation Gardens precinct via point-in-polygon.
 *
 * Usage:
 *   LINZ_API_KEY=your_key node scripts/fetch-property-data.mjs
 *
 * Get a free API key:
 *   1. Sign up at https://data.linz.govt.nz
 *   2. Go to My Account → API Keys → Create Key
 *   3. Enable the "NZ Street Address" dataset (layer-53353)
 */

import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load from .env.local if not set in environment
let LINZ_API_KEY = process.env.LINZ_API_KEY || process.env.LINZ_LDS_API_KEY;
if (!LINZ_API_KEY) {
  try {
    const envLocal = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
    const match = envLocal.match(/^LINZ_LDS_API_KEY=(.+)$/m);
    if (match) LINZ_API_KEY = match[1].trim();
  } catch {}
}
if (!LINZ_API_KEY) {
  console.error('Error: LINZ_LDS_API_KEY not found in .env.local or environment.');
  console.error('Get a free key at https://data.linz.govt.nz');
  process.exit(1);
}

const LAYER_ID = 'data.linz.govt.nz:layer-105689';

// Bounding box covering all precincts + padding [minLng, minLat, maxLng, maxLat]
const BBOX = [174.7890, -36.9520, 174.7945, -36.9475];

// Precinct polygons — coordinates in [lng, lat] (GeoJSON convention)
const PRECINCTS = [
  {
    id: 'huri-street',
    name: 'Huri Street',
    coordinates: [
      [174.7911881, -36.949543], [174.7917173, -36.9496133], [174.7919506, -36.9501085],
      [174.7919593, -36.9501315], [174.7920697, -36.9501047], [174.7921753, -36.9500747],
      [174.7921142, -36.9499434], [174.7922654, -36.9498937], [174.7923053, -36.9498676],
      [174.7921558, -36.9498276], [174.7921591, -36.9496947], [174.7921261, -36.9495645],
      [174.7921435, -36.949467], [174.7920578, -36.9494335], [174.7920016, -36.9494001],
      [174.7920588, -36.949351], [174.7920716, -36.949316], [174.7921368, -36.9493293],
      [174.7923037, -36.9493555], [174.7923681, -36.9490812], [174.7922608, -36.9490613],
      [174.7922903, -36.9489027], [174.7922427, -36.9488947], [174.7921743, -36.9488851],
      [174.7921066, -36.9488752], [174.7920986, -36.9489182], [174.7920386, -36.9489105],
      [174.7918646, -36.9488872], [174.7918391, -36.9490083], [174.7913342, -36.9489343],
      [174.7911735, -36.9489072], [174.7911463, -36.9490391], [174.7910744, -36.9490283],
      [174.7909938, -36.9490397], [174.7908176, -36.9490764], [174.7908364, -36.9491256],
      [174.7908304, -36.9491954], [174.7906889, -36.949217], [174.7907311, -36.9492645],
      [174.7906272, -36.9492806], [174.7906231, -36.949258], [174.7904811, -36.9492794],
      [174.7903706, -36.9492863], [174.7903659, -36.9493607], [174.7903928, -36.9494321],
      [174.7903867, -36.9494754], [174.7903908, -36.949551], [174.7904693, -36.9497508],
      [174.7911881, -36.949543],
    ],
  },
  {
    id: 'tukari-lane',
    name: 'Tukari Lane',
    coordinates: [
      [174.7903671, -36.9493172], [174.7903706, -36.9492863], [174.7904644, -36.9492796],
      [174.7906231, -36.949258], [174.7906272, -36.9492806], [174.7907311, -36.9492645],
      [174.7906889, -36.949217], [174.7908304, -36.9491954], [174.7908365, -36.9491291],
      [174.7908176, -36.9490764], [174.7910744, -36.9490283], [174.7911463, -36.9490391],
      [174.7911735, -36.9489072], [174.7918391, -36.9490083], [174.7918646, -36.9488872],
      [174.7920986, -36.9489182], [174.7921066, -36.9488752], [174.7921408, -36.9488804],
      [174.7922903, -36.9489027], [174.7923024, -36.948851], [174.7924049, -36.9488632],
      [174.7924251, -36.9487823],
      [174.7923895, -36.9487765], [174.7924137, -36.9486864], [174.7913629, -36.9485246],
      [174.7907292, -36.9487127], [174.7905422, -36.9487722], [174.7904114, -36.9488049],
      [174.7900801, -36.9489024], [174.7902062, -36.9491821], [174.7902263, -36.9492293],
      [174.7902672, -36.9492791], [174.7903148, -36.9493027], [174.7903671, -36.9493172],
    ],
  },
  {
    id: 'tima-lane',
    name: 'Tima Lane',
    coordinates: [
      [174.7923053, -36.9498676], [174.7923554, -36.9498132], [174.7923822, -36.9497548],
      [174.7923916, -36.9496819], [174.7923809, -36.9496321], [174.7923514, -36.9495694],
      [174.793038, -36.949369], [174.7930876, -36.9493856], [174.7930984, -36.9494145],
      [174.7931956, -36.9496991], [174.7934571, -36.9496262], [174.7931789, -36.9488041],
      [174.7924137, -36.9486864], [174.7923895, -36.9487765], [174.7924251, -36.9487823],
      [174.7924049, -36.9488632], [174.7923024, -36.948851],
      [174.7922903, -36.9489027], [174.7922608, -36.9490613], [174.7923681, -36.9490812],
      [174.7923037, -36.9493555], [174.7920716, -36.949316], [174.7920588, -36.949351],
      [174.7920016, -36.9494001], [174.7920698, -36.9494397], [174.7921435, -36.949467],
      [174.7921261, -36.9495645], [174.7921591, -36.9496947], [174.7921558, -36.9498276],
      [174.7923053, -36.9498676],
    ],
  },
  {
    id: 'whai-hua-lane',
    name: 'Whai Hua Lane',
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
    coordinates: [
      [174.7921745, -36.9505357], [174.7921833, -36.9505596], [174.7922019, -36.9506165],
      [174.7923292, -36.9506022], [174.7922621, -36.9505015], [174.7923728, -36.9504463],
      [174.7923982, -36.9504447], [174.7924204, -36.9504281], [174.7924559, -36.950338],
      [174.792932, -36.9501939], [174.7929052, -36.9501355], [174.7930174, -36.9501004],
      [174.7929591, -36.9499642], [174.7927029, -36.9500339], [174.7926426, -36.9500436],
      [174.7925601, -36.950043], [174.7923355, -36.9499663], [174.7922919, -36.9499566],
      [174.7922697, -36.9499666], [174.7922415, -36.9499024], [174.7921142, -36.9499434],
      [174.7921753, -36.9500747], [174.7919277, -36.9501435], [174.7918995, -36.9502415],
      [174.7919599, -36.9503696], [174.7920537, -36.9504093], [174.7921315, -36.9504714],
      [174.792145, -36.9505004], [174.7921745, -36.9505357],
    ],
  },
  {
    id: 'mikoikoi-cres',
    name: 'Mikoikoi Cres',
    coordinates: [
      [174.7922415, -36.9499024], [174.7922697, -36.9499666], [174.7922919, -36.9499566],
      [174.7925601, -36.950043], [174.7926426, -36.9500436], [174.7929591, -36.9499642],
      [174.7926839, -36.9498228], [174.7926859, -36.9498142], [174.7924659, -36.9497462],
      [174.792472, -36.9496433], [174.7924559, -36.9496095], [174.7923809, -36.9496321],
      [174.7923928, -36.9496733], [174.7923875, -36.9497499], [174.7923493, -36.9498239],
      [174.7923053, -36.9498676], [174.7922661, -36.9498973], [174.7922415, -36.9499024],
    ],
  },
  {
    id: 'kaihua-terrace',
    name: 'Kaihua Terrace',
    coordinates: [
      [174.7929591, -36.9499642], [174.7930691, -36.949875], [174.7930128, -36.9497432],
      [174.793116, -36.9497078], [174.7930342, -36.9494624], [174.793002, -36.9493809],
      [174.7923514, -36.9495694], [174.7923809, -36.9496321], [174.7924559, -36.9496095],
      [174.792472, -36.9496433], [174.7924659, -36.9497462], [174.7926859, -36.9498142],
      [174.7926839, -36.9498228], [174.7929591, -36.9499642],
    ],
  },
  {
    id: 'patiti-parade',
    name: 'Patiti Parade',
    coordinates: [
      [174.7935643, -36.9499399], [174.7934571, -36.9496262], [174.7931956, -36.9496991],
      [174.7930984, -36.9494145], [174.7930876, -36.9493856], [174.793038, -36.949369],
      [174.793002, -36.9493809], [174.793116, -36.9497078], [174.7930128, -36.9497432],
      [174.7930691, -36.949875], [174.7929591, -36.9499642], [174.7930174, -36.9501004],
      [174.7935643, -36.9499399],
    ],
  },
];

// Ray-casting point-in-polygon
function pointInPolygon(lng, lat, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

async function fetchAddresses() {
  const [minLng, minLat, maxLng, maxLat] = BBOX;
  // LINZ CQL BBOX uses lat/lng order (EPSG:4326 axis convention)
  const cql = `BBOX(shape,${minLat},${minLng},${maxLat},${maxLng})`;
  const url = new URL(`https://data.linz.govt.nz/services;key=${LINZ_API_KEY}/wfs`);
  url.searchParams.set('service', 'WFS');
  url.searchParams.set('version', '2.0.0');
  url.searchParams.set('request', 'GetFeature');
  url.searchParams.set('typeNames', LAYER_ID);
  url.searchParams.set('outputFormat', 'application/json');
  url.searchParams.set('count', '5000');
  url.searchParams.set('cql_filter', cql);

  console.log('Fetching addresses from LINZ Data Service...');
  console.log(`  Layer: ${LAYER_ID}`);
  console.log(`  BBOX: ${BBOX.join(', ')}`);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LINZ API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const data = await res.json();
  const features = data.features || [];
  console.log(`  Received ${features.length} address features`);

  if (features.length > 0) {
    console.log(`  Sample properties: ${Object.keys(features[0].properties).join(', ')}`);
  }

  return features;
}

function extractAddress(props) {
  // Handle different LINZ schema versions
  return (
    props.full_address ||
    props.fullAddress ||
    [props.full_address_number || props.address_number || '', props.full_road_name || props.road_name || '']
      .filter(Boolean)
      .join(' ')
  );
}

function extractStreetName(props) {
  return props.full_road_name || props.road_name || props.street_name || '';
}

function extractStreetNumber(props) {
  return props.full_address_number || props.address_number || props.street_number || '';
}

function assignToPrecincts(features) {
  const result = new Map();
  for (const p of PRECINCTS) {
    result.set(p.id, { precinctId: p.id, name: p.name, count: 0, addresses: [] });
  }

  let assigned = 0;
  let outside = 0;

  for (const feature of features) {
    const coords = feature.geometry?.coordinates;
    if (!coords || coords.length < 2) continue;

    const [lng, lat] = coords;

    let matched = false;
    for (const precinct of PRECINCTS) {
      if (pointInPolygon(lng, lat, precinct.coordinates)) {
        const props = feature.properties;
        const entry = result.get(precinct.id);
        entry.addresses.push({
          id: String(props.address_id ?? props.id ?? assigned),
          fullAddress: extractAddress(props),
          streetName: extractStreetName(props),
          streetNumber: extractStreetNumber(props),
          coordinates: [lat, lng],
        });
        entry.count++;
        assigned++;
        matched = true;
        break;
      }
    }
    if (!matched) outside++;
  }

  // Sort addresses alphabetically within each precinct
  for (const entry of result.values()) {
    entry.addresses.sort((a, b) => a.fullAddress.localeCompare(b.fullAddress));
  }

  console.log(`\nAssignment results:`);
  console.log(`  Assigned to precincts: ${assigned}`);
  console.log(`  Outside all precincts: ${outside}`);

  return [...result.values()];
}

function generateTypeScript(precinctData) {
  const now = new Date().toISOString().split('T')[0];
  const lines = [
    `// Auto-generated by scripts/fetch-property-data.mjs — do not edit manually`,
    `// Source: LINZ NZ Street Address (${LAYER_ID})`,
    `// Generated: ${now}`,
    ``,
    `export interface PropertyAddress {`,
    `  id: string;`,
    `  fullAddress: string;`,
    `  streetName: string;`,
    `  streetNumber: string;`,
    `  coordinates: [number, number];`,
    `}`,
    ``,
    `export interface PrecinctProperties {`,
    `  precinctId: string;`,
    `  name: string;`,
    `  count: number;`,
    `  addresses: PropertyAddress[];`,
    `}`,
    ``,
    `export const PROPERTY_DATA: PrecinctProperties[] = ${JSON.stringify(precinctData, null, 2)};`,
    ``,
  ];
  return lines.join('\n');
}

async function main() {
  try {
    const features = await fetchAddresses();

    if (features.length === 0) {
      console.error('\nNo addresses returned. Possible causes:');
      console.error('  - API key lacks access to the Street Address layer');
      console.error('  - BBOX coordinates are in wrong order');
      console.error('  - Layer ID has changed');
      console.error('\nTry browsing https://data.linz.govt.nz/layer/53353-nz-street-address/');
      process.exit(1);
    }

    const precinctData = assignToPrecincts(features);

    console.log('\nPer-precinct counts:');
    for (const p of precinctData) {
      console.log(`  ${p.name}: ${p.count} addresses`);
    }

    const ts = generateTypeScript(precinctData);
    const outPath = resolve(__dirname, '../src/data/property-addresses.ts');
    writeFileSync(outPath, ts, 'utf-8');
    console.log(`\nWritten to ${outPath}`);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
}

main();
