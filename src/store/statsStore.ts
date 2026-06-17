import { create } from 'zustand';
import type { SalesStats, DailyPreparation, PreparationItem, ConsumptionItem, DishSale } from '../types';
import { mockSalesStats } from '../data/mockStats';
import { storage } from '../utils/storage';
import { getToday, formatDate } from '../utils/date';

interface StatsState {
  salesStats: SalesStats[];
  preparations: DailyPreparation[];
  recordConsumption: (
    date: string,
    items: ConsumptionItem[],
    totalAmount: number,
    stallId?: string,
    stallName?: string
  ) => void;
  getStatsByDate: (date: string) => SalesStats | undefined;
  getStatsByDateRange: (startDate: string, endDate: string) => SalesStats[];
  getAggregatedStats: (
    startDate: string,
    endDate: string
  ) => {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    dailyData: { date: string; revenue: number; orders: number }[];
  };
  getTopDishes: (startDate: string, endDate: string, limit?: number) => { name: string; quantity: number; revenue: number }[];
  getPreparation: (date: string, mealType: 'lunch' | 'dinner') => DailyPreparation | undefined;
  updatePreparationItem: (
    date: string,
    mealType: 'lunch' | 'dinner',
    dishId: string,
    preparedQuantity: number,
    status: 'pending' | 'preparing' | 'ready'
  ) => void;
  generatePreparationFromBookings: (
    date: string,
    mealType: 'lunch' | 'dinner',
    bookings: { dishId: string; dishName: string; quantity: number }[]
  ) => void;
  init: () => void;
}

const getDateRangeDates = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d));
  }
  return dates;
};

export const useStatsStore = create<StatsState>((set, get) => ({
  salesStats: [],
  preparations: [],

  init: () => {
    const savedStats = storage.get<SalesStats[]>('salesStats', mockSalesStats);
    const savedPreparations = storage.get<DailyPreparation[]>('preparations', []);
    set({ salesStats: savedStats, preparations: savedPreparations });
  },

  recordConsumption: (date, items, totalAmount, stallId, stallName) => {
    set((state) => {
      const existingIndex = state.salesStats.findIndex((s) => s.date === date);
      let updatedStats: SalesStats[];

      if (existingIndex >= 0) {
        updatedStats = state.salesStats.map((s, idx) => {
          if (idx !== existingIndex) return s;

          const newDishSales: DishSale[] = [...s.dishSales];
          items.forEach((item) => {
            const existingDish = newDishSales.find((d) => d.dishId === item.dishId);
            if (existingDish) {
              existingDish.quantity += item.quantity;
              existingDish.revenue += item.subtotal;
            } else {
              newDishSales.push({
                dishId: item.dishId,
                dishName: item.dishName,
                quantity: item.quantity,
                revenue: item.subtotal,
              });
            }
          });

          const newStallStats = [...s.stallStats];
          if (stallId && stallName) {
            const existingStall = newStallStats.find((st) => st.stallId === stallId);
            if (existingStall) {
              existingStall.revenue += totalAmount;
              existingStall.orders += 1;
            } else {
              newStallStats.push({
                stallId,
                stallName,
                revenue: totalAmount,
                orders: 1,
              });
            }
          }

          return {
            ...s,
            totalRevenue: s.totalRevenue + totalAmount,
            totalOrders: s.totalOrders + 1,
            dishSales: newDishSales,
            stallStats: newStallStats,
          };
        });
      } else {
        const dishSales: DishSale[] = items.map((item) => ({
          dishId: item.dishId,
          dishName: item.dishName,
          quantity: item.quantity,
          revenue: item.subtotal,
        }));

        const stallStats = stallId && stallName
          ? [{ stallId, stallName, revenue: totalAmount, orders: 1 }]
          : [];

        const newStat: SalesStats = {
          date,
          totalRevenue: totalAmount,
          totalOrders: 1,
          dishSales,
          stallStats,
        };
        updatedStats = [...state.salesStats, newStat];
      }

      storage.set('salesStats', updatedStats);
      return { salesStats: updatedStats };
    });
  },

  getStatsByDate: (date) => {
    return get().salesStats.find((s) => s.date === date);
  },

  getStatsByDateRange: (startDate, endDate) => {
    return get().salesStats.filter((s) => s.date >= startDate && s.date <= endDate);
  },

  getAggregatedStats: (startDate, endDate) => {
    const stats = get().getStatsByDateRange(startDate, endDate);
    const totalRevenue = stats.reduce((sum, s) => sum + s.totalRevenue, 0);
    const totalOrders = stats.reduce((sum, s) => sum + s.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0;

    const allDates = getDateRangeDates(startDate, endDate);
    const statsMap = new Map(stats.map((s) => [s.date, s]));
    const dailyData = allDates.map((date) => {
      const s = statsMap.get(date);
      return {
        date: date.slice(5),
        revenue: s?.totalRevenue || 0,
        orders: s?.totalOrders || 0,
      };
    });

    return { totalRevenue, totalOrders, avgOrderValue, dailyData };
  },

  getTopDishes: (startDate, endDate, limit = 10) => {
    const stats = get().getStatsByDateRange(startDate, endDate);
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
  },

  getPreparation: (date, mealType) => {
    return get().preparations.find((p) => p.date === date && p.mealType === mealType);
  },

  updatePreparationItem: (date, mealType, dishId, preparedQuantity, status) => {
    set((state) => {
      const updated = state.preparations.map((p) => {
        if (p.date === date && p.mealType === mealType) {
          const items = p.items.map((item) =>
            item.dishId === dishId ? { ...item, preparedQuantity, status } : item
          );
          const totalPrepared = items.reduce((sum, i) => sum + i.preparedQuantity, 0);
          return { ...p, items, totalPrepared };
        }
        return p;
      });
      storage.set('preparations', updated);
      return { preparations: updated };
    });
  },

  generatePreparationFromBookings: (date, mealType, bookings) => {
    const dishMap = new Map<string, { name: string; quantity: number }>();
    bookings.forEach((b) => {
      const existing = dishMap.get(b.dishId);
      if (existing) {
        existing.quantity += b.quantity;
      } else {
        dishMap.set(b.dishId, { name: b.dishName, quantity: b.quantity });
      }
    });

    const items: PreparationItem[] = Array.from(dishMap.entries()).map(([dishId, data]) => ({
      dishId,
      dishName: data.name,
      bookedQuantity: data.quantity,
      preparedQuantity: 0,
      status: 'pending' as const,
    }));

    const totalBooked = items.reduce((sum, i) => sum + i.bookedQuantity, 0);

    set((state) => {
      const existingIndex = state.preparations.findIndex(
        (p) => p.date === date && p.mealType === mealType
      );
      let updated;
      if (existingIndex >= 0) {
        updated = state.preparations.map((p, idx) =>
          idx === existingIndex
            ? { ...p, items, totalBooked, totalPrepared: 0 }
            : p
        );
      } else {
        const newPrep: DailyPreparation = {
          date,
          mealType,
          items,
          totalBooked,
          totalPrepared: 0,
        };
        updated = [...state.preparations, newPrep];
      }
      storage.set('preparations', updated);
      return { preparations: updated };
    });
  },
}));
