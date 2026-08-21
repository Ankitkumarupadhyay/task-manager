import api from './api';
import { ExternalUser } from '@/types/api';

interface ExternalUsersResponse {
  items: ExternalUser[];
  total: number;
}

export const externalService = {
  async getUsers(): Promise<ExternalUsersResponse> {
    const { data } = await api.get<ExternalUsersResponse>('/external/users');
    return data;
  },
};
