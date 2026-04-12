import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';

export interface QuickAccessCardAltProps {
  title: string;
  description: string;
  href: string;
  variant?: 'standard' | 'large';
  icon?: string;
  image?: string;
  index?: number;
  className?: string;
}

/**
 * Alternative Quick Access Card - V3 (Fixed Proportions)
 * Content-driven layout with a fixed aspect ratio image, avoiding squishing.
 * Image is sandwiched between small text at the top and large text at the bottom.
 * Features a floating icon anchored inside the bottom-right corner of the image.
 * Features a frame around the card with a texture overlay and a forest background with sage-light text.
 */
const QuickAccessCardAlt = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, index = 0, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-forest rounded-card border border-sage/20 transition-colors, transition-transform, transition-opacity duration-400 ease-out-custom overflow-hidden text-sage-light hover:-translate-y-1.5 hover:shadow-card-hover hover:border-sage',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2' : '',
          className
        )}
      >
        {/* Texture Overlay */}
        <div className="absolute inset-0 texture-grain opacity-[0.15] mix-blend-overlay pointer-events-none" />

        {/* Content Container */}
        <div className="relative z-10 flex flex-col p-2 sm:p-2.5 h-full">
          
          {/* Top Portion - Small Text */}
          <div className="px-2 pt-2 pb-3 text-left">
            <p 
              className={cn(
                "font-body text-sage-light/70",
                isLarge ? "text-sm md:text-base line-clamp-2" : "text-[12px] md:text-sm line-clamp-2"
              )}
            >
              {description}
            </p>
          </div>

          {/* Middle Portion - Image */}
          <div 
            className={cn(
              "relative w-full rounded-[10px] overflow-hidden bg-forest-light/30",
              isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-video"
            )}
          >
            {hasImage && (
              <Image
                src={image!}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 ease-out-custom group-hover:scale-105"
                sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
              />
            )}
            
            {/* Floating Icon - Anchored inside the image bottom-right */}
            <div className="absolute bottom-2 right-2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-sage-light text-forest shadow-[0_4px_12px_rgba(26,34,24,0.4)] transition-colors, transition-transform, transition-opacity duration-400 ease-out-custom group-hover:scale-110 group-hover:bg-terracotta group-hover:text-bone">
              <Icon 
                name={(icon as IconName) || 'arrow-right'} 
                size={isLarge ? "md" : "sm"} 
              />
            </div>
          </div>

          {/* Bottom Portion - Large Text (H3) */}
          <div className="mt-auto px-2 pt-4 pb-2 text-left">
            <h3 
              className={cn(
                "font-display font-medium text-sage-light group-hover:text-terracotta transition-colors duration-300",
                isLarge ? "text-2xl md:text-3xl lg:text-4xl" : "text-lg sm:text-xl leading-tight"
              )}
            >
              {title}
            </h3>
          </div>
        </div>
      </Link>
    );
  }
);

QuickAccessCardAlt.displayName = 'QuickAccessCardAlt';

// Motion wrapper for staggered list rendering
export const MotionQuickAccessCardAlt = motion(QuickAccessCardAlt);

export default QuickAccessCardAlt;
