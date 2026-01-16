'use client';

import {
  Wrench,
  Megaphone,
  Users,
  Calendar,
  Newspaper,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCategoryConfig, getTypeColor } from '@/lib/calendar-config';
import type { CalendarItemType } from '@/types';

interface CategoryIconProps {
  type: CalendarItemType;
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  wrench: Wrench,
  megaphone: Megaphone,
  users: Users,
  calendar: Calendar,
  newspaper: Newspaper,
  info: Info,
};

const SIZE_MAP = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const WRAPPER_SIZE_MAP = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function CategoryIcon({
  type,
  category,
  size = 'md',
  className,
}: CategoryIconProps) {
  const config = getCategoryConfig(type, category);
  const IconComponent = ICON_MAP[config.icon] || Info;
  const typeColor = getTypeColor(type);

  const wrapperClasses = cn(
    'rounded-full flex items-center justify-center',
    WRAPPER_SIZE_MAP[size],
    {
      'bg-terracotta/10 text-terracotta': typeColor === 'terracotta',
      'bg-sage/30 text-forest': typeColor === 'sage',
      'bg-forest/10 text-forest': typeColor === 'forest',
    },
    className
  );

  return (
    <div className={wrapperClasses}>
      <IconComponent className={SIZE_MAP[size]} />
    </div>
  );
}

export default CategoryIcon;
