'use client';

import { useState } from 'react';
import { Home, Building2, ChevronDown, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreetResponse } from '@/lib/api/verification';

interface AddressSelectionFormProps {
  streets: StreetResponse[];
  onSubmit: (data: {
    streetId: string;
    streetNumber: string;
    verificationType: 'resident' | 'owner';
  }) => Promise<void>;
}

export default function AddressSelectionForm({ streets, onSubmit }: AddressSelectionFormProps) {
  const [streetId, setStreetId] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [verificationType, setVerificationType] = useState<'resident' | 'owner'>('resident');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = streetId && streetNumber.trim();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        streetId,
        streetNumber: streetNumber.trim(),
        verificationType,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
      <h3 className="font-display text-lg text-forest mb-4">Enter Your Address</h3>

      {/* Verification Type Toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-forest/70 mb-2">
          I want to verify as
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setVerificationType('resident')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all',
              verificationType === 'resident'
                ? 'bg-terracotta text-bone shadow-sm'
                : 'bg-sage-light/50 text-forest hover:bg-sage-light',
            )}
          >
            <Home className="h-4 w-4" />
            Resident
          </button>
          <button
            type="button"
            onClick={() => setVerificationType('owner')}
            className={cn(
              'flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all',
              verificationType === 'owner'
                ? 'bg-forest text-bone shadow-sm'
                : 'bg-sage-light/50 text-forest hover:bg-sage-light',
            )}
          >
            <Building2 className="h-4 w-4" />
            Owner
          </button>
        </div>
      </div>

      {/* Street Select */}
      <div className="mb-4">
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

      {/* Street Number */}
      <div className="mb-6">
        <label htmlFor="streetNumber" className="block text-sm font-medium text-forest/70 mb-1.5">
          Street Number
        </label>
        <input
          type="text"
          id="streetNumber"
          value={streetNumber}
          onChange={(e) => setStreetNumber(e.target.value)}
          placeholder="e.g. 42"
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm text-forest',
            'focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20',
            'transition-all placeholder:text-forest/30',
          )}
        />
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
