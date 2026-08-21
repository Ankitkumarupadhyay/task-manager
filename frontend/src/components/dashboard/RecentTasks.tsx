import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { formatDate, isOverdue } from '@/utils/date';
import { TableSkeleton } from '@/components/ui/Spinner';
import { Calendar, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface RecentTasksProps {
  tasks: Task[];
  isLoading?: boolean;
}

export function RecentTasks({ tasks, isLoading }: RecentTasksProps) {
  if (isLoading) return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">Recent Tasks</h3>
        <Link to="/tasks" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
          View all →
        </Link>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No recent tasks.</p>
      ) : (
        <div className="divide-y divide-gray-50">
          {tasks.map((task) => {
            const overdue = isOverdue(task.due_date, task.status);
            return (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                    {overdue && <AlertCircle className="h-3.5 w-3.5 text-red-500 flex-shrink-0" />}
                  </div>
                  {task.assignee && (
                    <p className="text-xs text-gray-500 mt-0.5">{task.assignee.name}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  {task.due_date && (
                    <div className={clsx('hidden sm:flex items-center gap-1 text-xs', overdue ? 'text-red-500' : 'text-gray-400')}>
                      <Calendar className="h-3 w-3" />
                      {formatDate(task.due_date)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
