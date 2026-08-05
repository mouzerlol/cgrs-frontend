import { Suspense } from 'react';
import type { Metadata } from 'next';
import PageHeader from '@/components/sections/PageHeader';
import MapSkeleton from '@/components/map/MapSkeleton';
import MapClient from './MapClient';
import { parseShareCoords, buildShareUrl } from '@/lib/share-location';
import { resolveShareLocation } from '@/lib/geocode';
import { buildShareCardCopy } from '@/lib/og-share-card';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

/**
 * Per-link Open Graph metadata (Tier 1: text only, shared static image).
 *
 * Link-preview scrapers (WhatsApp, iMessage, Slack…) run no JavaScript and only see
 * this server-rendered <head>. When the URL carries valid `lat`/`lng`, name the
 * precinct + nearest address so the unfurl describes the actual point. Param'd URLs
 * also get `canonical: /map` so search engines don't index endless coordinate
 * variants. Humans still get the live client map.
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams?: SearchParams;
}): Promise<Metadata> {
  const sp = (await searchParams) ?? {};
  const coords = parseShareCoords(sp.lat, sp.lng);

  if (!coords) {
    return {
      title: 'Community Map | Coronation Gardens',
      description:
        'Explore Coronation Gardens with our interactive map. Find community boundaries, amenities, and points of interest in Mangere Bridge.',
    };
  }

  const copy = buildShareCardCopy(await resolveShareLocation(coords.lat, coords.lng));

  // Per-coordinate "Living Wall" card naming the actual point. It renders from glyphs
  // and text only (no basemap, no Stadia key), so the unfurl never depends on an
  // external fetch; the route still falls back to the static default on bad coords.
  const image = {
    url: `/api/og/share-location?lat=${coords.lat}&lng=${coords.lng}`,
    width: 1200,
    height: 630,
    alt: copy.imageAlt,
  };

  // Keep search engines from indexing endless coordinate variants with `noindex` (which
  // the social crawlers ignore), NOT a canonical pointing at /map. A canonical to a
  // different URL than og:url gives Facebook/Messenger contradictory signals and it falls
  // back to a bare domain preview. Self-canonical + og:url + noindex all agree, so the
  // social card resolves and SEO is still satisfied. (WhatsApp ignores all this anyway.)
  const from = typeof sp.from === 'string' ? sp.from : undefined;
  const shareUrl = buildShareUrl(coords.lat, coords.lng, from ? { from } : {});

  return {
    title: copy.metaTitle,
    description: copy.metaDescription,
    alternates: { canonical: shareUrl },
    robots: { index: false, follow: true },
    openGraph: {
      title: copy.metaTitle,
      description: copy.metaDescription,
      type: 'website',
      url: shareUrl,
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.metaTitle,
      description: copy.metaDescription,
      images: [image.url],
    },
  };
}

/**
 * Dedicated Map page for exploring Coronation Gardens.
 *
 * Server Component: parses share coordinates from the URL and forwards them to the
 * client map (via MapClient, which performs the ssr:false dynamic import). The map
 * itself handles the deep-link landing — instant max-zoom + dropped pin + card.
 */
export default async function MapPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const sp = (await searchParams) ?? {};
  const coords = parseShareCoords(sp.lat, sp.lng);
  const from = typeof sp.from === 'string' ? sp.from : undefined;

  return (
    <div className="min-h-screen">
      <PageHeader
        title="Explore Coronation Gardens"
        description="Community boundaries, amenities, and points of interest in Māngere Bridge."
        eyebrow="Community Map"
        eyebrowIconKey="map"
        backgroundImage="/images/mangere-mountain.jpg"
      />
      <Suspense fallback={<MapSkeleton />}>
        <MapClient shareLat={coords?.lat} shareLng={coords?.lng} shareFrom={from} />
      </Suspense>
    </div>
  );
}
