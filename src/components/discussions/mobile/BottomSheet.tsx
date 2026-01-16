'use client';

import {
  forwardRef,
  useState,
  type ReactNode,
  type HTMLAttributes,
} from 'react';
import { Dialog, DialogBackdrop } from '@headlessui/react';
import { AnimatePresence, motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface BottomSheetProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Whether the bottom sheet is open */
  isOpen: boolean;
  /** Callback when the sheet should close */
  onClose: () => void;
  /** Content to render inside the sheet */
  children: ReactNode;
  /** Title for accessibility (screen readers) */
  title?: string;
  /** Maximum height of the sheet (default: 85vh) */
  maxHeight?: string;
  /** Show drag handle indicator */
  showHandle?: boolean;
}

/**
 * Mobile-optimized bottom sheet using Headless UI Dialog.
 *
 * Features:
 * - Slides up from bottom with spring animation
 * - Swipe down to dismiss gesture
 * - Visual drag handle for affordance
 * - Backdrop tap to close
 * - Focus trap and proper accessibility
 * - Smooth, organic feel matching garden aesthetic
 */
const BottomSheet = forwardRef<HTMLDivElement, BottomSheetProps>(
  ({
    isOpen,
    onClose,
    children,
    title = 'Bottom sheet',
    maxHeight = '85vh',
    showHandle = true,
    className,
    ...props
  }, ref) => {
    const [isDragging, setIsDragging] = useState(false);

    // Motion value for tracking drag position
    const y = useMotionValue(0);

    // Transform drag position to backdrop opacity
    const backdropOpacity = useTransform(y, [0, 300], [1, 0]);

    // Drag handlers with proper types for Framer Motion
    const handleDragStart = () => {
      setIsDragging(true);
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      setIsDragging(false);
      // If dragged down more than 100px or with high velocity, close
      if (info.offset.y > 100 || info.velocity.y > 500) {
        onClose();
      }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={onClose}
            className="relative z-50"
          >
            {/* Backdrop with animated opacity */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ opacity: backdropOpacity }}
            >
              <DialogBackdrop className="fixed inset-0 bg-forest/40 backdrop-blur-sm" />
            </motion.div>

            {/* Sheet container */}
            <div className="fixed inset-0 overflow-hidden">
              <div className="flex min-h-full items-end justify-center">
                {/* Using motion.div with role="dialog" for accessibility */}
                <motion.div
                  ref={ref}
                  role="dialog"
                  aria-modal="true"
                  aria-label={title}
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{
                    type: 'spring',
                    damping: 30,
                    stiffness: 300,
                    mass: 0.8,
                  }}
                  drag="y"
                  dragConstraints={{ top: 0 }}
                  dragElastic={0.2}
                  // @ts-expect-error - Framer Motion drag events conflict with React's native drag events
                  onDragStart={handleDragStart}
                  // @ts-expect-error - Framer Motion drag events conflict with React's native drag events
                  onDragEnd={handleDragEnd}
                  style={{ y, maxHeight }}
                  className={cn(
                    'w-full bg-bone rounded-t-3xl shadow-2xl',
                    'overflow-hidden',
                    'touch-pan-x',
                    isDragging && 'cursor-grabbing',
                    className
                  )}
                  {...props}
                >
                  {/* Drag Handle */}
                  {showHandle && (
                    <div
                      className={cn(
                        'flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing',
                        'touch-none select-none'
                      )}
                    >
                      <div
                        className={cn(
                          'w-12 h-1.5 rounded-full',
                          'bg-sage transition-colors duration-200',
                          isDragging && 'bg-forest/40'
                        )}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div
                    className={cn(
                      'overflow-y-auto overscroll-contain',
                      'px-4 pb-safe',
                      !showHandle && 'pt-4'
                    )}
                    style={{ maxHeight: `calc(${maxHeight} - 2rem)` }}
                  >
                    {children}
                  </div>

                  {/* Safe area spacer for iOS home indicator */}
                  <div className="h-safe-area-inset-bottom" />
                </motion.div>
              </div>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';

export default BottomSheet;
