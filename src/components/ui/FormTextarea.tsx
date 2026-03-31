import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FormTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, hint, id: idProp, className, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div>
        {label && (
          <label htmlFor={id} className="block font-body text-sm font-medium text-forest mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all min-h-[120px] resize-y',
            error ? 'border-terracotta' : 'border-sage/30',
            props.disabled && 'bg-sage-light/50 opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="mt-1 text-sm text-terracotta">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="mt-1 text-sm text-forest/50">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

FormTextarea.displayName = 'FormTextarea';

export { FormTextarea };
export type { FormTextareaProps };
export default FormTextarea;
