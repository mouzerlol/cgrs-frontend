import React from 'react';
import { Task, BoardMember } from '@/types/work-management';
import { formatRelativeDate } from '@/lib/utils';
import mockData from '@/data/work-management.json';

interface TaskActivityLogProps {
  task: Task;
}

interface ActivityItem {
  id: string;
  type: 'status_change' | 'priority_change' | 'comment_added' | 'task_created';
  userId: string;
  timestamp: string;
  details: {
    from?: string;
    to?: string;
    content?: string;
  };
}

/**
 * Displays a list of activities related to a task.
 * Currently uses mock data derived from task properties since a real activity log isn't in types yet.
 */
export default function TaskActivityLog({ task }: TaskActivityLogProps) {
  const getAuthor = (userId: string): BoardMember | undefined => {
    return mockData.members.find((m: any) => m.id === userId);
  };

  // Generating mock activity based on task metadata
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_created',
      userId: task.reporter,
      timestamp: task.createdAt,
      details: {}
    }
  ];

  if (task.updatedAt) {
    activities.unshift({
      id: '2',
      type: 'status_change',
      userId: task.assignee || task.reporter,
      timestamp: task.updatedAt,
      details: { to: task.status }
    });
  }

  return (
    <div className="space-y-6 mt-4">
      {activities.length > 0 ? (
        <div className="relative before:absolute before:inset-0 before:left-[15px] before:w-px before:bg-sage/20">
          <div className="space-y-8">
            {activities.map((activity) => {
              const user = getAuthor(activity.userId);
              return (
                <div key={activity.id} className="relative flex gap-4 pl-1">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-white border border-sage/30 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-[10px] font-bold text-forest/40 uppercase">
                        {user?.name?.substring(0, 2) || '??'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="text-sm text-forest/80">
                      <span className="font-semibold text-forest">{user?.name || 'Unknown User'}</span>{' '}
                      {activity.type === 'task_created' && 'created this task'}
                      {activity.type === 'status_change' && (
                        <>
                          changed status to <span className="font-medium text-terracotta">{activity.details.to}</span>
                        </>
                      )}
                    </div>
                    <div className="text-xs text-forest/40 mt-1">
                      {formatRelativeDate(activity.timestamp)}
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
