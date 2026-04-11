import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Car,
  Eye,
  Hand,
  HelpCircle,
  Megaphone,
  MessageCircle,
  Recycle,
} from 'lucide-react';
import type { DiscussionCategorySlug } from '@/types';

/**
 * Lucide icons for discussion categories, matching names used in CategoryBadge / forum metadata.
 */
export const DISCUSSION_CATEGORY_LUCIDE_ICONS: Record<DiscussionCategorySlug, LucideIcon> = {
  introductions: Hand,
  announcements: Megaphone,
  parking: Car,
  'waste-management': Recycle,
  'questions-help': HelpCircle,
  'neighborhood-watch': Eye,
  general: MessageCircle,
  events: Calendar,
};

/** Human-readable labels for accessibility (aligned with CategoryBadge defaults). */
const DISCUSSION_CATEGORY_LABELS: Record<DiscussionCategorySlug, string> = {
  introductions: 'Introductions',
  announcements: 'Announcements',
  parking: 'Parking',
  'waste-management': 'Waste Management',
  'questions-help': 'Questions & Help',
  'neighborhood-watch': 'Neighborhood Watch',
  general: 'General',
  events: 'Events',
};

/** Returns the Lucide icon component for a category slug; unknown slugs fall back to General. */
export function getDiscussionCategoryLucideIcon(slug: string): LucideIcon {
  if (slug in DISCUSSION_CATEGORY_LUCIDE_ICONS) {
    return DISCUSSION_CATEGORY_LUCIDE_ICONS[slug as DiscussionCategorySlug];
  }
  return MessageCircle;
}

/** Display name for a category slug (for aria-labels). */
export function getDiscussionCategoryLabel(slug: string): string {
  if (slug in DISCUSSION_CATEGORY_LABELS) {
    return DISCUSSION_CATEGORY_LABELS[slug as DiscussionCategorySlug];
  }
  return 'General';
}
