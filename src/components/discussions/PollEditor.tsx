'use client';

import { useState, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';
import type { Poll } from '@/types';
import Button from '@/components/ui/Button';

interface PollEditorProps {
  poll: Poll | null | undefined;
  onChange: (poll: Partial<Poll> & { options: Array<{ id?: string; text: string; votes: number; voters: string[] }> }) => void;
  disabled?: boolean;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

/**
 * PollEditor - Editable poll options editor.
 * Used in ThreadEditModal for editing existing polls or creating new ones.
 */
export function PollEditor({ poll, onChange, disabled = false }: PollEditorProps) {
  const [options, setOptions] = useState(
    poll?.options ?? [
      { id: 'new-1', text: '', votes: 0, voters: [] },
      { id: 'new-2', text: '', votes: 0, voters: [] },
    ],
  );
  const [allowMultiple, setAllowMultiple] = useState(poll?.allowMultiple ?? false);

  const handleOptionChange = useCallback(
    (index: number, text: string) => {
      const newOptions = [...options];
      newOptions[index] = { ...newOptions[index], text };
      setOptions(newOptions);
      onChange({ ...poll, options: newOptions, allowMultiple });
    },
    [options, onChange, poll, allowMultiple],
  );

  const handleAddOption = useCallback(() => {
    if (options.length >= MAX_OPTIONS) return;
    const newOptions = [...options, { id: `new-${Date.now()}`, text: '', votes: 0, voters: [] }];
    setOptions(newOptions);
    onChange({ ...poll, options: newOptions, allowMultiple });
  }, [options, onChange, poll, allowMultiple]);

  const handleRemoveOption = useCallback(
    (index: number) => {
      if (options.length <= MIN_OPTIONS) return;
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      onChange({ ...poll, options: newOptions, allowMultiple });
    },
    [options, onChange, poll, allowMultiple],
  );

  const handleAllowMultipleChange = useCallback(
    (checked: boolean) => {
      setAllowMultiple(checked);
      onChange({ ...poll, options, allowMultiple: checked });
    },
    [onChange, poll, options],
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-forest">Poll Options</label>
        <label className="flex items-center gap-2 text-sm text-forest/70">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={(e) => handleAllowMultipleChange(e.target.checked)}
            disabled={disabled}
            className="rounded border-sage/30 text-forest focus:ring-forest"
          />
          Allow multiple votes
        </label>
      </div>

      <div className="space-y-2">
        {options.map((option, index) => (
          <div key={option.id ?? index} className="flex items-center gap-2">
            <input
              type="text"
              value={option.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
              disabled={disabled}
              className="flex-1 w-full p-md bg-white border border-sage rounded-xl text-base text-forest font-body transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10 placeholder:text-forest/50"
            />
            {options.length > MIN_OPTIONS && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveOption(index)}
                disabled={disabled}
                aria-label="Remove option"
              >
                <Icon icon="lucide:x" className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {options.length < MAX_OPTIONS && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={disabled}
          className="text-forest/70 border-sage/30 hover:border-forest"
        >
          <Icon icon="lucide:plus" className="w-4 h-4 mr-1" />
          Add Option
        </Button>
      )}
    </div>
  );
}

export default PollEditor;
