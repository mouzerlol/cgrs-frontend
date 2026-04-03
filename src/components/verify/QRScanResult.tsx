'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

interface QRScanResultProps {
  state: 'loading' | 'success' | 'error';
  error: string | null;
  roleAssigned: string | null;
  onRetry: () => void;
}

export default function QRScanResult({ state, error, roleAssigned, onRetry }: QRScanResultProps) {
  if (state === 'loading') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-sage/20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
            <svg className="h-8 w-8 animate-spin text-sage" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-xl text-forest mb-1">Verifying...</h2>
            <p className="text-sm text-forest/60">Please wait while we verify your QR code.</p>
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm border border-sage/20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10">
            <Icon icon="lucide:x" className="h-8 w-8 text-terracotta" />
          </div>
          <div>
            <h2 className="font-display text-xl text-forest mb-1">Verification Failed</h2>
            <p className="text-sm text-forest/60 max-w-sm mx-auto">{error || 'An unknown error occurred.'}</p>
          </div>
          <div className="mt-4 space-y-2 text-left w-full max-w-xs">
            <p className="text-xs text-forest/50 font-medium uppercase tracking-wide">Possible reasons:</p>
            <ul className="text-sm text-forest/70 space-y-1">
              <li className="flex items-start gap-2">
                <Icon icon="lucide:check" className="h-4 w-4 text-terracotta/50 mt-0.5 shrink-0" />
                The QR code has already been used
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="lucide:check" className="h-4 w-4 text-terracotta/50 mt-0.5 shrink-0" />
                The QR code has expired
              </li>
              <li className="flex items-start gap-2">
                <Icon icon="lucide:check" className="h-4 w-4 text-terracotta/50 mt-0.5 shrink-0" />
                The QR code is invalid
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 mt-4 w-full max-w-xs">
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-xl bg-forest px-4 py-2.5 text-sm font-medium text-bone hover:bg-forest/90 transition-colors"
            >
              Try Again
            </button>
            <Link
              href="/profile/verification"
              className="w-full rounded-xl border border-sage/30 px-4 py-2.5 text-sm font-medium text-forest hover:bg-sage-light/30 transition-colors text-center"
            >
              Go to Verification Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm border border-sage/20 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
          <Icon icon="lucide:shield-check" className="h-8 w-8 text-sage" />
        </div>
        <div>
          <h2 className="font-display text-xl text-forest mb-1">You&apos;re Verified!</h2>
          <p className="text-sm text-forest/60">
            Your account has been upgraded to{' '}
            <span className="font-medium text-forest capitalize">{roleAssigned}</span>.
          </p>
        </div>
        <div className="mt-2 rounded-xl bg-sage-light/30 p-4 w-full max-w-xs">
          <p className="text-sm text-forest/70">
            You now have full access to community features. Redirecting to your profile...
          </p>
        </div>
        <Link
          href="/profile"
          className="w-full max-w-xs rounded-xl bg-forest px-4 py-2.5 text-sm font-medium text-bone hover:bg-forest/90 transition-colors"
        >
          Go to My Profile
        </Link>
      </div>
    </div>
  );
}
