'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PropertyBadgeProps {
  streetName: string;
  streetNumber: string;
  verificationType: string;
}

/**
 * A lightweight, celebratory status emblem for a verified property — an illustrated
 * SVG house inside a CSS-styled crest. Deliberately thinner than the My Property card
 * (no photo/map/room stats); it answers "I'm verified, and where", nothing more.
 *
 * One house figure for all; the role (owner vs resident) drives the colour accent.
 */
export default function PropertyBadge({ streetName, streetNumber, verificationType }: PropertyBadgeProps) {
  const prefersReducedMotion = useReducedMotion();
  const isOwner = verificationType === 'owner';
  const address = `${streetNumber} ${streetName}`.trim();

  // Role accent — owner: forest/gold; resident: terracotta/sage.
  const accent = isOwner
    ? {
        frame: 'border-forest/20 from-forest/[0.06] to-amber/[0.08]',
        crest: 'bg-forest/5 ring-forest/15',
        roof: 'text-forest',
        body: 'text-amber',
        chip: 'bg-forest text-bone',
      }
    : {
        frame: 'border-terracotta/20 from-terracotta/[0.06] to-sage/[0.12]',
        crest: 'bg-terracotta/5 ring-terracotta/15',
        roof: 'text-terracotta',
        body: 'text-sage',
        chip: 'bg-terracotta text-bone',
      };

  return (
    <motion.div
      data-testid="property-badge"
      data-role={verificationType}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={prefersReducedMotion ? undefined : { y: -3 }}
      transition={{ duration: 0.4, ease: [0.215, 0.61, 0.355, 1] }}
      className={cn(
        'group relative flex flex-col items-center overflow-hidden rounded-none border bg-gradient-to-br p-6 text-center shadow-sm transition-shadow',
        'hover:shadow-card-hover',
        accent.frame,
      )}
    >
      {/* Crest holding the illustrated house */}
      <div
        className={cn(
          'relative mb-4 flex h-24 w-24 items-center justify-center rounded-none ring-1',
          accent.crest,
        )}
      >
        <HouseEmblem roofClass={accent.roof} bodyClass={accent.body} />
      </div>

      {/* Address — the meaningful label */}
      <p className="font-display text-lg leading-tight text-forest">{address}</p>

      {/* Role chip */}
      <span
        className={cn(
          'mt-3 inline-flex items-center gap-1.5 rounded-none px-3 py-1 text-xs font-medium',
          accent.chip,
        )}
      >
        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
        {isOwner ? 'Verified Owner' : 'Verified Resident'}
      </span>
    </motion.div>
  );
}

/**
 * Decorative illustrated house. Hidden from assistive tech — the address and role
 * label carry the meaning. Colours flow from the role accent via class props.
 */
function HouseEmblem({ roofClass, bodyClass }: { roofClass: string; bodyClass: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-14 w-14"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Body */}
      <rect x="16" y="30" width="32" height="22" rx="2" className={bodyClass} fill="currentColor" opacity="0.18" />
      <rect
        x="16"
        y="30"
        width="32"
        height="22"
        rx="2"
        className={bodyClass}
        stroke="currentColor"
        strokeWidth="2.5"
      />
      {/* Roof */}
      <path
        d="M11 31 L32 14 L53 31"
        className={roofClass}
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Chimney */}
      <rect x="42" y="19" width="5" height="9" rx="1" className={roofClass} fill="currentColor" />
      {/* Door */}
      <rect x="28" y="38" width="8" height="14" rx="1" className={roofClass} fill="currentColor" opacity="0.85" />
      {/* Windows */}
      <rect x="20.5" y="35" width="6" height="6" rx="1" className={bodyClass} fill="currentColor" />
      <rect x="37.5" y="35" width="6" height="6" rx="1" className={bodyClass} fill="currentColor" />
    </svg>
  );
}
