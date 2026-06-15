import { describe, it, expect } from 'vitest';
import {
  roundCoord,
  parseShareCoords,
  buildShareUrl,
  describeLocation,
  locationSubtitle,
} from '@/lib/share-location';
import { PROPERTY_DATA } from '@/data/property-addresses';

describe('roundCoord', () => {
  it('rounds to 5 decimal places', () => {
    expect(roundCoord(-36.94971234)).toBe(-36.94971);
    expect(roundCoord(174.7918399)).toBe(174.79184);
  });
});

describe('parseShareCoords', () => {
  it('parses a valid pair', () => {
    expect(parseShareCoords('-36.94971', '174.79184')).toEqual({
      lat: -36.94971,
      lng: 174.79184,
    });
  });

  it('accepts the first value of an array param', () => {
    expect(parseShareCoords(['-36.9', '0'], ['174.8'])).toEqual({ lat: -36.9, lng: 174.8 });
  });

  it('returns null when a half is missing', () => {
    expect(parseShareCoords('-36.9', undefined)).toBeNull();
    expect(parseShareCoords(null, '174.8')).toBeNull();
  });

  it('returns null for non-numeric or out-of-range values', () => {
    expect(parseShareCoords('abc', '174.8')).toBeNull();
    expect(parseShareCoords('-91', '174.8')).toBeNull();
    expect(parseShareCoords('-36.9', '181')).toBeNull();
    expect(parseShareCoords('', '')).toBeNull();
  });
});

describe('buildShareUrl', () => {
  it('builds a rounded /map URL', () => {
    expect(buildShareUrl(-36.94971234, 174.7918399)).toBe(
      '/map?lat=-36.94971&lng=174.79184'
    );
  });

  it('appends the from flag', () => {
    expect(buildShareUrl(-36.9, 174.8, { from: 'share' })).toBe(
      '/map?lat=-36.9&lng=174.8&from=share'
    );
  });
});

describe('describeLocation', () => {
  it('names the nearest address for an exact property coordinate', () => {
    const [lat, lng] = PROPERTY_DATA[0].addresses[0].coordinates;
    const desc = describeLocation(lat, lng);
    expect(desc.address).toBe(PROPERTY_DATA[0].addresses[0].fullAddress);
  });

  it('omits the address for a far-away point', () => {
    // Equator — nowhere near Māngere Bridge.
    const desc = describeLocation(0, 0);
    expect(desc.address).toBeUndefined();
    expect(desc.precinctName).toBeUndefined();
  });
});

describe('locationSubtitle', () => {
  it('joins precinct and address', () => {
    expect(locationSubtitle({ precinctName: 'Whai Hua', address: '12 Huri Street' })).toBe(
      'Whai Hua · near 12 Huri Street'
    );
  });

  it('returns undefined when nothing resolves', () => {
    expect(locationSubtitle({})).toBeUndefined();
  });
});
