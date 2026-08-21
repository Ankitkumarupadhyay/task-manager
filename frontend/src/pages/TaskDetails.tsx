import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Pencil, Trash2, Calendar, User, Clock, Hash,
  MessageSquare, Activity as ActivityIcon,
} from 'lucide-react';
import { useTask, useUpdateTask, useDeleteTask, useTaskComments, useTaskActivity } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageSpinner } from '@/components/ui/Spinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { TaskForm } from '@/components/tasks/TaskForm';
import { CommentsList } from '@/components/tasks/CommentsList';
import { ActivityTimeline } from '@/components/tasks/ActivityTimeline';
import { formatDate, formatDateTime, isOverdue } from '@/utils/date';
import { getInitials, getAvatarBg } from '@/utils/formatters';
import { STATUS_OPTIONS } from '@/utils/constants';
import { TaskStatus } from '@/types/task';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';

export function TaskDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const taskId = Number(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');

  const { data: task, isLoading, isError, refetch } = useTask(taskId);
  const { data: comments = [], isLoading: commentsLoading } = useTaskComments(taskId);
  const { data: activities = [], isLoading: activityLoading } = useTaskActivity(taskId);

  const updateTask = useUpdateTask(taskId);
  const deleteTask = useDeleteTask();

  if (isLoading) return <PageSpinner />;
  if (isError || !task) return <ErrorState title="Task not found" message="This task may have been deleted." onRetry={refetch} />;

  const overdue = isOverdue(task.due_date, task.status);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === task.status) return;
    try {
      await updateTask.mutateAsync({ status: newStatus as TaskStatus });
    } catch {
      // toast handled in hook
    }
  };

  const handleDelete = async () => {
    await deleteTask.mutateAsync(taskId);
    navigate('/tasks');
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager' || task.assignee?.id === user?.id;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <Link to="/tasks" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tasks
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-medium truncate max-w-[300px]">{task.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{task.title}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {overdue && (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                      ⚠ Overdue
                    </span>
                  )}
                </div>
              </div>
              {canEdit && (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Pencil className="h-3.5 w-3.5" />}
                    onClick={() => setEditOpen(true)}
                  >
                    Edit
                  </Button>
                  {(user?.role === 'admin' || user?.role === 'manager') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:bg-red-50"
                      leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      onClick={() => setDeleteOpen(true)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Inline status change */}
            {canEdit && (
              <div className="mt-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600">Change Status:</span>
                  <div className="w-44">
                    <Select
                      options={STATUS_OPTIONS}
                      value={task.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      id="inline-status-change"
                    />
                  </div>
                  {updateTask.isPending && (
                    <span className="text-xs text-gray-400">Saving...</span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {task.description && (
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Comments & Activity tabs */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('comments')}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors',
                  activeTab === 'comments'
                    ? 'text-brand-600 border-b-2 border-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <MessageSquare className="h-4 w-4" />
                Comments
                {comments.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                    {comments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={clsx(
                  'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors',
                  activeTab === 'activity'
                    ? 'text-brand-600 border-b-2 border-brand-600'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                <ActivityIcon className="h-4 w-4" />
                Activity
                {activities.length > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                    {activities.length}
                  </span>
                )}
              </button>
            </div>
            <div className="p-6">
              {activeTab === 'comments' ? (
                <CommentsList taskId={taskId} comments={comments} isLoading={commentsLoading} />
              ) : (
                <ActivityTimeline activities={activities} isLoading={activityLoading} />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Task Details</h2>

            {/* Assignee */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Assignee</p>
              {task.assignee ? (
                <div className="flex items-center gap-2">
                  <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center', getAvatarBg(task.assignee.name))}>
                    <span className="text-xs font-semibold text-white">{getInitials(task.assignee.name)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{task.assignee.name}</p>
                    <p className="text-xs text-gray-400">{task.assignee.email}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Unassigned</p>
              )}
            </div>

            {/* Creator */}
            {task.creator && (
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Created By</p>
                <div className="flex items-center gap-2">
                  <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center', getAvatarBg(task.creator.name))}>
                    <span className="text-xs font-semibold text-white">{getInitials(task.creator.name)}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{task.creator.name}</p>
                </div>
              </div>
            )}

            {/* Due date */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Due Date</p>
              <div className={clsx('flex items-center gap-1.5 text-sm', overdue ? 'text-red-500 font-medium' : 'text-gray-700')}>
                <Calendar className="h-3.5 w-3.5" />
                {task.due_date ? formatDate(task.due_date) : '—'}
                {overdue && <span className="text-xs">(Overdue)</span>}
              </div>
            </div>

            {/* Task ID */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Task ID</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Hash className="h-3.5 w-3.5" />
                {task.id}
              </div>
            </div>

            {/* Created */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Created</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(task.created_at)}
              </div>
            </div>

            {/* Updated */}
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1.5">Last Updated</p>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Clock className="h-3.5 w-3.5" />
                {formatDateTime(task.updated_at)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Task" size="lg">
        <TaskForm
          task={task}
          onSubmit={async (data) => {
            await updateTask.mutateAsync(data as any);
            setEditOpen(false);
          }}
          onCancel={() => setEditOpen(false)}
          isLoading={updateTask.isPending}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${task.title}"?`}
        isLoading={deleteTask.isPending}
      />
    </div>
  );
}
