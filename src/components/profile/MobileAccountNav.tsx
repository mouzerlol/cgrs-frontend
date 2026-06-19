'use client';

import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import ProfileSideNav from './ProfileSideNav';
import type { CurrentUserResponse } from '@/hooks/useCurrentUser';

interface MobileAccountNavProps {
  open: boolean;
  onClose: () => void;
  activeCategory: string | null;
  onCategoryChange: (id: string) => void;
  hasPendingVerification: boolean;
  canViewSociety: boolean;
  canViewGroundReport?: boolean;
  user?: CurrentUserResponse['user'];
  membership?: CurrentUserResponse['membership'];
  clerkFallback?: { firstName?: string; lastName?: string; imageUrl?: string; email?: string };
}

/**
 * Slide-in account navigation for screens below `lg`, where the folder-tab
 * sidebar is hidden. Reuses ProfileSideNav (mobile variant) so the items,
 * icons, badges and feature-flag logic stay single-source. Selecting an item
 * navigates and closes the drawer; Escape, backdrop click and the close button
 * all dismiss it. Focus is trapped while open and restored to the trigger on close.
 */
export default function MobileAccountNav({
  open,
  onClose,
  activeCategory,
  onCategoryChange,
  hasPendingVerification,
  canViewSociety,
  canViewGroundReport = false,
  user,
  membership,
  clerkFallback,
}: MobileAccountNavProps) {
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeBtnRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // Close if the viewport grows past the lg breakpoint, where the persistent
    // sidebar takes over and the drawer (and its scroll lock) must not linger.
    const desktopQuery = window.matchMedia('(min-width: 1024px)');
    function onDesktop(e: MediaQueryListEvent) {
      if (e.matches) onClose();
    }
    desktopQuery.addEventListener('change', onDesktop);

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      desktopQuery.removeEventListener('change', onDesktop);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1100] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-forest/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            id="account-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Account navigation"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-forest-light shadow-[8px_0_32px_rgba(26,34,24,0.35)]"
            initial={prefersReducedMotion ? false : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { x: '-100%' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: [0.215, 0.61, 0.355, 1] }}
          >
            <div className="flex items-center justify-between px-md pt-md pb-sm">
              <span className="text-xs font-semibold uppercase tracking-[0.15em] text-bone/70">Account</span>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-bone transition-colors hover:bg-bone/[0.12] focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta/50"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-md pb-md">
              <ProfileSideNav
                variant="mobile"
                activeCategory={activeCategory}
                onCategoryChange={onCategoryChange}
                onNavigate={onClose}
                hasPendingVerification={hasPendingVerification}
                canViewSociety={canViewSociety}
                canViewGroundReport={canViewGroundReport}
                user={user}
                membership={membership}
                clerkFallback={clerkFallback}
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
