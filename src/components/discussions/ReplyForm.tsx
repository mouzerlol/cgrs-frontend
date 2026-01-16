'use client';

import { forwardRef, HTMLAttributes, useRef, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ReplyFormProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit: (body: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  initialValue?: string;
}

const MAX_LENGTH = 2000;

/**
 * Reply form for submitting new replies to threads or other replies.
 * Features character count, auto-resize, and validation.
 */
const ReplyForm = forwardRef<HTMLDivElement, ReplyFormProps>(
  ({
    onSubmit,
    onCancel,
    placeholder = 'What are your thoughts?',
    submitLabel = 'Reply',
    isSubmitting = false,
    initialValue = '',
    className,
    ...props
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState(initialValue);

    // Auto-resize textarea
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [value]);

    // Focus on mount
    useEffect(() => {
      textareaRef.current?.focus();
    }, []);

    const handleSubmit = () => {
      if (value.trim() && !isSubmitting) {
        onSubmit(value.trim());
        setValue('');
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.altKey && !e.ctrlKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };

    const remainingChars = MAX_LENGTH - value.length;
    const isOverLimit = remainingChars < 0;

    return (
      <div ref={ref} className={cn('space-y-2', className)} {...props}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={MAX_LENGTH}
          rows={1}
          className={cn(
            'w-full p-3 rounded-lg border bg-bone text-forest placeholder:text-forest/40',
            'focus:outline-none focus:ring-2 focus:ring-terracotta/20 focus:border-terracotta',
            'resize-none min-h-[80px] text-sm',
            isOverLimit && 'border-terracotta/50'
          )}
          aria-label={placeholder}
        />

        <div className="flex items-center justify-between gap-3">
          {/* Character Count */}
          <span
            className={cn(
              'text-xs',
              remainingChars < 100 && remainingChars >= 0
                ? 'text-terracotta'
                : remainingChars < 0
                ? 'text-red-600'
                : 'text-forest/40'
            )}
          >
            {remainingChars} characters remaining
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-sm font-medium text-forest/60 hover:text-forest hover:bg-sage-light rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || isSubmitting || isOverLimit}
              className={cn(
                'flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors',
                value.trim() && !isSubmitting && !isOverLimit
                  ? 'bg-terracotta text-bone hover:bg-terracotta-dark'
                  : 'bg-sage text-forest/40 cursor-not-allowed'
              )}
            >
              {isSubmitting ? (
                <>
                  <Icon icon="lucide:loader" className="w-4 h-4 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Icon icon="lucide:send" className="w-4 h-4" />
                  {submitLabel}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
);

ReplyForm.displayName = 'ReplyForm';

export default ReplyForm;
