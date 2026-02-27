'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CategoryIcon } from './CategoryIcon';
import { getCategoryConfig } from '@/lib/calendar-config';
import type { CalendarItem } from '@/types';

interface CalendarItemCardProps {
  item: CalendarItem;
  isExpanded: boolean;
  onToggle: () => void;
}

export function CalendarItemCard({
  item,
  isExpanded,
  onToggle,
}: CalendarItemCardProps) {
  const config = getCategoryConfig(item.type, item.category);
  const imageSrc = item.image || config.defaultImage;

  const getReadMoreHref = () => {
    if (!item.slug) return null;
    if (item.type === 'event') {
      return `/calendar/${item.slug}`;
    }
    return `/blog/${item.slug}`;
  };

  const readMoreHref = getReadMoreHref();

  return (
    <div
      className={cn(
        'bg-white rounded-xl overflow-hidden border border-sage transition-all duration-[200ms] ease-out-custom [content-visibility:auto] [contain-intrinsic-size:0_100px] hover:border-forest hover:shadow-[0_4px_16px_rgba(26,34,24,0.08)]',
        isExpanded && 'border-terracotta'
      )}
      data-item-id={item.id}
    >
      <button
        className="flex items-center gap-sm p-sm w-full bg-transparent border-none cursor-pointer text-left transition-[background] duration-[200ms] ease-out-custom hover:bg-sage-light"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <CategoryIcon type={item.type} category={item.category} size="md" />
        <div className="flex-1 min-w-0">
          <h4 className="font-body text-base font-semibold text-forest m-0 leading-[1.3]">{item.title}</h4>
          {item.time && (
            <p className="text-sm text-forest/60 mt-0.5">{item.time}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="w-5 h-5 text-forest/50 transition-transform duration-[200ms] ease-out-custom flex-shrink-0"
        >
          <ChevronDown />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="px-sm pb-sm border-t border-sage-light">
              {imageSrc && (
                <div className="my-sm rounded-lg overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    width={400}
                    height={200}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              <p className="text-sm text-forest/80 leading-relaxed my-sm">{item.description}</p>
              {readMoreHref && (
                <Link
                  href={readMoreHref}
                  className="inline-block mt-xs text-sm font-medium text-terracotta no-underline transition-colors duration-200 hover:text-terracotta-dark hover:underline"
                >
                  Read more →
                </Link>
              )}
              <div className="flex items-center gap-xs mt-sm pt-sm border-t border-sage">
                <Image
                  src={item.author.avatar}
                  alt={item.author.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-forest">{item.author.name}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CalendarItemCard;
