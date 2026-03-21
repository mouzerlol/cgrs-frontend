'use client';

import { RelationshipItem } from '@/types/portfolio';
import SectionWrapper from './SectionWrapper';

interface RelationshipsSectionProps {
  content: { items?: RelationshipItem[] };
  isEditingLayout: boolean;
  isLoading?: boolean;
}

export default function RelationshipsSection({ content, isEditingLayout, isLoading = false }: RelationshipsSectionProps) {
  const items = content.items || [];

  return (
    <SectionWrapper title="Key Relationships" isEditingLayout={isEditingLayout} isLoading={isLoading}>
      {items.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No relationships documented yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item) => (
            <li key={item.id} className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-forest">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sage-light text-forest/50 uppercase tracking-wide font-medium">
                  {item.type}
                </span>
              </div>
              {item.description && (
                <p className="text-xs text-forest/50">{item.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionWrapper>
  );
}
