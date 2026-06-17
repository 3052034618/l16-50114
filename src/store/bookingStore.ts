import { create } from 'zustand';
import type { Booking, BookingItem, Dish } from '../types';
import { mockBookings, getTodayBookings } from '../data/mockBookings';
import { storage } from '../utils/storage';
import { formatDateTime, getToday } from '../utils/date';

export interface CartItem {
  dish: Dish;
  quantity: number;
}

interface BookingState {
  bookings: Booking[];
  cart: CartItem[];
  mealType: 'lunch' | 'dinner';
  addToCart: (dish: Dish) => void;
  removeFromCart: (dishId: string) => void;
  updateCartQuantity: (dishId: string, quantity: number) => void;
  clearCart: () => void;
  setMealType: (type: 'lunch' | 'dinner') => void;
  getCartTotal: () => number;
  submitBooking: (studentId: string, studentName: string) => Booking | null;
  cancelBooking: (bookingId: string) => void;
  confirmPickup: (bookingId: string) => void;
  getBookingsByStudent: (studentId: string) => Booking[];
  getTodayBookingsByMeal: (mealType: 'lunch' | 'dinner') => Booking[];
  getBookingByCode: (code: string) => Booking | undefined;
  init: () => void;
}

const generatePickupCode = (mealType: 'lunch' | 'dinner') => {
  const prefix = mealType === 'lunch' ? 'LUN' : 'DIN';
  const today = getToday().replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}${today}${random}`;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: [],
  cart: [],
  mealType: 'lunch',

  init: () => {
    const savedBookings = storage.get<Booking[]>('bookings', mockBookings);
    set({ bookings: savedBookings });
  },

  addToCart: (dish) => {
    set((state) => {
      const existing = state.cart.find((item) => item.dish.id === dish.id);
      if (existing) {
        return {
          cart: state.cart.map((item) =>
            item.dish.id === dish.id
              ? { ...item, quantity: Math.min(item.quantity + 1, dish.stock) }
              : item
          ),
        };
      }
      return { cart: [...state.cart, { dish, quantity: 1 }] };
    });
  },

  removeFromCart: (dishId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.dish.id !== dishId),
    }));
  },

  updateCartQuantity: (dishId, quantity) => {
    if (quantity <= 0) {
      get().removeFromCart(dishId);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.dish.id === dishId
          ? { ...item, quantity: Math.min(quantity, item.dish.stock) }
          : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  setMealType: (type) => {
    set({ mealType: type, cart: [] });
  },

  getCartTotal: () => {
    return get().cart.reduce((sum, item) => sum + item.dish.price * item.quantity, 0);
  },

  submitBooking: (studentId, studentName) => {
    const { cart, mealType } = get();
    if (cart.length === 0) return null;

    const items: BookingItem[] = cart.map((item) => ({
      dishId: item.dish.id,
      dishName: item.dish.name,
      quantity: item.quantity,
      unitPrice: item.dish.price,
      subtotal: item.dish.price * item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    const newBooking: Booking = {
      id: `booking-${Date.now()}`,
      studentId,
      studentName,
      items,
      totalAmount,
      mealType,
      status: 'confirmed',
      bookingTime: formatDateTime(new Date()),
      pickupCode: generatePickupCode(mealType),
    };

    set((state) => {
      const updated = [...state.bookings, newBooking];
      storage.set('bookings', updated);
      return { bookings: updated, cart: [] };
    });

    return newBooking;
  },

  cancelBooking: (bookingId) => {
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'cancelled' as const } : b
      );
      storage.set('bookings', updated);
      return { bookings: updated };
    });
  },

  confirmPickup: (bookingId) => {
    set((state) => {
      const updated = state.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'picked' as const, pickupTime: formatDateTime(new Date()) }
          : b
      );
      storage.set('bookings', updated);
      return { bookings: updated };
    });
  },

  getBookingsByStudent: (studentId) => {
    return get()
      .bookings.filter((b) => b.studentId === studentId)
      .sort((a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime());
  },

  getTodayBookingsByMeal: (mealType) => {
    const today = getToday();
    return get().bookings.filter(
      (b) =>
        b.bookingTime.startsWith(today) &&
        b.mealType === mealType &&
        b.status !== 'cancelled'
    );
  },

  getBookingByCode: (code) => {
    return get().bookings.find((b) => b.pickupCode === code);
  },
}));
