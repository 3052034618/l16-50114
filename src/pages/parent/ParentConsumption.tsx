import { useEffect, useState, useMemo } from 'react';
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
import { formatDate } from '@/utils/date';
import type { Student, Consumption } from '@/types';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6'];

const getDateRange = (range: 'week' | 'month' | 'all'): { start: string; end: string; days: number } => {
  const end = new Date();
  const start = new Date();
  let days = 7;
  if (range === 'week') {
    start.setDate(end.getDate() - 6);
    days = 7;
  } else if (range === 'month') {
    start.setDate(end.getDate() - 29);
    days = 30;
  } else {
    start.setFullYear(2020, 0, 1);
    days = 30;
  }
  return { start: formatDate(start), end: formatDate(end), days };
};

const getContinuousDates = (startDate: string, endDate: string): string[] => {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(formatDate(d));
  }
  return dates;
};

type ConsumptionFilter = 'all' | 'booking' | 'onsite';

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
  const [filterType, setFilterType] = useState<ConsumptionFilter>('all');

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

  const { start: startDate, end: endDate, days } = getDateRange(timeRange);

  const allConsumptions = useMemo(() => {
    if (!selectedStudent) return [];
    return getConsumptionsByStudent(selectedStudent.id).filter(
      (c) => timeRange === 'all' || (c.timestamp >= startDate && c.timestamp <= endDate + ' 23:59:59')
    );
  }, [selectedStudent, getConsumptionsByStudent, startDate, endDate, timeRange]);

  const filteredConsumptions = useMemo(() => {
    if (filterType === 'all') return allConsumptions;
    return allConsumptions.filter((c) => c.type === filterType);
  }, [allConsumptions, filterType]);

  const totalStats = useMemo(() => {
    const records = filteredConsumptions;
    return {
      total: records.reduce((sum, r) => sum + r.totalAmount, 0),
      count: records.length,
    };
  }, [filteredConsumptions]);

  const averagePerMeal = totalStats.count > 0 ? totalStats.total / totalStats.count : 0;

  const typeStats = useMemo(() => {
    return allConsumptions.reduce(
      (acc, c) => {
        if (c.type === 'booking') acc.booking += c.totalAmount;
        else acc.onsite += c.totalAmount;
        return acc;
      },
      { booking: 0, onsite: 0 }
    );
  }, [allConsumptions]);

  const pieData = useMemo(() => {
    if (filterType === 'all') {
      return [
        { name: '预订消费', value: typeStats.booking },
        { name: '现场消费', value: typeStats.onsite },
      ];
    } else if (filterType === 'booking') {
      return [{ name: '预订消费', value: typeStats.booking }];
    } else {
      return [{ name: '现场消费', value: typeStats.onsite }];
    }
  }, [typeStats, filterType]);

  const barData = useMemo(() => {
    const dateList = getContinuousDates(startDate, endDate);
    const dateMap = new Map<string, number>();
    dateList.forEach((d) => dateMap.set(d, 0));

    filteredConsumptions.forEach((c) => {
      const date = c.timestamp.split(' ')[0];
      if (dateMap.has(date)) {
        dateMap.set(date, (dateMap.get(date) || 0) + c.totalAmount);
      }
    });

    return dateList
      .slice(-days)
      .map((date) => ({
        date: date.slice(5),
        消费金额: Math.round(dateMap.get(date) || 0),
      }));
  }, [filteredConsumptions, startDate, endDate, days]);

  const bookingCount = allConsumptions.filter((c) => c.type === 'booking').length;
  const onsiteCount = allConsumptions.filter((c) => c.type === 'onsite').length;
  const displayBookingCount = filterType === 'onsite' ? 0 : bookingCount;
  const displayOnsiteCount = filterType === 'booking' ? 0 : onsiteCount;

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
              subtitleValue={`${displayBookingCount}笔`}
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
              <Tabs value={filterType} onValueChange={(v) => setFilterType(v as ConsumptionFilter)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">
                    全部
                    <Badge variant="secondary" className="ml-2">
                      {allConsumptions.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="booking">
                    预订
                    <Badge variant="success" className="ml-2">
                      {bookingCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="onsite">
                    现场
                    <Badge variant="warning" className="ml-2">
                      {onsiteCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {filteredConsumptions.length > 0 ? (
                <div className="space-y-3">
                  {filteredConsumptions.map(renderConsumptionItem)}
                </div>
              ) : (
                <EmptyState />
              )}
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
