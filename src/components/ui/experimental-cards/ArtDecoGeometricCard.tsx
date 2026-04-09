import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const ArtDecoGeometricCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#111A15] p-1 overflow-hidden text-[#D4AF37]',
          'transition-all duration-500 hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] hover:-translate-y-1',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="absolute inset-0 border border-[#D4AF37]/30 m-2 pointer-events-none" />
        <div className="absolute inset-0 border border-[#D4AF37]/10 m-3 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col h-full bg-[#1A2218] border border-[#D4AF37]/40 m-4 p-4 sm:p-6 transition-colors duration-500 group-hover:bg-[#111A15]">
          
          <div className="flex flex-col items-center text-center flex-grow mb-6">
            <div className="w-8 h-px bg-[#D4AF37] mb-4" />
            <h3 className={cn("font-display font-light uppercase tracking-[0.2em] text-[#D4AF37]", isLarge ? "text-2xl md:text-3xl" : "text-lg sm:text-xl")}>
              {title}
            </h3>
            <div className="w-8 h-px bg-[#D4AF37] mt-4 mb-6" />
            
            <p className={cn("font-body font-light text-[#D4AF37]/70", isLarge ? "text-base" : "text-xs")}>
              {description}
            </p>
          </div>

          {hasImage && (
            <div className={cn("relative w-full border-t border-b border-[#D4AF37]/30 mt-auto", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <div className="absolute inset-0 bg-[#D4AF37] mix-blend-color pointer-events-none z-10 opacity-20" />
              <Image src={image!} alt={title} fill className="object-cover sepia-[0.3]" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}

          {icon && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 flex h-12 w-12 items-center justify-center bg-[#1A2218] border border-[#D4AF37] text-[#D4AF37] rotate-45 transition-transform duration-500 group-hover:rotate-[-45deg] group-hover:bg-[#D4AF37] group-hover:text-[#111A15]">
              <div className="-rotate-45 group-hover:rotate-[45deg] transition-transform duration-500 flex items-center justify-center">
                <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  }
);
ArtDecoGeometricCard.displayName = 'ArtDecoGeometricCard';
export default ArtDecoGeometricCard;
