import { useEffect, useState } from 'react';
import { Wallet, CreditCard, TrendingUp, Calendar, ArrowDownCircle, ArrowUpCircle, Filter } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConsumptionStore } from '@/store/consumptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { StatCard } from '@/components/ui/StatCard';
import { Tag } from '@/components/ui/Tag';
import type { Consumption, Recharge } from '@/types';

export default function StudentConsumption() {
  const { currentUser } = useAuthStore();
  const {
    consumptions,
    recharges,
    getConsumptionsByStudent,
    getRechargesByStudent,
    getStudentBalance,
    getConsumptionStats,
    init: initConsumption,
  } = useConsumptionStore();

  const [filterType, setFilterType] = useState<'all' | 'booking' | 'onsite'>('all');

  useEffect(() => {
    initConsumption();
  }, [initConsumption]);

  const studentId = currentUser?.role === 'student' ? currentUser.id : '';
  const myConsumptions = getConsumptionsByStudent(studentId);
  const myRecharges = getRechargesByStudent(studentId);
  const balance = getStudentBalance(studentId);

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const weekStats = getConsumptionStats(studentId, weekAgo, today);
  const monthStats = getConsumptionStats(studentId, monthAgo, today);

  const totalRecharged = myRecharges
    .filter((r) => r.status === 'success')
    .reduce((sum, r) => sum + r.amount, 0);

  const filteredConsumptions = myConsumptions.filter((c) => {
    if (filterType === 'all') return true;
    return c.type === filterType;
  });

  const typeLabels: Record<string, string> = {
    booking: '预订消费',
    onsite: '现场消费',
  };

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
            {typeLabels[consumption.type]}
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

  const renderRechargeItem = (recharge: Recharge) => (
    <div
      key={recharge.id}
      className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 hover:border-stone-200 transition-colors animate-slide-up"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
          <ArrowUpCircle className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <div className="font-medium text-stone-900">账户充值</div>
          <div className="text-sm text-stone-500 mt-0.5">
            <Calendar className="w-3.5 h-3.5 inline mr-1" />
            {recharge.timestamp}
          </div>
          <div className="text-xs text-stone-400 mt-1">
            充值方式：{recharge.method === 'wechat' ? '微信支付' : recharge.method === 'alipay' ? '支付宝' : '校园卡'}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-green-500">
          +¥{recharge.amount.toFixed(2)}
        </div>
        <Badge variant={recharge.status === 'success' ? 'success' : 'warning'} className="mt-1">
          {recharge.status === 'success' ? '充值成功' : '处理中'}
        </Badge>
      </div>
    </div>
  );

  const allRecords = [...filteredConsumptions, ...myRecharges].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const renderAllRecord = (record: Consumption | Recharge) => {
    if ('type' in record) {
      return renderConsumptionItem(record);
    }
    return renderRechargeItem(record);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="账户余额"
          value={`¥${balance.toFixed(2)}`}
          icon={<Wallet className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="累计充值"
          value={`¥${totalRecharged.toFixed(2)}`}
          icon={<CreditCard className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="本周消费"
          value={`¥${weekStats.total.toFixed(2)}`}
          subtitle="消费次数"
          subtitleValue={`${weekStats.count}次`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="accent"
        />
        <StatCard
          title="本月消费"
          value={`¥${monthStats.total.toFixed(2)}`}
          subtitle="消费次数"
          subtitleValue={`${monthStats.count}次`}
          icon={<Calendar className="w-6 h-6" />}
          variant="info"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>账单明细</CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <div className="flex gap-1">
              {(['all', 'booking', 'onsite'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {type === 'all' ? '全部' : typeLabels[type]}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">
                全部记录
                <Badge variant="secondary" className="ml-2">
                  {allRecords.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="consumption">
                消费记录
                <Badge variant="warning" className="ml-2">
                  {filteredConsumptions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="recharge">
                充值记录
                <Badge variant="success" className="ml-2">
                  {myRecharges.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {allRecords.length > 0 ? (
                <div className="space-y-3">
                  {allRecords.map(renderAllRecord)}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="consumption" className="mt-6">
              {filteredConsumptions.length > 0 ? (
                <div className="space-y-3">
                  {filteredConsumptions.map(renderConsumptionItem)}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>

            <TabsContent value="recharge" className="mt-6">
              {myRecharges.length > 0 ? (
                <div className="space-y-3">
                  {myRecharges.map(renderRechargeItem)}
                </div>
              ) : (
                <EmptyState />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">📝</div>
      <h3 className="text-lg font-semibold text-stone-900 mb-2">暂无记录</h3>
      <p className="text-stone-500">您的账单记录将显示在这里</p>
    </div>
  );
}
