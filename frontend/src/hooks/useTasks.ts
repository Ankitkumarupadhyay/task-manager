import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { TaskFilters, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';
import { getErrorMessage } from '@/services/api';
import toast from 'react-hot-toast';

export function useTasks(filters: Partial<TaskFilters>) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => taskService.getAll(filters),
    staleTime: 30_000,
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => taskService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task created successfully.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateTask(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskService.update(taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task updated successfully.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => taskService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Task deleted successfully.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useTaskComments(taskId: number) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: () => taskService.getComments(taskId),
    enabled: !!taskId,
  });
}

export function useAddComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (comment: string) => taskService.addComment(taskId, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      qc.invalidateQueries({ queryKey: ['activity', taskId] });
      toast.success('Comment added.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteComment(taskId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => taskService.deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['comments', taskId] });
      toast.success('Comment deleted.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useTaskActivity(taskId: number) {
  return useQuery({
    queryKey: ['activity', taskId],
    queryFn: () => taskService.getActivity(taskId),
    enabled: !!taskId,
  });
}
