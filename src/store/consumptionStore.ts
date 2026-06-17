import { create } from 'zustand';
import type { Consumption, ConsumptionItem, Recharge } from '../types';
import { mockConsumptions, getConsumptionsByStudent } from '../data/mockConsumptions';
import { mockRecharges, getRechargesByParent, getRechargesByStudent } from '../data/mockRecharges';
import { storage } from '../utils/storage';
import { formatDateTime, getToday } from '../utils/date';
import { useStatsStore } from './statsStore';

interface ConsumptionState {
  consumptions: Consumption[];
  recharges: Recharge[];
  addConsumption: (
    studentId: string,
    studentName: string,
    type: 'booking' | 'onsite',
    items: ConsumptionItem[],
    balanceAfter: number,
    stallId?: string,
    stallName?: string
  ) => Consumption;
  addRecharge: (
    parentId: string,
    studentId: string,
    studentName: string,
    amount: number,
    method: 'wechat' | 'alipay' | 'card'
  ) => Recharge;
  getConsumptionsByStudent: (studentId: string) => Consumption[];
  getRechargesByStudent: (studentId: string) => Recharge[];
  getRechargesByParent: (parentId: string) => Recharge[];
  getStudentBalance: (studentId: string) => number;
  getConsumptionStats: (
    studentId: string,
    startDate: string,
    endDate: string
  ) => { total: number; count: number };
  init: () => void;
}

export const useConsumptionStore = create<ConsumptionState>((set, get) => ({
  consumptions: [],
  recharges: [],

  init: () => {
    const savedConsumptions = storage.get<Consumption[]>('consumptions', mockConsumptions);
    const savedRecharges = storage.get<Recharge[]>('recharges', mockRecharges);
    set({ consumptions: savedConsumptions, recharges: savedRecharges });
  },

  addConsumption: (studentId, studentName, type, items, balanceAfter, stallId, stallName) => {
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const newConsumption: Consumption = {
      id: `cons-${Date.now()}`,
      studentId,
      studentName,
      type,
      items,
      totalAmount,
      balanceAfter,
      timestamp: formatDateTime(new Date()),
      stallId,
      stallName,
    };

    set((state) => {
      const updated = [...state.consumptions, newConsumption];
      storage.set('consumptions', updated);
      return { consumptions: updated };
    });

    useStatsStore.getState().recordConsumption(
      getToday(),
      items,
      totalAmount,
      stallId,
      stallName
    );

    return newConsumption;
  },

  addRecharge: (parentId, studentId, studentName, amount, method) => {
    const newRecharge: Recharge = {
      id: `recharge-${Date.now()}`,
      parentId,
      studentId,
      studentName,
      amount,
      method,
      status: 'success',
      timestamp: formatDateTime(new Date()),
    };

    set((state) => {
      const updated = [...state.recharges, newRecharge];
      storage.set('recharges', updated);
      return { recharges: updated };
    });

    return newRecharge;
  },

  getConsumptionsByStudent: (studentId) => {
    return get()
      .consumptions.filter((c) => c.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getRechargesByStudent: (studentId) => {
    return get()
      .recharges.filter((r) => r.studentId === studentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getRechargesByParent: (parentId) => {
    return get()
      .recharges.filter((r) => r.parentId === parentId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  getStudentBalance: (studentId) => {
    const recharges = get().getRechargesByStudent(studentId);
    const consumptions = get().getConsumptionsByStudent(studentId);

    const totalRecharged = recharges
      .filter((r) => r.status === 'success')
      .reduce((sum, r) => sum + r.amount, 0);
    const totalSpent = consumptions.reduce((sum, c) => sum + c.totalAmount, 0);

    return Math.round((totalRecharged - totalSpent) * 100) / 100;
  },

  getConsumptionStats: (studentId, startDate, endDate) => {
    const records = get().consumptions.filter(
      (c) =>
        c.studentId === studentId &&
        c.timestamp >= startDate &&
        c.timestamp <= endDate + ' 23:59:59'
    );
    return {
      total: records.reduce((sum, r) => sum + r.totalAmount, 0),
      count: records.length,
    };
  },
}));
