'use client';

import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';

export interface DeleteCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
  error?: string | null;
}

/**
 * Confirms deletion of a task comment (simple confirm — no type-to-confirm).
 */
export function DeleteCommentDialog({
  isOpen,
  onClose,
  onConfirm,
  isPending = false,
  error = null,
}: DeleteCommentDialogProps) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1002]" onClose={isPending ? () => {} : onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-card bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-50">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </div>
                  <DialogTitle as="h3" className="font-display text-lg font-semibold text-forest">
                    Delete comment
                  </DialogTitle>
                </div>

                <p className="text-sm text-forest/70">
                  Remove this comment permanently? This cannot be undone.
                </p>

                {error ? (
                  <p className="mt-3 text-sm text-red-700 bg-red-50 rounded-lg px-3 py-2" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-semibold text-forest/70 bg-sage-light/30 rounded-lg hover:bg-sage-light/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => void onConfirm()}
                    disabled={isPending}
                    className={cn(
                      'px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2',
                      !isPending ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-200 text-red-400 cursor-not-allowed',
                    )}
                  >
                    {isPending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Deleting…
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
