import Modal from '@/components/ui/Modal';
import { Task } from '@/types/work-management';
import InlineEditField from './InlineEditField';
import PriorityIndicator from './PriorityIndicator';
import TagInput from './TagInput';
import TaskLocationPicker from './TaskLocationPicker';
import TaskImageGallery from './TaskImageGallery';
import TaskComments from './TaskComments';
import { BOARD_COLUMNS, PRIORITY_CONFIG } from '@/lib/work-management';
import mockData from '@/data/work-management.json';
import { formatRelativeDate } from '@/lib/utils';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (updatedTask: Task) => void;
}

export default function TaskDetailModal({ isOpen, onClose, task, onUpdate }: TaskDetailModalProps) {
  if (!task) return null;

  const handleChange = (field: keyof Task, value: any) => {
    onUpdate({ ...task, [field]: value });
  };

  const members = mockData.members.map(m => ({ label: m.name, value: m.id }));
  
  const assignee = mockData.members.find((m: any) => m.id === task.assignee);
  const reporter = mockData.members.find((m: any) => m.id === task.reporter);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      position="right"
      size="2xl" 
      className="p-0 border-l border-sage/20"
    >
      <div className="flex flex-col h-full bg-bone/50">
        {/* Header Section */}
        <div className="p-6 pb-4 bg-white border-b border-sage/10 shrink-0">
          <InlineEditField
            value={task.title}
            onSave={v => handleChange('title', v)}
            textClassName="font-display text-2xl font-semibold text-forest leading-tight"
            className="mb-4"
          />
          <div className="flex flex-wrap gap-4 items-center text-sm text-forest/70">
            <div className="flex items-center gap-2">
              <span className="font-medium uppercase tracking-wider text-[10px]">Status:</span>
              <InlineEditField
                type="select"
                value={task.status}
                onSave={v => handleChange('status', v)}
                options={BOARD_COLUMNS.map(c => ({ label: c.title, value: c.id }))}
                textClassName="font-medium text-forest"
              />
            </div>
            <div className="w-px h-4 bg-sage/30"></div>
            <div className="flex items-center gap-2">
              <span className="font-medium uppercase tracking-wider text-[10px]">Priority:</span>
              <div className="flex items-center gap-1.5">
                <PriorityIndicator priority={task.priority as any} showLabel={false} />
                <InlineEditField
                  type="select"
                  value={task.priority}
                  onSave={v => handleChange('priority', v)}
                  options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))}
                  textClassName="text-forest"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Top Attributes */}
          <div className="grid grid-cols-2 gap-6 bg-white p-4 rounded-xl border border-sage/10 shadow-sm">
            <div>
              <h4 className="font-display text-xs text-forest/50 uppercase tracking-wider mb-2">Assignee</h4>
              <div className="flex items-center gap-3">
                {assignee ? (
                  <img src={assignee.avatar} alt={assignee.name} width={32} height={32} loading="lazy" className="w-8 h-8 rounded-full object-cover border border-sage/30" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sage-light flex items-center justify-center text-forest/40 text-xs font-medium">?</div>
                )}
                <InlineEditField
                  type="select"
                  value={task.assignee || ''}
                  onSave={v => handleChange('assignee', v)}
                  options={members}
                  textClassName="text-sm font-medium"
                  placeholder="Unassigned"
                />
              </div>
            </div>

            <div>
              <h4 className="font-display text-xs text-forest/50 uppercase tracking-wider mb-2">Tags</h4>
              <TagInput 
                tags={task.tags} 
                onChange={v => handleChange('tags', v)} 
              />
            </div>
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-xl border border-sage/10 shadow-sm">
            <h4 className="font-display text-sm font-medium text-forest mb-3">Description</h4>
            <InlineEditField
              type="textarea"
              value={task.description}
              onSave={v => handleChange('description', v)}
              textClassName="font-body text-sm text-forest/80 leading-relaxed whitespace-pre-wrap min-h-[100px]"
              placeholder="Add a more detailed description…"
            />
          </div>

          {/* Location & Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-xl border border-sage/10 shadow-sm">
              <h4 className="font-display text-sm font-medium text-forest mb-3">Location</h4>
              <TaskLocationPicker 
                location={task.location} 
                onChange={v => handleChange('location', v)} 
              />
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-sage/10 shadow-sm">
              <h4 className="font-display text-sm font-medium text-forest mb-3">Images</h4>
              <TaskImageGallery 
                images={task.images || []} 
                onChange={v => handleChange('images', v)} 
              />
            </div>
          </div>
          
          {/* Comments */}
          <div className="bg-white p-4 rounded-xl border border-sage/10 shadow-sm">
            <h4 className="font-display text-sm font-medium text-forest mb-3 flex items-center justify-between">
              Activity
              <span className="text-xs font-normal text-forest/50">Created {formatRelativeDate(task.createdAt)} by {reporter?.name || 'Unknown'}</span>
            </h4>
            <TaskComments 
              comments={task.comments || []} 
              onChange={v => handleChange('comments', v)} 
            />
          </div>

        </div>
      </div>
    </Modal>
  );
}
