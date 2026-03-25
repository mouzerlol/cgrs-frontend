import { cn } from '@/lib/utils';

export interface BreadcrumbBarProps {
  /** BreadcrumbTrail (or any content) */
  children: React.ReactNode;
  /** Classes on the gradient surface (borders, background). */
  className?: string;
  /**
   * Outermost wrapper — use for layout shells, e.g. `shrink-0 pt-[72px]` under the fixed app header
   * on work-management routes.
   */
  outerClassName?: string;
}

/**
 * Shared CGRS breadcrumb strip: sage top edge, bone/sage-light gradient, terracotta hairline.
 * Wrap {@link BreadcrumbTrail} or compose manually.
 */
export function BreadcrumbBar({ children, className, outerClassName }: BreadcrumbBarProps) {
  const surface = (
    <div
      className={cn(
        'relative border-t border-sage/40',
        'bg-gradient-to-b from-sage-light/95 via-bone to-bone',
        'shadow-[inset_0_1px_0_rgba(217,93,57,0.08)]',
        className
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-terracotta/20 to-transparent"
        aria-hidden
      />
      <div className="container mx-auto px-4 py-3 md:px-6">{children}</div>
    </div>
  );

  if (outerClassName) {
    return <div className={outerClassName}>{surface}</div>;
  }

  return surface;
}
