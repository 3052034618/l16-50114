import { createContext, useContext, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a Tabs');
  }
  return context;
};

interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: ReactNode;
}

export const Tabs = ({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue || controlledValue || '');
  const value = controlledValue ?? internalValue;

  const handleValueChange = (newValue: string) => {
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

interface TabsListProps {
  className?: string;
  children: ReactNode;
}

export const TabsList = ({ className, children }: TabsListProps) => {
  return (
    <div className={cn('flex gap-1 bg-stone-100 p-1 rounded-lg', className)}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export const TabsTrigger = ({ value, className, children }: TabsTriggerProps) => {
  const { value: activeValue, onValueChange } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
        isActive
          ? 'bg-white text-primary-600 shadow-sm'
          : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export const TabsContent = ({ value, className, children }: TabsContentProps) => {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;
  return <div className={className}>{children}</div>;
};
