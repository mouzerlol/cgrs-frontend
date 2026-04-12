import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const LuxuryRefinedCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#F9F8F6] rounded-sm border border-[#E5E0D8] overflow-hidden text-[#2C3E2D]',
          'transition-colors, transition-transform, transition-opacity duration-500 ease-out-custom hover:-translate-y-1 hover:shadow-xl hover:shadow-[#2C3E2D]/5',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="absolute inset-0 texture-grain opacity-[0.2] mix-blend-multiply pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex flex-col p-8 sm:p-10 flex-grow">
            <div className="flex justify-between items-start gap-4 mb-4">
              <h3 className={cn("font-display font-light tracking-wide text-[#1A2218]", isLarge ? "text-3xl md:text-5xl" : "text-2xl sm:text-3xl")}>
                {title}
              </h3>
              {icon && (
                <div className="shrink-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#E8EDE6] text-[#2C3E2D] transition-transform duration-500 group-hover:scale-110">
                  <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
                </div>
              )}
            </div>
            
            <p className={cn("font-body font-light text-[#2C3E2D]/70", isLarge ? "text-lg line-clamp-3" : "text-sm line-clamp-2")}>
              {description}
            </p>
          </div>

          {hasImage && (
            <div className="px-6 pb-6 sm:px-8 sm:pb-8 mt-auto">
              <div className={cn("relative w-full rounded-sm overflow-hidden", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
                <Image src={image!} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }
);
LuxuryRefinedCard.displayName = 'LuxuryRefinedCard';
export default LuxuryRefinedCard;
