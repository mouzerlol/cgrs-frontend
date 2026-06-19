'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
  /** Render this item expanded on first paint (no flash-collapse). */
  defaultOpen?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  /** Override the trigger button styling (e.g. square surfaces that match a host page). */
  triggerClassName?: string;
  /** Override the expanded panel styling. */
  panelClassName?: string;
}

/**
 * Accordion component using Headless UI Disclosure.
 * Provides expandable/collapsible content sections with smooth animations.
 */
export function Accordion({ items, className, triggerClassName, panelClassName }: AccordionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <Disclosure key={index} defaultOpen={item.defaultOpen}>
          <DisclosureButton className={cn(
            'flex w-full justify-between items-center px-4 py-4',
            'bg-sage-light rounded-lg text-left',
            'hover:bg-sage/30 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-terracotta/50',
            triggerClassName
          )}>
            <span className="font-medium text-forest">{item.title}</span>
            <ChevronIcon className="ui-open:rotate-180 transition-transform duration-200" />
          </DisclosureButton>
          <DisclosurePanel className={cn('px-4 py-4 text-forest/80', panelClassName)}>
            {item.content}
          </DisclosurePanel>
        </Disclosure>
      ))}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-5 h-5 text-forest', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

export default Accordion;
