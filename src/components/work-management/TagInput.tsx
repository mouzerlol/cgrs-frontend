import { useState } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  readonly?: boolean;
}

export default function TagInput({ tags, onChange, readonly = false }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        onChange([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {tags.map(tag => (
        <span key={tag} className="bg-sage-light text-forest/70 text-xs px-2 py-1 rounded-full flex items-center gap-1">
          {tag}
          {!readonly && (
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-terracotta focus:outline-none">
              <X className="w-3 h-3" strokeWidth={1.5} />
            </button>
          )}
        </span>
      ))}
      {!readonly && (
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags..." : ""}
          className="text-sm border-none outline-none focus:ring-0 p-1 w-24 flex-1 bg-transparent min-w-[80px]"
        />
      )}
    </div>
  );
}
