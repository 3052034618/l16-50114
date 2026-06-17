import { create } from 'zustand';
import type { SalesStats, DailyPreparation, PreparationItem } from '../types';
import { mockSalesStats, getStatsByDate, getStatsByDateRange, getAggregatedStats, getTopDishes } from '../data/mockStats';
import { storage } from '../utils/storage';
import { getToday } from '../utils/date';

interface StatsState {
  salesStats: SalesStats[];
  preparations: DailyPreparation[];
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

export const useStatsStore = create<StatsState>((set, get) => ({
  salesStats: [],
  preparations: [],

  init: () => {
    const savedStats = storage.get<SalesStats[]>('salesStats', mockSalesStats);
    const savedPreparations = storage.get<DailyPreparation[]>('preparations', []);
    set({ salesStats: savedStats, preparations: savedPreparations });
  },

  getStatsByDate: (date) => {
    return get().salesStats.find((s) => s.date === date);
  },

  getStatsByDateRange: (startDate, endDate) => {
    return get().salesStats.filter((s) => s.date >= startDate && s.date <= endDate);
  },

  getAggregatedStats: (startDate, endDate) => {
    return getAggregatedStats(startDate, endDate);
  },

  getTopDishes: (startDate, endDate, limit = 10) => {
    return getTopDishes(startDate, endDate, limit);
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
