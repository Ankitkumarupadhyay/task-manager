import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'gray';
  isLoading?: boolean;
}

const colorMap = {
  blue: {
    icon: 'bg-blue-50 text-blue-600',
    value: 'text-blue-600',
  },
  green: {
    icon: 'bg-green-50 text-green-600',
    value: 'text-green-600',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    value: 'text-amber-600',
  },
  red: {
    icon: 'bg-red-50 text-red-600',
    value: 'text-red-600',
  },
  purple: {
    icon: 'bg-purple-50 text-purple-600',
    value: 'text-purple-600',
  },
  gray: {
    icon: 'bg-gray-100 text-gray-600',
    value: 'text-gray-700',
  },
};

export function StatCard({ title, value, icon, description, color = 'blue', isLoading }: StatCardProps) {
  const colors = colorMap[color];

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="w-16 h-4 bg-gray-200 rounded" />
        </div>
        <div className="mt-4 h-8 bg-gray-200 rounded w-1/2" />
        <div className="mt-2 h-3 bg-gray-200 rounded w-3/4" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className={clsx('w-10 h-10 rounded-lg flex items-center justify-center', colors.icon)}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className={clsx('text-3xl font-bold', colors.value)}>{value.toLocaleString()}</p>
        <p className="mt-1 text-sm font-medium text-gray-600">{title}</p>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </div>
    </div>
  );
}
