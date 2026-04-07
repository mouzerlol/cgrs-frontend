'use client';

import { useMemo, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Task } from '@/types/work-management';
import { PRIORITY_CONFIG } from '@/lib/work-management';
import mockData from '@/data/work-management.json';
import { MAP_CENTER } from '@/data/map-data';
import { cn } from '@/lib/utils';
import { SectionLabel } from '@/components/ui/SectionLabel';
import { memberDisplayName } from '@/lib/member-display';
import { useMembers } from '@/hooks/useAuthorization';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import InlineEditField, { type InlineEditFieldHandle } from './InlineEditField';
import PriorityIndicator from './PriorityIndicator';
import TagInput from './TagInput';
import TaskLocationPicker from './TaskLocationPicker';
import TaskImageGallery from './TaskImageGallery';
import TaskComments from './TaskComments';
import TaskActivityLog from './TaskActivityLog';
import { Dropdown } from '@/components/ui/Dropdown';
import { DeleteTaskDialog } from './DeleteTaskDialog';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  onUpdate: (updatedTask: Task) => void;
  onDelete?: (taskId: string) => void;
  /** R2 upload failures from the asset gallery (size, MIME, network). */
  onAssetUploadError?: (message: string) => void;
}

export default function TaskDetailModal({
  isOpen,
  onClose,
  task,
  onUpdate,
  onDelete,
  onAssetUploadError,
}: TaskDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const assigneeFieldRef = useRef<InlineEditFieldHandle>(null);
  const [assigneeFieldEditing, setAssigneeFieldEditing] = useState(false);

  const { data: apiMembers = [] } = useMembers();

  /** Assignee/reporter values are API `user_id` (UUID); mock JSON uses `m1`-style ids — merge both for dropdowns. */
  const assigneeSelectOptions = useMemo(() => {
    const fromApi = apiMembers.map((m) => ({ label: memberDisplayName(m), value: m.user_id }));
    const fromMock = mockData.members.map((m) => ({ label: m.name, value: m.id }));
    return [...fromApi, ...fromMock];
  }, [apiMembers]);

  if (!task) return null;

  const handleChange = (field: keyof Task, value: unknown) => {
    onUpdate({ ...task, [field]: value });
  };

  const handleDeleteSuccess = () => {
    if (onDelete) {
      onDelete(task.id);
    }
    onClose();
  };

  const mockAssignee = mockData.members.find((m: { id: string }) => m.id === task.assignee);
  const apiAssigneeMember = apiMembers.find((m) => m.user_id === task.assignee);
  const assigneeName =
    task.assignee_name ?? (apiAssigneeMember ? memberDisplayName(apiAssigneeMember) : mockAssignee?.name);
  const assigneeAvatarSrc =
    task.assignee_avatar_url ?? apiAssigneeMember?.user.avatar_url ?? mockAssignee?.avatar ?? null;

  const mockReporter = mockData.members.find((m: { id: string }) => m.id === task.reporter);
  const apiReporterMember = apiMembers.find((m) => m.user_id === task.reporter);
  const reporterName =
    task.reporter_name ?? (apiReporterMember ? memberDisplayName(apiReporterMember) : mockReporter?.name);
  const reporterAvatarSrc = task.reporter_avatar_url ?? apiReporterMember?.user.avatar_url ?? mockReporter?.avatar;
  const hasAssignee = Boolean(task.assignee);

  const handleAssigneeSave = (userId: string) => {
    const trimmed = userId.trim();
    if (!trimmed) {
      onUpdate({
        ...task,
        assignee: undefined,
        assignee_name: undefined,
        assignee_avatar_url: null,
      });
      return;
    }
    const member = apiMembers.find((m) => m.user_id === trimmed);
    const mockM = mockData.members.find((m: { id: string }) => m.id === trimmed);
    onUpdate({
      ...task,
      assignee: trimmed,
      assignee_name: member ? memberDisplayName(member) : mockM?.name,
      assignee_avatar_url: member?.user.avatar_url ?? mockM?.avatar ?? null,
    });
  };

  const actionMenuItems = [
    {
      label: 'Delete',
      onClick: () => setShowDeleteDialog(true),
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <DeleteTaskDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onSuccess={handleDeleteSuccess}
        taskTitle={task.title}
        taskId={task.id}
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        position="right"
        size="2xl"
        className="p-0 border-l border-sage/20 shadow-2xl"
      >
        <div className="flex flex-col h-full bg-sage-light/50 relative" data-testid="task-detail-modal">
          {/* Header Section */}
          <div className="p-5 pb-4 bg-forest-light border-b border-sage/10 shrink-0 relative">
            {/* Header actions: task menu (left) + close (right), same row */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <Dropdown
                trigger={
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Task actions"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                }
                items={actionMenuItems}
                align="right"
              />
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                {task.status.replace('_', ' ')}
              </Badge>
              <div className="w-1 h-1 rounded-full bg-white/40" />
              <div className="text-[10px] font-medium text-white/60 uppercase tracking-widest">
                Task ID: {task.id.toUpperCase()}
              </div>
            </div>

            <InlineEditField
              value={task.title}
              onSave={v => handleChange('title', v)}
              textClassName="font-display text-2xl font-semibold text-white leading-tight tracking-tight"
              className="mb-4"
            />

            <div className="flex flex-wrap gap-6 items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/60">Priority</span>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                  <PriorityIndicator priority={task.priority} showLabel={false} />
                  <InlineEditField
                    type="select"
                    value={task.priority}
                    onSave={v => handleChange('priority', v)}
                    options={Object.entries(PRIORITY_CONFIG).map(([k, v]) => ({ label: v.label, value: k }))}
                    textClassName="text-white font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-white/60">Reporter</span>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={reporterAvatarSrc}
                    alt={reporterName ?? 'Reporter'}
                    name={reporterName ?? ''}
                    size="xs"
                    className="ring-1 ring-white/20"
                  />
                  <span className="text-white font-medium">{reporterName ?? '—'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
            <div className="space-y-5">
              {/* Description Section */}
              <div className="space-y-1.5">
                <SectionLabel as="h4" variant="muted">Description</SectionLabel>
                <Card hover className="p-4">
                  <InlineEditField
                    type="textarea"
                    value={task.description}
                    onSave={v => handleChange('description', v)}
                    textClassName="font-body text-[14px] text-forest/80 leading-relaxed whitespace-pre-wrap min-h-[80px]"
                    placeholder="Add a more detailed description…"
                  />
                </Card>
              </div>

              {/* Assignee + Labels (left) / Location (right) */}
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <SectionLabel as="h4" variant="muted">Assignee</SectionLabel>
                    <div
                      className={cn(
                        'rounded-2xl outline-none',
                        !assigneeFieldEditing &&
                          'cursor-pointer focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2',
                      )}
                      role={assigneeFieldEditing ? undefined : 'button'}
                      tabIndex={assigneeFieldEditing ? -1 : 0}
                      aria-label="Edit assignee"
                      onClick={() => assigneeFieldRef.current?.startEditing()}
                      onKeyDown={e => {
                        if (assigneeFieldEditing) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          assigneeFieldRef.current?.startEditing();
                        }
                      }}
                    >
                      <Card
                        hover
                        className={cn(
                          'flex items-center gap-2.5 p-2.5',
                          !assigneeFieldEditing && 'pointer-events-none',
                        )}
                      >
                        {hasAssignee ? (
                          <Avatar
                            src={assigneeAvatarSrc}
                            alt={assigneeName ?? 'Assignee'}
                            name={assigneeName ?? ''}
                            size="sm"
                            className="ring-2 ring-bone"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-sage-light/30 flex items-center justify-center text-forest/30">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <InlineEditField
                            ref={assigneeFieldRef}
                            type="select"
                            value={task.assignee || ''}
                            onSave={handleAssigneeSave}
                            options={assigneeSelectOptions}
                            textClassName="text-sm font-semibold text-forest block truncate"
                            placeholder="Click to assign"
                            onEditModeChange={setAssigneeFieldEditing}
                          />
                          <span className="text-[10px] text-forest/40 uppercase font-bold tracking-tighter">Team Member</span>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <SectionLabel as="h4" variant="muted">Labels</SectionLabel>
                    <Card className="p-2.5 min-h-[58px] flex items-stretch">
                      <TagInput
                        tags={task.tags}
                        onChange={v => handleChange('tags', v)}
                      />
                    </Card>
                  </div>
                </div>

                {/* Location (right column) */}
                <div className="space-y-1.5">
                  <SectionLabel as="h4" variant="muted">Location</SectionLabel>
                  {task.location ? (
                    <Card className="p-1.5 overflow-hidden">
                      <div className="h-[180px]">
                        <TaskLocationPicker
                          location={task.location}
                          onChange={v => handleChange('location', v)}
                        />
                      </div>
                    </Card>
                  ) : (
                    <button
                      onClick={() => handleChange('location', { lat: MAP_CENTER[0], lng: MAP_CENTER[1] })}
                      className="w-full h-[180px] rounded-2xl border-2 border-dashed border-sage/20 bg-white/50 hover:bg-white hover:border-sage/40 transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <div className="p-3 rounded-full bg-sage-light group-hover:bg-sage-light/80 transition-colors">
                        <svg className="w-6 h-6 text-forest/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="text-sm font-semibold text-forest/60">Add Location</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assets - full width */}
              <div className="space-y-1.5">
                <SectionLabel as="h4" variant="muted">Assets</SectionLabel>
                <Card className="p-3">
                  <TaskImageGallery
                    images={task.images || []}
                    onChange={v => handleChange('images', v)}
                    onUploadError={onAssetUploadError}
                  />
                </Card>
              </div>

              {/* Comments & Activity Section */}
              <Card className="rounded-[24px] overflow-hidden shadow-lg">
                <div className="flex border-b border-sage/5 bg-bone/30 p-1 gap-1">
                  <button
                    onClick={() => setActiveTab('comments')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === 'comments'
                        ? "bg-white text-forest shadow-sm border border-sage/10"
                        : "text-forest/40 hover:text-forest/60 hover:bg-white/50"
                    )}
                  >
                    Comments {task.comments?.length ? `(${task.comments.length})` : ''}
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={cn(
                      "flex-1 py-2 px-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      activeTab === 'activity'
                        ? "bg-white text-forest shadow-sm border border-sage/10"
                        : "text-forest/40 hover:text-forest/60 hover:bg-white/50"
                    )}
                  >
                    Activity
                  </button>
                </div>

                <div className="p-6">
                  {activeTab === 'comments' ? (
                    <TaskComments taskId={task.id} comments={task.comments || []} />
                  ) : (
                    <TaskActivityLog task={task} />
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
