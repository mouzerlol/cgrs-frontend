'use client';

import {
  forwardRef,
  useRef,
  useState,
  useCallback,
  type HTMLAttributes,
} from 'react';
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import ThreadCard from '../ThreadCard';
import type { Thread } from '@/types';

interface SwipeableThreadCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  /** Thread data */
  thread: Thread;
  /** Whether the current user has upvoted */
  hasUpvoted?: boolean;
  /** Whether the current user has bookmarked */
  isBookmarked?: boolean;
  /** Callback when upvote is triggered via swipe */
  onUpvote?: () => void;
  /** Callback when bookmark is triggered via swipe */
  onBookmark?: () => void;
  /** Callback when share is triggered via swipe */
  onShare?: () => void;
  /** Callback when report is triggered via swipe */
  onReport?: () => void;
  /** Callback when card is tapped */
  onClick?: () => void;
  /** Show category badge */
  showCategory?: boolean;
  /** Disable swipe gestures */
  disableSwipe?: boolean;
}

/**
 * Mobile-optimized thread card with swipe gestures.
 *
 * Features:
 * - Swipe RIGHT to upvote (reveals green panel)
 * - Swipe LEFT to reveal actions (bookmark, share, report)
 * - Haptic-like visual feedback during swipe
 * - Smooth spring animations
 * - 40% threshold for action completion
 * - Touch-optimized 44px action buttons
 */
const SwipeableThreadCard = forwardRef<HTMLDivElement, SwipeableThreadCardProps>(
  ({
    thread,
    hasUpvoted = false,
    isBookmarked = false,
    onUpvote,
    onBookmark,
    onShare,
    onReport,
    onClick,
    showCategory = true,
    disableSwipe = false,
    className,
    ...props
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isActionRevealed, setIsActionRevealed] = useState(false);
    const [activeAction, setActiveAction] = useState<'upvote' | 'actions' | null>(null);

    // Motion value for horizontal drag
    const x = useMotionValue(0);

    // Transform drag to action panel opacity
    const leftPanelOpacity = useTransform(x, [0, 80], [0, 1]);
    const rightPanelOpacity = useTransform(x, [-80, 0], [1, 0]);

    // Scale transforms for action icons
    const upvoteScale = useTransform(x, [0, 60, 100], [0.6, 1, 1.2]);
    const actionScale = useTransform(x, [-100, -60, 0], [1.2, 1, 0.6]);

    // Background color intensity based on swipe distance
    const leftBgOpacity = useTransform(x, [0, 100, 150], [0.3, 0.8, 1]);
    const rightBgOpacity = useTransform(x, [-150, -100, 0], [1, 0.8, 0.3]);

    const getSwipeThreshold = useCallback(() => {
      if (!containerRef.current) return 120;
      return containerRef.current.offsetWidth * 0.4; // 40% threshold
    }, []);

    const handleDragStart = useCallback(() => {
      setIsActionRevealed(false);
    }, []);

    const handleDrag = useCallback(
      (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = getSwipeThreshold();

        if (info.offset.x > threshold * 0.5) {
          setActiveAction('upvote');
        } else if (info.offset.x < -threshold * 0.5) {
          setActiveAction('actions');
        } else {
          setActiveAction(null);
        }
      },
      [getSwipeThreshold]
    );

    const handleDragEnd = useCallback(
      async (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = getSwipeThreshold();

        if (info.offset.x > threshold) {
          // Swipe right - Upvote
          onUpvote?.();
          // Snap back with satisfying animation
          await animate(x, 0, {
            type: 'spring',
            stiffness: 500,
            damping: 30,
          });
        } else if (info.offset.x < -threshold) {
          // Swipe left - Reveal actions
          setIsActionRevealed(true);
          await animate(x, -160, {
            type: 'spring',
            stiffness: 400,
            damping: 30,
          });
        } else {
          // Snap back
          setIsActionRevealed(false);
          await animate(x, 0, {
            type: 'spring',
            stiffness: 400,
            damping: 25,
          });
        }
        setActiveAction(null);
      },
      [getSwipeThreshold, onUpvote, x]
    );

    const closeActions = useCallback(async () => {
      setIsActionRevealed(false);
      await animate(x, 0, {
        type: 'spring',
        stiffness: 400,
        damping: 25,
      });
    }, [x]);

    const handleActionClick = useCallback(
      (action: 'bookmark' | 'share' | 'report') => {
        switch (action) {
          case 'bookmark':
            onBookmark?.();
            break;
          case 'share':
            onShare?.();
            break;
          case 'report':
            onReport?.();
            break;
        }
        closeActions();
      },
      [onBookmark, onShare, onReport, closeActions]
    );

    const handleCardClick = useCallback(() => {
      if (isActionRevealed) {
        closeActions();
      } else {
        onClick?.();
      }
    }, [isActionRevealed, closeActions, onClick]);

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden rounded-2xl', className)}
        {...props}
      >
        {/* Left Action Panel - Upvote (revealed on swipe right) */}
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 w-32',
            'flex items-center justify-center',
            'rounded-l-2xl',
            hasUpvoted ? 'bg-sage' : 'bg-forest'
          )}
          style={{ opacity: leftPanelOpacity }}
        >
          <motion.div
            className="flex flex-col items-center gap-1"
            style={{ scale: upvoteScale, opacity: leftBgOpacity }}
          >
            <Icon
              icon={hasUpvoted ? 'lucide:check' : 'lucide:arrow-big-up'}
              className="w-8 h-8 text-bone"
            />
            <span className="text-xs font-semibold text-bone/90">
              {hasUpvoted ? 'Upvoted' : 'Upvote'}
            </span>
          </motion.div>
        </motion.div>

        {/* Right Action Panel - Actions (revealed on swipe left) */}
        <motion.div
          className="absolute inset-y-0 right-0 w-40 flex items-center justify-end pr-2 rounded-r-2xl bg-gradient-to-l from-sage-light to-transparent"
          style={{ opacity: rightPanelOpacity }}
        >
          <div className="flex items-center gap-1">
            {/* Bookmark Button */}
            <motion.button
              type="button"
              onClick={() => handleActionClick('bookmark')}
              className={cn(
                'flex items-center justify-center w-12 h-12 rounded-xl',
                'transition-colors duration-150',
                isBookmarked
                  ? 'bg-terracotta text-bone'
                  : 'bg-bone/80 text-forest hover:bg-bone'
              )}
              style={{ scale: actionScale }}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
            >
              <Icon
                icon={isBookmarked ? 'lucide:bookmark-check' : 'lucide:bookmark'}
                className="w-5 h-5"
              />
            </motion.button>

            {/* Share Button */}
            <motion.button
              type="button"
              onClick={() => handleActionClick('share')}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-bone/80 text-forest hover:bg-bone transition-colors duration-150"
              style={{ scale: actionScale }}
              aria-label="Share thread"
            >
              <Icon icon="lucide:share-2" className="w-5 h-5" />
            </motion.button>

            {/* Report Button */}
            <motion.button
              type="button"
              onClick={() => handleActionClick('report')}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-bone/80 text-terracotta hover:bg-terracotta hover:text-bone transition-colors duration-150"
              style={{ scale: actionScale }}
              aria-label="Report thread"
            >
              <Icon icon="lucide:flag" className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* Main Card - Draggable */}
        <motion.div
          ref={containerRef}
          drag={disableSwipe ? false : 'x'}
          dragConstraints={{ left: -200, right: 150 }}
          dragElastic={0.1}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className={cn(
            'relative z-10 cursor-grab active:cursor-grabbing',
            'touch-pan-y',
            activeAction === 'upvote' && 'ring-2 ring-forest/30',
            activeAction === 'actions' && 'ring-2 ring-sage/50'
          )}
          onClick={handleCardClick}
          whileTap={{ scale: disableSwipe ? 0.98 : 1 }}
        >
          <ThreadCard
            thread={thread}
            hasUpvoted={hasUpvoted}
            isBookmarked={isBookmarked}
            showCategory={showCategory}
            className={cn(
              'transition-shadow duration-200',
              isActionRevealed && 'shadow-lg'
            )}
          />
        </motion.div>

        {/* Swipe Hint Overlay (shows on first render or when idle) */}
        {!disableSwipe && (
          <div
            className={cn(
              'absolute bottom-2 left-1/2 -translate-x-1/2',
              'flex items-center gap-2 px-3 py-1.5',
              'bg-forest/80 text-bone text-xs font-medium rounded-full',
              'opacity-0 pointer-events-none',
              'transition-opacity duration-300',
              '[.swipeable-hint-visible_&]:opacity-100'
            )}
          >
            <Icon icon="lucide:arrow-left-right" className="w-3 h-3" />
            <span>Swipe for actions</span>
          </div>
        )}
      </div>
    );
  }
);

SwipeableThreadCard.displayName = 'SwipeableThreadCard';

export default SwipeableThreadCard;
