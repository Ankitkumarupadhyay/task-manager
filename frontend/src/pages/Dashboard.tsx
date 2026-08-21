import { useDashboard } from '@/hooks/useDashboard';
import { useAuth } from '@/hooks/useAuth';
import { StatCard } from '@/components/dashboard/StatCard';
import { StatusChart } from '@/components/dashboard/StatusChart';
import { PriorityChart } from '@/components/dashboard/PriorityChart';
import { RecentTasks } from '@/components/dashboard/RecentTasks';
import { ErrorState } from '@/components/ui/ErrorState';
import { getGreeting } from '@/utils/date';
import {
  ClipboardList,
  Clock,
  PlayCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
} from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useDashboard();

  if (isError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        message="We couldn't load the dashboard data."
        onRetry={refetch}
      />
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your team's tasks today.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          title="Total Tasks"
          value={summary?.total ?? 0}
          icon={<ClipboardList className="h-5 w-5" />}
          color="gray"
          isLoading={isLoading}
        />
        <StatCard
          title="Pending"
          value={summary?.pending ?? 0}
          icon={<Clock className="h-5 w-5" />}
          color="amber"
          isLoading={isLoading}
        />
        <StatCard
          title="In Progress"
          value={summary?.in_progress ?? 0}
          icon={<PlayCircle className="h-5 w-5" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatCard
          title="Completed"
          value={summary?.completed ?? 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
          isLoading={isLoading}
        />
        <StatCard
          title="Blocked"
          value={summary?.blocked ?? 0}
          icon={<XCircle className="h-5 w-5" />}
          color="red"
          isLoading={isLoading}
        />
        <StatCard
          title="Overdue"
          value={summary?.overdue ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="red"
          isLoading={isLoading}
        />
        <StatCard
          title="My Tasks"
          value={summary?.my_tasks ?? 0}
          icon={<User className="h-5 w-5" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusChart data={data?.status_breakdown ?? []} isLoading={isLoading} />
        <PriorityChart data={data?.priority_breakdown ?? []} isLoading={isLoading} />
      </div>

      {/* Recent Tasks */}
      <RecentTasks tasks={data?.recent_tasks ?? []} isLoading={isLoading} />
    </div>
  );
}
