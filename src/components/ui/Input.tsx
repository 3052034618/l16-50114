import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  iconPosition?: 'left' | 'right';
  size?: 'sm' | 'md' | number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, rightIcon, iconPosition = 'left', size, className, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).slice(2);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-stone-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && !rightIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'input',
              (icon && iconPosition === 'left' && !rightIcon) && 'pl-10',
              (icon && iconPosition === 'right') || rightIcon && 'pr-10',
              size === 'sm' && 'h-9 text-sm',
              size === 'md' && 'h-11',
              error && 'border-red-300 focus:ring-red-500',
              className
            )}
            {...props}
          />
          {(icon && iconPosition === 'right') || rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {rightIcon || icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
