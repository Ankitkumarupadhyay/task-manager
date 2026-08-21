import api from './api';
import { User } from '@/types/user';
import { TokenResponse } from '@/types/api';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ token: string; user: User }> {
    const { data } = await api.post<TokenResponse>('/auth/login', payload);
    localStorage.setItem('access_token', data.access_token);
    const user = await authService.getMe();
    localStorage.setItem('user', JSON.stringify(user));
    return { token: data.access_token, user };
  },

  async register(payload: RegisterPayload): Promise<User> {
    const { data } = await api.post<User>('/auth/register', payload);
    return data;
  },

  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const stored = localStorage.getItem('user');
    if (!stored) return null;
    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },
};
