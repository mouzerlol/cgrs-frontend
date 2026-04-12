'use client';

import { Mail, Clock } from 'lucide-react';

interface QRInstructionsProps {
  address: string;
  expiresAt: string | null;
}

export default function QRInstructions({ address, expiresAt }: QRInstructionsProps) {
  const expiryDate = expiresAt ? new Date(expiresAt) : null;
  const formattedExpiry = expiryDate
    ? expiryDate.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      {/* Success indicator */}
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm border border-sage/20">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10">
          <Mail className="h-6 w-6 text-terracotta" />
        </div>
        <div>
          <h4 className="font-display text-lg text-forest">QR Code Sent!</h4>
          <p className="text-sm text-forest/70">
            A QR code has been mailed to {address}
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-sage/20">
        <h4 className="font-display text-lg text-forest mb-4">What happens next?</h4>
        <ol className="space-y-4">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
              1
            </span>
            <div>
              <p className="font-medium text-forest">We mail a QR code to your address</p>
              <p className="text-sm text-forest/60">
                A physical letter containing your unique QR code will be delivered to {address}.
              </p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-light text-xs font-medium text-forest">
              2
            </span>
            <div>
              <p className="font-medium text-forest">Scan the QR code</p>
              <p className="text-sm text-forest/60">
                When you receive the letter, scan the QR code using your phone&apos;s camera to complete verification.
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
                Once scanned, your account will be upgraded to verified resident status.
              </p>
            </div>
          </li>
        </ol>
      </div>

      {/* Delivery estimate */}
      <div className="flex items-center gap-2 rounded-xl bg-sage-light/30 p-4">
        <Clock className="h-5 w-5 text-forest/60" />
        <p className="text-sm text-forest/70">
          Standard mail delivery typically takes 3-5 business days. QR code expires: {formattedExpiry || '30 days'}.
        </p>
      </div>
    </div>
  );
}
