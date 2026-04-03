'use client';

import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDiscussionSettings } from '@/hooks/useDiscussions';
import type { ThreadVisibilityValue } from '@/lib/discussionVisibility';

interface ThreadVisibilitySelectProps {
  value: ThreadVisibilityValue;
  onChange: (value: ThreadVisibilityValue) => void;
  disabled?: boolean;
  error?: string;
}

/**
 * Who can see this thread — shown only to owners+ (see `canConfigureThreadVisibility`).
 * Options are fetched from the API for a single source of truth.
 */
export function ThreadVisibilitySelect({
  value,
  onChange,
  disabled = false,
  error,
}: ThreadVisibilitySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const settings = useDiscussionSettings();

  const selected = settings?.visibilityOptions.find((o) => o.value === value);

  if (!settings) {
    return (
      <div className="flex flex-col gap-xs">
        <label className="text-sm font-medium text-forest">
          Who can see this thread?
        </label>
        <div className="w-full p-md bg-white border border-sage rounded-xl animate-pulse h-[52px]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-xs">
      <label className="text-sm font-medium text-forest">
        Who can see this thread?
      </label>

      <div className="relative">
        <button
          type="button"
          aria-disabled={disabled}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            'w-full p-md bg-white border border-sage rounded-xl flex items-center justify-between transition-all duration-[250ms] ease-out-custom text-left focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10',
            disabled
              ? 'cursor-not-allowed opacity-60'
              : 'cursor-pointer hover:border-forest',
            error && 'border-terracotta'
          )}
        >
          {selected ? (
            <span className="text-base text-forest">{selected.label}</span>
          ) : (
            <span className="text-forest/50">Select visibility</span>
          )}
          <ChevronDown
            className={cn(
              'w-5 h-5 text-forest/50 transition-transform duration-[250ms] ease-out-custom',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div
              className={cn(
                'absolute top-[calc(100%+4px)] left-0 right-0 z-50 max-h-[min(320px,70vh)]',
                'overflow-y-auto overscroll-contain rounded-xl border border-sage bg-white',
                'shadow-[0_8px_24px_rgba(26,34,24,0.12)]',
              )}
            >
              {settings.visibilityOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value as ThreadVisibilityValue);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full p-md flex items-start gap-sm cursor-pointer transition-colors duration-[250ms] ease-out-custom text-left border-none bg-transparent hover:bg-sage-light',
                    value === opt.value && 'bg-sage-light'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <span className="block text-base font-medium text-forest">{opt.label}</span>
                    <span className="block text-sm text-forest/60 mt-0.5">{opt.description}</span>
                  </div>
                  {value === opt.value && <Check className="w-5 h-5 text-forest shrink-0" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {error ? (
        <p className="text-sm text-terracotta" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-sm text-forest/70">
          {selected?.description}
        </p>
      )}
    </div>
  );
}
