'use client';

/**
 * Dev-only harness for end-to-end testing of the Ground Report reel in a real
 * browser (touch/pointer drag can't be exercised in jsdom). Returns 404 in
 * production. Mounts the reel with mock zones — the second image uses a
 * deliberately broken URL so the onError fallback can be verified.
 */

import { notFound } from 'next/navigation';
import GroundReportReel from '@/components/ground-report/GroundReportReel';
import type { MemberZoneReportResponse } from '@/types/ground-report';

// A 1×1 forest-green pixel so the "good" images load without any backend.
const OK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800"><rect width="600" height="800" fill="%231f3d2b"/><text x="300" y="400" fill="%23f4f1ea" font-size="40" text-anchor="middle">OK PHOTO</text></svg>',
  );
const BROKEN_IMAGE = 'https://invalid.invalid/this-url-will-404.jpg';

const ZONES: MemberZoneReportResponse[] = [
  {
    zone_id: 'z1',
    label: 'Coronation',
    precinct_keys: ['stage-1'],
    report_id: 'r1',
    period_type: 'week',
    period_start: '2026-06-15',
    period_end: '2026-06-21',
    images: [
      { id: 'i1', url: OK_IMAGE, lat: -36.95, lng: 174.79, caption: 'Stage 1 photo', sort_order: 0 },
      { id: 'i2', url: BROKEN_IMAGE, lat: -36.951, lng: 174.791, caption: 'Stage 2&3 photo', sort_order: 1 },
      { id: 'i3', url: OK_IMAGE, lat: -36.952, lng: 174.792, caption: 'Stage 4 photo', sort_order: 2 },
    ],
  },
];

export default function ReelPreviewPage() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <GroundReportReel zones={ZONES} onClose={() => {}} />;
}
