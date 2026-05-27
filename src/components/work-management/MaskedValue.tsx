'use client';

import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaskedValueProps {
  value: string | null;
  masked: string;
  isRevealed: boolean;
  onToggle: () => void;
  ariaLabelHide: string;
  ariaLabelReveal: string;
  renderClassName?: string;
}

export function MaskedValue({
  value,
  masked,
  isRevealed,
  onToggle,
  ariaLabelHide,
  ariaLabelReveal,
  renderClassName,
}: MaskedValueProps) {
  if (value === null) {
    return <span className="text-forest/30">—</span>;
  }

  const display = isRevealed ? value : masked;

  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn('font-mono text-xs text-forest/60', renderClassName)}>{display}</span>
      <button
        type="button"
        onClick={onToggle}
        className="p-0.5 rounded hover:bg-forest/5 transition-colors"
        aria-label={isRevealed ? ariaLabelHide : ariaLabelReveal}
      >
        {isRevealed ? (
          <EyeOff className="w-3.5 h-3.5 text-forest/40" aria-hidden />
        ) : (
          <Eye className="w-3.5 h-3.5 text-forest/40" aria-hidden />
        )}
      </button>
    </div>
  );
}

export default MaskedValue;
