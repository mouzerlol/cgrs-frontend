'use client';

import { useState } from 'react';
import SectionWrapper from './SectionWrapper';

interface MissionSectionProps {
  content: { text?: string };
  isEditingLayout: boolean;
  isLoading?: boolean;
  onUpdate?: (content: { text: string }) => void;
}

export default function MissionSection({ content, isEditingLayout, isLoading = false, onUpdate }: MissionSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(content.text || '');

  const handleSave = () => {
    onUpdate?.({ text });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setText(content.text || '');
    setIsEditing(false);
  };

  return (
    <SectionWrapper
      title="Mission & Scope"
      isEditingLayout={isEditingLayout}
      isLoading={isLoading}
      onEdit={() => setIsEditing(true)}
    >
      {isEditing ? (
        <div className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 rounded-lg border border-terracotta/30 bg-white text-forest text-sm focus:outline-none focus:ring-2 focus:ring-terracotta/40 resize-none"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button onClick={handleCancel} className="px-3 py-1 text-xs text-forest/60 hover:text-forest">
              Cancel
            </button>
            <button onClick={handleSave} className="px-3 py-1 text-xs bg-terracotta text-bone rounded-md hover:bg-terracotta-dark">
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-forest/70 leading-relaxed">
          {content.text || <span className="italic text-forest/40">No mission statement defined yet.</span>}
        </p>
      )}
    </SectionWrapper>
  );
}
