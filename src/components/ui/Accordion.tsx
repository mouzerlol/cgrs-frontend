'use client';

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react';
import { cn } from '@/lib/utils';

export interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  className?: string;
}

/**
 * Accordion component using Headless UI Disclosure.
 * Provides expandable/collapsible content sections with smooth animations.
 */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <Disclosure key={index}>
          <DisclosureButton className={cn(
            'flex w-full justify-between items-center px-4 py-4',
            'bg-sage-light rounded-lg text-left',
            'hover:bg-sage/30 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-terracotta/50'
          )}>
            <span className="font-medium text-forest">{item.title}</span>
            <ChevronIcon className="ui-open:rotate-180 transition-transform duration-200" />
          </DisclosureButton>
          <DisclosurePanel className="px-4 py-4 text-forest/80">
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
