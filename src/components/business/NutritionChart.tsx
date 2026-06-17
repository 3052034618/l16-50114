import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import type { NutritionAnalysis } from '@/types';
import { RECOMMENDED_DAILY, getNutrientStatus } from '@/utils/nutrition';

interface NutritionChartProps {
  analysis: NutritionAnalysis;
}

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#eab308'];

export const NutritionChart = ({ analysis }: NutritionChartProps) => {
  const pieData = [
    { name: '蛋白质', value: analysis.avgProtein * 4, color: COLORS[0] },
    { name: '脂肪', value: analysis.avgFat * 9, color: COLORS[1] },
    { name: '碳水', value: analysis.avgCarbs * 4, color: COLORS[2] },
  ];

  const dailyData = analysis.dailyData.map((d) => ({
    date: d.date.slice(5),
    热量: d.calories,
    蛋白质: d.protein,
  }));

  const nutrients = [
    {
      name: '热量',
      value: analysis.avgCalories,
      recommended: RECOMMENDED_DAILY.calories,
      unit: 'kcal',
    },
    {
      name: '蛋白质',
      value: analysis.avgProtein,
      recommended: RECOMMENDED_DAILY.protein,
      unit: 'g',
    },
    {
      name: '脂肪',
      value: analysis.avgFat,
      recommended: RECOMMENDED_DAILY.fat,
      unit: 'g',
    },
    {
      name: '碳水',
      value: analysis.avgCarbs,
      recommended: RECOMMENDED_DAILY.carbs,
      unit: 'g',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-slide-up animate-stagger-1">
          <CardHeader>
            <CardTitle>营养素占比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value} kcal`}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-slide-up animate-stagger-2">
          <CardHeader>
            <CardTitle>每日摄入趋势（{analysis.period === 'week' ? '近7天' : '近30天'}）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#78716c" 
                    fontSize={12}
                    interval={analysis.period === 'month' ? 3 : 0}
                  />
                  <YAxis stroke="#78716c" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="热量" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="蛋白质" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="animate-slide-up animate-stagger-3">
        <CardHeader>
          <CardTitle>营养指标达标情况</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {nutrients.map((nutrient, idx) => {
            const status = getNutrientStatus(nutrient.value, nutrient.recommended);
            return (
              <div key={nutrient.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-stone-900">{nutrient.name}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: status.color + '20', color: status.color }}
                    >
                      {status.status === 'low' ? '偏低' : status.status === 'high' ? '偏高' : '正常'}
                    </span>
                  </div>
                  <span className="text-sm text-stone-600">
                    {nutrient.value} / {nutrient.recommended.max} {nutrient.unit}
                  </span>
                </div>
                <ProgressBar
                  value={nutrient.value}
                  max={nutrient.recommended.max}
                  color={status.color}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {analysis.imbalanceTags.length > 0 && (
        <Card className="animate-slide-up animate-stagger-4 bg-amber-50/50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">⚠️ 饮食提醒</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.imbalanceTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="animate-slide-up animate-stagger-5 bg-primary-50/50 border-primary-200">
        <CardHeader>
          <CardTitle className="text-primary-800">💡 饮食建议</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {analysis.suggestions.map((suggestion, idx) => (
              <li key={idx} className="flex items-start gap-2 text-stone-700">
                <span className="text-primary-500 mt-1">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
