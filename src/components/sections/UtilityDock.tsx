'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useStaggeredReveal, useFadeUpObserver } from '@/hooks/useIntersectionObserver';
import Icon, { IconName } from '@/components/ui/Icon';

export interface UtilityDockItem {
  name: string;
  href: string;
  icon: string;
  label: string;
}

interface UtilityDockProps {
  items?: UtilityDockItem[];
  useIconComponent?: boolean;
}

/**
 * Floating utility dock with icon links.
 * Overlaps hero section with elevated shadow.
 * Pass custom items or use defaults from constants.
 * Set useIconComponent=true to use Icon component instead of images.
 */
export default function UtilityDock({ items, useIconComponent = false }: UtilityDockProps) {
  const setRef = useStaggeredReveal(200, 100);
  useFadeUpObserver();

  const defaultItems: UtilityDockItem[] = [
    {
      name: 'Maintenance Request',
      href: '/contact?subject=maintenance',
      icon: '/icons/maintenance-request-icon.png',
      label: 'Maintenance<br>Request',
    },
    {
      name: 'Notice Board',
      href: '/discussion',
      icon: '/icons/notice-board-icon.png',
      label: 'Message<br>Board',
    },
    {
      name: 'Community Events',
      href: '/calendar',
      icon: '/icons/community-events-icon.png',
      label: 'Community<br>Calendar',
    },
    {
      name: 'Community News',
      href: '/blog',
      icon: '/icons/community-news-icon.png',
      label: 'Blog',
    },
  ];

  const dockItems = items || defaultItems;

  return (
    <section className="utility-dock fade-up">
      <div className="utility-grid">
        {dockItems.map((item, index) => (
          <Link
            key={item.name}
            href={item.href}
            className="utility-item"
            aria-label={item.name}
            ref={setRef(index)}
          >
            {useIconComponent ? (
              <Icon name={item.icon as IconName} size="xl" className="utility-icon" />
            ) : (
              <Image
                src={item.icon}
                alt={item.name}
                width={110}
                height={110}
                className="utility-icon"
                loading="lazy"
              />
            )}
            <span
              className="utility-label"
              dangerouslySetInnerHTML={{ __html: item.label.replace('\n', '<br>') }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
