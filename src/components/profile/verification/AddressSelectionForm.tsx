'use client';

import { useState } from 'react';
import { ChevronDown, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreetResponse } from '@/lib/api/verification';

interface AddressSelectionFormProps {
  streets: StreetResponse[];
  initialVerificationType?: 'resident' | 'owner';
  onSubmit: (data: {
    streetId: string;
    streetNumber: string;
    verificationType: 'resident' | 'owner';
  }) => Promise<void>;
}

export default function AddressSelectionForm({ streets, initialVerificationType, onSubmit }: AddressSelectionFormProps) {
  const [streetId, setStreetId] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = streetId && streetNumber.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || !initialVerificationType) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        streetId,
        streetNumber: streetNumber.trim(),
        verificationType: initialVerificationType,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
      <h3 className={cn('font-display text-lg mb-4', initialVerificationType === 'owner' ? 'text-forest' : 'text-terracotta')}>
        {initialVerificationType === 'owner' ? 'Owner' : 'Resident'} of your property
      </h3>
      {/* Street Number + Street on same line */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="w-24 shrink-0">
            <label htmlFor="streetNumber" className="block text-sm font-medium text-forest/70 mb-1.5">
              Number
            </label>
            <input
              type="text"
              id="streetNumber"
              value={streetNumber}
              onChange={(e) => setStreetNumber(e.target.value)}
              placeholder="42"
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
              className={cn(
                'w-full rounded-xl border bg-white px-3 py-3 text-sm text-forest',
                'focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20',
                'transition-all placeholder:text-forest/30',
              )}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="street" className="block text-sm font-medium text-forest/70 mb-1.5">
              Street
            </label>
            <div className="relative">
              <select
                id="street"
                value={streetId}
                onChange={(e) => setStreetId(e.target.value)}
                className={cn(
                  'w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm text-forest',
                  'focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20',
                  'transition-all',
                  !streetId && 'text-forest/50',
                )}
              >
                <option value="">Select a street...</option>
                {streets.map((street) => (
                  <option key={street.id} value={street.id}>
                    {street.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className={cn(
          'w-full rounded-xl px-6 py-3 text-sm font-medium transition-all',
          'flex items-center justify-center gap-2',
          isValid && !isSubmitting
            ? 'bg-terracotta text-bone hover:bg-terracotta/90 cursor-pointer'
            : 'bg-sage-light/30 text-forest/40 cursor-not-allowed',
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <ShieldCheck className="h-4 w-4" />
            Request Verification
          </>
        )}
      </button>
    </form>
  );
}
