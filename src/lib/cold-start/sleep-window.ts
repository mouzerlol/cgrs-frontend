import { SLEEP_WINDOW } from './config';

/**
 * Return true if `at` falls inside the Cloud Run sleep window (server scaled to zero).
 *
 * Evaluation is ALWAYS performed in `Pacific/Auckland`, regardless of the
 * client's local timezone. Using client-local hours would mis-fire for any
 * visitor outside NZ (e.g. a Sydney visitor at 23:30 AEDT during NZ daytime).
 *
 * The window wraps midnight: `startHour` is the scale-down hour at the end of
 * one day; `endHour` is the scale-up hour the next morning. With defaults of
 * 23 and 6, the sleep window is [23:00, 06:00) NZ.
 */
export function isInSleepWindow(at: Date = new Date()): boolean {
  const hour = aucklandHour(at);
  const { startHour, endHour } = SLEEP_WINDOW;

  if (startHour === endHour) return false;

  if (startHour > endHour) {
    // Window crosses midnight (the common case: 23 → 06).
    return hour >= startHour || hour < endHour;
  }

  // Window does not cross midnight (e.g. 02 → 05). Inclusive of start, exclusive of end.
  return hour >= startHour && hour < endHour;
}

/** Return the current hour-of-day (0–23) in `Pacific/Auckland`. */
export function aucklandHour(at: Date = new Date()): number {
  const formatter = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(at);
  const hourPart = parts.find((p) => p.type === 'hour');
  if (!hourPart) {
    throw new Error('Intl.DateTimeFormat did not return an hour part for Pacific/Auckland');
  }
  const hour = Number.parseInt(hourPart.value, 10);
  // en-NZ with hour12:false returns "24" at midnight in some Node versions; normalize to 0.
  return hour === 24 ? 0 : hour;
}
