import { create } from 'zustand';
import type { SalesStats, DailyPreparation, PreparationItem, ConsumptionItem, DishSale, StallStat, Consumption } from '../types';
import { storage } from '../utils/storage';
import { getToday, formatDate } from '../utils/date';
import { useDishStore } from './dishStore';
import { useConsumptionStore } from './consumptionStore';

interface StatsState {
  salesStats: SalesStats[];
  preparations: DailyPreparation[];
  recordConsumption: (
    date: string,
    items: ConsumptionItem[],
    totalAmount: number
  ) => void;
  rebuildFromConsumptions: (consumptions: Consumption[]) => void;
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

const extractDate = (timestamp: string): string => {
  return timestamp.split(' ')[0].split('T')[0];
};

const groupItemsByStall = (items: ConsumptionItem[]): Map<string, { stallName: string; revenue: number }> => {
  const stallMap = new Map<string, { stallName: string; revenue: number }>();
  const dishStore = useDishStore.getState();

  items.forEach((item) => {
    const dish = dishStore.getDishById(item.dishId);
    if (dish) {
      const existing = stallMap.get(dish.stallId);
      if (existing) {
        existing.revenue += item.subtotal;
      } else {
        stallMap.set(dish.stallId, { stallName: dish.stallName, revenue: item.subtotal });
      }
    }
  });

  return stallMap;
};

const buildSalesStatsFromConsumptions = (consumptions: Consumption[]): SalesStats[] => {
  const dateMap = new Map<string, Consumption[]>();
  consumptions.forEach((c) => {
    const date = extractDate(c.timestamp);
    const list = dateMap.get(date);
    if (list) {
      list.push(c);
    } else {
      dateMap.set(date, [c]);
    }
  });

  const stats: SalesStats[] = [];
  dateMap.forEach((dayConsumptions, date) => {
    const dishSalesMap = new Map<string, DishSale>();
    const stallStatsMap = new Map<string, StallStat>();

    dayConsumptions.forEach((c) => {
      c.items.forEach((item) => {
        const existing = dishSalesMap.get(item.dishId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.subtotal;
        } else {
          dishSalesMap.set(item.dishId, {
            dishId: item.dishId,
            dishName: item.dishName,
            quantity: item.quantity,
            revenue: item.subtotal,
          });
        }
      });

      const stallMap = groupItemsByStall(c.items);
      stallMap.forEach((info, stallId) => {
        const existing = stallStatsMap.get(stallId);
        if (existing) {
          existing.revenue += info.revenue;
          existing.orders += 1;
        } else {
          stallStatsMap.set(stallId, {
            stallId,
            stallName: info.stallName,
            revenue: info.revenue,
            orders: 1,
          });
        }
      });
    });

    stats.push({
      date,
      totalRevenue: dayConsumptions.reduce((sum, c) => sum + c.totalAmount, 0),
      totalOrders: dayConsumptions.length,
      dishSales: Array.from(dishSalesMap.values()),
      stallStats: Array.from(stallStatsMap.values()),
    });
  });

  return stats.sort((a, b) => a.date.localeCompare(b.date));
};

export const useStatsStore = create<StatsState>((set, get) => ({
  salesStats: (() => {
    try {
      const cs = useConsumptionStore.getState();
      if (cs.consumptions.length > 0) {
        return buildSalesStatsFromConsumptions(cs.consumptions);
      }
    } catch {}
    return [];
  })(),
  preparations: storage.get<DailyPreparation[]>('preparations', []),

  init: () => {
    const consumptions = useConsumptionStore.getState().consumptions;
    const savedPreparations = storage.get<DailyPreparation[]>('preparations', []);
    if (consumptions.length > 0) {
      const rebuilt = buildSalesStatsFromConsumptions(consumptions);
      storage.set('salesStats', rebuilt);
      set({ salesStats: rebuilt, preparations: savedPreparations });
    } else {
      set({ salesStats: [], preparations: savedPreparations });
    }
  },

  rebuildFromConsumptions: (consumptions) => {
    const rebuilt = buildSalesStatsFromConsumptions(consumptions);
    storage.set('salesStats', rebuilt);
    set({ salesStats: rebuilt });
  },

  recordConsumption: (date, items, totalAmount) => {
    set((state) => {
      const stallMap = groupItemsByStall(items);

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
          stallMap.forEach((info, stallId) => {
            const existingStall = newStallStats.find((st) => st.stallId === stallId);
            if (existingStall) {
              existingStall.revenue += info.revenue;
              existingStall.orders += 1;
            } else {
              newStallStats.push({
                stallId,
                stallName: info.stallName,
                revenue: info.revenue,
                orders: 1,
              });
            }
          });

          return {
            ...s,
            totalRevenue: Math.round((s.totalRevenue + totalAmount) * 100) / 100,
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

        const stallStats: StallStat[] = [];
        stallMap.forEach((info, stallId) => {
          stallStats.push({
            stallId,
            stallName: info.stallName,
            revenue: info.revenue,
            orders: 1,
          });
        });

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
