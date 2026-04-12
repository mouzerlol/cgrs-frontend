import Image from 'next/image';
import type { Occupant } from '@/data/property';
import { isNonOptimizableImageSrc } from '@/lib/image';

interface OccupantCardProps {
  occupant: Occupant;
}

const RELATIONSHIP_LABELS: Record<string, string> = {
  primary: 'Primary Resident',
  partner: 'Partner',
  dependent: 'Dependent',
  flatmate: 'Flatmate',
};

export default function OccupantCard({ occupant }: OccupantCardProps) {
  const initials = occupant.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-3 rounded-xl bg-bone p-3">
      {occupant.avatar_url ? (
        <Image
          src={occupant.avatar_url}
          alt={occupant.name}
          width={40}
          height={40}
          unoptimized={isNonOptimizableImageSrc(occupant.avatar_url)}
          className="h-10 w-10 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-bold text-bone">
          {initials}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-forest">{occupant.name}</p>
        <p className="text-xs text-forest/60">
          {RELATIONSHIP_LABELS[occupant.relationship] || occupant.relationship}
        </p>
      </div>
    </div>
  );
}
