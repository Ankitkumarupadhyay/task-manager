import { clsx } from 'clsx';
import { TaskStatus, TaskPriority } from '@/types/task';
import { getStatusColor, getPriorityColor } from '@/utils/formatters';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/utils/constants';

interface BadgeProps {
  label: string;
  className?: string;
}

export function Badge({ label, className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-inset whitespace-nowrap select-none', className)}>
      {label}
    </span>
  );
}

interface StatusBadgeProps {
  status: TaskStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      label={STATUS_LABELS[status] || status}
      className={getStatusColor(status)}
    />
  );
}

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  return (
    <Badge
      label={PRIORITY_LABELS[priority] || priority}
      className={getPriorityColor(priority)}
    />
  );
}

interface RoleBadgeProps {
  role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colors: Record<string, string> = {
    admin: 'bg-purple-50 text-purple-700 ring-purple-200',
    manager: 'bg-blue-50 text-blue-700 ring-blue-200',
    member: 'bg-gray-50 text-gray-700 ring-gray-200',
  };
  return (
    <Badge
      label={role.charAt(0).toUpperCase() + role.slice(1)}
      className={colors[role] || 'bg-gray-50 text-gray-700 ring-gray-200'}
    />
  );
}
