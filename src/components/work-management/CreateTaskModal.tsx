import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Task, TaskPriority, TaskStatus, TaskLocation } from '@/types/work-management';
import { generateTaskId } from '@/lib/work-management';
import PrioritySelector from './PrioritySelector';
import TagInput from './TagInput';
import TaskLocationPicker from './TaskLocationPicker';
import { ImageUploader } from '@/components/discussions/ThreadForm/ImageUploader';
import mockData from '@/data/work-management.json';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus | null;
  onSubmit: (task: Task) => void;
}

export default function CreateTaskModal({ isOpen, onClose, defaultStatus, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [assignee, setAssignee] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [showLocation, setShowLocation] = useState(false);
  const [location, setLocation] = useState<TaskLocation | undefined>();
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setTags([]);
      setDueDate('');
      setShowLocation(false);
      setLocation(undefined);
      setImages([]);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const newTask: Task = {
      id: generateTaskId(),
      title: title.trim(),
      description: description.trim(),
      status: defaultStatus || 'todo',
      priority,
      assignee: assignee || undefined,
      reporter: mockData.members[0].id, // Mocking current user
      tags,
      images: images.map((f, i) => ({
        id: `img-${i}`,
        url: URL.createObjectURL(f),
        thumbnail: URL.createObjectURL(f),
        alt: f.name
      })),
      location,
      createdAt: new Date().toISOString(),
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
    };

    onSubmit(newTask);
    onClose();
  };

  const members = mockData.members.map((m: any) => ({ label: m.name, value: m.id }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Create Task" className="overflow-y-auto max-h-[90vh]">
      <form onSubmit={handleSubmit} className="space-y-5 mt-4">
        {error && <div className="text-terracotta text-sm mb-4 bg-terracotta/10 p-3 rounded">{error}</div>}

        <div>
          <label htmlFor="task-title" className="font-body text-sm font-medium text-forest mb-1 block">Title *</label>
          <input
            id="task-title"
            name="title"
            autoComplete="off"
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border border-sage/30 rounded-lg px-3 py-2 font-body text-sm focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all"
            placeholder="What needs to be done?"
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="task-description" className="font-body text-sm font-medium text-forest mb-1 block">Description</label>
          <textarea
            id="task-description"
            name="description"
            autoComplete="off"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full border border-sage/30 rounded-lg px-3 py-2 font-body text-sm focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none min-h-[100px] resize-y transition-all"
            placeholder="Add more details…"
          />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-forest mb-2 block">Priority</label>
          <PrioritySelector value={priority} onChange={setPriority} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-assignee" className="font-body text-sm font-medium text-forest mb-1 block">Assignee</label>
            <select
              id="task-assignee"
              name="assignee"
              autoComplete="off"
              value={assignee}
              onChange={e => setAssignee(e.target.value)}
              className="w-full border border-sage/30 rounded-lg px-3 py-2 font-body text-sm focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all"
            >
              <option value="">Unassigned</option>
              {members.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="task-due-date" className="font-body text-sm font-medium text-forest mb-1 block">Due Date</label>
            <input
              id="task-due-date"
              name="dueDate"
              autoComplete="off"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-full border border-sage/30 rounded-lg px-3 py-2 font-body text-sm focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="font-body text-sm font-medium text-forest mb-1 block">Tags</label>
          <TagInput tags={tags} onChange={setTags} />
        </div>

        <div>
          <label className="font-body text-sm font-medium text-forest mb-1 block">Images</label>
          <ImageUploader value={images} onChange={setImages} />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowLocation(!showLocation)}
            className="font-body text-sm font-medium text-terracotta hover:underline"
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
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button variant="primary" type="submit">Create Task</Button>
        </div>
      </form>
    </Modal>
  );
}
