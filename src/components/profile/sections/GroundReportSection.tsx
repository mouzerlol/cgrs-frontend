'use client';

/**
 * Member Ground Report tab: a filed record of the committee's photo walk-throughs.
 *
 * The most recent area leads as a wide feature plate; the rest follow as a square
 * grid of cover tiles. Tapping any plate opens the full-screen reel seeked to that
 * zone. Zones with no qualifying report are omitted by the API.
 */

import { useMemo, useState } from 'react';
import { ImageIcon, MapPinned, Play } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import AccountSectionHeading from '@/components/profile/AccountSectionHeading';
import EmptyState from '@/components/ui/EmptyState';
import GroundReportReel from '@/components/ground-report/GroundReportReel';
import { useMemberGroundReportQuery } from '@/hooks/useGroundReport';
import { buildSlides, formatZonePeriod, titleSlideIndex } from '@/lib/ground-report/reel';
import type { MemberZoneReportResponse } from '@/types/ground-report';

export default function GroundReportSection() {
  const { data, isLoading, refetch } = useMemberGroundReportQuery();
  const zones = useMemo(() => data?.zones ?? [], [data]);
  const slides = useMemo(() => buildSlides(zones), [zones]);
  const [reelStart, setReelStart] = useState<number | null>(null);

  if (isLoading) return <LoadingState />;

  if (zones.length === 0) {
    return (
      <EmptyState
        icon={<MapPinned className="h-7 w-7 text-forest" aria-hidden="true" />}
        title="No ground reports yet"
        description="When the committee publishes photo updates of your area, you'll see them here as a swipeable reel."
      />
    );
  }

  const open = (zoneId: string) => setReelStart(titleSlideIndex(slides, zoneId));
  const [feature, ...rest] = zones;

  return (
    <div className="space-y-7 lg:pl-8 lg:[&>*:first-child]:-ml-8">
      {/* Masthead */}
      <AccountSectionHeading
        eyebrow="Committee"
        title="Ground Report"
        subtitle="Photo walk-throughs from around the development, logged area by area."
        icon={MapPinned}
        action={
          <span className="hidden items-baseline gap-1.5 border border-sage/40 bg-sage-light px-3 py-1.5 sm:inline-flex">
            <span className="font-display text-lg leading-none text-forest">{zones.length}</span>
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-forest/55">
              {zones.length === 1 ? 'area' : 'areas'}
            </span>
          </span>
        }
      />

      {/* Feature plate: the most recent area, given the most room. */}
      <FeatureTile zone={feature} onOpen={() => open(feature.zone_id)} />

      {rest.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-forest/40">
              Other areas
            </span>
            <span className="h-px flex-1 bg-sage/30" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="ground-report-grid">
            {rest.map((zone) => (
              <GridTile key={zone.zone_id} zone={zone} onOpen={() => open(zone.zone_id)} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-center text-xs text-forest/45">Tap any area to play its photo reel.</p>

      {reelStart !== null ? (
        <GroundReportReel
          zones={zones}
          startIndex={reelStart}
          onClose={() => setReelStart(null)}
          onImageError={() => void refetch()}
        />
      ) : null}
    </div>
  );
}

function FeatureTile({ zone, onOpen }: { zone: MemberZoneReportResponse; onOpen: () => void }) {
  const cover = zone.images[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative block aspect-[16/10] w-full overflow-hidden rounded-none border border-sage/25 bg-forest text-left transition hover:border-forest/30 hover:shadow-[0_12px_30px_rgba(26,34,24,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta sm:aspect-[21/9]"
      data-testid={`feature-tile-${zone.zone_id}`}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={`${zone.label} cover`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/35 to-transparent" />

      <PhotoChip count={zone.images.length} />

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-terracotta">
            Latest
          </span>
          <p className="mt-1 truncate font-display text-2xl text-bone sm:text-3xl">{zone.label}</p>
          <p className="mt-0.5 text-sm text-bone/75">{formatZonePeriod(zone)}</p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-none bg-terracotta text-bone transition group-hover:bg-terracotta-dark">
          <Play className="h-5 w-5 translate-x-px fill-bone" aria-hidden="true" />
        </span>
      </div>
    </button>
  );
}

function GridTile({ zone, onOpen }: { zone: MemberZoneReportResponse; onOpen: () => void }) {
  const cover = zone.images[0];
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative aspect-square overflow-hidden rounded-none border border-sage/25 bg-sage-light text-left transition hover:border-forest/30 hover:shadow-[0_8px_22px_rgba(26,34,24,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      data-testid={`grid-tile-${zone.zone_id}`}
    >
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={cover.url}
          alt={`${zone.label} cover`}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
        />
      ) : null}
      <PhotoChip count={zone.images.length} />
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/85 to-transparent p-3">
        <p className="truncate text-sm font-semibold text-bone">{zone.label}</p>
        <p className="text-xs text-bone/75">{formatZonePeriod(zone)}</p>
      </div>
    </button>
  );
}

function PhotoChip({ count }: { count: number }) {
  return (
    <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-none bg-forest/55 px-2 py-0.5 text-[0.7rem] font-medium text-bone">
      <ImageIcon className="h-3 w-3" aria-hidden="true" />
      {count}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-7">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 shrink-0 rounded-none" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
      </div>
      <Skeleton className="aspect-[16/10] w-full rounded-none sm:aspect-[21/9]" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-none" />
        ))}
      </div>
    </div>
  );
}
