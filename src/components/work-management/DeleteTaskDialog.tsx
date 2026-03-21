'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import { useDeleteTask } from '@/hooks/useTasks';

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  taskTitle: string;
  taskId: string;
}

export function DeleteTaskDialog({ isOpen, onClose, onSuccess, taskTitle, taskId }: DeleteTaskDialogProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [hasError, setHasError] = useState(false);
  const deleteTask = useDeleteTask();

  const lastFiveDigits = taskId.slice(-5).toUpperCase();
  const isConfirmValid = confirmationText.toUpperCase() === lastFiveDigits;

  const handleDelete = async () => {
    if (!isConfirmValid) return;
    try {
      await deleteTask.mutateAsync(taskId);
      onSuccess();
      onClose();
    } catch {
      setHasError(true);
      setTimeout(() => setHasError(false), 500);
    }
  };

  const handleClose = () => {
    setConfirmationText('');
    setHasError(false);
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[1002]" onClose={handleClose}>
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
              <DialogPanel className={cn(
                "w-full max-w-md transform overflow-hidden rounded-card bg-white p-6 text-left align-middle shadow-xl transition-all",
                hasError && "animate-shake"
              )}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-red-50">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <DialogTitle as="h3" className="font-display text-lg font-semibold text-forest">
                    Delete Task
                  </DialogTitle>
                </div>

                <div className="mt-2 space-y-4">
                  <p className="text-sm text-forest/70">
                    Are you sure you want to delete this task? This action cannot be undone.
                  </p>

                  <div className="rounded-lg bg-sage-light/20 p-3 space-y-1">
                    <p className="text-sm font-semibold text-forest">{taskTitle}</p>
                    <p className="text-xs text-forest/50">
                      Task ID: {taskId.toUpperCase().slice(0, -5)}
                      <span className="font-bold text-red-600">{lastFiveDigits}</span>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-forest/70">
                      Type <span className="font-bold text-red-600">{lastFiveDigits}</span> to confirm:
                    </label>
                    <input
                      type="text"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder={lastFiveDigits}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border text-sm font-mono tracking-wider",
                        "focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all",
                        isConfirmValid
                          ? "border-green-300 bg-green-50 text-green-800"
                          : "border-sage/30 bg-white text-forest"
                      )}
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 text-sm font-semibold text-forest/70 bg-sage-light/30 rounded-lg hover:bg-sage-light/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={!isConfirmValid || deleteTask.isPending}
                    className={cn(
                      "px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2",
                      isConfirmValid && !deleteTask.isPending
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-red-200 text-red-400 cursor-not-allowed"
                    )}
                  >
                    {deleteTask.isPending ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      'Delete Task'
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

export default DeleteTaskDialog;
