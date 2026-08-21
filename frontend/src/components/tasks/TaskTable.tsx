import { Task } from '@/types/task';
import { TaskRow } from './TaskRow';
import { TaskCard } from './TaskCard';
import { TableSkeleton } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClipboardList } from 'lucide-react';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onCreateTask?: () => void;
}

export function TaskTable({ tasks, isLoading, onEdit, onDelete, onCreateTask }: TaskTableProps) {
  if (isLoading) return <TableSkeleton rows={8} />;

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardList className="h-7 w-7" />}
        title="No tasks found"
        description="Try adjusting your filters or create a new task to get started."
        action={
          onCreateTask ? (
            <button
              onClick={onCreateTask}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Create Task
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      {/* Desktop table container with sticky header and vertical scroll */}
      <div className="hidden md:block overflow-x-auto max-h-[calc(100vh-270px)] overflow-y-auto relative">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white shadow-sm z-10 border-b border-gray-100">
            <tr className="bg-gray-50/90 backdrop-blur-sm">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide min-w-[260px]">
                Task
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden md:table-cell">
                Assignee
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden sm:table-cell">
                Priority
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden lg:table-cell">
                Due Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap hidden xl:table-cell">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    </>
  );
}
