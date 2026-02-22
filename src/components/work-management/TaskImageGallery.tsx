'use client';

import { useRef, useState, useCallback } from 'react';
import { TaskImage } from '@/types/work-management';
import { cn } from '@/lib/utils';
import VideoPlayerModal from './VideoPlayerModal';

function generateVideoThumbnail(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    
    video.onloadedmetadata = () => {
      video.currentTime = 1;
    };
    
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      URL.revokeObjectURL(objectUrl);
      resolve(thumbnail);
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve('');
    };
  });
}

interface TaskImageGalleryProps {
  images: TaskImage[];
  onChange: (images: TaskImage[]) => void;
  readonly?: boolean;
  maxImages?: number;
}

export default function TaskImageGallery({ images, onChange, readonly = false, maxImages = 8 }: TaskImageGalleryProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<TaskImage | null>(null);

  const handleAddFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
    if (images.length + validFiles.length > maxImages) return;

    const newImages: TaskImage[] = await Promise.all(validFiles.map(async (file) => {
      const isVideo = file.type.startsWith('video/');
      const id = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      
      if (isVideo) {
        const thumbnail = await generateVideoThumbnail(file);
        return {
          id,
          url: URL.createObjectURL(file),
          thumbnail,
          alt: file.name,
          type: 'video',
        };
      }
      
      return {
        id,
        url: URL.createObjectURL(file),
        thumbnail: URL.createObjectURL(file),
        alt: file.name,
        type: 'image',
      };
    }));
    
    onChange([...images, ...newImages]);
  }, [images, maxImages, onChange]);

  const handleRemove = useCallback((id: string) => {
    onChange(images.filter(img => img.id !== id));
  }, [images, onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) handleAddFiles(e.dataTransfer.files);
  }, [handleAddFiles]);

  const canAdd = !readonly && images.length < maxImages;

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map(img => (
            <div 
              key={img.id} 
              className={cn(
                "relative group aspect-square rounded-xl overflow-hidden border border-sage/20",
                img.type === 'video' && "cursor-pointer"
              )}
              onClick={() => img.type === 'video' && setSelectedVideo(img)}
            >
              <img
                src={img.thumbnail || img.url}
                alt={img.alt || 'Task asset'}
                className="w-full h-full object-cover"
              />
              {img.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <svg className="w-5 h-5 text-forest ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
              {!readonly && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(img.id); }}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                  aria-label={`Remove ${img.alt || 'asset'}`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}

          {canAdd && (
            <button
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-sage/20 hover:border-sage/40 bg-sage-light/20 hover:bg-sage-light/40 transition-all flex flex-col items-center justify-center gap-1 text-forest/40 hover:text-forest/60"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-[10px] font-bold uppercase">Add</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && canAdd && (
        <div
          className={cn(
            "rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer",
            isDragging
              ? "border-terracotta/40 bg-terracotta/5"
              : "border-sage/20 bg-sage-light/10 hover:border-sage/40 hover:bg-sage-light/30"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <svg className="w-8 h-8 mx-auto mb-2 text-forest/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-forest/40">
            Drag & drop or <span className="text-terracotta font-medium">browse</span>
          </p>
          <p className="text-[10px] text-forest/30 mt-1">Up to {maxImages} images or videos</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={e => { if (e.target.files) handleAddFiles(e.target.files); e.target.value = ''; }}
        className="sr-only"
      />

      {selectedVideo && (
        <VideoPlayerModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
}
