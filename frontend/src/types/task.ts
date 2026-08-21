import { UserBrief } from './user';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SortOrder = 'asc' | 'desc';

export interface Task {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date?: string | null;
  created_at: string;
  updated_at: string;
  assignee?: UserBrief | null;
  creator?: UserBrief | null;
}

export interface Comment {
  id: number;
  task_id: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: UserBrief | null;
}

export interface Activity {
  id: number;
  task_id: number;
  action: string;
  old_value?: string | null;
  new_value?: string | null;
  created_at: string;
  user?: UserBrief | null;
}

export interface TaskFilters {
  page: number;
  limit: number;
  status?: string;
  priority?: string;
  assignee?: number;
  search?: string;
  sort_by?: string;
  sort_order?: SortOrder;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: number;
  due_date?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigned_to?: number;
  due_date?: string;
}
