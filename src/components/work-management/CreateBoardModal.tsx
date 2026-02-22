'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Board, BoardColor } from '@/types/work-management';

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (board: Omit<Board, 'id' | 'taskCount' | 'createdAt' | 'updatedAt'>) => void;
}

const colorOptions: { value: BoardColor; label: string; bg: string }[] = [
  { value: 'sage', label: 'Sage', bg: 'bg-sage-light' },
  { value: 'terracotta', label: 'Terracotta', bg: 'bg-[#FBEBE6]' },
  { value: 'forest', label: 'Forest', bg: 'bg-forest-light/20' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber/10' },
];

const iconOptions = ['🏢', '👥', '📋', '🏠', '🌳', '🔧', '📅', '💼', '🎯', '📊'];

export default function CreateBoardModal({ isOpen, onClose, onSubmit }: CreateBoardModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<BoardColor>('sage');
  const [icon, setIcon] = useState('📋');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim(),
      color,
      icon,
    });
    onClose();
    setName('');
    setDescription('');
    setColor('sage');
    setIcon('📋');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Board" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="board-name" className="block text-sm font-medium text-forest mb-2">
            Board Name
          </label>
          <input
            id="board-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Maintenance Requests"
            className="w-full px-4 py-3 rounded-lg border border-sage/30 bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="board-description" className="block text-sm font-medium text-forest mb-2">
            Description
          </label>
          <textarea
            id="board-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this board for?"
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-sage/30 bg-white text-forest placeholder:text-forest/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent transition-all resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-forest mb-2">
            Icon
          </label>
          <div className="flex flex-wrap gap-2">
            {iconOptions.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${
                  icon === emoji
                    ? 'bg-terracotta text-bone ring-2 ring-terracotta ring-offset-2'
                    : 'bg-sage-light text-forest hover:bg-sage'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-forest mb-2">
            Color
          </label>
          <div className="flex gap-3">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColor(option.value)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  option.bg
                } ${
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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            Create Board
          </Button>
        </div>
      </form>
    </Modal>
  );
}
