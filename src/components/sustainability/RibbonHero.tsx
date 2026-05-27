import { SLEEP_WINDOW } from '@/lib/cold-start/config';
import { aucklandHour } from '@/lib/cold-start/sleep-window';

/**
 * The 24-hour ribbon hero. Pure inline SVG, server-rendered. The "now" marker
 * is positioned from the request-time clock evaluated in Pacific/Auckland.
 *
 * Visual model (24-step ribbon, 0..23):
 *   ░ = asleep slot (forest)
 *   ▰ = awake slot  (terracotta-tinted bone)
 *   ▲ = now marker positioned under the slot of the current hour
 */

export interface RibbonHeroProps {
  /** Override for the current time — used by tests and by the optional client hydration. */
  now?: Date;
}

const VIEW_W = 1200;
const VIEW_H = 120;
const RIBBON_Y = 36;
const RIBBON_H = 36;
const MARKER_Y = RIBBON_Y + RIBBON_H + 12;
const HOUR_LABEL_Y = 18;

const LABELLED_HOURS = [0, 3, 6, 9, 12, 15, 18, 21];

export default function RibbonHero({ now }: RibbonHeroProps) {
  const at = now ?? new Date();
  const hour = aucklandHour(at);
  const minuteWithin = minuteWithinHour(at);
  // Hour fraction (0..24) so the marker can sit between hour ticks rather than snapping.
  const positionHours = hour + minuteWithin / 60;
  const markerX = (positionHours / 24) * VIEW_W;

  const { startHour, endHour } = SLEEP_WINDOW;

  return (
    <figure className="w-full" aria-labelledby="ribbon-caption">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full h-auto"
        role="img"
        aria-describedby="ribbon-caption"
      >
        {/* Hour labels above the ribbon. */}
        {LABELLED_HOURS.map((h) => {
          const x = (h / 24) * VIEW_W;
          return (
            <text
              key={`label-${h}`}
              x={x}
              y={HOUR_LABEL_Y}
              fill="#1A2218"
              fillOpacity="0.5"
              fontSize="11"
              fontFamily="var(--font-jetbrains-mono), monospace"
              textAnchor="middle"
            >
              {String(h).padStart(2, '0')}
            </text>
          );
        })}

        {/* Twenty-four ribbon slots. Two passes so the SVG order keeps borders crisp. */}
        {Array.from({ length: 24 }).map((_, h) => {
          const x = (h / 24) * VIEW_W;
          const slotWidth = VIEW_W / 24;
          const sleeping = isHourSleeping(h, startHour, endHour);
          return (
            <rect
              key={`slot-${h}`}
              x={x}
              y={RIBBON_Y}
              width={slotWidth - 2}
              height={RIBBON_H}
              fill={sleeping ? '#2C3E2D' : '#F4F1EA'}
              stroke={sleeping ? '#1A2218' : '#D95D39'}
              strokeOpacity={sleeping ? 0.4 : 0.18}
              strokeWidth="0.5"
            />
          );
        })}

        {/* Awake-window overline so the lit zone reads as one continuous span at a glance. */}
        {(() => {
          const awakeStartX = (endHour / 24) * VIEW_W;
          const awakeEndX = (startHour / 24) * VIEW_W;
          return (
            <line
              x1={awakeStartX}
              x2={awakeEndX}
              y1={RIBBON_Y - 3}
              y2={RIBBON_Y - 3}
              stroke="#D95D39"
              strokeWidth="1"
            />
          );
        })()}

        {/* "Now" marker — a small terracotta triangle directly under the current-hour slot. */}
        <polygon
          points={`${markerX - 6},${MARKER_Y + 10} ${markerX + 6},${MARKER_Y + 10} ${markerX},${MARKER_Y}`}
          fill="#D95D39"
        />

        {/* Marker label: "now (HH:MM NZST)". */}
        <text
          x={markerX}
          y={MARKER_Y + 26}
          fill="#1A2218"
          fontSize="11"
          fontFamily="var(--font-jetbrains-mono), monospace"
          textAnchor="middle"
        >
          now ({hhmm(at)} {nzZoneShort(at)})
        </text>
      </svg>

      <figcaption
        id="ribbon-caption"
        className="text-sm text-forest/70 mt-md font-body"
      >
        The site is awake from {endHour} in the morning until {startHour > 12 ? startHour - 12 : startHour} at night, Auckland time.
      </figcaption>
    </figure>
  );
}

function isHourSleeping(hour: number, startHour: number, endHour: number): boolean {
  if (startHour === endHour) return false;
  if (startHour > endHour) return hour >= startHour || hour < endHour;
  return hour >= startHour && hour < endHour;
}

function minuteWithinHour(at: Date): number {
  const minute = Number.parseInt(
    new Intl.DateTimeFormat('en-NZ', {
      timeZone: 'Pacific/Auckland',
      minute: 'numeric',
      hour12: false,
    }).format(at),
    10,
  );
  return Number.isFinite(minute) ? minute : 0;
}

function hhmm(at: Date): string {
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(at);
}

function nzZoneShort(at: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Pacific/Auckland',
    timeZoneName: 'short',
  }).formatToParts(at);
  const tz = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  if (/NZDT/i.test(tz)) return 'NZDT';
  if (/NZST/i.test(tz)) return 'NZST';
  return tz.includes('13') ? 'NZDT' : 'NZST';
}
