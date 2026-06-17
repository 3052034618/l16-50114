import { Bell, Search } from 'lucide-react';
import { getChineseDate } from '@/utils/date';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-stone-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div>
        <h2 className="font-serif text-xl font-semibold text-stone-900">{title}</h2>
        {subtitle && <p className="text-sm text-stone-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="搜索菜品..."
            className="w-64 pl-10 pr-4 py-2 bg-stone-100 rounded-lg text-sm border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-stone-500 hidden lg:block">{getChineseDate()}</p>
          <button className="relative p-2 rounded-lg hover:bg-stone-100 transition-colors">
            <Bell className="w-5 h-5 text-stone-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
};
