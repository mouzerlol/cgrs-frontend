'use client';

/**
 * Single re-export boundary for Sonner so app code does not import 'sonner' directly.
 * Install: `sonner` must be in package.json; run `npm install` if the module is missing.
 */
export { Toaster, toast } from 'sonner';
