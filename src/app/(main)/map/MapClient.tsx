'use client';

import dynamic from 'next/dynamic';
import MapSkeleton from '@/components/map/MapSkeleton';

/**
 * Client shim for the map page.
 *
 * The interactive Leaflet map cannot be server-rendered (`ssr: false`), and a
 * `dynamic(..., { ssr: false })` import is only allowed inside a Client Component.
 * Keeping it here lets `page.tsx` stay a Server Component so it can export
 * `generateMetadata` for per-link share unfurls. Share coordinates parsed on the
 * server are forwarded down as props.
 */
const MapSection = dynamic(() => import('@/components/sections/MapSection'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export interface MapClientProps {
  shareLat?: number;
  shareLng?: number;
  shareFrom?: string;
}

export default function MapClient({ shareLat, shareLng, shareFrom }: MapClientProps) {
  return <MapSection shareLat={shareLat} shareLng={shareLng} shareFrom={shareFrom} />;
}
