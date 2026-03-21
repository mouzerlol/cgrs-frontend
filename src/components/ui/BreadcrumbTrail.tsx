import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/lib/breadcrumbs';

export interface BreadcrumbTrailProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Semantic breadcrumb list only (no chrome). Use inside {@link BreadcrumbBar} for the standard site look.
 */
export function BreadcrumbTrail({ items, className }: BreadcrumbTrailProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('font-body text-[13px] md:text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-0 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 select-none font-light text-terracotta/45" aria-hidden="true">
                  ›
                </span>
              )}
              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={cn(
                    'max-w-[min(100%,28rem)] truncate',
                    isLast ? 'font-semibold text-forest' : 'text-forest/55'
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="max-w-[min(100%,16rem)] truncate font-medium text-forest/55 transition-colors hover:text-terracotta"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
