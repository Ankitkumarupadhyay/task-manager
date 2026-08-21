import api from './api';
import { Task, CreateTaskPayload, UpdateTaskPayload, TaskFilters, Comment, Activity } from '@/types/task';
import { PaginatedResponse } from '@/types/api';

export const taskService = {
  async getAll(filters: Partial<TaskFilters>): Promise<PaginatedResponse<Task>> {
    const params = new URLSearchParams();
    if (filters.page) params.set('page', String(filters.page));
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.status) params.set('status', filters.status);
    if (filters.priority) params.set('priority', filters.priority);
    if (filters.assignee) params.set('assignee', String(filters.assignee));
    if (filters.search) params.set('search', filters.search);
    if (filters.sort_by) params.set('sort_by', filters.sort_by);
    if (filters.sort_order) params.set('sort_order', filters.sort_order);

    const { data } = await api.get<PaginatedResponse<Task>>(`/tasks?${params.toString()}`);
    return data;
  },

  async getById(id: number): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post<Task>('/tasks', payload);
    return data;
  },

  async update(id: number, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  async getComments(taskId: number): Promise<Comment[]> {
    const { data } = await api.get<Comment[]>(`/tasks/${taskId}/comments`);
    return data;
  },

  async addComment(taskId: number, comment: string): Promise<Comment> {
    const { data } = await api.post<Comment>(`/tasks/${taskId}/comments`, { comment });
    return data;
  },

  async updateComment(commentId: number, comment: string): Promise<Comment> {
    const { data } = await api.put<Comment>(`/comments/${commentId}`, { comment });
    return data;
  },

  async deleteComment(commentId: number): Promise<void> {
    await api.delete(`/comments/${commentId}`);
  },

  async getActivity(taskId: number): Promise<Activity[]> {
    const { data } = await api.get<Activity[]>(`/tasks/${taskId}/activity`);
    return data;
  },
};
