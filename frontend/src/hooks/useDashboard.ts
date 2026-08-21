import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.get(),
    staleTime: 60_000,
    refetchInterval: 5 * 60_000, // auto-refresh every 5 minutes
  });
}
