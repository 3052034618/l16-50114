import type { NutritionRecord } from '../types';
import { formatDate } from '../utils/date';

const generateNutritionRecords = (studentId: string, days: number): NutritionRecord[] => {
  const records: NutritionRecord[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);

    const baseCalories = 1800 + Math.floor(Math.random() * 800);
    const baseProtein = 40 + Math.floor(Math.random() * 40);
    const baseFat = 40 + Math.floor(Math.random() * 50);
    const baseCarbs = 200 + Math.floor(Math.random() * 150);

    records.push({
      id: `nut-${studentId}-${dateStr}`,
      studentId,
      date: dateStr,
      calories: baseCalories,
      protein: baseProtein,
      fat: baseFat,
      carbs: baseCarbs,
    });
  }
  return records;
};

export const mockNutritionRecords: NutritionRecord[] = [
  ...generateNutritionRecords('stu-001', 30),
  ...generateNutritionRecords('stu-002', 25),
  ...generateNutritionRecords('stu-003', 20),
];

export const getNutritionByStudent = (studentId: string): NutritionRecord[] => {
  return mockNutritionRecords.filter((r) => r.studentId === studentId);
};

export const getNutritionByStudentAndDate = (
  studentId: string,
  date: string
): NutritionRecord | undefined => {
  return mockNutritionRecords.find((r) => r.studentId === studentId && r.date === date);
};
