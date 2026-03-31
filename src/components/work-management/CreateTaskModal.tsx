'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { FormTextarea } from '@/components/ui/FormTextarea';
import { FormSelect } from '@/components/ui/FormSelect';
import type { CreateTaskFormValues, TaskImage, TaskLocation, TaskPriority, TaskStatus } from '@/types/work-management';
import PrioritySelector from './PrioritySelector';
import TagInput from './TagInput';
import TaskLocationPicker from './TaskLocationPicker';
import TaskImageGallery from './TaskImageGallery';
import { useMembers } from '@/hooks/useAuthorization';
import { memberDisplayName } from '@/lib/member-display';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus | null;
  onSubmit: (values: CreateTaskFormValues) => void;
  isSubmitting?: boolean;
  submitError?: string | null;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  defaultStatus,
  onSubmit,
  isSubmitting = false,
  submitError = null,
}: CreateTaskModalProps) {
  const { data: members = [], isLoading: membersLoading } = useMembers();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assigneeUserId, setAssigneeUserId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState<TaskLocation | undefined>();
  const [taskImages, setTaskImages] = useState<TaskImage[]>([]);
  const [assetUploadError, setAssetUploadError] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssigneeUserId('');
      setTags([]);
      setDueDate('');
      setShowLocation(false);
      setLocation(undefined);
      setTaskImages([]);
      setAssetUploadError(null);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      status: defaultStatus || 'todo',
      assigneeUserId,
      tags,
      dueDate,
      location: showLocation ? location : undefined,
      images: taskImages.length ? taskImages : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Create Task" className="overflow-y-auto max-h-[90vh]">
      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        {(error || submitError) && (
          <div className="text-terracotta text-sm mb-4 bg-terracotta/10 p-3 rounded">
            {error || submitError}
          </div>
        )}

        <FormInput
          label="Title *"
          name="title"
          autoComplete="off"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
          disabled={isSubmitting}
        />

        <FormTextarea
          label="Description"
          name="description"
          autoComplete="off"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="min-h-[100px]"
          placeholder="Add more details..."
          disabled={isSubmitting}
        />

        <div>
          <label className="font-body text-sm font-medium text-forest mb-2 block">Priority</label>
          <PrioritySelector value={priority} onChange={setPriority} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Assignee"
            name="assignee"
            autoComplete="off"
            value={assigneeUserId}
            onChange={e => setAssigneeUserId(e.target.value)}
            disabled={isSubmitting || membersLoading}
          >
            <option value="">{membersLoading ? 'Loading...' : 'Unassigned'}</option>
            {members.map(m => (
              <option key={m.id} value={m.user_id}>{memberDisplayName(m)}</option>
            ))}
          </FormSelect>
          <FormInput
            label="Due Date"
            name="dueDate"
            autoComplete="off"
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-forest mb-1 block">Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div className="space-y-1.5">
          <label className="font-body text-sm font-medium text-forest block">Photos (optional)</label>
          {assetUploadError && (
            <div className="text-terracotta text-sm bg-terracotta/10 p-2 rounded flex justify-between gap-2">
              <span>{assetUploadError}</span>
              <button type="button" className="underline shrink-0" onClick={() => setAssetUploadError(null)}>
                Dismiss
              </button>
            </div>
          )}
          <TaskImageGallery
            images={taskImages}
            onChange={setTaskImages}
            maxImages={8}
            onUploadError={(msg) => setAssetUploadError(msg)}
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowLocation(!showLocation)}
            className="font-body text-sm font-medium text-terracotta hover:underline"
            disabled={isSubmitting}
          >
            {showLocation ? '- Remove Location' : '+ Add Location'}
          </button>
          {showLocation && (
            <div className="mt-2">
              <TaskLocationPicker location={location} onChange={setLocation} />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-sage/20">
          <Button variant="outline" onClick={onClose} type="button" disabled={isSubmitting}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={isSubmitting} className="gap-2">
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating...
              </>
            ) : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
