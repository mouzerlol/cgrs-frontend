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
    <div className="link-input">
      <label className="link-label">
        <LinkIcon className="w-4 h-4 inline-block mr-1" />
        Links <span className="link-optional">(optional)</span>
      </label>

      <div className="link-input-row">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="https://example.com"
          className="link-url-input"
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Link title (optional)"
          className="link-title-input"
        />
        <button
          type="button"
          onClick={addLink}
          disabled={!isValidUrl(url)}
          className="link-add-button"
          aria-label="Add link"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {value.length > 0 && (
        <div className="link-list">
          {value.map((link, index) => (
            <div key={index} className="link-item">
              <div className="link-item-content">
                <span className="link-item-title">{link.title || link.url}</span>
                <span className="link-item-url">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="link-item-remove"
                aria-label="Remove link"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="link-hint">Add relevant links to support your discussion</p>
    </div>
  );
}
