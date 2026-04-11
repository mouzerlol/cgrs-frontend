'use client';

import { useRef, useState, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { TaskImage } from '@/types/work-management';
import type { LightboxImage } from '@/types';
import { cn } from '@/lib/utils';
import { uploadWorkTaskAttachmentFile, DISCUSSION_IMAGE_MAX_BYTES } from '@/lib/api/discussions';
import { useTaskAttachmentImages } from '@/hooks/useTaskAttachmentImages';
import VideoPlayerModal from './VideoPlayerModal';
import ImageLightbox from '@/components/ui/ImageLightbox';

interface TaskImageGalleryProps {
  images: TaskImage[];
  onChange: (images: TaskImage[]) => void;
  readonly?: boolean;
  maxImages?: number;
  /** Called when a direct R2 upload fails (network, size, MIME). */
  onUploadError?: (message: string) => void;
}

/**
 * Task photos: uploads go through the shared R2 presign pipeline (`upload_purpose: work_task`).
 * Legacy inline images (no `attachmentId`) still display; adding more is blocked until those are removed.
 */
export default function TaskImageGallery({
  images,
  onChange,
  readonly = false,
  maxImages = 8,
  onUploadError,
}: TaskImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TaskImage | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const { getToken } = useAuth();
  const { displayImages, isResolving } = useTaskAttachmentImages(images);

  const hasLegacyImages = images.some((i) => !i.attachmentId);
  const canAddMore = !readonly && images.length < maxImages && !hasLegacyImages;

  const handleAddFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
      if (!canAddMore || fileArray.length === 0) return;
      if (images.length + fileArray.length > maxImages) return;

      for (const file of fileArray) {
        if (file.size < 1 || file.size > DISCUSSION_IMAGE_MAX_BYTES) {
          onUploadError?.(
            `Each image must be under ${Math.round(DISCUSSION_IMAGE_MAX_BYTES / (1024 * 1024))} MB (server limit).`,
          );
          return;
        }
      }

      setUploadingCount((c) => c + fileArray.length);
      const next: TaskImage[] = [...images];
      try {
        for (const file of fileArray) {
          const attachmentId = await uploadWorkTaskAttachmentFile(file, getToken);
          const preview = URL.createObjectURL(file);
          next.push({
            id: attachmentId,
            attachmentId,
            url: preview,
            thumbnail: preview,
            alt: file.name,
            type: 'image',
          });
        }
        onChange(next);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Upload failed';
        onUploadError?.(msg);
      } finally {
        setUploadingCount((c) => Math.max(0, c - fileArray.length));
      }
    },
    [canAddMore, images, maxImages, getToken, onChange, onUploadError],
  );

  const handleRemove = useCallback(
    (id: string) => {
      onChange(images.filter((img) => img.id !== id));
    },
    [images, onChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) void handleAddFiles(e.dataTransfer.files);
    },
    [handleAddFiles],
  );

  const showAddTile = canAddMore && !uploadingCount;

  return (
    <div className="space-y-3">
      {hasLegacyImages && !readonly && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-none px-3 py-2">
          This task uses older inline photos. Remove them to add new images stored in cloud storage.
        </p>
      )}

      {(isResolving || uploadingCount > 0) && (
        <p className="text-xs text-forest/50">Loading or uploading media…</p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {displayImages.map((img, index) => {
            const displaySrc = (img.thumbnail || img.url || '').trim();
            return (
            <div
              key={img.id}
              className={cn(
                'relative group aspect-square rounded-none overflow-hidden border border-sage/20',
                img.type === 'video' && 'cursor-pointer',
              )}
              onClick={() => {
                if (img.type === 'video') {
                  setSelectedVideo(img);
                } else {
                  setLightboxIndex(index);
                }
              }}
            >
              {displaySrc ? (
                <img
                  src={displaySrc}
                  alt={img.alt || 'Task asset'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full min-h-0 items-center justify-center bg-sage-light/50 text-forest/35"
                  aria-busy="true"
                  aria-label="Loading image preview"
                >
                  <svg className="h-8 w-8 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              {!readonly && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(img.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  aria-label={`Remove ${img.alt || 'asset'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            );
          })}

          {showAddTile && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-none border-2 border-dashed border-sage/20 hover:border-sage/40 bg-sage-light/20 hover:bg-sage-light/40 transition-all flex flex-col items-center justify-center gap-1 text-forest/40 hover:text-forest/60"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-bold uppercase">Add</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && canAddMore && (
        <div
          className={cn(
            'rounded-none border-2 border-dashed p-6 text-center transition-all cursor-pointer',
            isDragging
              ? 'border-terracotta/40 bg-terracotta/5'
              : 'border-sage/20 bg-sage-light/10 hover:border-sage/40 hover:bg-sage-light/30',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadingCount && inputRef.current?.click()}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-forest/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm text-forest/40">
            Drag & drop or <span className="text-terracotta font-medium">browse</span>
          </p>
          <p className="text-[10px] text-forest/30 mt-1">Up to {maxImages} images (JPEG, PNG, GIF, WebP)</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => {
          if (e.target.files) void handleAddFiles(e.target.files);
          e.target.value = '';
        }}
        className="sr-only"
      />

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
