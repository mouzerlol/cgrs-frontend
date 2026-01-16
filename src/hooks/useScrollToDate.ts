import { useCallback, useRef, RefObject } from 'react';

interface UseScrollToDateReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  scrollToDate: (dateString: string) => void;
  scrollToItem: (itemId: string) => void;
}

/**
 * Hook for managing scroll synchronization between calendar grid and detail view
 * Provides a ref for the scrollable container and functions to scroll to specific elements
 * Only scrolls the detail view, not the main page
 */
export function useScrollToDate(): UseScrollToDateReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollToElement = useCallback((selector: string) => {
    if (!containerRef.current) return;

    // Use requestAnimationFrame to ensure DOM has updated after state changes
    requestAnimationFrame(() => {
      if (!containerRef.current) return;

      const targetEl = containerRef.current.querySelector(selector);
      if (targetEl) {
        // Calculate absolute scroll position: target's offset within container + current scroll position
        // Subtract a 24px offset to leave "breathing room" above the text
        const SCROLL_OFFSET = 24;
        const targetOffset = targetEl.getBoundingClientRect().top - containerRef.current.getBoundingClientRect().top;
        const absoluteScrollTop = containerRef.current.scrollTop + targetOffset - SCROLL_OFFSET;

        containerRef.current.scrollTo({
          top: Math.max(0, absoluteScrollTop),
          behavior: 'smooth',
        });
      }
    });
  }, []);

  const scrollToDate = useCallback((dateString: string) => {
    scrollToElement(`[data-date="${dateString}"]`);
  }, [scrollToElement]);

  const scrollToItem = useCallback((itemId: string) => {
    scrollToElement(`[data-item-id="${itemId}"]`);
  }, [scrollToElement]);

  return {
    containerRef,
    scrollToDate,
    scrollToItem,
  };
}
