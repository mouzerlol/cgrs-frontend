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
  digital: 'bg-blue-50 text-blue-600',
  governance: 'bg-purple-50 text-purple-600',
  documentation: 'bg-amber/10 text-amber-dark',
  other: 'bg-sage-light text-forest',
};

interface SystemsSectionProps {
  content: { items?: SystemItem[] };
  isEditingLayout: boolean;
}

export default function SystemsSection({ content, isEditingLayout }: SystemsSectionProps) {
  const items = content.items || [];

  return (
    <SectionWrapper title="Systems" isEditingLayout={isEditingLayout}>
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
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-forest/30 hover:text-terracotta">
                        <ExternalLink className="w-3 h-3" />
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
