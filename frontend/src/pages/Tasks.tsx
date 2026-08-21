import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task } from '@/types/task';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskTable } from '@/components/tasks/TaskTable';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ErrorState } from '@/components/ui/ErrorState';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/useTasks';
import { TaskFilters as TFilters } from '@/types/task';
import { clsx } from 'clsx';

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteTask, setDeleteTask] = useState<Task | null>(null);

  const filters: Partial<TFilters> = {
    page: Number(searchParams.get('page') ?? 1),
    limit: 20,
    status: searchParams.get('status') ?? undefined,
    priority: searchParams.get('priority') ?? undefined,
    assignee: searchParams.get('assignee') ? Number(searchParams.get('assignee')) : undefined,
    search: searchParams.get('search') ?? undefined,
    sort_by: searchParams.get('sort_by') ?? 'created_at',
    sort_order: (searchParams.get('sort_order') as 'asc' | 'desc') ?? 'desc',
  };

  const { data, isLoading, isError, refetch } = useTasks(filters);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(editTask?.id ?? 0);
  const deleteTaskMut = useDeleteTask();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(page));
    setSearchParams(params);
  };

  const handleDelete = async () => {
    if (!deleteTask) return;
    await deleteTaskMut.mutateAsync(deleteTask.id);
    setDeleteTask(null);
  };

  const currentPage = filters.page ?? 1;
  const totalPages = data?.total_pages ?? 1;
  const total = data?.total ?? 0;
  const startItem = ((currentPage - 1) * 20) + 1;
  const endItem = Math.min(currentPage * 20, total);

  if (isError) {
    return (
      <ErrorState
        title="Failed to load tasks"
        message="We couldn't load the task list. Please try again."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and track your team's work.</p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
          id="create-task-btn"
        >
          Create Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters />

      {/* Task count */}
      {!isLoading && total > 0 && (
        <p className="text-sm text-gray-500">
          Showing {startItem}–{endItem} of <span className="font-medium text-gray-900">{total}</span> tasks
        </p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <TaskTable
          tasks={data?.items ?? []}
          isLoading={isLoading}
          onEdit={setEditTask}
          onDelete={setDeleteTask}
          onCreateTask={() => setIsCreateOpen(true)}
        />
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              aria-label="First page"
            >
              «
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
              aria-label="Previous page"
            >
              Prev
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-9"
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === currentPage ? 'page' : undefined}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              aria-label="Next page"
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              aria-label="Last page"
            >
              »
            </Button>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Create New Task" size="lg">
        <TaskForm
          onSubmit={async (data) => {
            await createTask.mutateAsync(data as any);
            setIsCreateOpen(false);
          }}
          onCancel={() => setIsCreateOpen(false)}
          isLoading={createTask.isPending}
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && (
          <TaskForm
            task={editTask}
            onSubmit={async (data) => {
              await updateTask.mutateAsync(data as any);
              setEditTask(null);
            }}
            onCancel={() => setEditTask(null)}
            isLoading={updateTask.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={handleDelete}
        title="Delete Task?"
        message={`Are you sure you want to delete "${deleteTask?.title}"? This action cannot be undone.`}
        isLoading={deleteTaskMut.isPending}
      />
    </div>
  );
}
