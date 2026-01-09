/**
 * Mock IntersectionObserver for testing.
 */
export class IntersectionObserver {
  readonly root: Element | null;
  readonly rootMargin: string;
  readonly thresholds: number[];

  private callback: IntersectionObserverCallback;
  private entries: IntersectionObserverEntry[] = [];

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback;
    this.root = (options?.root as Element | null) ?? null;
    this.rootMargin = options?.rootMargin ?? '0px';
    this.thresholds = Array.isArray(options?.threshold) ? options.threshold : [options?.threshold ?? 0];
  }

  observe(target: Element): void {
    const entry: IntersectionObserverEntry = {
      boundingClientRect: target.getBoundingClientRect(),
      intersectionRatio: 0,
      intersectionRect: target.getBoundingClientRect(),
      isIntersecting: true,
      rootBounds: this.root?.getBoundingClientRect() ?? new DOMRect(),
      target,
      time: performance.now(),
    };
    this.entries.push(entry);
    this.callback(this.entries, this);
  }

  unobserve(target: Element): void {
    this.entries = this.entries.filter((e) => e.target !== target);
  }

  disconnect(): void {
    this.entries = [];
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [...this.entries];
  }
}

export const mockIntersectionObserver = {
  new (callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    return new IntersectionObserver(callback, options);
  },
};
