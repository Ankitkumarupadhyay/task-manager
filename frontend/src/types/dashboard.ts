import { Task } from './task';

export interface DashboardSummary {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  blocked: number;
  overdue: number;
  my_tasks: number;
}

export interface StatusBreakdownItem {
  status: string;
  count: number;
}

export interface PriorityBreakdownItem {
  priority: string;
  count: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  status_breakdown: StatusBreakdownItem[];
  priority_breakdown: PriorityBreakdownItem[];
  recent_tasks: Task[];
}
