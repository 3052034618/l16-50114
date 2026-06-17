import type { Consumption } from '../types';
import { formatDateTime } from '../utils/date';

const generateTimestamp = (daysAgo: number, hour: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return formatDateTime(d);
};

export const mockConsumptions: Consumption[] = [
  {
    id: 'cons-001',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-2', dishName: '宫保鸡丁饭', quantity: 1, unitPrice: 16, subtotal: 16 },
      { dishId: 'dish-8', dishName: '清炒时蔬', quantity: 1, unitPrice: 8, subtotal: 8 },
    ],
    totalAmount: 24,
    balanceAfter: 580,
    timestamp: generateTimestamp(6, 12),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-002',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'onsite',
    items: [
      { dishId: 'dish-17', dishName: '肉夹馍', quantity: 1, unitPrice: 10, subtotal: 10 },
      { dishId: 'dish-19', dishName: '鲜榨橙汁', quantity: 1, unitPrice: 10, subtotal: 10 },
    ],
    totalAmount: 20,
    balanceAfter: 560,
    timestamp: generateTimestamp(6, 18),
    stallId: 'stall-2',
    stallName: '风味小吃',
  },
  {
    id: 'cons-003',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-1', dishName: '红烧排骨饭', quantity: 1, unitPrice: 18, subtotal: 18 },
      { dishId: 'dish-11', dishName: '西红柿蛋汤', quantity: 1, unitPrice: 5, subtotal: 5 },
    ],
    totalAmount: 23,
    balanceAfter: 537,
    timestamp: generateTimestamp(5, 12),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-004',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'onsite',
    items: [
      { dishId: 'dish-15', dishName: '意大利面', quantity: 1, unitPrice: 22, subtotal: 22 },
      { dishId: 'dish-20', dishName: '提拉米苏', quantity: 1, unitPrice: 18, subtotal: 18 },
    ],
    totalAmount: 40,
    balanceAfter: 497,
    timestamp: generateTimestamp(5, 18),
    stallId: 'stall-3',
    stallName: '西餐简餐',
  },
  {
    id: 'cons-005',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-3', dishName: '鱼香肉丝饭', quantity: 1, unitPrice: 15, subtotal: 15 },
      { dishId: 'dish-9', dishName: '蒜蓉西兰花', quantity: 1, unitPrice: 10, subtotal: 10 },
      { dishId: 'dish-13', dishName: '玉米排骨汤', quantity: 1, unitPrice: 12, subtotal: 12 },
    ],
    totalAmount: 37,
    balanceAfter: 460,
    timestamp: generateTimestamp(4, 12),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-006',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-5', dishName: '红烧肉', quantity: 1, unitPrice: 22, subtotal: 22 },
      { dishId: 'dish-10', dishName: '凉拌黄瓜', quantity: 1, unitPrice: 6, subtotal: 6 },
      { dishId: 'dish-12', dishName: '紫菜蛋花汤', quantity: 1, unitPrice: 5, subtotal: 5 },
    ],
    totalAmount: 33,
    balanceAfter: 427,
    timestamp: generateTimestamp(4, 18),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-007',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-4', dishName: '麻婆豆腐饭', quantity: 1, unitPrice: 12, subtotal: 12 },
      { dishId: 'dish-7', dishName: '宫保鸡丁', quantity: 1, unitPrice: 18, subtotal: 18 },
      { dishId: 'dish-8', dishName: '清炒时蔬', quantity: 1, unitPrice: 8, subtotal: 8 },
    ],
    totalAmount: 38,
    balanceAfter: 389,
    timestamp: generateTimestamp(3, 12),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-008',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'onsite',
    items: [
      { dishId: 'dish-16', dishName: '手抓饼', quantity: 2, unitPrice: 8, subtotal: 16 },
      { dishId: 'dish-18', dishName: '珍珠奶茶', quantity: 1, unitPrice: 12, subtotal: 12 },
    ],
    totalAmount: 28,
    balanceAfter: 361,
    timestamp: generateTimestamp(3, 18),
    stallId: 'stall-2',
    stallName: '风味小吃',
  },
  {
    id: 'cons-009',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-6', dishName: '清蒸鲈鱼', quantity: 1, unitPrice: 28, subtotal: 28 },
      { dishId: 'dish-9', dishName: '蒜蓉西兰花', quantity: 1, unitPrice: 10, subtotal: 10 },
      { dishId: 'dish-13', dishName: '玉米排骨汤', quantity: 1, unitPrice: 12, subtotal: 12 },
    ],
    totalAmount: 50,
    balanceAfter: 311,
    timestamp: generateTimestamp(2, 18),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
  {
    id: 'cons-010',
    studentId: 'stu-001',
    studentName: '张小明',
    type: 'booking',
    items: [
      { dishId: 'dish-1', dishName: '红烧排骨饭', quantity: 1, unitPrice: 18, subtotal: 18 },
      { dishId: 'dish-8', dishName: '清炒时蔬', quantity: 1, unitPrice: 8, subtotal: 8 },
      { dishId: 'dish-11', dishName: '西红柿蛋汤', quantity: 1, unitPrice: 5, subtotal: 5 },
    ],
    totalAmount: 31,
    balanceAfter: 568.5,
    timestamp: generateTimestamp(1, 12),
    stallId: 'stall-1',
    stallName: '中式快餐',
  },
];

export const getConsumptionsByStudent = (studentId: string): Consumption[] => {
  return mockConsumptions
    .filter((c) => c.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getConsumptionStats = (
  studentId: string,
  startDate: string,
  endDate: string
): { total: number; count: number } => {
  const records = mockConsumptions.filter(
    (c) =>
      c.studentId === studentId &&
      c.timestamp >= startDate &&
      c.timestamp <= endDate + ' 23:59:59'
  );
  return {
    total: records.reduce((sum, r) => sum + r.totalAmount, 0),
    count: records.length,
  };
};
