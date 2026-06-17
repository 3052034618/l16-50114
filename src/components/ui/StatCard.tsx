import type { ReactNode } from 'react';
import { Card, CardContent } from './Card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  } | string;
  trendUp?: boolean;
  variant?: 'primary' | 'accent' | 'info' | 'warning' | 'success' | 'danger';
  subtitle?: string;
  subtitleValue?: string | number;
  color?: 'primary' | 'accent' | 'info' | 'warning';
  className?: string;
}

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600',
  accent: 'bg-accent-50 text-accent-600',
  info: 'bg-info-50 text-info-600',
  warning: 'bg-amber-50 text-amber-600',
  success: 'bg-primary-50 text-primary-600',
  danger: 'bg-red-50 text-red-600',
};

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  variant = 'primary',
  subtitle,
  subtitleValue,
  color,
  className,
}: StatCardProps) => {
  const iconColor = color || variant;

  const renderTrend = () => {
    if (!trend) return null;
    if (typeof trend === 'string') {
      const isPositive = trendUp ?? true;
      return (
        <p
          className={cn(
            'text-sm mt-2 flex items-center gap-1',
            isPositive ? 'text-primary-600' : 'text-red-500'
          )}
        >
          {isPositive ? '↑' : '↓'} {trend}
          <span className="text-stone-400 ml-1">较上周</span>
        </p>
      );
    }
    return (
      <p
        className={cn(
          'text-sm mt-2 flex items-center gap-1',
          trend.isPositive ? 'text-primary-600' : 'text-red-500'
        )}
      >
        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        <span className="text-stone-400 ml-1">较上周</span>
      </p>
    );
  };

  return (
    <Card className={cn('animate-slide-up', className)}>
      <CardContent className="flex items-start justify-between">
        <div>
          <p className="text-sm text-stone-500 mb-1">{title}</p>
          <p className="text-3xl font-serif font-bold text-stone-900">{value}</p>
          {subtitle && (
            <p className="text-sm text-stone-500 mt-1">
              {subtitle}
              {subtitleValue !== undefined && (
                <span className="font-medium text-stone-900 ml-1">{subtitleValue}</span>
              )}
            </p>
          )}
          {renderTrend()}
        </div>
        {icon && (
          <div className={cn('p-3 rounded-xl', colorClasses[iconColor as keyof typeof colorClasses])}>
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
