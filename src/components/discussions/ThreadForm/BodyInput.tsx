'use client';

import { cn } from '@/lib/utils';

interface BodyInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BodyInput({ value, onChange, error }: BodyInputProps) {
  const MAX_LENGTH = 2000;
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="flex flex-col gap-xs">
      <label htmlFor="body" className="text-sm font-medium text-forest">
        Body <span className="opacity-60 font-normal">(optional)</span>
      </label>

      <textarea
        id="body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Provide more details about your discussion. You can use plain text formatting."
        rows={6}
        maxLength={MAX_LENGTH}
        className={cn(
          'w-full p-md bg-white border border-sage rounded-xl text-base text-forest font-body transition-all duration-[250ms] ease-out-custom resize-y min-h-[120px] focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10 placeholder:text-forest/50',
          error && 'border-terracotta'
        )}
      />

      <div className="flex justify-end">
        <span
          className={cn(
            'text-xs text-forest/50',
            remaining < 200 && 'text-terracotta'
          )}
        >
          {remaining} characters remaining
        </span>
      </div>

      {error && <p className="text-sm text-terracotta">{error}</p>}
    </div>
  );
}
