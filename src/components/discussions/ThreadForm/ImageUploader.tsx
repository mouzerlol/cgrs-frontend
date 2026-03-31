'use client';

import { useState, useCallback } from 'react';
import { X } from 'lucide-react';
import { UploadZone } from '@/components/ui/UploadZone';

interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 6,
  maxSizeMB = 10,
}: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!file.type.startsWith('image/')) {
      return 'File must be an image';
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return `Image must be under ${maxSizeMB}MB`;
    }
    return null;
  }, [maxSizeMB]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(newFiles);

    const totalCount = value.length + fileArray.length;
    if (totalCount > maxFiles) {
      setError(`Maximum ${maxFiles} images allowed`);
      return;
    }

    for (const file of fileArray) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onChange([...value, ...fileArray]);
  }, [value, maxFiles, validateFile, onChange]);

  const removeFile = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index));
  }, [value, onChange]);

  const handleDrop = useCallback((files: File[]) => {
    addFiles(files);
  }, [addFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="flex flex-col gap-sm">
      <div>
        <span className="text-sm font-medium mb-2 block">Images</span>
        <span className="text-xs opacity-60 mb-3 block">
          Up to {maxFiles} images, max {maxSizeMB}MB each
        </span>
        <UploadZone onDrop={handleDrop} accept="image/*" multiple />
      </div>

      {error && (
        <p className="text-sm text-terracotta">{error}</p>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-sm">
          {value.map((file, index) => (
            <div key={index} className="relative rounded-lg overflow-hidden bg-sage-light">
              <div className="aspect-square overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-xs flex flex-col gap-0.5">
                <span className="text-xs text-forest overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
                <span className="text-[10px] text-forest/60">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-xs right-xs w-6 h-6 flex items-center justify-center bg-terracotta/90 border-none rounded-full text-white cursor-pointer transition-colors duration-[250ms] ease-out-custom hover:bg-terracotta-dark"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
