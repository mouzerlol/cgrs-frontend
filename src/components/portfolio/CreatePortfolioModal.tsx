'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { Icon } from '@iconify/react';
import { Portfolio } from '@/types/portfolio';
import { BoardColor } from '@/types/work-management';
import { generatePortfolioId, generatePortfolioTag, SECTION_TYPE_CONFIGS, createDefaultSection } from '@/lib/portfolio';

interface CreatePortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (portfolio: Portfolio) => void;
}

const colorOptions: { value: BoardColor; label: string; bg: string }[] = [
  { value: 'sage', label: 'Sage', bg: 'bg-sage-light' },
  { value: 'terracotta', label: 'Terracotta', bg: 'bg-[#FBEBE6]' },
  { value: 'forest', label: 'Forest', bg: 'bg-forest-light/20' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber/10' },
];

const iconOptions = [
  { value: 'wallet', icon: 'lucide:wallet' },
  { value: 'wrench', icon: 'lucide:wrench' },
  { value: 'trees', icon: 'lucide:trees' },
  { value: 'shield', icon: 'lucide:shield' },
  { value: 'party-popper', icon: 'lucide:party-popper' },
  { value: 'megaphone', icon: 'lucide:megaphone' },
  { value: 'settings', icon: 'lucide:settings' },
  { value: 'heart', icon: 'lucide:heart' },
  { value: 'zap', icon: 'lucide:zap' },
  { value: 'globe', icon: 'lucide:globe' },
];

export default function CreatePortfolioModal({ isOpen, onClose, onSubmit }: CreatePortfolioModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<BoardColor>('sage');
  const [icon, setIcon] = useState('wallet');
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !leadName.trim()) return;

    const id = generatePortfolioId(name);
    const tag = generatePortfolioTag(name);

    // Build default sections with a reasonable layout
    const defaultSectionTypes = SECTION_TYPE_CONFIGS.map(c => c.type);
    let currentY = 0;
    const sections = defaultSectionTypes.map(type => {
      const section = createDefaultSection(type, { x: 0, y: currentY });
      currentY += section.gridSize.h;
      return section;
    });

    const portfolio: Portfolio = {
      id,
      name: name.trim(),
      description: description.trim(),
      icon,
      color,
      tag,
      lead: {
        id: `lead-${id}`,
        name: leadName.trim(),
        avatar: '',
        role: 'Portfolio Lead',
        email: leadEmail.trim() || undefined,
      },
      members: [],
      sections,
      linkedBoardIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(portfolio);
    setName('');
    setDescription('');
    setColor('sage');
    setIcon('wallet');
    setLeadName('');
    setLeadEmail('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Portfolio" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormInput
          label="Portfolio Name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Landscaping"
          required
        />

        <FormTextarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What area of responsibility does this portfolio cover?"
          rows={3}
          className="resize-none"
        />

        <div>
          <label className="block text-sm font-medium text-forest mb-2">Icon</label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setIcon(option.value)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all ${
                  icon === option.value
                    ? 'bg-terracotta text-bone ring-2 ring-terracotta ring-offset-2'
                    : 'bg-sage-light text-forest hover:bg-sage'
                }`}
              >
                <Icon icon={option.icon} className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest mb-2">Color</label>
          <div className="flex gap-3">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${option.bg} ${
                  color === option.value
                    ? 'ring-2 ring-terracotta ring-offset-2 text-forest'
                    : 'text-forest/70 hover:text-forest'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-sage/20 pt-4">
          <h4 className="text-sm font-medium text-forest mb-3">Portfolio Lead</h4>
          <div className="space-y-3">
            <FormInput
              type="text"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
              placeholder="Lead name"
              required
            />
            <FormInput
              type="email"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
              placeholder="Lead email (optional)"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Create Portfolio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
