import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';
import { IntersectionObserver } from '@/test/mocks/intersection-observer';

beforeEach(() => {
  global.IntersectionObserver = IntersectionObserver as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
