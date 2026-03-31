import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
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
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all',
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

FormInput.displayName = 'FormInput';

export { FormInput };
export type { FormInputProps };
export default FormInput;
