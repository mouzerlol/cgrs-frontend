'use client';

import Icon from '@/components/ui/Icon';

/**
 * Social media tray component with outline-style social media icons.
 * Uses MDI (Material Design Icons) through Iconify framework.
 */
export default function SocialMediaTray() {
  return (
    <div className="pt-0">
      <h4 className="font-body text-xs mb-sm text-terracotta font-semibold tracking-[0.15em] uppercase">Connect</h4>
      <div className="flex gap-sm items-start">
        <a
          href="https://www.facebook.com/groups/1588752135253432"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 text-bone opacity-70 transition-opacity duration-300 hover:opacity-100"
          aria-label="Visit our Facebook community group"
        >
          <Icon name="mdi:facebook" size="lg" />
        </a>
        <a
          href="https://m.me/ch/AbY9QUkOtr08iXCF/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-8 h-8 text-bone opacity-70 transition-opacity duration-300 hover:opacity-100"
          aria-label="Message us on Messenger"
        >
          <Icon name="mdi:facebook-messenger" size="lg" />
        </a>
      </div>
    </div>
  );
}
