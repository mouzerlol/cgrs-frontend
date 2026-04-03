'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Check, X, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getVerificationHistory } from '@/lib/api/verification';
import type { VerificationHistoryItem } from '@/lib/api/verification';

export default function VerificationHistory() {
  const { getToken } = useAuth();
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const token = await getToken();
        const data = await getVerificationHistory(async () => token);
        setHistory(data);
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [getToken]);

  if (isLoading) {
    return (
      <section>
        <h3 className="font-display text-lg text-forest mb-4">Verification History</h3>
        <div className="rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-sage" />
          </div>
        </div>
      </section>
    );
  }

  if (history.length === 0) {
    return null;
  }

  function getOutcomeIcon(outcome: string) {
    if (outcome === 'success') return Check;
    if (outcome === 'rejected') return X;
    return Clock;
  }

  return (
    <section>
      <h3 className="font-display text-lg text-forest mb-4">Verification History</h3>
      <div className="space-y-3">
        {history.map((item) => {
          const OutcomeIcon = getOutcomeIcon(item.outcome);
          return (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm border border-sage/10"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full',
                    item.outcome === 'success'
                      ? 'bg-forest/10'
                      : item.outcome === 'rejected'
                        ? 'bg-terracotta/10'
                        : 'bg-sage-light',
                  )}
                >
                  <OutcomeIcon
                    className={cn(
                      'h-4 w-4',
                      item.outcome === 'success'
                        ? 'text-forest'
                        : item.outcome === 'rejected'
                          ? 'text-terracotta'
                          : 'text-forest/50',
                    )}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-forest">
                    {item.street_name} {item.street_number}
                  </p>
                  <p className="text-xs text-forest/50">
                    {item.verification_type} via {item.method.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    item.outcome === 'success'
                      ? 'bg-forest/10 text-forest'
                      : item.outcome === 'rejected'
                        ? 'bg-terracotta/10 text-terracotta'
                        : 'bg-sage-light text-forest/50',
                  )}
                >
                  {item.outcome}
                </span>
                <p className="mt-1 text-xs text-forest/50">
                  {new Date(item.created_at).toLocaleDateString('en-AU', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
