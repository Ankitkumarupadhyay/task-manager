import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, isOverdue } from '@/utils/date';
import { getInitials, getAvatarBg } from '@/utils/formatters';
import { Eye, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          {overdue && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
          <Link
            to={`/tasks/${task.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-2"
          >
            {task.title}
          </Link>
        </div>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <StatusBadge status={task.status} />

        {task.due_date && (
          <div className={clsx('flex items-center gap-1 text-xs', overdue ? 'text-red-500' : 'text-gray-400')}>
            <Calendar className="h-3 w-3" />
            {formatDate(task.due_date)}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div className={clsx('w-6 h-6 rounded-full flex items-center justify-center', getAvatarBg(task.assignee.name))}>
              <span className="text-xs font-medium text-white">{getInitials(task.assignee.name)}</span>
            </div>
            <span className="text-xs text-gray-600">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-xs text-gray-400">Unassigned</span>
        )}

        <div className="flex items-center gap-1">
          <Link to={`/tasks/${task.id}`}>
            <Button variant="ghost" size="sm" className="p-1.5" aria-label="View">
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="p-1.5" onClick={() => onEdit(task)} aria-label="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="p-1.5 hover:text-red-600" onClick={() => onDelete(task)} aria-label="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
