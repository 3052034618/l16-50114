import { useEffect, useState } from 'react';
import { Activity, TrendingUp, Calendar, Target, Award, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNutritionStore } from '@/store/nutritionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { NutritionChart } from '@/components/business/NutritionChart';
import type { NutritionAnalysis } from '@/types';

export default function StudentNutrition() {
  const { currentUser } = useAuthStore();
  const { records, getAnalysis, getRecordsByStudent, init: initNutrition } = useNutritionStore();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    initNutrition();
  }, [initNutrition]);

  const studentId = currentUser?.role === 'student' ? currentUser.id : '';
  const myRecords = getRecordsByStudent(studentId);
  const analysis = getAnalysis(studentId, period);

  const getHealthScore = (analysis: NutritionAnalysis): number => {
    let score = 100;
    analysis.imbalanceTags.forEach((tag) => {
      if (tag.includes('严重') || tag.includes('过高') || tag.includes('不足')) {
        score -= 15;
      } else {
        score -= 8;
      }
    });
    return Math.max(0, score);
  };

  const healthScore = getHealthScore(analysis);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    if (score >= 60) return '及格';
    return '需要改善';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <Card className="h-full bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-5 h-5 text-white/80" />
                    <span className="text-white/80 text-sm font-medium">健康评分</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className={`text-6xl font-bold ${getScoreColor(healthScore).replace('text-', 'text-white')}`}>
                      {healthScore}
                    </span>
                    <span className="text-2xl text-white/60">/100</span>
                  </div>
                  <Badge className="mt-3 bg-white/20 text-white border-none">
                    <Award className="w-3 h-3 mr-1" />
                    {getScoreLabel(healthScore)}
                  </Badge>
                </div>
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="64"
                      cy="64"
                      r="56"
                      stroke="white"
                      strokeWidth="12"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${healthScore * 3.52} 352`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl">
                      {healthScore >= 80 ? '😊' : healthScore >= 60 ? '😐' : '😟'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <StatCard
          title="平均热量"
          value={`${Math.round(analysis.avgCalories)}`}
          subtitle="kcal/天"
          subtitleValue={`${Math.round((analysis.avgCalories / 2200) * 100)}% 达标`}
          icon={<span className="text-2xl">🔥</span>}
          variant="accent"
        />

        <StatCard
          title="记录天数"
          value={analysis.dailyData.length.toString()}
          subtitle="分析周期"
          subtitleValue={period === 'week' ? '近7天' : '近30天'}
          icon={<Calendar className="w-6 h-6" />}
          variant="info"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>营养分析</CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')} className="w-auto">
            <TabsList>
              <TabsTrigger value="week">
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  近7天
                </span>
              </TabsTrigger>
              <TabsTrigger value="month">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4" />
                  近30天
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <NutritionChart analysis={analysis} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>每日营养记录</CardTitle>
        </CardHeader>
        <CardContent>
          {myRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">日期</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">热量 (kcal)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">蛋白质 (g)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">脂肪 (g)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">碳水 (g)</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {myRecords
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 14)
                    .map((record, idx) => {
                      const calorieStatus = record.calories < 1500 ? 'low' : record.calories > 2800 ? 'high' : 'normal';
                      return (
                        <tr key={record.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-stone-700">{record.date}</td>
                          <td className="py-3 px-4 text-sm font-medium text-stone-900">
                            {record.calories}
                          </td>
                          <td className="py-3 px-4 text-sm text-stone-600">{record.protein}</td>
                          <td className="py-3 px-4 text-sm text-stone-600">{record.fat}</td>
                          <td className="py-3 px-4 text-sm text-stone-600">{record.carbs}</td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                calorieStatus === 'normal'
                                  ? 'success'
                                  : calorieStatus === 'low'
                                  ? 'warning'
                                  : 'danger'
                              }
                              size="sm"
                            >
                              {calorieStatus === 'normal'
                                ? '正常'
                                : calorieStatus === 'low'
                                ? '偏低'
                                : '偏高'}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">暂无营养记录</h3>
              <p className="text-stone-500">开始用餐后，您的营养记录将显示在这里</p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis.imbalanceTags.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <AlertTriangle className="w-5 h-5" />
              需要注意的问题
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.imbalanceTags.map((tag, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-200"
                >
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="font-medium text-stone-900">{tag}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {idx < analysis.suggestions.length ? analysis.suggestions[idx] : '请调整饮食结构'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
