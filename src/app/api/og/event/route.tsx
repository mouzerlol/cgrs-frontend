import { type NextRequest } from 'next/server';
import { livingWallImageResponse } from '@/lib/og/living-wall';
import eventsData from '@/data/events.json';
import type { Event } from '@/types';

/**
 * Open Graph image for calendar events. `GET /api/og/event?slug=` renders the shared
 * "Living Wall" card with the EVENTS glyph set (calendar, clock, pin, ticket, people)
 * and the event title + date + place in the plaque. `generateMetadata` on
 * /calendar/[slug] points here.
 */
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const event = (eventsData.events as Event[]).find((e) => e.slug === slug);
  if (!event) return Response.redirect(new URL('/images/og-default.jpg', req.nextUrl.origin), 307);

  const date = new Date(event.date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'long' });
  return livingWallImageResponse({
    set: 'events',
    eyebrow: 'Community Event',
    headline: event.title,
    subhead: `${date} · ${event.location}`,
    footerGlyph: 'calendar',
  });
}
