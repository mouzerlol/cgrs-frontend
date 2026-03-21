'use client';

import { useEffect, useCallback, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function MobileDrawer({ isOpen, onClose, children }: MobileDrawerProps) {
  const prefersReducedMotion = useReducedMotion();
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-forest/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            initial={prefersReducedMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: '-100%' }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-bone shadow-xl"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
