'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';
import { FEATURE_FLAG_IDS } from '@/lib/feature-flags';
import type { PostSummary } from '@/lib/blog/types';
import { formatDate } from '@/lib/utils';
import Icon from '@/components/ui/Icon';
import BlogCard from '@/components/ui/BlogCard';
import DuotoneFilter from '@/components/blog/DuotoneFilter';

interface BlogGridProps {
  posts: PostSummary[];
  title?: string;
  eyebrow?: string;
  showViewAll?: boolean;
}

/**
 * Homepage blog grid with image cards.
 * Three-column layout on desktop.
 * Hidden when the blog nav flag is off (content links to /blog).
 *
 * SECURITY NOTE: dangerouslySetInnerHTML is safe here - title contains only hardcoded
 * strings (e.g., 'Community<br>News'). If title ever becomes user-controlled,
 * use a sanitizer like DOMPurify.
 */
export default function BlogGrid({
  posts,
  title = 'Community<br>Blog',
  eyebrow = 'Latest Updates',
  showViewAll = true,
}: BlogGridProps) {
  const blogEnabled = useFeatureFlag(FEATURE_FLAG_IDS.NAV_BLOG);
  const [headerRef, headerVisible] = useIntersectionObserver<HTMLDivElement>({ threshold: 0.2 });

  if (!blogEnabled) {
    return null;
  }

  return (
    <section className="section relative overflow-hidden bg-bone" id="news">
      {/* The cards' plates reference this filter by id. */}
      <DuotoneFilter />

      {/*
       * Graph-paper ground for the whole section rather than per-card: at page
       * scale it tiles flat (the vignetted .texture-grid reads as a stain once
       * it is this big), and the white cards sit on it as paper on a desk.
       */}
      <div
        className="texture-grid-page pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div className="container relative">
        <div
          ref={headerRef}
          className={`max-w-[600px] mb-10 md:mb-12 fade-up ${headerVisible ? 'visible' : ''}`}
        >
          <span className="text-eyebrow block mb-4">{eyebrow}</span>
          <h2 dangerouslySetInnerHTML={{ __html: title }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-4 md:gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        {showViewAll && (
          <div className="text-center mt-10">
            <Link
              href="/blog"
              className="group inline-flex items-center gap-2 text-sm font-medium text-forest uppercase tracking-wider hover:text-terracotta transition-colors"
            >
              {/* Rule sits on the label, not the link box, so it stops short
                  of the arrow. */}
              <span className="underline-draw">View All Blog Posts</span>
              <Icon name="arrow-right" size="sm" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

