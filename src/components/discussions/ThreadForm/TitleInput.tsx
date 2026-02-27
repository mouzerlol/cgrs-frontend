'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TitleInput({ value, onChange, error }: TitleInputProps) {
  const [showHint, setShowHint] = useState(false);
  const MAX_LENGTH = 150;
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="title" className="text-sm font-medium text-forest">
        Title <span className="text-terracotta">*</span>
      </label>

      <div className="relative">
        <input
          type="text"
          id="title"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          placeholder="What's your discussion about?"
          maxLength={MAX_LENGTH}
          className={cn(
            'w-full p-md pr-[60px] bg-white border border-sage rounded-xl text-base text-forest transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10 placeholder:text-forest/50',
            error && 'border-terracotta'
          )}
        />

        <div
          className={cn(
            'absolute right-md top-1/2 -translate-y-1/2 text-sm text-forest/50',
            remaining < 20 && 'text-terracotta'
          )}
        >
          {remaining}
        </div>
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}

      {showHint && !error && (
        <div className="text-sm text-forest/70 p-sm bg-sage-light rounded-lg">
          <p>Be specific and concise. A good title helps others find your discussion.</p>
          <p className="mt-xs text-xs opacity-60">
            <strong>Good:</strong> "Best coffee shops near Mangere Bridge?"
            <br />
            <strong>Avoid:</strong> "I have a question"
          </p>
        </div>
      )}
    </div>
  );
}
