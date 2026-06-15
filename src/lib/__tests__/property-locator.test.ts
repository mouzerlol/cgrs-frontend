import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/data/property-addresses', () => ({
  PROPERTY_DATA: [
    {
      precinctId: 'huri-street',
      name: 'Huri Street',
      count: 2,
      addresses: [
        {
          id: '1',
          fullAddress: '41 Huri Street, Māngere Bridge, Auckland',
          streetName: 'Huri Street',
          streetNumber: '41',
          coordinates: [-36.9491, 174.7907],
        },
        {
          id: '2',
          fullAddress: '12A Huri Street, Māngere Bridge, Auckland',
          streetName: 'Huri Street',
          streetNumber: '12A',
          coordinates: [-36.9492, 174.7908],
        },
      ],
    },
    {
      precinctId: 'tanners-rd',
      name: 'Tanners Rd',
      count: 1,
      addresses: [
        {
          id: '3',
          fullAddress: '5 Tanners Road, Māngere Bridge, Auckland',
          streetName: 'Tanners Rd',
          streetNumber: '5',
          coordinates: [-36.95, 174.79],
        },
      ],
    },
  ],
}));

import {
  resolvePropertyCoordinates,
  resolvePropertyLocation,
  __resetIndexForTests,
} from '@/lib/property-locator';

describe('property-locator', () => {
  beforeEach(() => {
    __resetIndexForTests();
  });

  it('resolves a known address to coordinates', () => {
    expect(resolvePropertyCoordinates('41', 'Huri Street')).toEqual([-36.9491, 174.7907]);
  });

  it('returns the full record with source metadata', () => {
    const result = resolvePropertyLocation('41', 'Huri Street');
    expect(result).toMatchObject({
      id: '1',
      streetNumber: '41',
      coordinates: [-36.9491, 174.7907],
      source: 'local-linz',
    });
  });

  it('is case- and whitespace-insensitive on the street name', () => {
    expect(resolvePropertyCoordinates('41', '  huri   STREET ')).toEqual([-36.9491, 174.7907]);
  });

  it('canonicalises street-type suffixes (Rd <-> Road)', () => {
    // Dataset stores "Tanners Rd"; an API value of "Tanners Road" must still match.
    expect(resolvePropertyCoordinates('5', 'Tanners Road')).toEqual([-36.95, 174.79]);
  });

  it('collapses spacing in alphanumeric street numbers (12 A == 12A)', () => {
    expect(resolvePropertyCoordinates('12 a', 'Huri Street')).toEqual([-36.9492, 174.7908]);
  });

  it('returns null for an unknown address', () => {
    expect(resolvePropertyCoordinates('999', 'Nowhere Street')).toBeNull();
    expect(resolvePropertyLocation('999', 'Nowhere Street')).toBeNull();
  });

  it('returns null when inputs are missing', () => {
    expect(resolvePropertyCoordinates(null, 'Huri Street')).toBeNull();
    expect(resolvePropertyCoordinates('41', null)).toBeNull();
    expect(resolvePropertyCoordinates('', '')).toBeNull();
  });
});
