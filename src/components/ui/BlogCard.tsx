'use client';

import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import type { PostSummary } from '@/lib/blog/types';
import BlogPostCell from '@/components/blog/BlogPostCell';

interface BlogCardProps {
  post: PostSummary;
}

/**
 * The home page's blog card: `BlogPostCell` in its `home` variant, plus the
 * reveal the home page's sections all share.
 *
 * It used to be a separate implementation, and that was the whole problem. A
 * post on the home page had no category and no reading time, dated itself in
 * terracotta above its title, and set that title two sizes off the same post in
 * the listing. Now the only thing this file adds is the scroll-in, which the
 * cell cannot own because the cell is a server component and the listing and
 * article pages do not want it.
 *
 * The reveal sits on a wrapper rather than on the card, so the card keeps its
 * own transform for hover. The wrapper is not the click target either: the
 * cell's title carries `stretched-link`, which gives the whole card one tab
 * stop whose accessible name is the post's title rather than the entire card's
 * text.
 *
 * Requires `<DuotoneFilter />` somewhere on the same page.
 */
export default function BlogCard({ post }: BlogCardProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.1 });

  return (
    <div ref={ref} className={`fade-up h-full ${isVisible ? 'visible' : ''}`}>
      <BlogPostCell post={post} variant="home" />
    </div>
  );
}
