import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/lib/breadcrumbs';

export interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  className?: string;
}

/*
 * Site-wide indent for the trail, inside whatever surface carries it.
 *
 * The crumbs used to start on the container's edge, flush with the hero card
 * above them. That only reads once the surface under them dissolves at the
 * edges; against a surface that ends on a line — the article's bone band, the
 * bar's own bounds — the first label lands hard against it. This gives every
 * trail on the site the same small gutter instead, so none of them touch an
 * edge and they agree with each other page to page.
 */
const TRAIL_INDENT = 'pl-3 md:pl-4';

/**
 * Semantic breadcrumb list only (no chrome). Use inside {@link BreadcrumbBar} for the standard site look.
 */
export function BreadcrumbTrail({ items, className }: BreadcrumbTrailProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('font-body text-[13px] md:text-sm', TRAIL_INDENT, className)}
    >
      <ol className="flex flex-wrap items-center gap-x-0 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          /*
           * The root crumb reads as an icon rather than the word "Home": at the
           * head of every trail on the site it is the one label a reader never
           * needs to actually read. The label stays in the DOM for screen
           * readers, and in the JSON-LD, which is built from the same items.
           */
          const isHome = index === 0 && item.href === '/';
          const content = isHome ? (
            <>
              <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="sr-only">{item.label}</span>
            </>
          ) : (
            item.label
          );

          return (
            <li key={index} className="flex items-center">
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    isHome ? 'flex items-center' : 'max-w-[min(100%,28rem)] truncate',
                    isLast ? 'font-semibold text-forest' : 'text-forest/55'
                  )}
                >
                  {content}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    'font-medium text-forest/55 transition-colors hover:text-terracotta',
                    isHome ? 'flex items-center' : 'max-w-[min(100%,16rem)] truncate'
                  )}
                >
                  {content}
                </Link>
              )}

              {/*
               * The separator trails its own item rather than leading the next
               * one. On a single line the two render identically; when the
               * trail wraps, this keeps the chevron tucked behind the label it
               * belongs to instead of stranding it at the start of a new line.
               */}
              {!isLast && (
                <span className="mx-2 select-none font-light text-terracotta/45" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
