import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PriorityBreakdownItem } from '@/types/dashboard';
import { CardSkeleton } from '@/components/ui/Spinner';

interface PriorityChartProps {
  data: PriorityBreakdownItem[];
  isLoading?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
  low: '#94a3b8',
  medium: '#3b82f6',
  high: '#f97316',
  urgent: '#ef4444',
};

const PRIORITY_NAMES: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function PriorityChart({ data, isLoading }: PriorityChartProps) {
  if (isLoading) return <CardSkeleton />;

  const chartData = ['low', 'medium', 'high', 'urgent'].map((p) => {
    const found = data.find((d) => d.priority === p);
    return {
      name: PRIORITY_NAMES[p],
      value: found?.count ?? 0,
      fill: PRIORITY_COLORS[p],
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Priority Overview</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barSize={32}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number, name: string) => [value, 'Tasks']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
