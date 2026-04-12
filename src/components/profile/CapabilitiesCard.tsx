'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { profileSectionTitleSmClass } from '@/components/profile/profileSectionTitle';
import { cn } from '@/lib/utils';

interface CapabilitiesCardProps {
  capabilities: string[];
}

export default function CapabilitiesCard({ capabilities }: CapabilitiesCardProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!capabilities.length) return null;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
    >
      <h3 className={cn('mb-4', profileSectionTitleSmClass)}>Your Capabilities</h3>
      <div className="flex flex-wrap gap-2">
        {capabilities.map((cap) => (
          <span
            key={cap}
            className="rounded-full bg-bone px-3 py-1 text-xs font-medium text-forest"
          >
            {cap.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()).trim()}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
