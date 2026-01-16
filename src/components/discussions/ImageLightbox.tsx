'use client';

import { Fragment, useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { ThreadImage } from '@/types';

interface ImageLightboxProps {
  /** Array of images */
  images: ThreadImage[];
  /** Initial image index */
  initialIndex?: number;
  /** Whether lightbox is open */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
}

/**
 * Full-screen image lightbox modal.
 * Supports navigation between multiple images.
 */
export default function ImageLightbox({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}: ImageLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goToPrevious, goToNext, onClose]);

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        {/* Backdrop */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/90" />
        </TransitionChild>

        {/* Content */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="relative w-full max-w-5xl">
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className={cn(
                    'absolute top-4 right-4 z-10',
                    'w-10 h-10 rounded-full bg-white/10 backdrop-blur',
                    'flex items-center justify-center',
                    'text-white hover:bg-white/20',
                    'transition-colors duration-200'
                  )}
                  aria-label="Close lightbox"
                >
                  <Icon icon="lucide:x" className="w-6 h-6" />
                </button>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className={cn(
                        'absolute left-4 top-1/2 -translate-y-1/2 z-10',
                        'w-12 h-12 rounded-full bg-white/10 backdrop-blur',
                        'flex items-center justify-center',
                        'text-white hover:bg-white/20',
                        'transition-colors duration-200'
                      )}
                      aria-label="Previous image"
                    >
                      <Icon icon="lucide:chevron-left" className="w-8 h-8" />
                    </button>

                    <button
                      onClick={goToNext}
                      className={cn(
                        'absolute right-4 top-1/2 -translate-y-1/2 z-10',
                        'w-12 h-12 rounded-full bg-white/10 backdrop-blur',
                        'flex items-center justify-center',
                        'text-white hover:bg-white/20',
                        'transition-colors duration-200'
                      )}
                      aria-label="Next image"
                    >
                      <Icon icon="lucide:chevron-right" className="w-8 h-8" />
                    </button>
                  </>
                )}

                {/* Image */}
                <div className="relative aspect-[4/3] w-full">
                  <Image
                    src={currentImage.url}
                    alt={currentImage.alt || `Image ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Image Counter & Caption */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                  {images.length > 1 && (
                    <p className="text-white/80 text-sm mb-1">
                      {currentIndex + 1} / {images.length}
                    </p>
                  )}
                  {currentImage.alt && (
                    <p className="text-white text-sm max-w-md">{currentImage.alt}</p>
                  )}
                </div>

                {/* Thumbnail Strip (for multiple images) */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {images.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                          'relative w-12 h-12 rounded-lg overflow-hidden',
                          'ring-2 transition-all duration-200',
                          idx === currentIndex
                            ? 'ring-white opacity-100'
                            : 'ring-transparent opacity-50 hover:opacity-75'
                        )}
                      >
                        <Image
                          src={img.thumbnail}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
