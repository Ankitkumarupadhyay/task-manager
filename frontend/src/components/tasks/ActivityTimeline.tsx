import { Activity } from '@/types/task';
import { formatRelative } from '@/utils/date';
import { formatActionLabel, getInitials, getAvatarBg } from '@/utils/formatters';
import { clsx } from 'clsx';

interface ActivityTimelineProps {
  activities: Activity[];
  isLoading?: boolean;
}

function getActionIcon(action: string): string {
  const icons: Record<string, string> = {
    task_created: '✨',
    task_assigned: '👤',
    status_changed: '🔄',
    priority_changed: '⚡',
    due_date_changed: '📅',
    task_updated: '✏️',
    comment_added: '💬',
    task_deleted: '🗑️',
  };
  return icons[action] || '📝';
}

function buildActivityDescription(activity: Activity): string {
  const label = formatActionLabel(activity.action);

  if (activity.action === 'status_changed' && activity.old_value && activity.new_value) {
    return `${label} from "${activity.old_value.replace(/_/g, ' ')}" to "${activity.new_value.replace(/_/g, ' ')}"`;
  }
  if (activity.action === 'priority_changed' && activity.old_value && activity.new_value) {
    return `${label} from "${activity.old_value}" to "${activity.new_value}"`;
  }
  if (activity.action === 'task_assigned' && activity.new_value) {
    return `${label} ${activity.new_value}`;
  }
  if (activity.new_value) {
    return `${label}: ${activity.new_value}`;
  }
  return label;
}

export function ActivityTimeline({ activities, isLoading }: ActivityTimelineProps) {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-7 h-7 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="h-2.5 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-6">No activity recorded yet.</p>;
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-3.5 top-3.5 bottom-3.5 w-px bg-gray-100" />

      {activities.map((activity, index) => (
        <div key={activity.id} className="relative flex gap-3 pb-5 last:pb-0">
          {/* Avatar / icon */}
          {activity.user ? (
            <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 relative z-10', getAvatarBg(activity.user.name))}>
              <span className="text-xs font-semibold text-white">{getInitials(activity.user.name)}</span>
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 relative z-10 text-sm">
              {getActionIcon(activity.action)}
            </div>
          )}

          {/* Content */}
          <div className="flex-1 pt-0.5 min-w-0">
            <p className="text-sm text-gray-800">
              <span className="font-medium">{activity.user?.name ?? 'System'}</span>{' '}
              <span className="text-gray-600">{buildActivityDescription(activity)}</span>
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{formatRelative(activity.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
