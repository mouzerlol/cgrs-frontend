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
          activity_type: 'task_created',
          actor_id: task.reporter,
          actor_name: task.reporter_name || 'Unknown User',
          actor_avatar_url: task.reporter_avatar_url,
          message: 'Created this task',
          created_at: task.created_at,
        },
        ...(task.updated_at
          ? [
              {
                id: '2',
                activity_type: 'status_changed',
                actor_id: task.assignee || task.reporter,
                actor_name: task.assignee_name || task.reporter_name || 'Unknown User',
                actor_avatar_url: task.assignee_avatar_url || task.reporter_avatar_url,
                message: `Changed status to ${task.status}`,
                created_at: task.updated_at,
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
              const user = activity.actor_id ? getAuthor(activity.actor_id) : undefined;
              const actorName = activity.actor_name || user?.name || 'Unknown User';
              const actorAvatar = activity.actor_avatar_url || user?.avatar;
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
                      {formatRelativeDate(activity.created_at)}
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
