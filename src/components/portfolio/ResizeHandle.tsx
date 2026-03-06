'use client';

import type { Ref } from 'react';

/**
 * Render function for portfolio pegboard resize handles.
 * Returns edge/corner affordances consistent with the design system.
 * react-grid-layout calls this with (axis, ref) for each handle position.
 */
export function renderResizeHandle(axis: string, ref: Ref<HTMLElement>) {
  if (axis === 'se') {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className="react-resizable-handle react-resizable-handle-se absolute bottom-0 right-0 z-20 cursor-se-resize group/resize"
        style={{ width: 20, height: 20 }}
      >
        {/* Corner grip dots */}
        <svg
          className="absolute bottom-1 right-1 text-forest/20 group-hover/resize:text-terracotta transition-colors"
          width="10"
          height="10"
          viewBox="0 0 10 10"
        >
          <circle cx="8" cy="2" r="1.2" fill="currentColor" />
          <circle cx="8" cy="6" r="1.2" fill="currentColor" />
          <circle cx="4" cy="6" r="1.2" fill="currentColor" />
          <circle cx="8" cy="10" r="1.2" fill="currentColor" />
          <circle cx="4" cy="10" r="1.2" fill="currentColor" />
          <circle cx="0" cy="10" r="1.2" fill="currentColor" />
        </svg>
      </div>
    );
  }

  if (axis === 'e') {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className="react-resizable-handle react-resizable-handle-e absolute top-0 right-0 z-20 cursor-e-resize group/resize"
        style={{ width: 8, height: '100%' }}
      >
        <div className="absolute top-1/2 right-1 -translate-y-1/2 w-1 h-8 rounded-full bg-forest/10 group-hover/resize:bg-terracotta/40 transition-colors" />
      </div>
    );
  }

  if (axis === 's') {
    return (
      <div
        ref={ref as Ref<HTMLDivElement>}
        className="react-resizable-handle react-resizable-handle-s absolute bottom-0 left-0 z-20 cursor-s-resize group/resize"
        style={{ width: '100%', height: 8 }}
      >
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-8 rounded-full bg-forest/10 group-hover/resize:bg-terracotta/40 transition-colors" />
      </div>
    );
  }

  // Fallback for any other axis
  return (
    <div
      ref={ref as Ref<HTMLDivElement>}
      className={`react-resizable-handle react-resizable-handle-${axis}`}
    />
  );
}
