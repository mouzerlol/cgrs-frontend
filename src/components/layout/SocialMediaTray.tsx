'use client';

import Icon from '@/components/ui/Icon';

/**
 * Social media tray component with outline-style social media icons.
 * Uses MDI (Material Design Icons) through Iconify framework.
 */
export default function SocialMediaTray() {
  return (
    <div className="footer-social">
      <h4 className="footer-social-title">Connect</h4>
      <div className="footer-social-links">
        <a
          href="https://www.facebook.com/groups/1588752135253432"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label="Visit our Facebook community group"
        >
          <Icon name="mdi:facebook" size="lg" />
        </a>
        <a
          href="https://m.me/ch/AbY9QUkOtr08iXCF/"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-social-link"
          aria-label="Message us on Messenger"
        >
          <Icon name="mdi:facebook-messenger" size="lg" />
        </a>
      </div>
    </div>
  );
}
