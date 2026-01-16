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
      <div className="poll-builder-collapsed">
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="poll-builder-add-button"
        >
          <div className="poll-builder-add-icon">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div className="poll-builder-add-content">
            <span className="poll-builder-add-title">Add a poll</span>
            <span className="poll-builder-add-description">
              Let the community vote on options
            </span>
          </div>
          <Plus className="w-5 h-5 poll-builder-add-plus" />
        </button>
      </div>
    );
  }

  return (
    <div className={cn('poll-builder', isValid && 'poll-builder-active')}>
      {/* Header */}
      <div className="poll-builder-header">
        <div className="poll-builder-header-left">
          <BarChart2 className="w-5 h-5 text-terracotta" />
          <h4 className="font-display text-lg font-semibold text-forest">Create Poll</h4>
        </div>
        <button
          type="button"
          onClick={clearPoll}
          className="poll-builder-close"
          aria-label="Remove poll"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Question Input */}
      <div className="poll-question">
        <label htmlFor="poll-question" className="poll-input-label">
          Question
        </label>
        <div className="poll-question-wrapper">
          <input
            id="poll-question"
            type="text"
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="What would you like to ask the community?"
            maxLength={200}
            className="poll-question-input"
            aria-describedby="poll-question-count"
          />
          <span
            id="poll-question-count"
            className={cn(
              'poll-char-count',
              question.length > 180 && 'poll-char-count-warning',
              question.length >= 200 && 'poll-char-count-limit'
            )}
          >
            {question.length}/200
          </span>
        </div>
      </div>

      {/* Options */}
      <div className="poll-options">
        <label className="poll-input-label">
          Options
          <span className="poll-options-count">
            ({validOptionsCount} of {options.length})
          </span>
        </label>

        <div className="poll-options-list">
          {options.map((option, index) => (
            <div
              key={index}
              className={cn(
                'poll-option-row',
                focusedOption === index && 'poll-option-row-focused'
              )}
            >
              <div className="poll-option-grip" aria-hidden="true">
                <GripVertical className="w-4 h-4" />
              </div>

              <div className="poll-option-number">
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
                className="poll-option-input"
                aria-label={`Poll option ${index + 1}`}
                ref={(el) => {
                  if (focusedOption === index && el) {
                    el.focus();
                  }
                }}
              />

              <span className={cn(
                'poll-option-char-count',
                option.length > 80 && 'poll-char-count-warning',
                option.length >= 100 && 'poll-char-count-limit'
              )}>
                {option.length}/100
              </span>

              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="poll-option-remove"
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
            className="poll-add-option"
          >
            <Plus className="w-4 h-4" />
            Add option
            <span className="poll-add-option-hint">
              ({options.length}/{maxOptions})
            </span>
          </button>
        )}
      </div>

      {/* Settings */}
      <div className="poll-settings">
        <label className="poll-multiple-toggle">
          <input
            type="checkbox"
            checked={allowMultiple}
            onChange={toggleMultiple}
            className="sr-only"
          />
          <span className={cn(
            'poll-checkbox-custom',
            allowMultiple && 'poll-checkbox-custom-checked'
          )}>
            {allowMultiple && <Check className="w-3 h-3" />}
          </span>
          <div className="poll-toggle-content">
            <span className="poll-toggle-label">Allow multiple choices</span>
            <span className="poll-toggle-description">
              Voters can select more than one option
            </span>
          </div>
        </label>
      </div>

      {/* Validation Hint */}
      {!isValid && (
        <div className="poll-validation-hint">
          <div className="poll-validation-icon">!</div>
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
        <div className="poll-valid-indicator">
          <Check className="w-4 h-4" />
          <span>Poll ready to publish</span>
        </div>
      )}
    </div>
  );
}

export default PollBuilder;
