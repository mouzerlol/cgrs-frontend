import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const RetroFuturisticCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#050B14] border border-[#00FF41]/30 rounded-lg overflow-hidden text-[#00FF41]',
          'transition-colors, transition-transform, transition-opacity duration-300 hover:border-[#00FF41] hover:shadow-[0_0_15px_rgba(0,255,65,0.4)]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#00FF41]/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Scanlines overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

        <div className="relative z-10 flex flex-col h-full p-5 sm:p-6">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h3 className={cn("font-mono font-bold uppercase drop-shadow-[0_0_5px_rgba(0,255,65,0.8)]", isLarge ? "text-2xl md:text-4xl" : "text-xl sm:text-2xl")}>
              {title}
            </h3>
            {icon && (
              <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded border border-[#00FF41]/50 bg-[#00FF41]/10 text-[#00FF41] transition-all group-hover:bg-[#00FF41] group-hover:text-black">
                <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
              </div>
            )}
          </div>
          
          <p className={cn("font-mono text-[#00FF41]/70 mb-6", isLarge ? "text-base" : "text-xs")}>
            {description}
          </p>

          {hasImage && (
            <div className={cn("relative w-full rounded border border-[#00FF41]/30 overflow-hidden mt-auto group-hover:border-[#00FF41]/80 transition-colors", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <div className="absolute inset-0 bg-[#00FF41] mix-blend-color pointer-events-none z-10 opacity-40 group-hover:opacity-20 transition-opacity" />
              <Image src={image!} alt={title} fill className="object-cover" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}
        </div>
      </Link>
    );
  }
);
RetroFuturisticCard.displayName = 'RetroFuturisticCard';
export default RetroFuturisticCard;
