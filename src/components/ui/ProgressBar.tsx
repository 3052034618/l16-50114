import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  height?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar = ({
  value,
  max = 100,
  color = '#22c55e',
  height = '8px',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-stone-600">{label || `${value}/${max}`}</span>
          <span className="text-sm font-medium text-stone-900">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="progress-bar" style={{ height }}>
        <div
          className="progress-fill"
          style={{ width: `${percentage}%`, backgroundColor: color, height }}
        />
      </div>
    </div>
  );
};
