'use client';

import { Clock, Check, X, Info } from 'lucide-react';

interface VerificationStatusProps {
  type: 'pending' | 'approved' | 'rejected';
  address: string;
  verificationType: 'resident' | 'owner';
}

export default function VerificationStatus({ type, address, verificationType }: VerificationStatusProps) {
  if (type === 'pending') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
            <Clock className="h-6 w-6 text-terracotta" />
          </div>
          <div>
            <h4 className="font-display text-lg text-forest">Verification Pending</h4>
            <p className="text-sm text-forest/70">
              Waiting for approval at {address}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
          <h4 className="font-display text-lg text-forest mb-4">What happens next?</h4>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                1
              </span>
              <div>
                <p className="font-medium text-forest">Current residents will be notified</p>
                <p className="text-sm text-forest/60">
                  Existing verified residents or owners at {address} will receive a notification.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                2
              </span>
              <div>
                <p className="font-medium text-forest">They verify your identity</p>
                <p className="text-sm text-forest/60">
                  A resident or owner must confirm you live at this address.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
                3
              </span>
              <div>
                <p className="font-medium text-forest">You&apos;re verified!</p>
                <p className="text-sm text-forest/60">
                  Once approved, your account will be upgraded to verified {verificationType}.
                </p>
              </div>
            </li>
          </ol>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-sage-light/30 p-4">
          <Info className="h-5 w-5 text-forest/60" />
          <p className="text-sm text-forest/70">
            If no existing resident or owner responds within 7 days, please contact the society manager.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'approved') {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-forest/10 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-forest text-bone">
          <Check className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-display text-lg text-forest">Verified!</h4>
          <p className="text-sm text-forest/70">
            You are now a verified {verificationType} at {address}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-terracotta/10 p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-bone">
        <X className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-display text-lg text-forest">Verification Rejected</h4>
        <p className="text-sm text-forest/70">
          Your verification request for {address} was not approved.
        </p>
      </div>
    </div>
  );
}
