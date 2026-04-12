import { forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { QuickAccessCardAltProps } from '../QuickAccessCardAlt';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

const BrutallyMinimalCard = forwardRef<HTMLAnchorElement, QuickAccessCardAltProps>(
  ({ title, description, href, variant = 'standard', icon, image, className, index = 0 }, ref) => {
    const isLarge = variant === 'large';
    const hasImage = Boolean(image);
    const [localRef, isVisible] = useIntersectionObserver<HTMLAnchorElement>({ threshold: 0.1 });

    return (
      <Link
        ref={(node) => {
          // @ts-ignore - useIntersectionObserver returns a RefObject but we need to assign to it
          localRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as any).current = node;
        }}
        href={href}
        aria-label={title}
        className={cn(
          'group relative flex flex-col bg-white border border-black rounded-none text-black',
          'transition-colors, transition-transform, transition-opacity duration-400 ease-out-custom hover:bg-black hover:-translate-y-1.5',
          isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[464px] md:min-h-[504px]' : 'min-h-[220px] md:min-h-[240px]',
          'fade-up',
          isVisible && 'visible',
          className
        )}
        style={{ transitionDelay: `${index * 0.08}s` }}
      >
        <div className={cn("flex flex-col h-full", isLarge ? "px-6 py-4 sm:px-8 sm:py-5" : "px-4 py-3 sm:px-6 sm:py-4")}>
          <div className={cn("flex justify-between items-start text-left", isLarge ? "gap-4 mb-3" : "gap-3 mb-2")}>
            <h3 className={cn("font-sans font-extrabold uppercase tracking-tight transition-colors group-hover:text-white", isLarge ? "text-3xl md:text-5xl" : "text-lg leading-tight")}>
              {title}
            </h3>
            <div className="shrink-0 mt-1">
              <span className="inline-block font-mono text-[10px] md:text-xs font-bold px-2 py-1 bg-black text-white group-hover:bg-white group-hover:text-black transition-colors border border-black group-hover:border-white">
                [ VIEW ]
              </span>
            </div>
          </div>
          
          {hasImage ? (
            <div className="relative w-full flex-1 min-h-0 border border-black mt-auto overflow-hidden">
              <Image src={image!} alt={title} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" sizes={isLarge ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"} />
              <div className={cn("absolute pointer-events-none text-left", isLarge ? "bottom-6 left-6 right-6" : "bottom-4 left-4 right-4")}>
                <p className={cn("font-sans leading-snug", isLarge ? "text-lg md:text-xl" : "text-sm")}>
                  <span className="bg-white text-black px-2.5 py-1 box-decoration-clone transition-colors group-hover:bg-black group-hover:text-white">
                    {description}
                  </span>
                </p>
              </div>
            </div>
          ) : (
            <p className={cn("font-sans text-left mb-6", isLarge ? "text-lg md:text-xl" : "text-sm")}>
              {description}
            </p>
          )}
        </div>
      </Link>
    );
  }
);
BrutallyMinimalCard.displayName = 'BrutallyMinimalCard';
export default BrutallyMinimalCard;
