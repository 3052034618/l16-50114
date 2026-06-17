import { create } from 'zustand';
import type { Dish, Stall } from '../types';
import { mockDishes, mockStalls } from '../data/mockDishes';
import { storage } from '../utils/storage';

interface DishState {
  dishes: Dish[];
  stalls: Stall[];
  getDishesByStall: (stallId: string) => Dish[];
  getDishesByCategory: (category: string) => Dish[];
  getAvailableDishes: (mealType?: 'lunch' | 'dinner') => Dish[];
  getDishById: (id: string) => Dish | undefined;
  updateStock: (dishId: string, quantity: number) => void;
  addDish: (dish: Omit<Dish, 'id'>) => void;
  updateDish: (id: string, updates: Partial<Dish>) => void;
  deleteDish: (id: string) => void;
  toggleAvailability: (id: string) => void;
  init: () => void;
}

export const useDishStore = create<DishState>((set, get) => ({
  dishes: [],
  stalls: mockStalls,

  init: () => {
    const savedDishes = storage.get<Dish[]>('dishes', mockDishes);
    set({ dishes: savedDishes, stalls: mockStalls });
  },

  getDishesByStall: (stallId: string) => {
    return get().dishes.filter((d) => d.stallId === stallId && d.isAvailable);
  },

  getDishesByCategory: (category: string) => {
    return get().dishes.filter((d) => d.category === category && d.isAvailable);
  },

  getAvailableDishes: (mealType?: 'lunch' | 'dinner') => {
    const { dishes } = get();
    if (!mealType) return dishes.filter((d) => d.isAvailable);
    return dishes.filter((d) => d.isAvailable && (d.mealType === 'all' || d.mealType === mealType));
  },

  getDishById: (id: string) => {
    return get().dishes.find((d) => d.id === id);
  },

  updateStock: (dishId: string, quantity: number) => {
    set((state) => {
      const updated = state.dishes.map((d) =>
        d.id === dishId ? { ...d, stock: Math.max(0, d.stock - quantity) } : d
      );
      storage.set('dishes', updated);
      return { dishes: updated };
    });
  },

  addDish: (dish) => {
    set((state) => {
      const newDish: Dish = {
        ...dish,
        id: `dish-${Date.now()}`,
      };
      const updated = [...state.dishes, newDish];
      storage.set('dishes', updated);
      return { dishes: updated };
    });
  },

  updateDish: (id, updates) => {
    set((state) => {
      const updated = state.dishes.map((d) => (d.id === id ? { ...d, ...updates } : d));
      storage.set('dishes', updated);
      return { dishes: updated };
    });
  },

  deleteDish: (id) => {
    set((state) => {
      const updated = state.dishes.filter((d) => d.id !== id);
      storage.set('dishes', updated);
      return { dishes: updated };
    });
  },

  toggleAvailability: (id) => {
    set((state) => {
      const updated = state.dishes.map((d) =>
        d.id === id ? { ...d, isAvailable: !d.isAvailable } : d
      );
      storage.set('dishes', updated);
      return { dishes: updated };
    });
  },
}));
