'use client';

import { useState } from 'react';

interface TitleInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TitleInput({ value, onChange, error }: TitleInputProps) {
  const [showHint, setShowHint] = useState(false);
  const MAX_LENGTH = 150;
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="title-input">
      <label htmlFor="title" className="title-label">
        Title <span className="text-terracotta">*</span>
      </label>

      <div className="title-input-wrapper">
        <input
          type="text"
          id="title"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowHint(true)}
          onBlur={() => setShowHint(false)}
          placeholder="What's your discussion about?"
          maxLength={MAX_LENGTH}
          className={`title-field ${error ? 'title-field-error' : ''}`}
        />

        <div className={`title-char-count ${remaining < 20 ? 'title-char-count-warning' : ''}`}>
          {remaining}
        </div>
      </div>

      {error && <p className="title-error">{error}</p>}

      {showHint && !error && (
        <div className="title-hint">
          <p>Be specific and concise. A good title helps others find your discussion.</p>
          <p className="title-hint-examples">
            <strong>Good:</strong> "Best coffee shops near Mangere Bridge?"
            <br />
            <strong>Avoid:</strong> "I have a question"
          </p>
        </div>
      )}
    </div>
  );
}
