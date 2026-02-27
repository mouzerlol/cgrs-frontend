'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SuccessConfirmationProps {
  issueId: string;
  categoryName: string;
  onSubmitAnother: () => void;
}

/**
 * Success confirmation screen shown after a management request is submitted.
 * Displays the issue ID and provides options to submit another or return home.
 */
export function SuccessConfirmation({
  issueId,
  categoryName,
  onSubmitAnother,
}: SuccessConfirmationProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    if (!hasScrolledRef.current) {
      hasScrolledRef.current = true;
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(issueId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [issueId]);

  const handleReturnHome = () => {
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] p-lg">
      <div className="max-w-[480px] text-center py-xl px-lg bg-white rounded-card shadow-[0_8px_32px_rgba(26,34,24,0.08)] max-sm:py-lg max-sm:px-md">
        {/* Success Icon */}
        <div className="flex items-center justify-center w-[72px] h-[72px] mx-auto mb-md bg-sage-light rounded-full text-forest">
          <Icon icon="lucide:check" width={32} height={32} />
        </div>

        {/* Heading */}
        <h2 className="font-display text-[1.75rem] font-medium text-forest mb-md">
          Request Received
        </h2>

        {/* Issue ID */}
        <div className="flex flex-col items-center gap-2 mb-md">
          <span className="text-xs font-semibold uppercase tracking-widest text-terracotta">
            Your Reference ID
          </span>
          <button
            onClick={handleCopy}
            className={cn(
              'group inline-flex items-center gap-sm py-3 px-4',
              'bg-bone border border-sage rounded-[10px]',
              'cursor-pointer transition-all duration-[250ms] ease-out-custom',
              'hover:border-forest-light'
            )}
            title="Click to copy"
          >
            <span className="font-mono text-base font-medium text-forest tracking-wide">
              {issueId}
            </span>
            <Icon
              icon={copied ? 'lucide:check' : 'lucide:copy'}
              width={16}
              height={16}
              className={cn(
                'text-sage transition-colors duration-[250ms] ease-out-custom',
                'group-hover:text-forest',
                copied && 'text-sage'
              )}
            />
          </button>
          {copied && (
            <span className="text-xs text-sage font-medium">Copied!</span>
          )}
        </div>

        {/* Message */}
        <p className="text-[0.9375rem] text-forest/80 leading-relaxed mb-lg">
          Your <strong className="text-terracotta font-semibold">{categoryName}</strong> request has been received and will
          be reviewed by the committee. You&apos;ll receive an email confirmation
          at the address provided.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-sm min-[480px]:flex-row min-[480px]:justify-center">
          <button
            onClick={onSubmitAnother}
            className={cn(
              'inline-flex items-center justify-center gap-xs py-3 px-6',
              'bg-transparent border border-sage rounded-[10px]',
              'font-body text-[0.9375rem] font-semibold text-forest',
              'cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[48px]',
              'hover:bg-sage-light hover:border-forest-light'
            )}
          >
            <Icon icon="lucide:plus" width={18} height={18} />
            <span>Submit Another</span>
          </button>
          <button
            onClick={handleReturnHome}
            className={cn(
              'inline-flex items-center justify-center gap-xs py-3 px-6',
              'bg-terracotta border-none rounded-[10px]',
              'font-body text-[0.9375rem] font-semibold text-bone',
              'cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[48px]',
              'hover:bg-terracotta-dark'
            )}
          >
            <Icon icon="lucide:home" width={18} height={18} />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
