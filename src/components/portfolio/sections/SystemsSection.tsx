'use client';

import { Monitor, FileText, Scale, ExternalLink } from 'lucide-react';
import { SystemItem } from '@/types/portfolio';
import SectionWrapper from './SectionWrapper';

const typeIcons = {
  digital: Monitor,
  governance: Scale,
  documentation: FileText,
  other: Monitor,
};

const typeColors = {
  digital: 'bg-sage-light text-forest',
  governance: 'bg-forest/10 text-forest',
  documentation: 'bg-amber/15 text-amber-dark',
  other: 'bg-sage/20 text-forest',
};

interface SystemsSectionProps {
  content: { items?: SystemItem[] };
  isEditingLayout: boolean;
  isLoading?: boolean;
}

export default function SystemsSection({ content, isEditingLayout, isLoading = false }: SystemsSectionProps) {
  const items = content.items || [];

  return (
    <SectionWrapper title="Systems" isEditingLayout={isEditingLayout} isLoading={isLoading}>
      {items.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No systems documented yet.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const IconComponent = typeIcons[item.type] || Monitor;
            const colorClass = typeColors[item.type] || typeColors.other;
            return (
              <div key={item.id} className="flex items-start gap-3 py-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-forest">{item.name}</span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${item.name} (opens in new tab)`}
                        className="inline-flex items-center justify-center h-9 w-9 -my-1.5 text-forest/40 hover:text-terracotta transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-forest/50 mt-0.5">{item.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
