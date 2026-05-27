import { getPostHog } from './posthog-client';

export const EVENT_NAMES = [
  'petition_signed',
  'event_rsvp_submitted',
  'comment_posted',
  'map_marker_clicked',
  'report_form_submitted',
  'account_signed_up',
  'account_signed_in',
] as const;

export type EventName = (typeof EVENT_NAMES)[number];

export type EventProperties = Record<string, string | number | boolean | null | undefined>;

export function track(event: EventName, properties: EventProperties = {}): void {
  const ph = getPostHog();
  if (!ph) return;
  ph.capture(event, properties);
}

export function commentLengthBucket(length: number): 'short' | 'medium' | 'long' {
  if (length < 80) return 'short';
  if (length < 400) return 'medium';
  return 'long';
}
