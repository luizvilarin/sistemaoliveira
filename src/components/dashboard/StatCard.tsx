
import React from 'react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'default';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  colorScheme = 'default',
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-sgc-blue-50',
      text: 'text-sgc-blue-600',
      iconBg: 'bg-sgc-blue-100',
    },
    green: {
      bg: 'bg-sgc-green-50',
      text: 'text-sgc-green-600',
      iconBg: 'bg-sgc-green-100',
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
    },
    orange: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      iconBg: 'bg-orange-100',
    },
    red: {
      bg: 'bg-sgc-red-50',
      text: 'text-sgc-red-600',
      iconBg: 'bg-sgc-red-100',
    },
    default: {
      bg: 'bg-gray-50',
      text: 'text-gray-600',
      iconBg: 'bg-gray-100',
    },
  };

  const trendColorClass = trend
    ? trend.direction === 'up'
      ? 'text-sgc-green-500'
      : trend.direction === 'down'
      ? 'text-sgc-red-500'
      : 'text-gray-500'
    : '';

  const { bg, text, iconBg } = colorClasses[colorScheme];

  return (
    <Card className={cn("p-6 shadow-sm hover:shadow transition-shadow", bg)}>
      <div className="flex items-center">
        <div className={cn("flex items-center justify-center rounded-lg p-2 mr-4", iconBg)}>
          <Icon className={cn("h-8 w-8", text)} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-500 text-sm">{title}</h3>
          <div className="text-2xl font-bold">{value}</div>
          {(description || trend) && (
            <div className="mt-1 flex items-center text-xs">
              {trend && (
                <span className={cn("font-medium mr-1", trendColorClass)}>
                  {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '–'} {trend.value}
                </span>
              )}
              {description && <span className="text-gray-500">{description}</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
