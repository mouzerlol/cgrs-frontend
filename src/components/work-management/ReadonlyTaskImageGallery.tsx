'use client';

import { useState } from 'react';
import Image from 'next/image';
import { isNonOptimizableImageSrc } from '@/lib/image';
import type { LightboxImage } from '@/types';
import type { TaskImage } from '@/types/work-management';
import { cn } from '@/lib/utils';
import ImageLightbox from '@/components/ui/ImageLightbox';
import VideoPlayerModal from './VideoPlayerModal';

interface ReadonlyTaskImageGalleryProps {
  /** Resolved URLs from `useTaskAttachmentImages` (or raw task images with URLs). */
  displayImages: TaskImage[];
  isResolving?: boolean;
  /** Used for `alt` when an image has no `alt` text. */
  titleFallback?: string;
  className?: string;
}

/**
 * Read-only task media grid with the same lightbox and video modal behavior as board task cards.
 */
export default function ReadonlyTaskImageGallery({
  displayImages,
  isResolving = false,
  titleFallback = 'Task image',
  className,
}: ReadonlyTaskImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<TaskImage | null>(null);

  if (displayImages.length === 0) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {isResolving && <p className="text-xs text-forest/50">Loading images…</p>}

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {displayImages.map((img, index) => {
          const displaySrc = (img.thumbnail || img.url || '').trim();
          return (
            <div
              key={img.id}
              role="button"
              tabIndex={0}
              onClick={() => {
                if (img.type === 'video') {
                  setSelectedVideo(img);
                } else {
                  setLightboxIndex(index);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (img.type === 'video') {
                    setSelectedVideo(img);
                  } else {
                    setLightboxIndex(index);
                  }
                }
              }}
              className="relative group aspect-square rounded-xl overflow-hidden border border-sage/20 cursor-pointer"
            >
              {displaySrc ? (
                <Image
                  src={displaySrc}
                  alt={img.alt || titleFallback}
                  fill
                  sizes="(max-width: 640px) 33vw, 25vw"
                  unoptimized={isNonOptimizableImageSrc(displaySrc)}
                  className="object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full min-h-0 items-center justify-center bg-sage-light/50 text-forest/35"
                  aria-busy="true"
                  aria-label="Loading image preview"
                >
                  <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {img.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-forest ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedVideo && (
        <VideoPlayerModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}

      {lightboxIndex !== null && (
        <ImageLightbox
          images={displayImages as LightboxImage[]}
          initialIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
