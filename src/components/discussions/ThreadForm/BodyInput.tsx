'use client';

interface BodyInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function BodyInput({ value, onChange, error }: BodyInputProps) {
  const MAX_LENGTH = 2000;
  const remaining = MAX_LENGTH - value.length;

  return (
    <div className="body-input">
      <label htmlFor="body" className="body-label">
        Body <span className="body-optional">(optional)</span>
      </label>

      <textarea
        id="body"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Provide more details about your discussion. You can use plain text formatting."
        rows={6}
        maxLength={MAX_LENGTH}
        className={`body-field ${error ? 'body-field-error' : ''}`}
      />

      <div className="body-footer">
        <span className={`body-char-count ${remaining < 200 ? 'body-char-count-warning' : ''}`}>
          {remaining} characters remaining
        </span>
      </div>

      {error && <p className="body-error">{error}</p>}
    </div>
  );
}
