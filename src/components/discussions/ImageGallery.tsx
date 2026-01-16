'use client';

import { forwardRef, HTMLAttributes, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { ThreadImage } from '@/types';
import ImageLightbox from './ImageLightbox';

interface ImageGalleryProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of images to display */
  images: ThreadImage[];
  /** Maximum images to show before "show more" */
  maxVisible?: number;
}

/**
 * Inline image gallery with thumbnail grid.
 * Clicking opens image in lightbox modal.
 */
const ImageGallery = forwardRef<HTMLDivElement, ImageGalleryProps>(
  ({ images, maxVisible = 5, className, ...props }, ref) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const visibleImages = images.slice(0, maxVisible);
    const remainingCount = images.length - maxVisible;

    const openLightbox = (index: number) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
    };

    return (
      <>
        <div
          ref={ref}
          className={cn('flex flex-wrap gap-2', className)}
          {...props}
        >
          {visibleImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className={cn(
                'relative rounded-xl overflow-hidden bg-sage-light',
                'transition-all duration-200',
                'hover:ring-2 hover:ring-terracotta hover:ring-offset-2',
                'focus:outline-none focus:ring-2 focus:ring-terracotta focus:ring-offset-2',
                // Size based on image count
                images.length === 1 && 'w-full max-w-md h-64',
                images.length === 2 && 'w-[calc(50%-4px)] h-48',
                images.length >= 3 && 'w-24 h-24 sm:w-32 sm:h-32'
              )}
              aria-label={`View image ${index + 1}: ${image.alt || 'Thread image'}`}
            >
              <Image
                src={image.thumbnail}
                alt={image.alt || `Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Show remaining count on last visible image */}
              {index === maxVisible - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-forest/70 flex items-center justify-center">
                  <span className="text-bone text-lg font-semibold">
                    +{remainingCount}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </>
    );
  }
);

ImageGallery.displayName = 'ImageGallery';

export default ImageGallery;
