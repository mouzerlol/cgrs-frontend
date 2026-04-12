import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const EditorialMagazineCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-white border-x-[12px] border-b-[24px] border-t-[12px] border-white overflow-hidden text-black',
          'transition-colors, transition-transform, transition-opacity duration-300 hover:shadow-2xl',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="relative z-10 flex flex-col h-full border border-black/10">
          {hasImage && (
            <div className={cn("relative w-full border-b border-black/10", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <Image src={image!} alt={title} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
              {icon && (
                <div className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center bg-white text-black rounded-full shadow-lg">
                  <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col p-5 sm:p-6 flex-grow bg-[#FAF9F6]">
            <h3 className={cn("font-display font-bold text-black mb-3", isLarge ? "text-3xl md:text-5xl" : "text-xl sm:text-2xl")}>
              {title}
            </h3>
            
            <p className={cn("font-body text-black/70", isLarge ? "text-base md:text-lg" : "text-sm")}>
              {description}
            </p>
          </div>
        </div>
      </Link>
    );
  }
);
EditorialMagazineCard.displayName = 'EditorialMagazineCard';
export default EditorialMagazineCard;
