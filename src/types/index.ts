export type UserRole = 'student' | 'parent' | 'admin' | 'kitchen';

export interface User {
  id: string;
  role: UserRole;
  username: string;
  name: string;
  avatar?: string;
  password: string;
}

export interface Student extends User {
  role: 'student';
  studentNo: string;
  balance: number;
  className: string;
  grade: string;
  parentId?: string;
}

export interface Parent extends User {
  role: 'parent';
  phone: string;
  boundStudents: string[];
}

export interface Admin extends User {
  role: 'admin';
  staffNo: string;
}

export interface KitchenStaff extends User {
  role: 'kitchen';
  staffNo: string;
}

export type AnyUser = Student | Parent | Admin | KitchenStaff;

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  vitamins: string[];
  minerals: string[];
}

export type DishCategory = '主食' | '荤菜' | '素菜' | '汤品' | '饮品';
export type MealType = 'lunch' | 'dinner' | 'all';

export interface Dish {
  id: string;
  name: string;
  price: number;
  image: string;
  stallId: string;
  stallName: string;
  category: DishCategory;
  stock: number;
  maxStock: number;
  nutrition: Nutrition;
  tags: string[];
  description: string;
  isAvailable: boolean;
  mealType: MealType;
}

export interface Stall {
  id: string;
  name: string;
  type: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'picked' | 'cancelled';

export interface BookingItem {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  items: BookingItem[];
  totalAmount: number;
  mealType: 'lunch' | 'dinner';
  status: BookingStatus;
  bookingTime: string;
  pickupTime?: string;
  pickupCode: string;
}

export interface ConsumptionItem {
  dishId: string;
  dishName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Consumption {
  id: string;
  studentId: string;
  studentName: string;
  type: 'booking' | 'onsite';
  items: ConsumptionItem[];
  totalAmount: number;
  balanceAfter: number;
  timestamp: string;
  stallId?: string;
  stallName?: string;
}

export type RechargeMethod = 'wechat' | 'alipay' | 'card';
export type RechargeStatus = 'success' | 'pending' | 'failed';

export interface Recharge {
  id: string;
  parentId: string;
  studentId: string;
  studentName: string;
  amount: number;
  method: RechargeMethod;
  status: RechargeStatus;
  timestamp: string;
}

export interface NutritionRecord {
  id: string;
  studentId: string;
  date: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface NutritionAnalysis {
  period: 'week' | 'month';
  startDate: string;
  endDate: string;
  avgCalories: number;
  avgProtein: number;
  avgFat: number;
  avgCarbs: number;
  dailyData: {
    date: string;
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  }[];
  suggestions: string[];
  imbalanceTags: string[];
}

export interface DishSale {
  dishId: string;
  dishName: string;
  quantity: number;
  revenue: number;
}

export interface StallStat {
  stallId: string;
  stallName: string;
  revenue: number;
  orders: number;
}

export interface SalesStats {
  date: string;
  totalRevenue: number;
  totalOrders: number;
  dishSales: DishSale[];
  stallStats: StallStat[];
}

export interface PreparationItem {
  dishId: string;
  dishName: string;
  bookedQuantity: number;
  preparedQuantity: number;
  status: 'pending' | 'preparing' | 'ready';
}

export interface DailyPreparation {
  date: string;
  mealType: 'lunch' | 'dinner';
  items: PreparationItem[];
  totalBooked: number;
  totalPrepared: number;
}
