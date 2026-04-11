import { cn } from '@/lib/utils';

export interface BreadcrumbBarProps {
  /** BreadcrumbTrail (or any content) */
  children: React.ReactNode;
  /** Classes on the surface (background, shadows). */
  className?: string;
  /**
   * Outermost wrapper — use for layout shells, e.g. `shrink-0 pt-[72px]` under the fixed app header
   * on work-management routes.
   */
  outerClassName?: string;
}

/**
 * Shared CGRS breadcrumb strip: bone background, container padding.
 * Wrap {@link BreadcrumbTrail} or compose manually.
 */
export function BreadcrumbBar({ children, className, outerClassName }: BreadcrumbBarProps) {
  const surface = (
    <div className={cn('relative border-0 bg-bone', className)}>
      <div className="container mx-auto border-0 px-4 py-3 md:px-6">{children}</div>
    </div>
  );

  if (outerClassName) {
    return <div className={outerClassName}>{surface}</div>;
  }

  return surface;
}
