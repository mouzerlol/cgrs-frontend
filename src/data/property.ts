export interface PropertyData {
  id: string;
  unit_number: string;
  street_address: string;
  suburb: string;
  city: string;
  postcode: string;
  property_type: 'apartment' | 'townhouse' | 'house';
  bedrooms: number;
  bathrooms: number;
  parking_spaces: number;
  image_url: string;
  map_coordinates: { lat: number; lng: number };
}

export interface Occupant {
  id: string;
  name: string;
  relationship: 'primary' | 'partner' | 'dependent' | 'flatmate';
  avatar_url?: string;
}

export const MOCK_PROPERTY: PropertyData = {
  id: 'prop-001',
  unit_number: '14',
  street_address: '22 Coronation Road',
  suburb: 'Mangere Bridge',
  city: 'Auckland',
  postcode: '2022',
  property_type: 'townhouse',
  bedrooms: 3,
  bathrooms: 2,
  parking_spaces: 1,
  image_url: '/images/property-placeholder.jpg',
  map_coordinates: { lat: -36.9376, lng: 174.7856 },
};

export const MOCK_OCCUPANTS: Occupant[] = [
  { id: 'occ-001', name: 'Dameon Taylor', relationship: 'primary' },
  { id: 'occ-002', name: 'Sarah Taylor', relationship: 'partner' },
  { id: 'occ-003', name: 'Mia Taylor', relationship: 'dependent' },
];
