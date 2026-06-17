import type { Recharge } from '../types';
import { formatDateTime } from '../utils/date';

const generateTimestamp = (daysAgo: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
  return formatDateTime(d);
};

export const mockRecharges: Recharge[] = [
  {
    id: 'recharge-001',
    parentId: 'par-001',
    studentId: 'stu-001',
    studentName: '张小明',
    amount: 200,
    method: 'wechat',
    status: 'success',
    timestamp: generateTimestamp(15),
  },
  {
    id: 'recharge-002',
    parentId: 'par-001',
    studentId: 'stu-001',
    studentName: '张小明',
    amount: 300,
    method: 'alipay',
    status: 'success',
    timestamp: generateTimestamp(10),
  },
  {
    id: 'recharge-003',
    parentId: 'par-001',
    studentId: 'stu-001',
    studentName: '张小明',
    amount: 500,
    method: 'wechat',
    status: 'success',
    timestamp: generateTimestamp(5),
  },
  {
    id: 'recharge-004',
    parentId: 'par-002',
    studentId: 'stu-002',
    studentName: '李小红',
    amount: 200,
    method: 'wechat',
    status: 'success',
    timestamp: generateTimestamp(12),
  },
  {
    id: 'recharge-005',
    parentId: 'par-002',
    studentId: 'stu-002',
    studentName: '李小红',
    amount: 300,
    method: 'card',
    status: 'success',
    timestamp: generateTimestamp(6),
  },
];

export const getRechargesByParent = (parentId: string): Recharge[] => {
  return mockRecharges
    .filter((r) => r.parentId === parentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getRechargesByStudent = (studentId: string): Recharge[] => {
  return mockRecharges
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const getTotalRecharged = (studentId: string): number => {
  return mockRecharges
    .filter((r) => r.studentId === studentId && r.status === 'success')
    .reduce((sum, r) => sum + r.amount, 0);
};
