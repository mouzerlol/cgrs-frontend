'use client';

/**
 * One pending image in the upload flow: preview + caption + the device→EXIF→manual
 * coordinate capture chain. The card surfaces its readiness (a coordinate exists)
 * so the parent can block saving until every image has a pin.
 */

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2, Crosshair } from 'lucide-react';
import LocationPicker, { type LatLng } from '@/components/ground-report/LocationPicker';
import { autoCapture, type CapturedCoord } from '@/lib/ground-report/capture';
import type { GroundReportCoordSource } from '@/types/ground-report';

export interface PendingImage {
  file: File;
  caption: string;
  coord: LatLng | null;
  coordSource: GroundReportCoordSource;
  accuracyM?: number;
}

interface ImageCaptureCardProps {
  pending: PendingImage;
  index: number;
  batchDevice?: CapturedCoord | null;
  onChange: (index: number, next: PendingImage) => void;
  onRemove: (index: number) => void;
}

const SOURCE_LABEL: Record<GroundReportCoordSource, string> = {
  device: 'Device location',
  exif: 'Photo GPS (EXIF)',
  manual: 'Manual pin',
};

export default function ImageCaptureCard({
  pending,
  index,
  batchDevice,
  onChange,
  onRemove,
}: ImageCaptureCardProps) {
  const [autoRunning, setAutoRunning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const ranRef = useRef(false);

  useEffect(() => {
    const url = URL.createObjectURL(pending.file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pending.file]);

  // Run the device → EXIF chain once per card; manual pin remains the backstop.
  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    let cancelled = false;
    setAutoRunning(true);
    autoCapture(pending.file, batchDevice)
      .then((captured) => {
        if (cancelled || !captured) return;
        onChange(index, {
          ...pending,
          coord: { lat: captured.lat, lng: captured.lng },
          coordSource: captured.source,
          accuracyM: captured.accuracyM,
        });
      })
      .finally(() => !cancelled && setAutoRunning(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleManualPick = (coord: LatLng) => {
    // Any hand-placed/nudged pin is, by definition, a manual coordinate.
    onChange(index, { ...pending, coord, coordSource: 'manual' });
  };

  const ready = pending.coord != null;

  return (
    <div className="rounded-none border border-sage/40 bg-white p-3" data-testid={`image-capture-${index}`}>
      <div className="flex gap-3">
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt={pending.file.name} className="h-20 w-20 rounded-none object-cover" />
        ) : (
          <div className="h-20 w-20 rounded-none bg-sage/10" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-forest">{pending.file.name}</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            {autoRunning ? (
              <span className="flex items-center gap-1 text-forest/60">
                <Loader2 className="h-3 w-3 animate-spin" /> Locating…
              </span>
            ) : ready ? (
              <span className="flex items-center gap-1 text-forest" data-testid={`coord-ready-${index}`}>
                <MapPin className="h-3 w-3" /> {SOURCE_LABEL[pending.coordSource]} · {pending.coord!.lat.toFixed(5)}, {pending.coord!.lng.toFixed(5)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-terracotta" data-testid={`coord-missing-${index}`}>
                <Crosshair className="h-3 w-3" /> Drop a pin to set this photo&apos;s location
              </span>
            )}
          </div>
          <input
            type="text"
            value={pending.caption}
            placeholder="Caption (optional)"
            onChange={(e) => onChange(index, { ...pending, caption: e.target.value })}
            className="mt-2 w-full rounded-none border border-sage/40 bg-white px-2 py-1 text-sm text-forest focus:border-forest focus:outline-none"
            data-testid={`caption-${index}`}
          />
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="self-start text-xs text-forest/50 hover:text-terracotta"
        >
          Remove
        </button>
      </div>
      <div className="mt-3">
        <LocationPicker value={pending.coord} onPick={handleManualPick} className="overflow-hidden rounded-none border border-sage/30" />
      </div>
    </div>
  );
}
