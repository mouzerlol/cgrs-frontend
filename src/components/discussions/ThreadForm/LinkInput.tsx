'use client';

import { useState } from 'react';
import { Plus, X, Link as LinkIcon } from 'lucide-react';

interface LinkInputProps {
  value: { url: string; title?: string }[];
  onChange: (links: { url: string; title?: string }[]) => void;
}

export function LinkInput({ value, onChange }: LinkInputProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const addLink = () => {
    if (!url.trim()) return;

    const newLink = { url: url.trim(), title: title.trim() || undefined };
    onChange([...value, newLink]);
    setUrl('');
    setTitle('');
  };

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addLink();
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-medium text-forest">
        <LinkIcon className="w-4 h-4 inline-block mr-1" />
        Links <span className="opacity-60 font-normal">(optional)</span>
      </label>

      <div className="flex gap-sm items-center">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className="flex-1 py-sm px-md bg-white border border-sage rounded-lg text-sm text-forest transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Link title (optional)"
          className="flex-1 py-sm px-md bg-white border border-sage rounded-lg text-sm text-forest transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={!isValidUrl(url)}
          className="w-10 h-10 flex items-center justify-center bg-forest border-none rounded-lg text-white cursor-pointer transition-all duration-[250ms] ease-out-custom shrink-0 hover:bg-terracotta disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add link"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="flex flex-col gap-xs">
          {value.map((link, index) => (
            <div key={index} className="flex items-center gap-sm p-sm bg-sage-light rounded-lg">
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-forest">{link.title || link.url}</span>
                <span className="block text-xs text-forest/60 overflow-hidden text-ellipsis whitespace-nowrap">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="w-7 h-7 flex items-center justify-center bg-transparent border-none rounded text-terracotta cursor-pointer transition-colors duration-[250ms] ease-out-custom shrink-0 hover:bg-terracotta/10"
                aria-label="Remove link"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-forest/60">Add relevant links to support your discussion</p>
    </div>
  );
}
