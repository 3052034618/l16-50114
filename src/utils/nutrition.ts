import type { Nutrition, NutritionRecord, NutritionAnalysis } from '../types';

export const calculateDailyNutrition = (
  records: NutritionRecord[],
  date: string
): Nutrition => {
  const dayRecords = records.filter((r) => r.date === date);
  return dayRecords.reduce(
    (acc, r) => ({
      calories: acc.calories + r.calories,
      protein: acc.protein + r.protein,
      fat: acc.fat + r.fat,
      carbs: acc.carbs + r.carbs,
      vitamins: [],
      minerals: [],
    }),
    { calories: 0, protein: 0, fat: 0, carbs: 0, vitamins: [], minerals: [] }
  );
};

export const generateNutritionAnalysis = (
  records: NutritionRecord[],
  period: 'week' | 'month'
): NutritionAnalysis => {
  const now = new Date();
  const days = period === 'week' ? 7 : 30;

  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const dailyData = dates.map((date) => {
    const dayRecords = records.filter((r) => r.date === date);
    return dayRecords.reduce(
      (acc, r) => ({
        date,
        calories: acc.calories + r.calories,
        protein: acc.protein + r.protein,
        fat: acc.fat + r.fat,
        carbs: acc.carbs + r.carbs,
      }),
      { date, calories: 0, protein: 0, fat: 0, carbs: 0 }
    );
  });

  const validDays = dailyData.filter((d) => d.calories > 0);
  const avgCalories = validDays.length > 0
    ? Math.round(validDays.reduce((sum, d) => sum + d.calories, 0) / validDays.length)
    : 0;
  const avgProtein = validDays.length > 0
    ? Math.round(validDays.reduce((sum, d) => sum + d.protein, 0) / validDays.length)
    : 0;
  const avgFat = validDays.length > 0
    ? Math.round(validDays.reduce((sum, d) => sum + d.fat, 0) / validDays.length)
    : 0;
  const avgCarbs = validDays.length > 0
    ? Math.round(validDays.reduce((sum, d) => sum + d.carbs, 0) / validDays.length)
    : 0;

  const suggestions: string[] = [];
  const imbalanceTags: string[] = [];

  if (avgCalories < 1500 && avgCalories > 0) {
    suggestions.push('热量摄入偏低，建议增加主食和蛋白质的摄入');
    imbalanceTags.push('热量不足');
  } else if (avgCalories > 2800) {
    suggestions.push('热量摄入偏高，建议减少高热量食物，增加蔬菜摄入');
    imbalanceTags.push('热量超标');
  }

  if (avgProtein < 50 && avgCalories > 0) {
    suggestions.push('蛋白质摄入不足，建议多吃鸡蛋、牛奶、瘦肉等高蛋白食物');
    imbalanceTags.push('蛋白质不足');
  }

  if (avgFat > 80) {
    suggestions.push('脂肪摄入偏高，建议减少油炸食品和肥肉的摄入');
    imbalanceTags.push('脂肪超标');
  }

  if (avgCarbs < 200 && avgCalories > 0) {
    suggestions.push('碳水摄入偏低，建议适当增加米饭、面食等主食');
    imbalanceTags.push('碳水不足');
  } else if (avgCarbs > 400) {
    suggestions.push('碳水摄入偏高，建议减少精制碳水，增加粗粮比例');
    imbalanceTags.push('碳水超标');
  }

  if (suggestions.length === 0 && avgCalories > 0) {
    suggestions.push('您的饮食结构很均衡，请继续保持！');
  } else if (avgCalories === 0) {
    suggestions.push('暂无足够数据进行营养分析，请先记录饮食');
  }

  return {
    period,
    startDate: dates[0],
    endDate: dates[dates.length - 1],
    avgCalories,
    avgProtein,
    avgFat,
    avgCarbs,
    dailyData,
    suggestions,
    imbalanceTags,
  };
};

export const getNutrientStatus = (
  current: number,
  recommended: { min: number; max: number }
): { status: 'low' | 'normal' | 'high'; color: string } => {
  if (current < recommended.min) return { status: 'low', color: '#f97316' };
  if (current > recommended.max) return { status: 'high', color: '#ef4444' };
  return { status: 'normal', color: '#22c55e' };
};

export const RECOMMENDED_DAILY = {
  calories: { min: 1800, max: 2500 },
  protein: { min: 50, max: 80 },
  fat: { min: 50, max: 80 },
  carbs: { min: 250, max: 350 },
};
