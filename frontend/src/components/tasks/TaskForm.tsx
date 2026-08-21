import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { STATUS_OPTIONS, PRIORITY_OPTIONS } from '@/utils/constants';
import { useUsers } from '@/hooks/useUsers';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title is too long'),
  description: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigned_to: z.string().optional(),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const { data: usersData } = useUsers({ limit: 100 });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'pending',
      priority: task?.priority ?? 'medium',
      assigned_to: task?.assignee?.id ? String(task.assignee.id) : '',
      due_date: task?.due_date ?? '',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        assigned_to: task.assignee?.id ? String(task.assignee.id) : '',
        due_date: task.due_date ?? '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    const payload: CreateTaskPayload | UpdateTaskPayload = {
      title: values.title,
      description: values.description || undefined,
      status: values.status,
      priority: values.priority,
      assigned_to: values.assigned_to ? Number(values.assigned_to) : undefined,
      due_date: values.due_date || undefined,
    };
    await onSubmit(payload);
  };

  const userOptions = (usersData?.items ?? []).map((u) => ({
    value: String(u.id),
    label: `${u.name} (${u.role})`,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title"
        required
        placeholder="Enter task title..."
        error={errors.title?.message}
        {...register('title')}
      />

      <div>
        <label htmlFor="task-description" className="block text-sm font-medium text-gray-700 mb-1.5">
          Description
        </label>
        <textarea
          id="task-description"
          rows={3}
          placeholder="Describe the task in detail..."
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-colors resize-none"
          {...register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Status"
          required
          options={STATUS_OPTIONS}
          error={errors.status?.message}
          {...register('status')}
        />
        <Select
          label="Priority"
          required
          options={PRIORITY_OPTIONS}
          error={errors.priority?.message}
          {...register('priority')}
        />
      </div>

      <Select
        label="Assignee"
        placeholder="— Unassigned —"
        options={userOptions}
        {...register('assigned_to')}
      />

      <Input
        label="Due Date"
        type="date"
        error={errors.due_date?.message}
        {...register('due_date')}
      />

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1" disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" isLoading={isLoading} className="flex-1">
          {task ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
