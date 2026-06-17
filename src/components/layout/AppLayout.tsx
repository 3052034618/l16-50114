import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

const pageTitles: Record<string, { title: string; subtitle?: string }> = {
  '/student/home': { title: '今日菜单', subtitle: '选择您喜欢的菜品' },
  '/student/booking': { title: '预订菜品', subtitle: '提前预订，减少排队' },
  '/student/pickup': { title: '取餐核销', subtitle: '出示二维码扫码取餐' },
  '/student/consumption': { title: '消费记录', subtitle: '查看您的消费明细' },
  '/student/nutrition': { title: '营养分析', subtitle: '了解您的饮食结构' },
  '/parent/home': { title: '充值中心', subtitle: '为孩子充值餐饮额度' },
  '/parent/consumption': { title: '消费跟踪', subtitle: '查看孩子的消费情况' },
  '/admin/dishes': { title: '菜品管理', subtitle: '管理食堂菜品信息' },
  '/admin/statistics': { title: '销售统计', subtitle: '查看销售数据和分析' },
  '/kitchen/preparation': { title: '备料管理', subtitle: '根据预订数据准备食材' },
};

export const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const role = currentUser.role as UserRole;
  const pageInfo = pageTitles[location.pathname] || { title: '', subtitle: '' };

  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar role={role} />
      <div className="ml-64">
        <Header title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <main className="p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
