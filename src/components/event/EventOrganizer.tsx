'use client';

import Image from 'next/image';
import { EventOrganizer as EventOrganizerType } from '@/types';
import { cn } from '@/lib/utils';

interface EventOrganizerProps {
  organizer: EventOrganizerType;
  className?: string;
}

export default function EventOrganizer({ organizer, className }: EventOrganizerProps) {
  const initials = organizer.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Avatar */}
      <div className="relative w-10 h-10 rounded-full overflow-hidden bg-sage-light flex items-center justify-center flex-shrink-0">
        {organizer.avatar ? (
          <Image
            src={organizer.avatar}
            alt={organizer.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="font-semibold text-forest/60 text-sm">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0">
        <span className="font-semibold text-forest text-sm">{organizer.name}</span>
        <span className="text-terracotta font-medium text-xs">{organizer.title}</span>
      </div>
    </div>
  );
}
