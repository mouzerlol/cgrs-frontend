import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';
import { IntersectionObserver } from '@/test/mocks/intersection-observer';

beforeEach(() => {
  global.IntersectionObserver = IntersectionObserver as unknown as typeof IntersectionObserver;
  // jsdom does not implement window.scrollTo; mock it for MapSection/useImmersiveScroll
  Object.defineProperty(window, 'scrollTo', { value: vi.fn(), writable: true });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
