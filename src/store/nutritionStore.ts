import { create } from 'zustand';
import type { NutritionRecord, NutritionAnalysis } from '../types';
import { mockNutritionRecords, getNutritionByStudent } from '../data/mockNutrition';
import { storage } from '../utils/storage';
import { generateNutritionAnalysis } from '../utils/nutrition';

interface NutritionState {
  records: NutritionRecord[];
  addRecord: (record: Omit<NutritionRecord, 'id'>) => void;
  getRecordsByStudent: (studentId: string) => NutritionRecord[];
  getAnalysis: (studentId: string, period: 'week' | 'month') => NutritionAnalysis;
  addNutritionFromConsumption: (
    studentId: string,
    date: string,
    calories: number,
    protein: number,
    fat: number,
    carbs: number
  ) => void;
  init: () => void;
}

export const useNutritionStore = create<NutritionState>((set, get) => ({
  records: [],

  init: () => {
    const savedRecords = storage.get<NutritionRecord[]>('nutritionRecords', mockNutritionRecords);
    set({ records: savedRecords });
  },

  addRecord: (record) => {
    set((state) => {
      const existing = state.records.find(
        (r) => r.studentId === record.studentId && r.date === record.date
      );
      let updated;
      if (existing) {
        updated = state.records.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                calories: r.calories + record.calories,
                protein: r.protein + record.protein,
                fat: r.fat + record.fat,
                carbs: r.carbs + record.carbs,
              }
            : r
        );
      } else {
        const newRecord: NutritionRecord = {
          ...record,
          id: `nut-${record.studentId}-${record.date}-${Date.now()}`,
        };
        updated = [...state.records, newRecord];
      }
      storage.set('nutritionRecords', updated);
      return { records: updated };
    });
  },

  getRecordsByStudent: (studentId) => {
    return get().records.filter((r) => r.studentId === studentId);
  },

  getAnalysis: (studentId, period) => {
    const records = get().getRecordsByStudent(studentId);
    return generateNutritionAnalysis(records, period);
  },

  addNutritionFromConsumption: (studentId, date, calories, protein, fat, carbs) => {
    get().addRecord({ studentId, date, calories, protein, fat, carbs });
  },
}));
