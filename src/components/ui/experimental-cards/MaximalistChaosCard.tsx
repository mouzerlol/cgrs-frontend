import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const MaximalistChaosCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#FF007F] rounded-2xl overflow-hidden text-white',
          'transition-all duration-300 hover:rotate-1 hover:scale-105 shadow-[8px_8px_0_rgba(0,255,255,0.8)]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="absolute -inset-10 bg-[url('/images/hero-bg.svg')] opacity-40 mix-blend-color-burn group-hover:animate-pulse pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-4 sm:p-6">
          <div className="absolute top-2 right-2 flex gap-1 z-30">
            <div className="w-8 h-8 rounded-full bg-[#00FFFF] mix-blend-screen" />
            <div className="w-8 h-8 rounded-full bg-[#FFFF00] mix-blend-screen -ml-4" />
          </div>

          <h3 className={cn("font-display font-black text-white mix-blend-difference drop-shadow-md z-20", isLarge ? "text-4xl md:text-6xl" : "text-2xl sm:text-3xl")}>
            <span className="bg-black text-white px-2 py-1 leading-snug box-decoration-clone">{title}</span>
          </h3>
          
          <p className={cn("font-body font-bold text-black bg-[#00FFFF] p-2 mt-4 z-20 shadow-[4px_4px_0_#FF00FF]", isLarge ? "text-lg" : "text-sm")}>
            {description}
          </p>

          {hasImage && (
            <div className={cn("relative w-full rounded-full border-4 border-[#FFFF00] overflow-hidden mt-6 rotate-2 group-hover:-rotate-2 transition-transform duration-300", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <div className="absolute inset-0 bg-[#FF00FF] mix-blend-hue z-10" />
              <Image src={image!} alt={title} fill className="object-cover scale-125" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}

          {icon && (
            <div className="absolute bottom-4 right-4 z-30 flex h-14 w-14 items-center justify-center rounded-sm bg-black text-[#00FFFF] -rotate-6 transition-transform group-hover:rotate-12 group-hover:scale-125 shadow-[4px_4px_0_#FFFF00]">
              <Icon name={(icon as IconName) || 'arrow-right'} size="lg" />
            </div>
          )}
        </div>
      </Link>
    );
  }
);
MaximalistChaosCard.displayName = 'MaximalistChaosCard';
export default MaximalistChaosCard;
