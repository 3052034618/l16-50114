import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Utensils,
  QrCode,
  Receipt,
  PieChart,
  Wallet,
  Settings,
  LogOut,
  ChefHat,
  BarChart3,
  ShoppingCart,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

interface SidebarProps {
  role: UserRole;
}

const menuConfig: Record<UserRole, { to: string; label: string; icon: React.ReactNode }[]> = {
  student: [
    { to: '/student/home', label: '首页', icon: <Home className="w-5 h-5" /> },
    { to: '/student/booking', label: '预订菜品', icon: <ShoppingCart className="w-5 h-5" /> },
    { to: '/student/pickup', label: '取餐核销', icon: <QrCode className="w-5 h-5" /> },
    { to: '/student/consumption', label: '消费记录', icon: <Receipt className="w-5 h-5" /> },
    { to: '/student/nutrition', label: '营养分析', icon: <PieChart className="w-5 h-5" /> },
  ],
  parent: [
    { to: '/parent/home', label: '首页', icon: <Home className="w-5 h-5" /> },
    { to: '/parent/consumption', label: '消费跟踪', icon: <Receipt className="w-5 h-5" /> },
  ],
  admin: [
    { to: '/admin/dishes', label: '菜品管理', icon: <Utensils className="w-5 h-5" /> },
    { to: '/admin/statistics', label: '销售统计', icon: <BarChart3 className="w-5 h-5" /> },
  ],
  kitchen: [
    { to: '/kitchen/preparation', label: '备料管理', icon: <ChefHat className="w-5 h-5" /> },
  ],
};

const roleNames: Record<UserRole, string> = {
  student: '学生端',
  parent: '家长端',
  admin: '管理端',
  kitchen: '后厨端',
};

export const Sidebar = ({ role }: SidebarProps) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const menuItems = menuConfig[role];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-stone-200 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-stone-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-stone-900">智慧食堂</h1>
            <p className="text-xs text-stone-500">{roleNames[role]}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
              )
            }
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-100">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-primary-600 font-medium text-sm">
              {currentUser?.name?.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-stone-900 truncate">
              {currentUser?.name}
            </p>
            <p className="text-xs text-stone-500">
              {role === 'student' && (currentUser as any)?.studentNo}
              {role === 'parent' && (currentUser as any)?.phone}
              {(role === 'admin' || role === 'kitchen') && (currentUser as any)?.staffNo}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
};
