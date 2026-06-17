import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, BarChart3, PieChart } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from 'recharts';
import { useStatsStore } from '@/store/statsStore';
import { useDishStore } from '@/store/dishStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Tag } from '@/components/ui/Tag';

const COLORS = ['#22c55e', '#f97316', '#3b82f6', '#eab308', '#8b5cf6', '#ec4899'];

export default function AdminStatistics() {
  const {
    getAggregatedStats,
    getTopDishes,
    init: initStats,
  } = useStatsStore();
  const { stalls, init: initDishes } = useDishStore();

  const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');

  useEffect(() => {
    initStats();
    initDishes();
  }, [initStats, initDishes]);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const startDate = timeRange === 'week' ? weekAgo : monthAgo;
  const stats = getAggregatedStats(startDate, today);
  const topDishes = getTopDishes(startDate, today, 10);

  const stallStats = stalls.map((stall) => {
    const stallDishes = topDishes.filter((dish) => {
      const dishInfo = useDishStore.getState().dishes.find((d) => d.name === dish.name);
      return dishInfo?.stallId === stall.id;
    });
    const revenue = stallDishes.reduce((sum, d) => sum + d.revenue, 0);
    const quantity = stallDishes.reduce((sum, d) => sum + d.quantity, 0);
    return {
      ...stall,
      revenue,
      quantity,
      dishCount: stallDishes.length,
    };
  }).filter((s) => s.revenue > 0);

  const pieData = stallStats.map((s) => ({
    name: s.name,
    value: s.revenue,
  }));

  const dailyTrendData = stats.dailyData.map((d) => ({
    ...d,
    客单价: d.orders > 0 ? d.revenue / d.orders : 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-900">销售统计</h2>
          <p className="text-stone-500 mt-1">
            {timeRange === 'week' ? '近7天' : '近30天'}销售数据概览
          </p>
        </div>
        <div className="flex gap-2">
          {(['week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                timeRange === range
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {range === 'week' ? '近7天' : '近30天'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="总营收"
          value={`¥${stats.totalRevenue.toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+12.5%"
          trendUp={true}
          variant="primary"
        />
        <StatCard
          title="总订单数"
          value={stats.totalOrders.toString()}
          subtitle="总笔数"
          icon={<ShoppingBag className="w-6 h-6" />}
          trend="+8.3%"
          trendUp={true}
          variant="success"
        />
        <StatCard
          title="客单价"
          value={`¥${stats.avgOrderValue.toFixed(2)}`}
          subtitle="平均每单"
          icon={<Users className="w-6 h-6" />}
          trend="+3.8%"
          trendUp={true}
          variant="accent"
        />
        <StatCard
          title="在售菜品"
          value={topDishes.length.toString()}
          subtitle="热门菜品"
          icon={<BarChart3 className="w-6 h-6" />}
          variant="info"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              每日营收趋势
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="date" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `¥${value.toFixed(2)}` : value,
                      name === 'revenue' ? '营收' : name === 'orders' ? '订单数' : '客单价',
                    ]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="营收"
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="订单数"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-accent-500" />
              档口营收占比
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-info-500" />
              档口销量排行
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stallStats.sort((a, b) => b.quantity - a.quantity)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                  <XAxis dataKey="name" stroke="#78716c" fontSize={12} />
                  <YAxis stroke="#78716c" fontSize={12} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      value,
                      name === 'quantity' ? '销量' : '营收',
                    ]}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Bar dataKey="quantity" name="销量" fill="#f97316" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>档口销售明细</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stallStats
                .sort((a, b) => b.revenue - a.revenue)
                .map((stall, index) => (
                  <div
                    key={stall.id}
                    className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      >
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-stone-900">{stall.name}</div>
                        <div className="text-sm text-stone-500">
                          {stall.dishCount}道菜品 · {stall.quantity}份销量
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-accent-600">
                        ¥{stall.revenue.toFixed(2)}
                      </div>
                      <Badge variant="success" className="mt-1">
                        占比 {((stall.revenue / stats.totalRevenue) * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-500" />
            热门菜品排行榜 TOP 10
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500 w-16">排名</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">菜品名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">所属档口</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">销量</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">营收</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">占比</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">标签</th>
                </tr>
              </thead>
              <tbody>
                {topDishes.map((dish, index) => {
                  const dishInfo = useDishStore.getState().dishes.find((d) => d.name === dish.name);
                  const percentage = ((dish.revenue / stats.totalRevenue) * 100).toFixed(1);

                  return (
                    <tr
                      key={dish.name}
                      className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : index === 1
                              ? 'bg-stone-100 text-stone-700'
                              : index === 2
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-stone-50 text-stone-500'
                          }`}
                        >
                          {index + 1}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={dishInfo?.image}
                            alt={dish.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <span className="font-medium text-stone-900">{dish.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-stone-600">
                        {dishInfo?.stallName || '-'}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-primary-600">{dish.quantity}份</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-accent-600">¥{dish.revenue.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant={parseFloat(percentage) >= 10 ? 'success' : 'secondary'}>
                          {percentage}%
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-1">
                          {dishInfo?.tags.slice(0, 2).map((tag, idx) => (
                            <Tag key={idx} variant="success" size="sm">
                              {tag}
                            </Tag>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>💡 智能分析建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-5 bg-green-50 rounded-xl border border-green-200">
              <div className="text-2xl mb-2">🔥</div>
              <h4 className="font-semibold text-green-800 mb-1">热门菜品</h4>
              <p className="text-sm text-green-700">
                {topDishes[0]?.name || '暂无数据'} 最受欢迎，销量 {topDishes[0]?.quantity || 0} 份，建议增加备货量。
              </p>
            </div>
            <div className="p-5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-2xl mb-2">📈</div>
              <h4 className="font-semibold text-blue-800 mb-1">营收趋势</h4>
              <p className="text-sm text-blue-700">
                日均营收 ¥{(stats.totalRevenue / stats.dailyData.length).toFixed(2)}，较上周增长 12.5%。
              </p>
            </div>
            <div className="p-5 bg-amber-50 rounded-xl border border-amber-200">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="font-semibold text-amber-800 mb-1">优化建议</h4>
              <p className="text-sm text-amber-700">
                建议在高峰时段增加 {stallStats[0]?.name || '热门档口'} 的工作人员，减少排队时间。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
