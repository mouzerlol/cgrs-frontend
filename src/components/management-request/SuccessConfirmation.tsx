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
    <div className="success-confirmation">
      <div className="success-confirmation-card">
        {/* Success Icon */}
        <div className="success-confirmation-icon">
          <Icon icon="lucide:check" width={32} height={32} />
        </div>

        {/* Heading */}
        <h2 className="success-confirmation-title">Request Received</h2>

        {/* Issue ID */}
        <div className="success-confirmation-id-wrapper">
          <span className="success-confirmation-id-label">Your Reference ID</span>
          <button
            onClick={handleCopy}
            className="success-confirmation-id"
            title="Click to copy"
          >
            <span className="success-confirmation-id-text">{issueId}</span>
            <Icon
              icon={copied ? 'lucide:check' : 'lucide:copy'}
              width={16}
              height={16}
              className={cn(
                'success-confirmation-id-icon',
                copied && 'text-sage'
              )}
            />
          </button>
          {copied && (
            <span className="success-confirmation-copied">Copied!</span>
          )}
        </div>

        {/* Message */}
        <p className="success-confirmation-message">
          Your <strong>{categoryName}</strong> request has been received and will
          be reviewed by the committee. You&apos;ll receive an email confirmation
          at the address provided.
        </p>

        {/* Actions */}
        <div className="success-confirmation-actions">
          <button
            onClick={onSubmitAnother}
            className="success-confirmation-btn success-confirmation-btn-secondary"
          >
            <Icon icon="lucide:plus" width={18} height={18} />
            <span>Submit Another</span>
          </button>
          <button
            onClick={handleReturnHome}
            className="success-confirmation-btn success-confirmation-btn-primary"
          >
            <Icon icon="lucide:home" width={18} height={18} />
            <span>Return Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}
