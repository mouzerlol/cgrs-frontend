'use client';

import { Toaster } from '@/lib/sonner';

/**
 * Global toast host for the main site shell; styled to match bone/forest palette.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'bg-bone text-forest border border-sage/40 shadow-lg font-sans',
          title: 'text-forest font-semibold',
          description: 'text-forest/70',
          success: 'border-terracotta/30',
          error: 'border-red-300',
        },
      }}
    />
  );
}
