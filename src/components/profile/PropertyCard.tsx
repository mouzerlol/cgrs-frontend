'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { isNonOptimizableImageSrc } from '@/lib/image';
import { BedDouble, Bath, Car } from 'lucide-react';
import type { PropertyData } from '@/data/property';

interface PropertyCardProps {
  property: PropertyData;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const [heroImageFailed, setHeroImageFailed] = useState(false);

  const address = [
    property.unit_number ? `Unit ${property.unit_number},` : '',
    property.street_address,
  ]
    .filter(Boolean)
    .join(' ');
  const location = `${property.suburb}, ${property.city} ${property.postcode}`;

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-xl bg-white shadow-[0_8px_32px_rgba(26,34,24,0.08)]"
    >
      <div className="relative h-48 bg-sage-light">
        {!heroImageFailed && (
          <Image
            src={property.image_url}
            alt={address}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            unoptimized={isNonOptimizableImageSrc(property.image_url)}
            className="object-cover"
            onError={() => setHeroImageFailed(true)}
          />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl text-forest">{address}</h3>
        <p className="mt-1 text-sm text-forest/70">{location}</p>
        <p className="mt-1 text-xs capitalize text-terracotta">{property.property_type}</p>

        <div className="mt-4 flex gap-6">
          <div className="flex items-center gap-2 text-sm text-forest/70">
            <BedDouble className="h-4 w-4" aria-hidden="true" />
            <span>{property.bedrooms} bed</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-forest/70">
            <Bath className="h-4 w-4" aria-hidden="true" />
            <span>{property.bathrooms} bath</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-forest/70">
            <Car className="h-4 w-4" aria-hidden="true" />
            <span>{property.parking_spaces} park</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
