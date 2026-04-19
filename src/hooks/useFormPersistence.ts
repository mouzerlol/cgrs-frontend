import { useEffect, useCallback, useRef } from 'react';
import { flushSync } from 'react';

interface UseFormPersistenceOptions {
  /** Unique key for sessionStorage */
  key: string;
  /** Debounce writes to storage in ms (default 500) */
  debounceMs?: number;
  /** Called after data has been restored from sessionStorage */
  onRestored?: (data: unknown) => void;
}

/**
 * Persist form data to sessionStorage so it survives the sign-in redirect flow.
 * - On mount: reads stored data and calls setData to restore
 * - On data change: debounced write to sessionStorage (excludes File objects)
 * - Returns clearStoredData to manually clear when form is submitted successfully
 * - Optionally calls onRestored callback after successful restoration
 */
export function useFormPersistence<T extends Record<string, unknown>>(
  data: T,
  setData: (data: T | ((prev: T) => T)) => void,
  options: UseFormPersistenceOptions,
): { clearStoredData: () => void; restoredDataRef: React.RefObject<unknown> } {
  const { key, debounceMs = 500, onRestored } = options;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoredRef = useRef(false);
  const restoredDataRef = useRef<unknown>(null);

  // Restore data from sessionStorage on mount
  useEffect(() => {
    if (isRestoredRef.current) return;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored) as T;
        // sessionStorage only stores strings, so File objects are lost
        // Photos must be re-attached by the user
        const { photos: _photos, ...rest } = parsed;
        restoredDataRef.current = rest;
        // Use flushSync to ensure state update is processed before onRestored callback
        // This guarantees formData is updated when auto-submit fires
        // flushSync is only available in React 18+ client-side
        try {
          flushSync(() => {
            setData(rest as T);
          });
        } catch {
          // Fallback if flushSync fails
          setData(rest as T);
        }
        sessionStorage.removeItem(key);
        isRestoredRef.current = true;
        // Notify caller that data was restored (formData now has restored values)
        onRestored?.(rest);
      }
    } catch {
      // Ignore parse errors or missing data
    }
  }, [key, setData, onRestored]);

  // Debounced write to sessionStorage on data change
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      try {
        // Store data without File objects (they can't be serialized)
        const { photos: _photos, ...storableData } = data;
        sessionStorage.setItem(key, JSON.stringify(storableData));
      } catch {
        // sessionStorage may be full or unavailable - fail silently
      }
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [data, key, debounceMs]);

  const clearStoredData = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }, [key]);

  return { clearStoredData, restoredDataRef };
}
