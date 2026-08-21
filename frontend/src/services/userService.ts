import api from './api';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { PaginatedResponse } from '@/types/api';

export const userService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    const { data } = await api.get<PaginatedResponse<User>>(`/users?${query.toString()}`);
    return data;
  },

  async getById(id: number): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  async update(id: number, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};
