import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TagVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'secondary';
type TagSize = 'sm' | 'md';

interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: TagVariant;
  size?: TagSize;
  children: ReactNode;
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-stone-100 text-stone-600',
  success: 'bg-primary-100 text-primary-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-info-100 text-info-700',
  accent: 'bg-accent-100 text-accent-700',
  secondary: 'bg-stone-200 text-stone-700',
};

const sizeClasses: Record<TagSize, string> = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
};

export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn('tag', variantClasses[variant], sizeClasses[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Tag.displayName = 'Tag';
