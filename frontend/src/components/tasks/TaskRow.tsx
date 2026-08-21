import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDate, isOverdue } from '@/utils/date';
import { getInitials, getAvatarBg } from '@/utils/formatters';
import { Eye, Pencil, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface TaskRowProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskRow({ task, onEdit, onDelete }: TaskRowProps) {
  const overdue = isOverdue(task.due_date, task.status);

  return (
    <tr className="group hover:bg-slate-50/80 transition-colors">
      {/* Task title */}
      <td className="px-4 py-3 min-w-[260px] max-w-md">
        <div className="flex items-start gap-2.5">
          {overdue && (
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div className="min-w-0 flex-1">
            <Link
              to={`/tasks/${task.id}`}
              className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors truncate block leading-snug"
              title={task.title}
            >
              {task.title}
            </Link>
            {task.description && (
              <p
                className="text-xs text-gray-500 mt-0.5 truncate leading-tight"
                title={task.description}
              >
                {task.description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Assignee */}
      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
        {task.assignee ? (
          <div className="flex items-center gap-2">
            <div
              className={clsx(
                'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0',
                getAvatarBg(task.assignee.name)
              )}
            >
              <span className="text-[11px] font-semibold text-white">
                {getInitials(task.assignee.name)}
              </span>
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {task.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">Unassigned</span>
        )}
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Status */}
      <td className="px-4 py-3 whitespace-nowrap">
        <StatusBadge status={task.status} />
      </td>

      {/* Due date */}
      <td className="px-4 py-3 whitespace-nowrap hidden lg:table-cell">
        {task.due_date ? (
          <div
            className={clsx(
              'flex items-center gap-1.5 text-xs font-medium',
              overdue ? 'text-red-600' : 'text-gray-500'
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(task.due_date)}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">—</span>
        )}
      </td>

      {/* Created */}
      <td className="px-4 py-3 whitespace-nowrap hidden xl:table-cell">
        <span className="text-xs text-gray-500">{formatDate(task.created_at)}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 whitespace-nowrap text-right w-28">
        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <Link to={`/tasks/${task.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 h-8 w-8 text-gray-500 hover:text-brand-600 hover:bg-brand-50"
              aria-label="View task"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 h-8 w-8 text-gray-500 hover:text-brand-600 hover:bg-brand-50"
            onClick={() => onEdit(task)}
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1.5 h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(task)}
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
