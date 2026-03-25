/**
 * Helpers for suppressing a task "open detail" click that would otherwise fire
 * immediately after a @dnd-kit drag ends (pointerup synthesizes a click).
 */

export function markTaskOpenSuppressionAfterDrag(
  ref: { current: string | null },
  taskId: string,
  clearAfterMs = 400,
): void {
  ref.current = taskId;
  window.setTimeout(() => {
    if (ref.current === taskId) {
      ref.current = null;
    }
  }, clearAfterMs);
}

/** Returns true if this open should be ignored (post-drag ghost click). */
export function consumeTaskOpenSuppressionIfMatch(ref: { current: string | null }, taskId: string): boolean {
  if (ref.current === taskId) {
    ref.current = null;
    return true;
  }
  return false;
}
