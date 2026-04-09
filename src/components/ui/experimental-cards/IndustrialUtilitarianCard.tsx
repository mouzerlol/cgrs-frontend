import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Icon, { IconName } from '@/components/ui/Icon';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';

const IndustrialUtilitarianCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          'group relative flex flex-col bg-[#E5E7EB] border-2 border-[#374151] rounded-none overflow-hidden text-[#111827]',
          'transition-all duration-150 hover:bg-[#D1D5DB] hover:border-[#111827]',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
          className
        )}
      >
        <div className="flex border-b-2 border-[#374151] bg-[#F3F4F6] p-2 items-center justify-between">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-[#374151] bg-white"></div>
            <div className="w-3 h-3 rounded-full border-2 border-[#374151] bg-white"></div>
          </div>
          <span className="font-mono text-[10px] uppercase font-bold text-[#4B5563] tracking-widest">ID-SYS-0{Math.floor(Math.random() * 9)}</span>
        </div>

        <div className="relative z-10 flex flex-col h-full p-4 sm:p-5">
          <div className="flex justify-between items-start gap-4 mb-4">
            <h3 className={cn("font-mono font-bold uppercase", isLarge ? "text-2xl md:text-3xl" : "text-lg sm:text-xl")}>
              {title}
            </h3>
            {icon && (
              <div className="shrink-0 border-2 border-[#374151] p-1.5 bg-[#F9FAFB] group-hover:bg-[#374151] group-hover:text-white transition-colors">
                <Icon name={(icon as IconName) || 'arrow-right'} size="sm" />
              </div>
            )}
          </div>
          
          <p className={cn("font-mono text-[#4B5563] mb-6", isLarge ? "text-base" : "text-xs")}>
            {description}
          </p>

          {hasImage && (
            <div className={cn("relative w-full border-2 border-[#374151] mt-auto", isLarge ? "aspect-video md:aspect-[21/9]" : "aspect-[4/3] sm:aspect-video")}>
              <div className="absolute inset-0 bg-[#374151] mix-blend-color pointer-events-none z-10 opacity-30 group-hover:opacity-0 transition-opacity" />
              <Image src={image!} alt={title} fill className="object-cover" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
            </div>
          )}
        </div>
      </Link>
    );
  }
);
IndustrialUtilitarianCard.displayName = 'IndustrialUtilitarianCard';
export default IndustrialUtilitarianCard;
