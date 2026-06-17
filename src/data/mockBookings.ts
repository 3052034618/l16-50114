import type { Booking } from '../types';
import { getToday, formatDateTime } from '../utils/date';

export const mockBookings: Booking[] = [
  {
    id: 'booking-001',
    studentId: 'stu-001',
    studentName: '张小明',
    items: [
      { dishId: 'dish-1', dishName: '红烧排骨饭', quantity: 1, unitPrice: 18, subtotal: 18 },
      { dishId: 'dish-8', dishName: '清炒时蔬', quantity: 1, unitPrice: 8, subtotal: 8 },
      { dishId: 'dish-11', dishName: '西红柿蛋汤', quantity: 1, unitPrice: 5, subtotal: 5 },
    ],
    totalAmount: 31,
    mealType: 'lunch',
    status: 'confirmed',
    bookingTime: formatDateTime(new Date(Date.now() - 3600000 * 2)),
    pickupCode: 'LUN20240618001',
  },
  {
    id: 'booking-002',
    studentId: 'stu-001',
    studentName: '张小明',
    items: [
      { dishId: 'dish-6', dishName: '清蒸鲈鱼', quantity: 1, unitPrice: 28, subtotal: 28 },
      { dishId: 'dish-9', dishName: '蒜蓉西兰花', quantity: 1, unitPrice: 10, subtotal: 10 },
      { dishId: 'dish-13', dishName: '玉米排骨汤', quantity: 1, unitPrice: 12, subtotal: 12 },
    ],
    totalAmount: 50,
    mealType: 'dinner',
    status: 'pending',
    bookingTime: formatDateTime(new Date(Date.now() - 3600000 * 1)),
    pickupCode: 'DIN20240618001',
  },
  {
    id: 'booking-003',
    studentId: 'stu-002',
    studentName: '李小红',
    items: [
      { dishId: 'dish-2', dishName: '宫保鸡丁饭', quantity: 1, unitPrice: 16, subtotal: 16 },
      { dishId: 'dish-19', dishName: '鲜榨橙汁', quantity: 1, unitPrice: 10, subtotal: 10 },
    ],
    totalAmount: 26,
    mealType: 'lunch',
    status: 'picked',
    bookingTime: formatDateTime(new Date(Date.now() - 3600000 * 3)),
    pickupTime: formatDateTime(new Date(Date.now() - 3600000 * 2.5)),
    pickupCode: 'LUN20240618002',
  },
  {
    id: 'booking-004',
    studentId: 'stu-003',
    studentName: '王小强',
    items: [
      { dishId: 'dish-14', dishName: '汉堡套餐', quantity: 1, unitPrice: 25, subtotal: 25 },
      { dishId: 'dish-18', dishName: '珍珠奶茶', quantity: 1, unitPrice: 12, subtotal: 12 },
    ],
    totalAmount: 37,
    mealType: 'lunch',
    status: 'confirmed',
    bookingTime: formatDateTime(new Date(Date.now() - 3600000 * 1.5)),
    pickupCode: 'LUN20240618003',
  },
  {
    id: 'booking-005',
    studentId: 'stu-001',
    studentName: '张小明',
    items: [
      { dishId: 'dish-16', dishName: '手抓饼', quantity: 2, unitPrice: 8, subtotal: 16 },
      { dishId: 'dish-12', dishName: '紫菜蛋花汤', quantity: 1, unitPrice: 5, subtotal: 5 },
    ],
    totalAmount: 21,
    mealType: 'dinner',
    status: 'cancelled',
    bookingTime: formatDateTime(new Date(Date.now() - 3600000 * 5)),
    pickupCode: 'DIN20240617001',
  },
];

export const getBookingsByStudent = (studentId: string): Booking[] => {
  return mockBookings.filter((b) => b.studentId === studentId);
};

export const getBookingsByDateAndMeal = (
  date: string,
  mealType: 'lunch' | 'dinner'
): Booking[] => {
  return mockBookings.filter(
    (b) => b.bookingTime.startsWith(date) && b.mealType === mealType && b.status !== 'cancelled'
  );
};

export const getTodayBookings = (): Booking[] => {
  const today = getToday();
  return mockBookings.filter((b) => b.bookingTime.startsWith(today) && b.status !== 'cancelled');
};
