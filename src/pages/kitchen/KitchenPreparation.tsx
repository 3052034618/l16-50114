import { useEffect, useState } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
  Package,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useBookingStore } from '@/store/bookingStore';
import { useStatsStore } from '@/store/statsStore';
import { useDishStore } from '@/store/dishStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { getToday, getChineseDate, getMealType } from '@/utils/date';
import type { PreparationItem } from '@/types';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: '待备料', color: 'text-stone-600', bgColor: 'bg-stone-100' },
  preparing: { label: '备料中', color: 'text-amber-600', bgColor: 'bg-amber-100' },
  ready: { label: '已备好', color: 'text-green-600', bgColor: 'bg-green-100' },
};

export default function KitchenPreparation() {
  const {
    bookings,
    getTodayBookingsByMeal,
    init: initBookings,
  } = useBookingStore();
  const {
    preparations,
    getPreparation,
    updatePreparationItem,
    generatePreparationFromBookings,
    init: initStats,
  } = useStatsStore();
  const { dishes, init: initDishes } = useDishStore();

  const [activeMeal, setActiveMeal] = useState<'lunch' | 'dinner'>(getMealType());

  useEffect(() => {
    initBookings();
    initStats();
    initDishes();
  }, [initBookings, initStats, initDishes]);

  const today = getToday();
  const lunchBookings = getTodayBookingsByMeal('lunch');
  const dinnerBookings = getTodayBookingsByMeal('dinner');

  const generatePreparation = (mealType: 'lunch' | 'dinner') => {
    const bookings = getTodayBookingsByMeal(mealType);
    const bookingItems: { dishId: string; dishName: string; quantity: number }[] = [];

    bookings.forEach((booking) => {
      booking.items.forEach((item) => {
        bookingItems.push({
          dishId: item.dishId,
          dishName: item.dishName,
          quantity: item.quantity,
        });
      });
    });

    generatePreparationFromBookings(today, mealType, bookingItems);
  };

  const getPreparationData = (mealType: 'lunch' | 'dinner') => {
    let prep = getPreparation(today, mealType);

    if (!prep) {
      generatePreparation(mealType);
      prep = getPreparation(today, mealType);
    }

    return prep;
  };

  const lunchPrep = getPreparationData('lunch');
  const dinnerPrep = getPreparationData('dinner');

  const currentPrep = activeMeal === 'lunch' ? lunchPrep : dinnerPrep;
  const currentBookings = activeMeal === 'lunch' ? lunchBookings : dinnerBookings;

  const handleStatusChange = (
    mealType: 'lunch' | 'dinner',
    dishId: string,
    status: 'pending' | 'preparing' | 'ready'
  ) => {
    const prep = getPreparation(today, mealType);
    const item = prep?.items.find((i) => i.dishId === dishId);
    if (item) {
      updatePreparationItem(today, mealType, dishId, item.preparedQuantity, status);
    }
  };

  const handleQuantityChange = (
    mealType: 'lunch' | 'dinner',
    dishId: string,
    delta: number
  ) => {
    const prep = getPreparation(today, mealType);
    const item = prep?.items.find((i) => i.dishId === dishId);
    if (item) {
      const newQuantity = Math.max(0, item.preparedQuantity + delta);
      const newStatus = newQuantity === 0 ? 'pending' : newQuantity >= item.bookedQuantity ? 'ready' : 'preparing';
      updatePreparationItem(today, mealType, dishId, newQuantity, newStatus);
    }
  };

  const getProgress = (prep: typeof lunchPrep) => {
    if (!prep || prep.items.length === 0) return 0;
    const readyItems = prep.items.filter((i) => i.status === 'ready').length;
    return Math.round((readyItems / prep.items.length) * 100);
  };

  const totalBooked = currentPrep?.items.reduce((sum, i) => sum + i.bookedQuantity, 0) || 0;
  const totalPrepared = currentPrep?.items.reduce((sum, i) => sum + i.preparedQuantity, 0) || 0;

  const renderPreparationItem = (item: PreparationItem, index: number) => {
    const dish = dishes.find((d) => d.id === item.dishId);
    const status = statusConfig[item.status];
    const progress = item.bookedQuantity > 0 ? (item.preparedQuantity / item.bookedQuantity) * 100 : 0;
    const isComplete = item.preparedQuantity >= item.bookedQuantity;

    return (
      <div
        key={item.dishId}
        className="p-5 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-all animate-slide-up"
        style={{ animationDelay: `${index * 0.05}s` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {dish?.image && (
              <img
                src={dish.image}
                alt={item.dishName}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold text-stone-900 text-lg">{item.dishName}</h4>
                <Badge variant={isComplete ? 'success' : 'warning'} size="sm">
                  {isComplete ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      已完成
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      进行中
                    </span>
                  )}
                </Badge>
              </div>

              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">预订：</span>
                  <span className="font-semibold text-primary-600">{item.bookedQuantity}份</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">已备：</span>
                  <span className="font-semibold text-accent-600">{item.preparedQuantity}份</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                  <span>备料进度</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <ProgressBar
                  value={item.preparedQuantity}
                  max={item.bookedQuantity}
                  color={isComplete ? '#22c55e' : '#f97316'}
                  height="8px"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="!p-2"
                onClick={() => handleQuantityChange(activeMeal, item.dishId, -1)}
                disabled={item.preparedQuantity <= 0}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="w-10 text-center font-bold text-lg text-stone-900">
                {item.preparedQuantity}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="!p-2"
                onClick={() => handleQuantityChange(activeMeal, item.dishId, 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex gap-1">
              {(['pending', 'preparing', 'ready'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(activeMeal, item.dishId, s)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    item.status === s
                      ? statusConfig[s].bgColor + ' ' + statusConfig[s].color
                      : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                  }`}
                >
                  {statusConfig[s].label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">今日日期</p>
                <p className="text-xl font-bold mt-1">{getChineseDate()}</p>
              </div>
              <Calendar className="w-10 h-10 text-white/30" />
            </div>
          </CardContent>
        </Card>
        <StatCard
          title="午餐预订"
          value={lunchBookings.length.toString()}
          subtitle="预订份数"
          subtitleValue={`${lunchPrep?.totalBooked || 0}份`}
          icon={<span className="text-2xl">🌞</span>}
          variant="success"
        />
        <StatCard
          title="晚餐预订"
          value={dinnerBookings.length.toString()}
          subtitle="预订份数"
          subtitleValue={`${dinnerPrep?.totalBooked || 0}份`}
          icon={<span className="text-2xl">🌙</span>}
          variant="info"
        />
        <StatCard
          title="备料进度"
          value={`${getProgress(currentPrep)}%`}
          subtitle="已备好"
          subtitleValue={`${currentPrep?.items.filter((i) => i.status === 'ready').length || 0}/${currentPrep?.items.length || 0}道`}
          icon={<ChefHat className="w-6 h-6" />}
          variant="accent"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>备料管理</CardTitle>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                generatePreparation('lunch');
                generatePreparation('dinner');
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              刷新数据
            </Button>
            <Tabs value={activeMeal} onValueChange={(v) => setActiveMeal(v as 'lunch' | 'dinner')} className="w-auto">
              <TabsList>
                <TabsTrigger value="lunch">
                  <span className="flex items-center gap-1.5">
                    <span>🌞</span>
                    午餐
                    <Badge variant="success" className="ml-1">
                      {lunchBookings.length}
                    </Badge>
                  </span>
                </TabsTrigger>
                <TabsTrigger value="dinner">
                  <span className="flex items-center gap-1.5">
                    <span>🌙</span>
                    晚餐
                    <Badge variant="info" className="ml-1">
                      {dinnerBookings.length}
                    </Badge>
                  </span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-5 bg-gradient-to-r from-stone-50 to-stone-100 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                  <Package className="w-8 h-8 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-stone-900">
                    {activeMeal === 'lunch' ? '午餐' : '晚餐'}备料总览
                  </h3>
                  <p className="text-stone-500 mt-1">
                    共 {currentPrep?.items.length || 0} 道菜品，需备 {totalBooked} 份
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-sm text-stone-500">已备好</p>
                  <p className="text-2xl font-bold text-green-600">{totalPrepared}份</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-stone-500">完成度</p>
                  <p className="text-2xl font-bold text-primary-600">{getProgress(currentPrep)}%</p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar
                value={totalPrepared}
                max={totalBooked}
                color="#22c55e"
                height="12px"
              />
            </div>
          </div>

          {currentPrep && currentPrep.items.length > 0 ? (
            <div className="space-y-4">
              {currentPrep.items.map(renderPreparationItem)}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍳</div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">暂无备料数据</h3>
              <p className="text-stone-500 mb-4">当前时段还没有学生预订菜品</p>
              <Button
                variant="primary"
                onClick={() => generatePreparation(activeMeal)}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                生成备料清单
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-info-500" />
            预订订单列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentBookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">学生</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">菜品</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">取餐码</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">预订时间</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">金额</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {currentBookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4">
                        <span className="font-medium text-stone-900">{booking.studentName}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          {booking.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-stone-600">
                              {item.quantity}x {item.dishName}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono font-semibold text-primary-600">
                          {booking.pickupCode}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-stone-600">
                        {booking.bookingTime.split(' ')[1]}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-bold text-accent-600">¥{booking.totalAmount.toFixed(2)}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            booking.status === 'picked'
                              ? 'success'
                              : booking.status === 'confirmed'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {booking.status === 'picked'
                            ? '已取餐'
                            : booking.status === 'confirmed'
                            ? '待取餐'
                            : '已取消'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">暂无预订订单</h3>
              <p className="text-stone-500">当前时段还没有学生预订</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-7 h-7 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-1">智能备料提示</h3>
              <ul className="space-y-2 text-amber-700">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  根据预订数据，建议提前 {activeMeal === 'lunch' ? '1.5' : '2'} 小时开始备料
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  当前最热门菜品：{currentPrep?.items.sort((a, b) => b.bookedQuantity - a.bookedQuantity)[0]?.dishName || '暂无数据'}，
                  共 {currentPrep?.items.sort((a, b) => b.bookedQuantity - a.bookedQuantity)[0]?.bookedQuantity || 0} 份预订
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  建议备料时多准备 10% 余量，以应对现场突发需求
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
