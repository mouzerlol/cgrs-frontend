import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useHideOnScroll } from '@/hooks/useHideOnScroll';

vi.mock('next/navigation', () => ({ usePathname: () => '/' }));

// No [data-site-header] in jsdom → getFixedSiteHeaderHeight() returns its 80px fallback.
const CHROME_H = 80;

let prefersReduce = false;

function setScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true, writable: true });
}
function setWidth(w: number) {
  Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true });
}
function fireScroll() {
  act(() => {
    window.dispatchEvent(new Event('scroll'));
  });
}

beforeEach(() => {
  prefersReduce = false;
  setWidth(500); // mobile by default
  setScroll(0);

  // Run rAF callbacks synchronously so a dispatched scroll evaluates immediately.
  const raf = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as typeof window.requestAnimationFrame;
  window.requestAnimationFrame = raf;

  window.matchMedia = ((query: string) => ({
    matches: query.includes('reduced-motion') ? prefersReduce : false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
});

describe('useHideOnScroll', () => {
  it('hides when scrolling down past the chrome height', () => {
    const { result } = renderHook(() => useHideOnScroll());
    expect(result.current.hidden).toBe(false);

    setScroll(CHROME_H + 120);
    fireScroll();
    expect(result.current.hidden).toBe(true);
  });

  it('shows again when scrolling up', () => {
    const { result } = renderHook(() => useHideOnScroll());

    setScroll(CHROME_H + 120);
    fireScroll();
    expect(result.current.hidden).toBe(true);

    setScroll(CHROME_H + 20); // still past chrome, but upward
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });

  it('stays shown near the top of the page', () => {
    const { result } = renderHook(() => useHideOnScroll());

    setScroll(CHROME_H + 120);
    fireScroll();
    expect(result.current.hidden).toBe(true);

    setScroll(CHROME_H - 40); // within chrome height of the top
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });

  it('ignores sub-deadzone movement (no flicker)', () => {
    const { result } = renderHook(() => useHideOnScroll());

    setScroll(CHROME_H + 120);
    fireScroll();
    expect(result.current.hidden).toBe(true);

    setScroll(CHROME_H + 115); // 5px upward, below the 8px deadzone
    fireScroll();
    expect(result.current.hidden).toBe(true); // unchanged
  });

  it('stays shown under prefers-reduced-motion', () => {
    prefersReduce = true;
    const { result } = renderHook(() => useHideOnScroll());

    setScroll(CHROME_H + 200);
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });

  it('stays shown while the menu is open', () => {
    const { result } = renderHook(() => useHideOnScroll({ isMenuOpen: true }));

    setScroll(CHROME_H + 200);
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });

  it('never hides when scrollHide is false', () => {
    const { result } = renderHook(() => useHideOnScroll({ scrollHide: false }));

    setScroll(CHROME_H + 200);
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });

  it('stays shown on desktop-width viewports', () => {
    setWidth(1024);
    const { result } = renderHook(() => useHideOnScroll());

    setScroll(CHROME_H + 200);
    fireScroll();
    expect(result.current.hidden).toBe(false);
  });
});
