import { useEffect, useState } from 'react';
import { Calendar, ArrowDownCircle, Filter, TrendingUp, User, PieChart } from 'lucide-react';
import {
  PieChart as RechartsPieChart,
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
import { useAuthStore } from '@/store/authStore';
import { useConsumptionStore } from '@/store/consumptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Tag } from '@/components/ui/Tag';
import type { Student, Consumption } from '@/types';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6'];

export default function ParentConsumption() {
  const { currentUser, getBoundStudents, init: initAuth } = useAuthStore();
  const {
    consumptions,
    getConsumptionsByStudent,
    getStudentBalance,
    getConsumptionStats,
    init: initConsumption,
  } = useConsumptionStore();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    initAuth();
    initConsumption();
  }, [initAuth, initConsumption]);

  const parentId = currentUser?.role === 'parent' ? currentUser.id : '';
  const boundStudents = getBoundStudents(parentId);

  useEffect(() => {
    if (boundStudents.length > 0 && !selectedStudent) {
      setSelectedStudent(boundStudents[0]);
    }
  }, [boundStudents, selectedStudent]);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const getStartDate = () => {
    if (timeRange === 'week') return weekAgo;
    if (timeRange === 'month') return monthAgo;
    return '2020-01-01';
  };

  const studentConsumptions = selectedStudent
    ? getConsumptionsByStudent(selectedStudent.id).filter((c) => c.timestamp >= getStartDate())
    : [];

  const totalStats = selectedStudent
    ? getConsumptionStats(selectedStudent.id, getStartDate(), today)
    : { total: 0, count: 0 };

  const averagePerMeal = totalStats.count > 0 ? totalStats.total / totalStats.count : 0;

  const typeStats = studentConsumptions.reduce(
    (acc, c) => {
      if (c.type === 'booking') acc.booking += c.totalAmount;
      else acc.onsite += c.totalAmount;
      return acc;
    },
    { booking: 0, onsite: 0 }
  );

  const pieData = [
    { name: '预订消费', value: typeStats.booking },
    { name: '现场消费', value: typeStats.onsite },
  ];

  const dailyStats = studentConsumptions.reduce((acc, c) => {
    const date = c.timestamp.split(' ')[0];
    if (!acc[date]) acc[date] = 0;
    acc[date] += c.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(dailyStats)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({
      date: date.slice(5),
      消费金额: amount,
    }))
    .slice(-7);

  const renderConsumptionItem = (consumption: Consumption) => (
    <div
      key={consumption.id}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-colors animate-slide-up"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
          <ArrowDownCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <div className="font-medium text-stone-900">
            {consumption.type === 'booking' ? '预订消费' : '现场消费'}
          </div>
          <div className="text-sm text-stone-500 mt-0.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {consumption.timestamp}
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {consumption.items.slice(0, 3).map((item, idx) => (
              <Tag key={idx} variant="secondary" size="sm">
                {item.quantity}x {item.dishName}
              </Tag>
            ))}
            {consumption.items.length > 3 && (
              <Tag variant="secondary" size="sm">
                +{consumption.items.length - 3}
              </Tag>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-red-500">
          -¥{consumption.totalAmount.toFixed(2)}
        </div>
        <div className="text-sm text-stone-400 mt-0.5">
          余额 ¥{consumption.balanceAfter.toFixed(2)}
        </div>
        {consumption.stallName && (
          <Badge variant="secondary" className="mt-1">
            {consumption.stallName}
          </Badge>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {boundStudents.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <User className="w-5 h-5 text-stone-400 flex-shrink-0" />
          {boundStudents.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedStudent?.id === student.id
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {student.avatar} {student.name}
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={`${selectedStudent.name} 的余额`}
              value={`¥${getStudentBalance(selectedStudent.id).toFixed(2)}`}
              icon={<span className="text-2xl">💰</span>}
              variant="primary"
            />
            <StatCard
              title="消费总额"
              value={`¥${totalStats.total.toFixed(2)}`}
              subtitle="消费次数"
              subtitleValue={`${totalStats.count}次`}
              icon={<TrendingUp className="w-6 h-6" />}
              variant="accent"
            />
            <StatCard
              title="平均每餐"
              value={`¥${averagePerMeal.toFixed(2)}`}
              subtitle="时间范围"
              subtitleValue={timeRange === 'week' ? '近7天' : timeRange === 'month' ? '近30天' : '全部'}
              icon={<PieChart className="w-6 h-6" />}
              variant="info"
            />
            <StatCard
              title="消费笔数"
              value={totalStats.count.toString()}
              subtitle="预订消费"
              subtitleValue={`${studentConsumptions.filter((c) => c.type === 'booking').length}笔`}
              icon={<Calendar className="w-6 h-6" />}
              variant="success"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <div className="flex gap-1">
              {(['week', 'month', 'all'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary-500 text-white'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {range === 'week' ? '近7天' : range === 'month' ? '近30天' : '全部'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>消费类型分布</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
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
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => `¥${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>每日消费趋势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                      <YAxis stroke="#78716c" fontSize={12} />
                      <Tooltip
                        formatter={(value: number) => `¥${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="消费金额" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>消费明细</CardTitle>
              <Tabs defaultValue="all" className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">
                    全部
                    <Badge variant="secondary" className="ml-2">
                      {studentConsumptions.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="booking">
                    预订
                    <Badge variant="success" className="ml-2">
                      {studentConsumptions.filter((c) => c.type === 'booking').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="onsite">
                    现场
                    <Badge variant="warning" className="ml-2">
                      {studentConsumptions.filter((c) => c.type === 'onsite').length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsContent value="all" className="mt-0">
                  {studentConsumptions.length > 0 ? (
                    <div className="space-y-3">
                      {studentConsumptions.map(renderConsumptionItem)}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </TabsContent>
                <TabsContent value="booking" className="mt-0">
                  {studentConsumptions.filter((c) => c.type === 'booking').length > 0 ? (
                    <div className="space-y-3">
                      {studentConsumptions
                        .filter((c) => c.type === 'booking')
                        .map(renderConsumptionItem)}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </TabsContent>
                <TabsContent value="onsite" className="mt-0">
                  {studentConsumptions.filter((c) => c.type === 'onsite').length > 0 ? (
                    <div className="space-y-3">
                      {studentConsumptions
                        .filter((c) => c.type === 'onsite')
                        .map(renderConsumptionItem)}
                    </div>
                  ) : (
                    <EmptyState />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📊</div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">暂无消费记录</h3>
      <p className="text-stone-500">孩子的消费记录将显示在这里</p>
    </div>
  );
}
