import type { SalesStats } from '../types';
import { formatDate } from '../utils/date';
import { mockDishes, mockStalls } from './mockDishes';

const generateDailyStats = (date: string): SalesStats => {
  const dishSales = mockDishes.slice(0, 15).map((dish) => {
    const quantity = 20 + Math.floor(Math.random() * 60);
    return {
      dishId: dish.id,
      dishName: dish.name,
      quantity,
      revenue: quantity * dish.price,
    };
  });

  const stallStats = mockStalls.map((stall) => {
    const orders = 50 + Math.floor(Math.random() * 100);
    const revenue = 500 + Math.floor(Math.random() * 3000);
    return {
      stallId: stall.id,
      stallName: stall.name,
      revenue,
      orders,
    };
  });

  const totalRevenue = stallStats.reduce((sum, s) => sum + s.revenue, 0);
  const totalOrders = stallStats.reduce((sum, s) => sum + s.orders, 0);

  return {
    date,
    totalRevenue,
    totalOrders,
    dishSales,
    stallStats,
  };
};

export const mockSalesStats: SalesStats[] = (() => {
  const stats: SalesStats[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    stats.push(generateDailyStats(formatDate(d)));
  }
  return stats;
})();

export const getStatsByDate = (date: string): SalesStats | undefined => {
  return mockSalesStats.find((s) => s.date === date);
};

export const getStatsByDateRange = (startDate: string, endDate: string): SalesStats[] => {
  return mockSalesStats.filter((s) => s.date >= startDate && s.date <= endDate);
};

export const getAggregatedStats = (
  startDate: string,
  endDate: string
): { totalRevenue: number; totalOrders: number; avgOrderValue: number; dailyData: { date: string; revenue: number; orders: number }[] } => {
  const stats = getStatsByDateRange(startDate, endDate);
  const totalRevenue = stats.reduce((sum, s) => sum + s.totalRevenue, 0);
  const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

  const dailyData = stats.map((s) => ({
    date: s.date,
    revenue: s.totalRevenue,
    orders: s.totalOrders,
  }));

  return { totalRevenue, totalOrders, avgOrderValue, dailyData };
};

export const getTopDishes = (startDate: string, endDate: string, limit = 10) => {
  const stats = getStatsByDateRange(startDate, endDate);
  const dishMap = new Map<string, { name: string; quantity: number; revenue: number }>();

  stats.forEach((s) => {
    s.dishSales.forEach((ds) => {
      const existing = dishMap.get(ds.dishId);
      if (existing) {
        existing.quantity += ds.quantity;
        existing.revenue += ds.revenue;
      } else {
        dishMap.set(ds.dishId, {
          name: ds.dishName,
          quantity: ds.quantity,
          revenue: ds.revenue,
        });
      }
    });
  });

  return Array.from(dishMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);
};
