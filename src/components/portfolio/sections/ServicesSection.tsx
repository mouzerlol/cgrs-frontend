'use client';

import { CheckCircle2 } from 'lucide-react';
import { ServiceItem } from '@/types/portfolio';
import SectionWrapper from './SectionWrapper';

interface ServicesSectionProps {
  content: { items?: ServiceItem[] };
  isEditingLayout: boolean;
  isLoading?: boolean;
}

export default function ServicesSection({ content, isEditingLayout, isLoading = false }: ServicesSectionProps) {
  const items = content.items || [];

  return (
    <SectionWrapper title="Services & Responsibilities" isEditingLayout={isEditingLayout} isLoading={isLoading}>
      {items.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No services defined yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="flex gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-sage shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-forest">{item.name}</p>
                {item.description && (
                  <p className="text-xs text-forest/50 mt-0.5 leading-relaxed">{item.description}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionWrapper>
  );
}
