'use client';

import { GripVertical, X, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionWrapperProps {
  title: string;
  isEditingLayout: boolean;
  onEdit?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function SectionWrapper({
  title,
  isEditingLayout,
  onEdit,
  onRemove,
  children,
  className,
}: SectionWrapperProps) {
  return (
    <div
      className={cn(
        'h-full rounded-[16px] bg-white border overflow-hidden flex flex-col',
        isEditingLayout
          ? 'border-dashed border-sage/50 shadow-sm'
          : 'border-sage/20 shadow-sm',
        className
      )}
    >
      {/* Section header */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          {isEditingLayout && (
            <div className="cursor-grab active:cursor-grabbing text-forest/30 hover:text-forest/50 drag-handle">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <h3 className="font-display text-sm font-semibold text-forest tracking-wide">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {!isEditingLayout && onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-terracotta/70 hover:text-terracotta transition-colors px-1.5 py-0.5 rounded"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {isEditingLayout && onRemove && (
            <button
              onClick={onRemove}
              className="text-forest/30 hover:text-red-500 transition-colors p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Section content — scrollable when card is resized smaller than content */}
      <div className={cn(
        'flex-1 min-h-0 px-4 pb-4 overflow-y-auto scrollbar-thin',
        isEditingLayout && 'opacity-40 pointer-events-none'
      )}>
        {children}
      </div>
    </div>
  );
}
