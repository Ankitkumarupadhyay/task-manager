import api from './api';
import { DashboardData } from '@/types/dashboard';

export const dashboardService = {
  async get(): Promise<DashboardData> {
    const { data } = await api.get<DashboardData>('/dashboard');
    return data;
  },
};
