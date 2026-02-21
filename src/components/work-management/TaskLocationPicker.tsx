'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TaskLocation } from '@/types/work-management';

const LocationMap = dynamic(() => import('./LocationMap'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-sage-light/30 animate-pulse rounded-lg flex items-center justify-center text-forest/40">Loading map...</div>
});

interface TaskLocationPickerProps {
  location?: TaskLocation;
  onChange: (loc: TaskLocation) => void;
  readonly?: boolean;
}

export default function TaskLocationPicker({ location, onChange, readonly = false }: TaskLocationPickerProps) {
  return (
    <div className="h-[200px] w-full rounded-lg overflow-hidden border border-sage/20 relative z-0">
      <LocationMap location={location} onChange={onChange} readonly={readonly} />
    </div>
  );
}
