import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const OrganicNaturalCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-gradient-to-br from-[#F4EBE3] to-[#E9F0E6] rounded-[32px] overflow-hidden text-[#4A5D4E]',
          'transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(74,93,78,0.2)]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="relative z-10 flex flex-col h-full p-6 sm:p-8">
          <div className="flex justify-between items-center gap-4 mb-4">
            {icon && (
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-white/60 text-[#7C9082] transition-colors duration-300 group-hover:bg-[#4A5D4E] group-hover:text-white">
                <Icon name={(icon as IconName) || 'arrow-right'} size="md" />
              </div>
            )}
          </div>

          <h3 className={cn("font-display font-medium text-[#2C3E2D] mb-3", isLarge ? "text-3xl md:text-4xl" : "text-2xl sm:text-3xl")}>
            {title}
          </h3>
          
          <p className={cn("font-body text-[#4A5D4E]/80 mb-6", isLarge ? "text-lg" : "text-sm")}>
            {description}
          </p>

          {hasImage && (
            <div className={cn("relative w-full rounded-[24px] overflow-hidden mt-auto", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <Image src={image!} alt={title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}
        </div>
      </Link>
    );
  }
);
OrganicNaturalCard.displayName = 'OrganicNaturalCard';
export default OrganicNaturalCard;
