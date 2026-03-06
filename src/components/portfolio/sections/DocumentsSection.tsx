'use client';

import { FileText, FileCheck, FileBadge, FileSpreadsheet, File } from 'lucide-react';
import { DocumentItem } from '@/types/portfolio';
import { formatRelativeDate } from '@/lib/utils';
import SectionWrapper from './SectionWrapper';

const typeIcons = {
  policy: FileCheck,
  report: FileSpreadsheet,
  certificate: FileBadge,
  contract: FileText,
  other: File,
};

interface DocumentsSectionProps {
  content: { items?: DocumentItem[] };
  isEditingLayout: boolean;
}

export default function DocumentsSection({ content, isEditingLayout }: DocumentsSectionProps) {
  const items = content.items || [];

  return (
    <SectionWrapper title="Documents & Policies" isEditingLayout={isEditingLayout}>
      {items.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No documents added yet.</p>
      ) : (
        <div className="space-y-1">
          {items.map((item) => {
            const IconComponent = typeIcons[item.type] || File;
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-sage-light/30 transition-colors group cursor-pointer"
              >
                <IconComponent className="w-4 h-4 text-forest/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-forest group-hover:text-terracotta transition-colors truncate block">
                    {item.name}
                  </span>
                </div>
                {item.updatedAt && (
                  <span className="text-[10px] text-forest/30 shrink-0">
                    {formatRelativeDate(item.updatedAt)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionWrapper>
  );
}
