'use client';

import { forwardRef, InputHTMLAttributes, useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface SearchBarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  /** Current search value */
  value?: string;
  /** Callback when search value changes */
  onChange?: (value: string) => void;
  /** Callback when search is submitted (Enter key) */
  onSearch?: (value: string) => void;
  /** Debounce delay in ms (0 = no debounce) */
  debounceMs?: number;
  /** Show clear button when has value */
  showClear?: boolean;
}

/**
 * Search input for filtering discussions.
 * Supports debounced search and clear button.
 */
const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({
    value: controlledValue,
    onChange,
    onSearch,
    debounceMs = 300,
    showClear = true,
    placeholder = 'Search discussions...',
    className,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const value = controlledValue !== undefined ? controlledValue : internalValue;

    // Debounced onChange handler
    const debounceTimer = useCallback(() => {
      let timer: NodeJS.Timeout;
      return (val: string) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          onChange?.(val);
        }, debounceMs);
      };
    }, [debounceMs, onChange])();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);

      if (debounceMs > 0) {
        debounceTimer(newValue);
      } else {
        onChange?.(newValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value);
      }
    };

    const handleClear = () => {
      setInternalValue('');
      onChange?.('');
    };

    return (
      <div
        className={cn(
          'relative flex items-center gap-3',
          'px-4 py-3 bg-white rounded-xl',
          'border border-sage/30',
          'transition-all duration-200',
          'focus-within:border-terracotta focus-within:ring-2 focus-within:ring-terracotta/10',
          className
        )}
      >
        <Icon
          icon="lucide:search"
          className="w-5 h-5 text-forest/40 flex-shrink-0"
        />

        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent text-forest',
            'placeholder:text-forest/40',
            'focus:outline-none',
            'text-sm'
          )}
          {...props}
        />

        {showClear && value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-forest/40 hover:text-forest hover:bg-sage-light transition-colors"
            aria-label="Clear search"
          >
            <Icon icon="lucide:x" className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';

export default SearchBar;
