import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'secondary' | 'green' | 'blue' | 'orange';
type BadgeSize = 'sm' | 'md';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  clickable?: boolean;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-stone-100 text-stone-700',
  success: 'bg-primary-100 text-primary-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-info-100 text-info-700',
  purple: 'bg-purple-100 text-purple-700',
  secondary: 'bg-stone-200 text-stone-700',
  green: 'bg-primary-100 text-primary-700',
  blue: 'bg-info-100 text-info-700',
  orange: 'bg-accent-100 text-accent-700',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'default', size = 'md', clickable, className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'badge',
          variantClasses[variant],
          sizeClasses[size],
          clickable && 'cursor-pointer hover:opacity-80 transition-opacity',
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
