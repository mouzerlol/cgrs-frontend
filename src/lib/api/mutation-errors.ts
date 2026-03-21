/**
 * Maps API / validation errors into a single user-facing string for mutations.
 */

import { ApiError } from '@/lib/api/client';

/** User-facing message from a failed task-related mutation (validation array or string detail). */
export function formatTaskMutationError(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body;
    if (body && typeof body === 'object' && 'detail' in body) {
      const detail = (body as { detail: unknown }).detail;
      if (typeof detail === 'string') return detail;
      if (Array.isArray(detail)) {
        return detail
          .map((item) => {
            if (item && typeof item === 'object' && 'msg' in item) {
              return String((item as { msg: unknown }).msg);
            }
            return JSON.stringify(item);
          })
          .join(' ');
      }
    }
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
