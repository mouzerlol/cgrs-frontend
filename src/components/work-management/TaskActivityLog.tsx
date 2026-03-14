import React from 'react';
import { Task, BoardMember, TaskActivity } from '@/types/work-management';
import { formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';

interface TaskActivityLogProps {
  task: Task;
}

/**
 * Displays a list of activities related to a task.
 * Currently uses mock data derived from task properties since a real activity log isn't in types yet.
 */
export default function TaskActivityLog({ task }: TaskActivityLogProps) {
  const getAuthor = (userId: string): BoardMember | undefined => {
    return mockData.members.find((m: any) => m.id === userId);
  };

  const activities: TaskActivity[] = task.activity && task.activity.length > 0
    ? task.activity
    : [
        {
          id: '1',
          activityType: 'task_created',
          actorId: task.reporter,
          actorName: task.reporterName || 'Unknown User',
          actorAvatarUrl: task.reporterAvatarUrl,
          message: 'Created this task',
          createdAt: task.createdAt,
        },
        ...(task.updatedAt
          ? [
              {
                id: '2',
                activityType: 'status_changed',
                actorId: task.assignee || task.reporter,
                actorName: task.assigneeName || task.reporterName || 'Unknown User',
                actorAvatarUrl: task.assigneeAvatarUrl || task.reporterAvatarUrl,
                message: `Changed status to ${task.status}`,
                createdAt: task.updatedAt,
              } satisfies TaskActivity,
            ]
          : []),
      ];

  return (
    <div className="space-y-6 mt-4">
      {activities.length > 0 ? (
        <div className="relative before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-sage/20">
          <div className="space-y-8">
            {activities.map((activity) => {
              const user = activity.actorId ? getAuthor(activity.actorId) : undefined;
              const actorName = activity.actorName || user?.name || 'Unknown User';
              const actorAvatar = activity.actorAvatarUrl || user?.avatar;
              return (
                <div key={activity.id} className="relative flex gap-4 pl-1">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-sage/30 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {actorAvatar ? (
                      <img src={actorAvatar} alt={actorName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] font-bold text-forest/40 uppercase">
                        {actorName.substring(0, 2) || '??'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm text-forest/80">
                      <span className="font-semibold text-forest">{actorName}</span>{' '}
                      {activity.message}
                    </div>
                    <div className="text-xs text-forest/40 mt-1">
                      {formatRelativeDate(activity.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-sm text-forest/50 italic">No activity recorded yet.</p>
      )}
    </div>
  );
}
