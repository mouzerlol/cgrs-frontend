/**
 * Shared display helpers for a resident's reported issues (list row + detail view).
 * Keeping the category icon/label mapping in one place stops the row and the detail
 * page from drifting apart (the detail page used to render the raw category slug).
 */

import {
  Wrench,
  Trash2,
  Car,
  CircleHelp,
  Volume2,
  Shield,
  Trees,
  CircleDot,
  type LucideIcon,
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  maintenance: Wrench,
  waste: Trash2,
  parking: Car,
  general: CircleHelp,
  noise: Volume2,
  safety: Shield,
  landscaping: Trees,
};

const CATEGORY_LABELS: Record<string, string> = {
  maintenance: 'Maintenance',
  waste: 'Waste',
  parking: 'Parking',
  general: 'General',
  noise: 'Noise Complaint',
  safety: 'Safety',
  landscaping: 'Landscaping',
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? 'Other';
}

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? CircleDot;
}
