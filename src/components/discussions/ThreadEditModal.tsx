'use client';

import { useState, useCallback, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { Thread, Poll } from '@/types';
import PollEditor from './PollEditor';

interface ThreadEditModalProps {
  thread: Thread;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    body: string;
    imageIds?: string[];
    pollOptions?: string[];
    allowMultiple?: boolean;
    removePoll?: boolean;
  }) => Promise<void> | void;
  isSaving?: boolean;
  currentUserId?: string;
}

/**
 * ThreadEditModal - Modal for editing thread content (title, body, poll).
 * Shows Edit button only to the thread author.
 */
export function ThreadEditModal({
  thread,
  isOpen,
  onClose,
  onSave,
  isSaving = false,
  currentUserId,
}: ThreadEditModalProps) {
  const [title, setTitle] = useState(thread.title);
  const [body, setBody] = useState(thread.body ?? '');
  const [pollOptions, setPollOptions] = useState<string[]>([]);
  const [hasPoll, setHasPoll] = useState(!!thread.poll);
  const [allowMultiple, setAllowMultiple] = useState(thread.poll?.allowMultiple ?? false);
  const [removePoll, setRemovePoll] = useState(false);

  // Reset form when thread changes
  useEffect(() => {
    setTitle(thread.title);
    setBody(thread.body ?? '');
    setHasPoll(!!thread.poll);
    setAllowMultiple(thread.poll?.allowMultiple ?? false);
    setRemovePoll(false);
    if (thread.poll?.options) {
      setPollOptions(thread.poll.options.map((o) => o.text));
    }
  }, [thread]);

  const handleSave = useCallback(async () => {
    const data: {
      title: string;
      body: string;
      imageIds?: string[];
      pollOptions?: string[];
      allowMultiple?: boolean;
      removePoll?: boolean;
    } = { title, body };

    if (hasPoll && pollOptions.length >= 2) {
      data.pollOptions = pollOptions;
      data.allowMultiple = allowMultiple;
    }

    if (removePoll) {
      data.removePoll = true;
    }

    await onSave(data);
  }, [title, body, hasPoll, pollOptions, allowMultiple, removePoll, onSave]);

  const hasChanges =
    title !== thread.title ||
    body !== (thread.body ?? '') ||
    hasPoll !== !!thread.poll ||
    removePoll;

  const canSave = hasChanges && title.trim().length > 0 && (!hasPoll || pollOptions.filter((o) => o.trim()).length >= 2);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Thread" className="max-w-2xl">
      <div className="space-y-4 p-4">
        {/* Title */}
        <div className="space-y-2">
          <label htmlFor="edit-title" className="text-sm font-medium text-forest">
            Title
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Thread title"
            disabled={isSaving}
            maxLength={150}
            className="w-full p-md bg-white border border-sage rounded-xl text-base text-forest font-body transition-all duration-[250ms] ease-out-custom focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10 placeholder:text-forest/50"
          />
        </div>

        {/* Body */}
        <div className="space-y-2">
          <label htmlFor="edit-body" className="text-sm font-medium text-forest">
            Body
          </label>
          <textarea
            id="edit-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Thread content"
            disabled={isSaving}
            rows={6}
            maxLength={2000}
            className="w-full p-md bg-white border border-sage rounded-xl text-base text-forest font-body transition-all duration-[250ms] ease-out-custom resize-y min-h-[120px] focus:outline-none focus:border-terracotta focus:ring-[3px] focus:ring-terracotta/10 placeholder:text-forest/50"
          />
        </div>

        {/* Poll Section */}
        {thread.poll && (
          <div className="space-y-3 rounded-lg border border-sage/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-forest">Poll</span>
              {!removePoll && (
                <button
                  type="button"
                  onClick={() => setRemovePoll(true)}
                  className="text-sm text-red-600 hover:text-red-700"
                  disabled={isSaving}
                >
                  Remove Poll
                </button>
              )}
            </div>

            {removePoll ? (
              <p className="text-sm text-forest/70">
                Poll will be removed. Click cancel to undo.
                <button
                  type="button"
                  onClick={() => setRemovePoll(false)}
                  className="ml-2 text-forest underline"
                  disabled={isSaving}
                >
                  Undo
                </button>
              </p>
            ) : (
              <PollEditor
                poll={thread.poll}
                onChange={(poll) => {
                  setPollOptions(poll.options.map((o) => o.text));
                  setAllowMultiple(poll.allowMultiple ?? false);
                }}
                disabled={isSaving}
              />
            )}
          </div>
        )}

        {/* Add Poll Button (if no poll exists) */}
        {!thread.poll && !hasPoll && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setHasPoll(true)}
            disabled={isSaving}
            className="text-forest/70 border-sage/30"
          >
            <Icon icon="lucide:plus" className="w-4 h-4 mr-1" />
            Add Poll
          </Button>
        )}

        {/* New Poll */}
        {hasPoll && !thread.poll && (
          <div className="space-y-3 rounded-lg border border-sage/30 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-forest">New Poll</span>
              <button
                type="button"
                onClick={() => {
                  setHasPoll(false);
                  setPollOptions([]);
                }}
                className="text-sm text-red-600 hover:text-red-700"
                disabled={isSaving}
              >
                Remove
              </button>
            </div>
            <PollEditor
              poll={{
                id: '',
                question: '',
                options: pollOptions.length >= 2 ? pollOptions.map((t, i) => ({ id: String(i), text: t, votes: 0, voters: [] })) : [
                  { id: '1', text: '', votes: 0, voters: [] },
                  { id: '2', text: '', votes: 0, voters: [] },
                ],
                allowMultiple,
                isClosed: false,
                creatorId: '',
              }}
              onChange={(poll) => {
                setPollOptions(poll.options.map((o) => o.text));
                setAllowMultiple(poll.allowMultiple ?? false);
              }}
              disabled={isSaving}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-sage/20">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
            disabled={!canSave || isSaving}
          >
            {isSaving ? (
              <>
                <Icon icon="lucide:loader-2" className="w-4 h-4 mr-1 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon icon="lucide:save" className="w-4 h-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ThreadEditModal;
