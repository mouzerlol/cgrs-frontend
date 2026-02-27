'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, X, Check, BarChart2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PollBuilderProps {
  value?: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  };
  onChange: (value: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  } | null) => void;
  /** Maximum number of poll options allowed */
  maxOptions?: number;
  /** Whether to show the poll builder in collapsed state initially */
  startCollapsed?: boolean;
}

/**
 * Poll builder component for creating polls in new discussion threads.
 *
 * Features:
 * - Add/remove poll options (min 2, max configurable)
 * - Toggle between single and multiple choice
 * - Character limits with counters
 * - Validation feedback
 *
 * Design: Organic/Garden community aesthetic matching the forum theme.
 */
export function PollBuilder({
  value,
  onChange,
  maxOptions = 6,
  startCollapsed = true,
}: PollBuilderProps) {
  const [question, setQuestion] = useState(value?.question || '');
  const [options, setOptions] = useState<string[]>(value?.options || ['', '']);
  const [allowMultiple, setAllowMultiple] = useState(value?.allowMultiple || false);
  const [isExpanded, setIsExpanded] = useState(!startCollapsed || !!value?.question);
  const [focusedOption, setFocusedOption] = useState<number | null>(null);

  // Sync state changes to parent via useEffect (fixes the async state update bug)
  useEffect(() => {
    const validOptions = options.filter(o => o.trim());

    if (!question.trim() || validOptions.length < 2) {
      // Only call onChange(null) if we currently have a value
      // This prevents infinite loops when value is already null
      if (value !== null && value !== undefined) {
        onChange(null);
      }
      return;
    }

    // Only update if values actually changed
    const newValue = {
      question: question.trim(),
      options: validOptions,
      allowMultiple,
    };

    const hasChanged =
      value?.question !== newValue.question ||
      value?.allowMultiple !== newValue.allowMultiple ||
      JSON.stringify(value?.options) !== JSON.stringify(newValue.options);

    if (hasChanged) {
      onChange(newValue);
    }
  }, [question, options, allowMultiple, onChange, value]);

  const handleQuestionChange = useCallback((q: string) => {
    setQuestion(q);
  }, []);

  const handleOptionChange = useCallback((index: number, opt: string) => {
    setOptions(prev => {
      const newOptions = [...prev];
      newOptions[index] = opt;
      return newOptions;
    });
  }, []);

  const addOption = useCallback(() => {
    if (options.length >= maxOptions) return;
    setOptions(prev => [...prev, '']);
    // Focus the new option after render
    setTimeout(() => setFocusedOption(options.length), 0);
  }, [options.length, maxOptions]);

  const removeOption = useCallback((index: number) => {
    if (options.length <= 2) return;
    setOptions(prev => prev.filter((_, i) => i !== index));
  }, [options.length]);

  const toggleMultiple = useCallback(() => {
    setAllowMultiple(prev => !prev);
  }, []);

  const clearPoll = useCallback(() => {
    setQuestion('');
    setOptions(['', '']);
    setAllowMultiple(false);
    setIsExpanded(false);
    onChange(null);
  }, [onChange]);

  const validOptionsCount = options.filter(o => o.trim()).length;
  const isValid = question.trim().length > 0 && validOptionsCount >= 2;
  const canAddMore = options.length < maxOptions;

  // Collapsed state - show "Add a poll" button
  if (!isExpanded) {
    return (
      <div className="p-md">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="group flex items-center gap-md w-full p-md bg-gradient-to-br from-sage-light to-sage/30 border-2 border-dashed border-sage rounded-xl cursor-pointer transition-all duration-[250ms] ease-out-custom min-h-[72px] hover:border-terracotta hover:from-terracotta/5 hover:to-sage-light"
        >
          <div className="w-11 h-11 flex items-center justify-center bg-bone rounded-[10px] text-terracotta shrink-0">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="flex-1 flex flex-col items-start gap-0.5">
            <span className="font-semibold text-forest text-base">Add a poll</span>
            <span className="text-sm text-forest/60">
              Let the community vote on options
            </span>
          </div>
          <Plus className="w-5 h-5 text-terracotta opacity-60 transition-all duration-[250ms] ease-out-custom group-hover:opacity-100 group-hover:rotate-90" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-sage-light rounded-xl p-md border border-sage',
        isValid && 'border-terracotta'
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-md">
        <div className="flex items-center gap-sm">
          <BarChart2 className="w-5 h-5 text-terracotta" />
          <h4 className="font-display text-lg font-semibold text-forest">Create Poll</h4>
        </div>
        <button
          type="button"
          onClick={clearPoll}
          className="w-9 h-9 flex items-center justify-center bg-transparent border-none rounded-lg text-forest/50 cursor-pointer transition-all duration-[250ms] ease-out-custom hover:opacity-100 hover:bg-terracotta/10 hover:text-terracotta"
          aria-label="Remove poll"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Input */}
      <div className="relative mb-md">
        <label htmlFor="poll-question" className="flex items-center gap-xs text-sm font-semibold text-forest mb-xs">
          Question
        </label>
        <div className="relative">
          <input
            id="poll-question"
            type="text"
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="What would you like to ask the community?"
            maxLength={200}
            className="w-full py-sm px-md pr-20 bg-white border border-sage rounded-lg text-base text-forest transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta"
            aria-describedby="poll-question-count"
          />
          <span
            id="poll-question-count"
            className={cn(
              'absolute right-sm top-1/2 -translate-y-1/2 text-xs text-forest/50',
              question.length > 180 && 'text-terracotta/80',
              question.length >= 200 && 'text-terracotta font-semibold'
            )}
          >
            {question.length}/200
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-sm mb-md">
        <label className="flex items-center gap-xs text-sm font-semibold text-forest mb-xs">
          Options
          <span className="font-normal opacity-50">
            ({validOptionsCount} of {options.length})
          </span>
        </label>

        <div className="flex flex-col gap-sm">
          {options.map((option, index) => (
            <div
              key={index}
              className={cn(
                'flex gap-sm items-center',
                focusedOption === index && 'z-[1]'
              )}
            >
              <div className="text-forest/30 cursor-grab p-xs -m-xs" aria-hidden="true">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="w-6 h-6 flex items-center justify-center bg-sage rounded-md text-xs font-semibold text-forest shrink-0">
                {index + 1}
              </div>

              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                onFocus={() => setFocusedOption(index)}
                onBlur={() => setFocusedOption(null)}
                placeholder={`Option ${index + 1}`}
                maxLength={100}
                className="flex-1 py-sm bg-white border border-sage rounded-lg text-sm text-forest transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta"
                aria-label={`Poll option ${index + 1}`}
                ref={(el) => {
                  if (focusedOption === index && el) {
                    el.focus();
                  }
                }}
              />

              <span className={cn(
                'text-xs text-forest/40 shrink-0 min-w-[48px] text-right',
                option.length > 80 && 'text-terracotta/80',
                option.length >= 100 && 'text-terracotta font-semibold'
              )}>
                {option.length}/100
              </span>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="w-8 h-8 flex items-center justify-center bg-transparent border-none rounded text-terracotta cursor-pointer transition-colors duration-[250ms] ease-out-custom shrink-0 hover:bg-terracotta/10"
                  aria-label={`Remove option ${index + 1}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Option Button */}
        {canAddMore && (
          <button
            type="button"
            onClick={addOption}
            className="flex items-center gap-xs py-sm px-md bg-white border border-dashed border-sage rounded-lg text-sm text-forest cursor-pointer transition-all duration-[250ms] ease-out-custom hover:border-terracotta hover:text-terracotta"
          >
            <Plus className="w-4 h-4" />
            Add option
            <span className="text-xs text-forest/50 ml-auto">
              ({options.length}/{maxOptions})
            </span>
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="pt-md border-t border-sage mt-sm">
        <label className="flex items-center gap-sm cursor-pointer text-sm text-forest">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={toggleMultiple}
            className="sr-only"
          />
          <span className={cn(
            'w-5 h-5 border-2 border-sage rounded flex items-center justify-center transition-all duration-[250ms] ease-out-custom shrink-0',
            allowMultiple && 'bg-terracotta border-terracotta text-bone'
          )}>
            {allowMultiple && <Check className="w-3 h-3" />}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-forest">Allow multiple choices</span>
            <span className="text-xs text-forest/60">
              Voters can select more than one option
            </span>
          </div>
        </label>
      </div>

      {/* Validation Hint */}
      {!isValid && (
        <div className="flex items-center gap-sm py-sm px-md bg-terracotta/[0.08] rounded-lg mt-md text-sm text-terracotta">
          <div className="w-5 h-5 flex items-center justify-center bg-terracotta text-bone rounded-full text-xs font-bold shrink-0">!</div>
          <span>
            {!question.trim()
              ? 'Add a question to complete your poll'
              : validOptionsCount < 2
                ? `Add ${2 - validOptionsCount} more option${2 - validOptionsCount !== 1 ? 's' : ''} to complete your poll`
                : 'Complete your poll to include it in the thread'}
          </span>
        </div>
      )}

      {/* Valid State Indicator */}
      {isValid && (
        <div className="flex items-center gap-sm py-sm px-md bg-forest/[0.08] rounded-lg mt-md text-sm text-forest font-medium">
          <Check className="w-4 h-4" />
          <span>Poll ready to publish</span>
        </div>
      )}
    </div>
  );
}

export default PollBuilder;
