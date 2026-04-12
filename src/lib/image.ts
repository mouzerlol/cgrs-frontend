/**
 * Returns true when `next/image` should use `unoptimized` (no Image Optimization API).
 * Blob and data URLs are not supported by the default optimizer pipeline.
 */
export function isNonOptimizableImageSrc(src: string): boolean {
  return src.startsWith('blob:') || src.startsWith('data:');
}
