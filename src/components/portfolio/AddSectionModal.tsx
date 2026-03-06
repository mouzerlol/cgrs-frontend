'use client';

import { Icon } from '@iconify/react';
import { Modal } from '@/components/ui/Modal';
import { SectionTypeConfig, DashboardSection } from '@/types/portfolio';
import { createDefaultSection } from '@/lib/portfolio';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTypes: SectionTypeConfig[];
  onAdd: (section: DashboardSection) => void;
}

export default function AddSectionModal({ isOpen, onClose, availableTypes, onAdd }: AddSectionModalProps) {
  const handleAdd = (config: SectionTypeConfig) => {
    const section = createDefaultSection(config.type, { x: 0, y: Infinity });
    onAdd(section);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Section" size="md">
      <div className="grid grid-cols-2 gap-3">
        {availableTypes.map((config) => (
          <button
            key={config.type}
            onClick={() => handleAdd(config)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-sage/20 hover:border-terracotta/40 hover:bg-terracotta/5 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-sage-light flex items-center justify-center group-hover:bg-terracotta/10 transition-colors">
              <Icon icon={`lucide:${config.icon}`} className="w-5 h-5 text-forest/60 group-hover:text-terracotta" />
            </div>
            <span className="text-sm font-medium text-forest">{config.label}</span>
            <span className="text-[10px] text-forest/40">
              {config.defaultSize.w}x{config.defaultSize.h}
            </span>
          </button>
        ))}
      </div>
      {availableTypes.length === 0 && (
        <p className="text-center text-sm text-forest/50 py-6">
          All section types are already on your dashboard.
        </p>
      )}
    </Modal>
  );
}
