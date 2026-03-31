'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import PropertyCard from '@/components/profile/PropertyCard';
import OccupantCard from '@/components/profile/OccupantCard';
import { MOCK_PROPERTY, MOCK_OCCUPANTS } from '@/data/property';

export default function MyPropertyPage() {
  const [property] = useState(MOCK_PROPERTY);
  const [occupants] = useState(MOCK_OCCUPANTS);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="space-y-4">
      <PropertyCard property={property} />

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl bg-white p-6 shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
      >
        <h3 className="mb-4 font-display text-lg text-forest">Household Members</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {occupants.map((occupant) => (
            <OccupantCard key={occupant.id} occupant={occupant} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
