'use client';

import { useRef, useState, useCallback, type ReactNode } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

type RenderChildren = (props: { isDragging: boolean }) => ReactNode;

interface UploadZoneProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  children?: ReactNode | RenderChildren;
  className?: string;
}

const UploadZone = ({
  onDrop,
  accept,
  multiple = true,
  disabled = false,
  children,
  className,
}: UploadZoneProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      if (e.dataTransfer.files.length > 0) {
        onDrop(Array.from(e.dataTransfer.files));
      }
    },
    [onDrop, disabled],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onDrop(Array.from(e.target.files));
        // Reset so the same file can be re-selected
        e.target.value = '';
      }
    },
    [onDrop],
  );

  const handleClick = useCallback(() => {
    if (!disabled) inputRef.current?.click();
  }, [disabled]);

  const renderContent = () => {
    if (typeof children === 'function') {
      return (children as RenderChildren)({ isDragging });
    }
    if (children) return children;

    return (
      <div className="pointer-events-none">
        <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm opacity-60">
          Drag & drop or <span className="text-terracotta">browse</span>
        </p>
      </div>
    );
  };

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'border-2 border-dashed border-sage rounded-xl p-lg text-center transition-all duration-[250ms] ease-out-custom bg-white',
        !disabled && 'cursor-pointer hover:border-terracotta hover:bg-terracotta/5',
        isDragging && 'border-terracotta bg-terracotta/5',
        disabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        className="sr-only"
        tabIndex={-1}
      />
      {renderContent()}
    </div>
  );
};

export { UploadZone };
export type { UploadZoneProps };
export default UploadZone;
