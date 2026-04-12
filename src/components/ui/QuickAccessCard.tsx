import Link from 'next/link';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { cn } from '@/lib/utils';
import Icon from '@/components/ui/Icon';

export interface QuickAccessCardType {
  title: string;
  description: string;
  href: string;
  type: 'large' | 'simple' | 'accent';
  icon?: string;
  backgroundImage?: string;
  flagId?: string | null;
}

interface QuickAccessCardProps {
  card: QuickAccessCardType;
  index?: number;
}

export default function QuickAccessCard({ card, index = 0 }: QuickAccessCardProps) {
  const [ref, isVisible] = useIntersectionObserver<HTMLAnchorElement>({ threshold: 0.1 });

  const isLarge = card.type === 'large';
  const isAccent = card.type === 'accent';
  const hasPhotoBg = Boolean(card.backgroundImage);

  return (
    <Link
      ref={ref}
      href={card.href}
      className={cn(
        'group relative block p-lg bg-white rounded-card border border-forest/[0.08] transition-colors, transition-transform, transition-opacity duration-400 ease-out-custom overflow-hidden text-forest hover:-translate-y-1.5 hover:shadow-card-hover hover:border-sage',
        isLarge ? 'col-span-1 md:col-span-2 md:row-span-2 min-h-[280px] md:min-h-[400px]' : 'min-h-[160px] md:min-h-[180px]',
        isAccent && 'bg-terracotta text-bone border-terracotta hover:bg-terracotta-dark hover:border-terracotta-dark',
        hasPhotoBg && !isAccent && 'text-white border-forest/20',
        'fade-up',
        isVisible && 'visible',
      )}
      style={{ transitionDelay: `${index * 0.08}s` }}
    >
      {hasPhotoBg && card.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${card.backgroundImage}')` }}
          />
          <div
            className={cn(
              'absolute inset-0',
              isLarge
                ? 'bg-gradient-to-t from-forest/[0.88] via-forest/45 to-forest/20'
                : 'bg-gradient-to-br from-forest/80 to-forest/55',
            )}
          />
        </>
      )}

      <div className={`relative z-10 h-full flex flex-col ${isLarge ? 'justify-end' : ''}`}>
        {!isLarge && (
          <div
            className={cn(
              'w-12 h-12 flex items-center justify-center rounded-xl mb-md transition-colors, transition-transform, transition-opacity duration-400 ease-out-custom group-hover:scale-105',
              isAccent && '!bg-white/20',
              !isAccent && hasPhotoBg && 'bg-terracotta group-hover:bg-terracotta-dark',
              !isAccent && !hasPhotoBg && 'bg-sage-light group-hover:bg-sage',
            )}
          >
            <Icon
              name={card.icon as import('@/components/ui/Icon').IconName}
              size="md"
              className={cn(isAccent ? 'stroke-bone' : hasPhotoBg ? 'stroke-white' : 'stroke-forest')}
            />
          </div>
        )}
        {isLarge && (
          <div className="w-14 h-14 flex items-center justify-center bg-terracotta rounded-2xl mb-4 transition-colors, transition-transform, transition-opacity duration-400 hover:scale-110 hover:rotate-[5deg]">
            <Icon name="amenities" size="lg" className="stroke-white" />
          </div>
        )}
        <h3
          className={cn(
            'font-display font-medium',
            isLarge ? 'text-3xl md:text-[2.5rem] mb-2' : 'text-2xl mb-1',
            hasPhotoBg && 'text-white',
          )}
        >
          {card.title}
        </h3>
        <p
          className={cn(
            isLarge ? 'text-base' : 'text-sm',
            hasPhotoBg ? 'text-white/90' : isLarge ? 'opacity-90' : 'opacity-70',
          )}
        >
          {card.description}
        </p>
      </div>
    </Link>
  );
}
