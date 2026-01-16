'use client';

import { useRef, useState, useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
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
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [addFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
  }, [addFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="image-uploader">
      <label className="image-uploader-label">
        <span className="text-sm font-medium mb-2 block">Images</span>
        <span className="text-xs opacity-60 mb-3 block">
          Up to {maxFiles} images, max {maxSizeMB}MB each
        </span>

        <div
          className={cn(
            'image-uploader-dropzone',
            isDragging && 'image-uploader-dropzone-active'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleInputChange}
            className="sr-only"
          />

          <div className="image-uploader-content">
            <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm opacity-60">
              Drag & drop or <span className="text-terracotta">browse</span>
            </p>
          </div>
        </div>
      </label>

      {error && (
        <p className="image-uploader-error">{error}</p>
      )}

      {value.length > 0 && (
        <div className="image-uploader-preview">
          {value.map((file, index) => (
            <div key={index} className="image-uploader-thumb">
              <div className="image-uploader-thumb-image">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="image-uploader-thumb-img"
                />
              </div>
              <div className="image-uploader-thumb-info">
                <span className="image-uploader-thumb-name">{file.name}</span>
                <span className="image-uploader-thumb-size">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="image-uploader-thumb-remove"
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
