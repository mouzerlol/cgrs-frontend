import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, hint, id: idProp, className, children, ...props }, ref) => {
    const generatedId = useId();
    const id = idProp ?? generatedId;

    return (
      <div>
        {label && (
          <label htmlFor={id} className="block font-body text-sm font-medium text-forest mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-lg border bg-white text-forest focus:outline-none focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta transition-all appearance-none',
            'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%231A2218%27 stroke-width=%271.5%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E")] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10',
            error ? 'border-terracotta' : 'border-sage/30',
            props.disabled && 'bg-sage-light/50 opacity-60 cursor-not-allowed',
            className,
          )}
          {...props}
        >
          {children}
        </select>
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

FormSelect.displayName = 'FormSelect';

export { FormSelect };
export type { FormSelectProps };
export default FormSelect;
