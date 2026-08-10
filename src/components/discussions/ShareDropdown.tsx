'use client';

import { forwardRef, useState, Fragment } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import { Tooltip } from '@/components/ui/Tooltip';
import {
  siteHeaderDropdownItemInteractive,
  siteHeaderDropdownSurface,
} from '@/components/layout/siteChrome';

/** A row in the menu, at the account menu's own geometry. */
const MENU_ITEM =
  'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-bone';

interface ShareDropdownProps {
  /** Thread ID for generating share link. Unused when `shareUrl` is given. */
  threadId?: string;
  /** Thread title for share text */
  threadTitle?: string;
  /**
   * What to share, when it is not a thread. A path (`/blog/some-slug`) or an
   * absolute URL; either is resolved against the current origin at click time
   * rather than at render, so the component stays renderable on the server.
   */
  shareUrl?: string;
  /**
   * What is being shared, for the screen-reader label. Defaults to the thread
   * this control was written for.
   */
  itemLabel?: string;
  /** Callback when share action is triggered */
  onShare?: (platform: string) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional class names */
  className?: string;
  /**
   * Additional class names for the trigger itself, rather than the menu's
   * wrapper. `className` lands on the positioning `div`, which is the right
   * place for layout and the wrong one for the chip's own fill — a caller
   * restyling the control (the article's toolbar) needs to reach the button.
   */
  buttonClassName?: string;
  /**
   * Drop the trigger's own chrome — fill, rule, radius, size and padding — and
   * take only `buttonClassName`.
   *
   * For a caller whose trigger is not a chip at all. The article's meta plaque
   * hangs this control off its bottom edge as a folder tab, and layering a tab
   * over the chip's geometry means every one of those properties has to be
   * overridden by a class of equal specificity, which resolves on stylesheet
   * order rather than on intent.
   */
  unstyledTrigger?: boolean;
  /**
   * What the trigger shows, in place of the bare share glyph.
   *
   * For a caller whose trigger carries furniture around the icon — the article
   * plaque sets it in a terracotta tile, the way the sidebar tabs set theirs —
   * which a `className` cannot add.
   */
  triggerContent?: React.ReactNode;
  /**
   * Whether the trigger carries a hover tooltip.
   *
   * On by default: a bare share glyph on a thread card says nothing without one.
   * Off for a trigger that already names itself — the article plaque's tab has
   * "Share" set under the mark, and a tooltip repeating the word it is pointing
   * at is noise on top of a label.
   */
  showTooltip?: boolean;
}

/**
 * Share dropdown with copy link functionality.
 * Uses Headless UI Menu for accessibility.
 */
const ShareDropdown = forwardRef<HTMLDivElement, ShareDropdownProps>(
  (
    {
      threadId,
      threadTitle,
      shareUrl,
      itemLabel = 'thread',
      size = 'md',
      className,
      buttonClassName,
      unstyledTrigger = false,
      triggerContent,
      showTooltip = true,
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const resolveUrl = () =>
      shareUrl
        ? new URL(shareUrl, window.location.origin).toString()
        : `${window.location.origin}/discussion/thread/${threadId}`;

    const sizeClasses = {
      sm: {
        button: 'min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] p-1.5',
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
      const url = resolveUrl();
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    };

    const handleNativeShare = async () => {
      const url = resolveUrl();
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
        {/*
         * The tooltip's own wrapper sits between the `Menu` div and the trigger,
         * so a caller sizing the trigger against the menu — `h-full` on a tab
         * that grows with its wrapper — resolves the percentage against this
         * element instead, which has an auto height and never moves. It passes
         * the height straight through when the trigger is the caller's own.
         */}
        {(() => {
          const trigger = (
            <MenuButton
              className={cn(
                'flex items-center justify-center transition-all duration-200',
                !unstyledTrigger && [
                  'rounded-lg border',
                  /* Same resting surface as `UpvoteButton` and `BookmarkButton`: the three
                     are one set of controls on the thread card and should read as one. */
                  'bg-sage-light text-forest border-sage',
                  'hover:bg-sage hover:border-forest/20',
                  sizes.button,
                ],
                /* `h-full` normally rides on the tooltip's wrapper; without one
                   the trigger resolves its height against the `Menu` div, which
                   is the caller's flex item and the element it wanted all along. */
                unstyledTrigger && 'h-full',
                buttonClassName,
              )}
              aria-label={`Share ${itemLabel}`}
            >
              {triggerContent ?? <Icon icon="lucide:share-2" className={sizes.icon} />}
            </MenuButton>
          );

          return showTooltip ? (
            <Tooltip content="Share" className={unstyledTrigger ? 'h-full' : undefined}>
              {trigger}
            </Tooltip>
          ) : (
            trigger
          );
        })()}

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          {/*
           * `modal={false}`, and it is a bug fix rather than a preference.
           *
           * Headless UI's `MenuItems` is modal by default, which locks the
           * document while the menu is open: it sets `overflow: hidden` on
           * `<html>` and adds a `padding-right` equal to the scrollbar's width to
           * stand in for the bar it has just removed. On a small dropdown that
           * trade is wrong in both directions — the page cannot be scrolled with
           * a share menu open, and every full-bleed element on it steps sideways
           * by the width of a scrollbar the moment the menu appears. The site's
           * account menu already passes this (`ClerkAppUserButton`); this one had
           * simply never been told.
           */}
          <MenuItems
            modal={false}
            /*
             * The site header's dropdown surface, which is where this pattern is
             * defined: forest, a `white/10` rule, and the deep shadow that says
             * the panel is off the page rather than on it. It was a white card
             * with a sage border, from before that surface existed — one control
             * opening a light menu while every other menu on the site opens a
             * dark one.
             */
            className={cn(
              'absolute right-0 z-[1100] mt-2 w-[min(100vw-2rem,14rem)] origin-top-right rounded-2xl',
              'focus:outline-none',
              siteHeaderDropdownSurface,
            )}
          >
            <div className="p-1">
              <MenuItem>
                {({ focus }) => (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={cn(MENU_ITEM, siteHeaderDropdownItemInteractive, focus && 'bg-white/10')}
                  >
                    {/*
                     * The glyph takes the accent once the link is on the
                     * clipboard, and the muted bone the account menu's icons run
                     * at until then. The row is its own confirmation — there is
                     * no toast behind this — so the tick has to carry it.
                     */}
                    <Icon
                      icon={copied ? 'lucide:check' : 'lucide:link'}
                      className={cn('h-4 w-4 shrink-0', copied ? 'text-terracotta' : 'text-bone/70')}
                    />
                    <span>{copied ? 'Link copied' : 'Copy link'}</span>
                  </button>
                )}
              </MenuItem>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <MenuItem>
                  {({ focus }) => (
                    <button
                      type="button"
                      onClick={handleNativeShare}
                      className={cn(MENU_ITEM, siteHeaderDropdownItemInteractive, focus && 'bg-white/10')}
                    >
                      <Icon icon="lucide:share" className="h-4 w-4 shrink-0 text-bone/70" />
                      <span>Share&hellip;</span>
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
