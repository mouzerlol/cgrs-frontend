import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const PlayfulToyCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#FFDE59] border-4 border-black rounded-3xl overflow-hidden text-black',
          'transition-colors, transition-transform, transition-opacity duration-200 hover:-translate-y-2 hover:shadow-[0_8px_0_0_#000] active:translate-y-0 active:shadow-[0_0px_0_0_#000]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="relative z-10 flex flex-col h-full p-5 sm:p-7">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h3 className={cn("font-display font-black text-black leading-tight", isLarge ? "text-3xl md:text-5xl" : "text-xl sm:text-2xl")}>
              {title}
            </h3>
            {icon && (
              <div className="shrink-0 flex h-12 w-12 items-center justify-center rounded-full border-2 border-black bg-[#FF5757] text-white transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                <Icon name={(icon as IconName) || 'arrow-right'} size="md" />
              </div>
            )}
          </div>
          
          <p className={cn("font-body font-medium text-black/80 mb-6", isLarge ? "text-lg" : "text-sm")}>
            {description}
          </p>

          {hasImage && (
            <div className={cn("relative w-full rounded-2xl border-4 border-black overflow-hidden mt-auto bg-white", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <Image src={image!} alt={title} fill className="object-cover transition-transform duration-500 group-hover:scale-110" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}
        </div>
      </Link>
    );
  }
);
PlayfulToyCard.displayName = 'PlayfulToyCard';
export default PlayfulToyCard;
