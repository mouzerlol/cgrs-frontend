'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** Human-readable summary naming the subject of the action. */
  message: React.ReactNode;
  confirmLabel: string;
  /** Visual intent of the confirm button. */
  intent?: 'primary' | 'danger';
  /** When true, show an optional note/reason textarea whose value is passed to onConfirm. */
  withNote?: boolean;
  noteLabel?: string;
  notePlaceholder?: string;
  /** Fired ONLY when the user confirms. Receives the note text (or undefined). */
  onConfirm: (note?: string) => Promise<void> | void;
}

/**
 * Confirmation gate for mutating staff actions (approve / reject / revoke).
 *
 * Spec invariant: no network request is issued until the user explicitly
 * confirms here. Cancelling sends nothing; confirming fires exactly one action.
 */
export function ConfirmActionModal({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel,
  intent = 'primary',
  withNote = false,
  noteLabel = 'Note (optional)',
  notePlaceholder = '',
  onConfirm,
}: ConfirmActionModalProps) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset transient state whenever the modal is (re)opened.
  useEffect(() => {
    if (isOpen) {
      setNote('');
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await onConfirm(withNote ? note.trim() || undefined : undefined);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <div className="text-sm text-forest/80">{message}</div>

        {withNote && (
          <div>
            <label className="block font-display text-xs font-medium uppercase tracking-wider text-forest/40 mb-1.5">
              {noteLabel}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={3}
              maxLength={500}
              className="w-full rounded-lg border border-sage/40 bg-bone/40 px-3 py-2 text-sm text-forest focus:border-forest/40 focus:outline-none focus:ring-1 focus:ring-forest/20"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-forest/70 transition-colors hover:bg-sage/10 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-60',
              intent === 'danger' ? 'bg-terracotta hover:bg-terracotta-dark' : 'bg-forest hover:bg-forest/90',
            )}
          >
            {submitting ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmActionModal;
