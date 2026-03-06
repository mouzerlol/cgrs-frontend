'use client';

import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  position?: 'center' | 'right';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  'full': 'max-w-full',
};

/**
 * Modal dialog component using Headless UI Dialog.
 * Provides accessible modal overlays with focus trapping and keyboard navigation.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  position = 'center',
  className
}: ModalProps) {
  const isRight = position === 'right';

  const headerOffset = 76;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className={cn("relative", isRight ? "z-[1001]" : "z-50")} onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed bg-black/25 backdrop-blur-sm"
            style={isRight ? { top: headerOffset, left: 0, right: 0, bottom: 0 } : { inset: 0 }}
          />
        </TransitionChild>

        <div className="fixed inset-0 overflow-hidden" style={isRight ? { top: `${headerOffset}px` } : undefined}>
          <div className={cn("flex min-h-full", isRight ? "justify-end" : "items-center justify-center p-4 text-center")}>
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom={isRight ? "translate-x-full" : "opacity-0 scale-95"}
              enterTo={isRight ? "translate-x-0" : "opacity-100 scale-100"}
              leave="ease-in duration-200"
              leaveFrom={isRight ? "translate-x-0" : "opacity-100 scale-100"}
              leaveTo={isRight ? "translate-x-full" : "opacity-0 scale-95"}
            >
              <DialogPanel
                className={cn(
                  'w-full transform overflow-hidden',
                  'bg-white text-left align-middle shadow-xl transition-all flex flex-col',
                  !isRight && 'rounded-card p-6',
                  sizeClasses[size],
                  className
                )}
                style={isRight ? { height: `calc(100vh - ${headerOffset}px)` } : undefined}
              >
                {title && (
                  <div className={cn(isRight ? "p-6 border-b border-sage/20" : "")}>
                    <DialogTitle
                      as="h3"
                      className="font-display text-xl font-medium leading-6 text-forest"
                    >
                      {title}
                    </DialogTitle>
                    {description && (
                      <div className="mt-2">
                        <p className="text-sm text-forest/60">{description}</p>
                      </div>
                    )}
                  </div>
                )}
                {!title && description && (
                  <div className={cn("mt-2", isRight ? "p-6" : "")}>
                    <p className="text-sm text-forest/60">{description}</p>
                  </div>
                )}
                <div className={cn(isRight ? "flex-1 overflow-y-auto" : "mt-4")}>{children}</div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
