import type { CalendarItemType } from '@/types';

export interface CategoryConfig {
  label: string;
  icon: string;
  color: 'terracotta' | 'forest' | 'sage';
  defaultImage: string;
}

export type CategoryMap = Record<string, CategoryConfig>;

export const CALENDAR_CATEGORIES: Record<CalendarItemType, CategoryMap> = {
  notice: {
    maintenance: {
      label: 'Maintenance',
      icon: 'wrench',
      color: 'terracotta',
      defaultImage: '/images/calendar/maintenance.svg',
    },
    announcement: {
      label: 'Announcement',
      icon: 'megaphone',
      color: 'forest',
      defaultImage: '/images/calendar/announcement.svg',
    },
  },
  event: {
    social: {
      label: 'Social Event',
      icon: 'users',
      color: 'sage',
      defaultImage: '/images/events/social.svg',
    },
    meeting: {
      label: 'Committee Meeting',
      icon: 'calendar',
      color: 'forest',
      defaultImage: '/images/events/meeting.svg',
    },
  },
  news: {
    general: {
      label: 'General News',
      icon: 'newspaper',
      color: 'sage',
      defaultImage: '/images/news/general.svg',
    },
  },
} as const;

export const MAX_ITEMS_PER_CELL = 2;

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

export function getCategoryConfig(
  type: CalendarItemType,
  category: string
): CategoryConfig {
  const typeCategories = CALENDAR_CATEGORIES[type];
  return (
    typeCategories[category] || {
      label: category,
      icon: 'info',
      color: 'sage' as const,
      defaultImage: '/images/calendar/default.svg',
    }
  );
}

export function getTypeColor(type: CalendarItemType): string {
  switch (type) {
    case 'notice':
      return 'terracotta';
    case 'event':
      return 'sage';
    case 'news':
      return 'forest';
    default:
      return 'sage';
  }
}
