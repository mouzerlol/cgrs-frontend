import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const BrutalistRawCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#E6E6FA] border-[3px] border-black rounded-none overflow-hidden text-black',
          'transition-colors, transition-transform, transition-opacity duration-100 hover:-translate-x-1 hover:-translate-y-1 shadow-[4px_4px_0_0_#000] hover:shadow-[8px_8px_0_0_#000]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex justify-between items-stretch border-b-[3px] border-black bg-[#FF6B6B]">
            <div className="px-4 py-2 border-r-[3px] border-black flex-grow">
              <span className="font-mono font-black uppercase text-xs tracking-widest text-black">System Info</span>
            </div>
            {icon && (
              <div className="px-4 py-2 flex items-center justify-center bg-white text-black transition-colors group-hover:bg-black group-hover:text-white">
                <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6 flex flex-col flex-grow">
            <h3 className={cn("font-body font-black uppercase tracking-tighter leading-none mb-4", isLarge ? "text-4xl md:text-6xl" : "text-2xl sm:text-3xl")}>
              {title}
            </h3>
            
            <p className={cn("font-mono font-bold text-black/80 mb-6", isLarge ? "text-lg" : "text-sm")}>
              {description}
            </p>

            {hasImage && (
              <div className={cn("relative w-full border-[3px] border-black overflow-hidden mt-auto bg-white filter grayscale contrast-125 group-hover:grayscale-0 transition-colors, transition-transform, transition-opacity", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
                <Image src={image!} alt={title} fill className="object-cover" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }
);
BrutalistRawCard.displayName = 'BrutalistRawCard';
export default BrutalistRawCard;
