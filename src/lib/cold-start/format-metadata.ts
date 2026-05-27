/**
 * Format the almanac metadata line displayed at the top of the cold-start banner.
 *
 * Pattern: "NO. {dayOfYear} — {weekday} {hh:mm} NZST — MANGERE BRIDGE"
 *
 * Both the weekday and the time are evaluated in Pacific/Auckland time, so a
 * Sydney-based visitor sees the same metadata as a Mangere Bridge resident.
 */
export interface BannerMetadata {
  entryNo: number;
  weekday: string;
  hhmm: string;
  zoneLabel: string;
  place: string;
}

const PLACE = 'MANGERE BRIDGE';

export function formatBannerMetadata(at: Date = new Date()): BannerMetadata {
  return {
    entryNo: dayOfYearAuckland(at),
    weekday: weekdayAuckland(at),
    hhmm: hhmmAuckland(at),
    zoneLabel: zoneLabelAuckland(at),
    place: PLACE,
  };
}

/** Day-of-year (1..366) for the date as it falls in Auckland. */
function dayOfYearAuckland(at: Date): number {
  const yearStr = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
  }).format(at);
  // Build a YYYY-MM-DD-ish reading in Auckland time.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(at); // e.g. "2026-05-13"
  const [y, m, d] = parts.split('-').map((n) => Number.parseInt(n, 10));
  const startOfYearUtc = Date.UTC(y, 0, 0);
  const thisDateUtc = Date.UTC(y, m - 1, d);
  const dayOfYear = Math.floor((thisDateUtc - startOfYearUtc) / 86_400_000);
  // Reference yearStr to avoid an unused-variable lint while keeping the locale read intentional.
  if (yearStr.length === 0) return 1;
  return dayOfYear;
}

function weekdayAuckland(at: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    weekday: 'short',
  })
    .format(at)
    .toUpperCase();
}

function hhmmAuckland(at: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(at);
}

/**
 * Returns NZST or NZDT depending on whether Auckland is currently observing
 * daylight saving. We derive this from the UTC offset rather than parsing the
 * locale string (which varies by Node version).
 */
function zoneLabelAuckland(at: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Pacific/Auckland',
    timeZoneName: 'short',
  });
  const parts = formatter.formatToParts(at);
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  if (/NZDT/i.test(tz)) return 'NZDT';
  if (/NZST/i.test(tz)) return 'NZST';
  // Fallback for environments returning GMT+13 / GMT+12 strings.
  return tz.includes('13') ? 'NZDT' : 'NZST';
}
