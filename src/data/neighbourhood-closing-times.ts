/**
 * The "Things that close overnight in Mangere Bridge" almanac list.
 *
 * Curated for Mangere Bridge. Designed to be a single-file edit when CGRS is
 * adapted for another community: replace the items, keep the structure. The
 * last entry SHALL be CGRS itself, framed as one neighbourhood institution
 * among others rather than as the subject of the list.
 *
 * See openspec/changes/cold-start-status-banner/design.md D11.
 */

export interface NeighbourhoodInstitution {
  name: string;
  hours: string;
  /** True for the CGRS website entry. Rendered with subtle emphasis so visitors notice it. */
  isOurs?: boolean;
}

export const NEIGHBOURHOOD_CLOSING_TIMES: NeighbourhoodInstitution[] = [
  { name: 'Mangere Bridge Library', hours: '9 am to 5 pm' },
  { name: 'Tarata Foodbank', hours: '10 am to 2 pm' },
  { name: 'The dairy on Coronation Road', hours: '6 am to 9 pm' },
  { name: 'The Manukau Harbour, the tide', hours: 'on its own schedule' },
  { name: 'CGRS, the website', hours: '6 am to 11 pm', isOurs: true },
];
