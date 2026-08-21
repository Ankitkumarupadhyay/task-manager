import { TaskStatus, TaskPriority } from '@/types/task';

export function getStatusColor(status: TaskStatus): string {
  const colors: Record<TaskStatus, string> = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-200',
    in_progress: 'bg-blue-50 text-blue-700 ring-blue-200',
    completed: 'bg-green-50 text-green-700 ring-green-200',
    blocked: 'bg-red-50 text-red-700 ring-red-200',
  };
  return colors[status] || 'bg-gray-50 text-gray-700 ring-gray-200';
}

export function getPriorityColor(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-slate-50 text-slate-600 ring-slate-200',
    medium: 'bg-blue-50 text-blue-600 ring-blue-200',
    high: 'bg-orange-50 text-orange-600 ring-orange-200',
    urgent: 'bg-red-50 text-red-600 ring-red-200',
  };
  return colors[priority] || 'bg-gray-50 text-gray-600 ring-gray-200';
}

export function getPriorityDot(priority: TaskPriority): string {
  const colors: Record<TaskPriority, string> = {
    low: 'bg-slate-400',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500',
  };
  return colors[priority] || 'bg-gray-400';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getAvatarBg(name: string): string {
  const colors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-cyan-500',
    'bg-teal-500',
    'bg-emerald-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function formatActionLabel(action: string): string {
  const labels: Record<string, string> = {
    task_created: 'created this task',
    task_assigned: 'assigned this task to',
    status_changed: 'changed status',
    priority_changed: 'changed priority',
    due_date_changed: 'changed due date',
    task_updated: 'updated the task',
    comment_added: 'added a comment',
    task_deleted: 'deleted the task',
  };
  return labels[action] || action.replace(/_/g, ' ');
}
