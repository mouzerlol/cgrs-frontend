'use client';

import Image from 'next/image';
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

  return (
    <div
      className={cn(
        'calendar-item-card',
        isExpanded && 'calendar-item-card-expanded'
      )}
      data-item-id={item.id}
    >
      <button
        className="calendar-item-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <CategoryIcon type={item.type} category={item.category} size="md" />
        <div className="calendar-item-info">
          <h4 className="calendar-item-title">{item.title}</h4>
          {item.time && (
            <p className="calendar-item-time">{item.time}</p>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'calendar-item-chevron'
          )}
        >
          <ChevronDown />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="calendar-item-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="calendar-item-panel-inner">
              {imageSrc && (
                <div className="calendar-item-image-wrapper">
                  <Image
                    src={imageSrc}
                    alt={item.title}
                    width={400}
                    height={200}
                    className="calendar-item-image"
                  />
                </div>
              )}
              <p className="calendar-item-description">{item.description}</p>
              <div className="calendar-item-author">
                <Image
                  src={item.author.avatar}
                  alt={item.author.name}
                  width={32}
                  height={32}
                  className="calendar-item-avatar"
                />
                <span className="calendar-item-author-name">{item.author.name}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CalendarItemCard;
