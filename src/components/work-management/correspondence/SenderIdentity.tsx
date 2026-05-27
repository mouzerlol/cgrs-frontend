'use client';

import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

export type SenderType = 'user' | 'contact_claimed' | 'contact_unclaimed' | 'raw';

export interface CorrespondenceSender {
  type: SenderType;
  name: string | null;
  email: string;
  avatar_url?: string | null;
  hint?: string | null;
}

interface SenderIdentityProps {
  sender: CorrespondenceSender;
  className?: string;
}

const ARIA_LABEL: Record<SenderType, string> = {
  user: 'sender: user',
  contact_claimed: 'sender: claimed contact',
  contact_unclaimed: 'sender: unclaimed contact',
  raw: 'sender: raw email',
};

export default function SenderIdentity({ sender, className }: SenderIdentityProps) {
  const displayName = sender.name || sender.email;
  const showExternalBadge = sender.type === 'contact_unclaimed' || sender.type === 'raw';

  return (
    <div
      aria-label={ARIA_LABEL[sender.type]}
      className={cn('flex items-center gap-2.5 min-w-0', className)}
    >
      <Avatar
        src={sender.avatar_url ?? null}
        alt={displayName}
        name={displayName}
        size="sm"
        className="ring-1 ring-sage/20"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-forest truncate">{displayName}</span>
          {showExternalBadge ? (
            <span className="text-[9px] font-bold uppercase tracking-widest text-forest/50 bg-sage-light/60 px-1.5 py-0.5 rounded-none">
              External
            </span>
          ) : null}
        </div>
        {sender.type !== 'raw' && sender.email && sender.email !== displayName ? (
          <div className="text-[11px] text-forest/50 truncate">{sender.email}</div>
        ) : null}
        {sender.hint ? (
          <div className="text-[10px] italic text-forest/50 truncate">{sender.hint}</div>
        ) : null}
      </div>
    </div>
  );
}
