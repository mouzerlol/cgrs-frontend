/**
 * Coordinate-capture helpers for ground-report images.
 *
 * The capture chain is device geolocation → photo EXIF GPS → manual map pin. A pin
 * must exist before an image can be saved, so `lat`/`lng` are never null. Each helper
 * resolves to `null` (never throws) so the UI can fall through to the next source.
 */

import type { GroundReportCoordSource } from '@/types/ground-report';

export interface CapturedCoord {
  lat: number;
  lng: number;
  source: GroundReportCoordSource;
  accuracyM?: number;
}

/** Read the device geolocation. Resolves null on denial, timeout, or no support. */
export function getDeviceLocation(timeoutMs = 8000): Promise<CapturedCoord | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          source: 'device',
          accuracyM: pos.coords.accuracy ?? undefined,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
    );
  });
}

/** Read EXIF GPS from a photo via exifr. Resolves null when absent or stripped. */
export async function readExifGps(file: File): Promise<CapturedCoord | null> {
  try {
    const exifr = (await import('exifr')).default as { gps?: (f: File) => Promise<unknown> };
    const gps = (await exifr.gps?.(file)) as { latitude?: number; longitude?: number } | undefined;
    if (gps && typeof gps.latitude === 'number' && typeof gps.longitude === 'number') {
      return { lat: gps.latitude, lng: gps.longitude, source: 'exif' };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Run the device → EXIF chain for one file, returning the first coordinate found
 * (or null, leaving the manual pin as the backstop). A pre-fetched batch device
 * coordinate (§6.9) short-circuits the per-image device call.
 */
export async function autoCapture(
  file: File,
  batchDevice?: CapturedCoord | null,
): Promise<CapturedCoord | null> {
  if (batchDevice) return batchDevice;
  const device = await getDeviceLocation();
  if (device) return device;
  return readExifGps(file);
}
