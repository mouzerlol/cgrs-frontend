'use client';

import { forwardRef, useState, Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface ShareDropdownProps {
  /** Thread ID for generating share link */
  threadId: string;
  /** Thread title for share text */
  threadTitle?: string;
  /** Callback when share action is triggered */
  onShare?: (platform: string) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
}

/**
 * Share dropdown with copy link functionality.
 * Uses Headless UI Menu for accessibility.
 */
const ShareDropdown = forwardRef<HTMLDivElement, ShareDropdownProps>(
  ({ threadId, threadTitle, size = 'md', className }, ref) => {
    const [copied, setCopied] = useState(false);

    const sizeClasses = {
      sm: {
        button: 'min-w-[36px] min-h-[36px] p-1.5',
        icon: 'w-4 h-4',
        text: 'text-xs',
      },
      md: {
        button: 'min-w-[44px] min-h-[44px] p-2',
        icon: 'w-5 h-5',
        text: 'text-sm',
      },
    };

    const sizes = sizeClasses[size];

    const handleCopyLink = async () => {
      const url = `${window.location.origin}/discussion/thread/${threadId}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    };

    const handleNativeShare = async () => {
      const url = `${window.location.origin}/discussion/thread/${threadId}`;
      if (navigator.share) {
        try {
          await navigator.share({
            title: threadTitle || 'CGRS Discussion',
            url,
          });
        } catch (err) {
          // User cancelled or share failed
          console.log('Share cancelled');
        }
      }
    };

    return (
      <Menu as="div" ref={ref} className={cn('relative', className)}>
        <MenuButton
          className={cn(
            'flex items-center justify-center rounded-lg border transition-all duration-200',
            'bg-transparent text-forest/60 border-sage',
            'hover:bg-sage-light hover:text-forest hover:border-forest/20',
            sizes.button
          )}
          aria-label="Share thread"
        >
          <Icon icon="lucide:share-2" className={sizes.icon} />
        </MenuButton>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <MenuItems
            className={cn(
              'absolute right-0 mt-2 w-48 origin-top-right',
              'bg-white rounded-xl shadow-lg border border-sage',
              'ring-1 ring-black/5 focus:outline-none z-50'
            )}
          >
            <div className="p-1">
              <MenuItem>
                {({ focus }) => (
                  <button
                    onClick={handleCopyLink}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm',
                      focus ? 'bg-sage-light text-forest' : 'text-forest/70'
                    )}
                  >
                    <Icon
                      icon={copied ? 'lucide:check' : 'lucide:link'}
                      className="w-4 h-4"
                    />
                    <span>{copied ? 'Link copied!' : 'Copy link'}</span>
                  </button>
                )}
              </MenuItem>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <MenuItem>
                  {({ focus }) => (
                    <button
                      onClick={handleNativeShare}
                      className={cn(
                        'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm',
                        focus ? 'bg-sage-light text-forest' : 'text-forest/70'
                      )}
                    >
                      <Icon icon="lucide:share" className="w-4 h-4" />
                      <span>Share...</span>
                    </button>
                  )}
                </MenuItem>
              )}
            </div>
          </MenuItems>
        </Transition>
      </Menu>
    );
  }
);

ShareDropdown.displayName = 'ShareDropdown';

export default ShareDropdown;
