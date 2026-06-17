import { useEffect, useState } from 'react';
import { Wallet, CreditCard, Plus, Minus, CheckCircle, History, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConsumptionStore } from '@/store/consumptionStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { Tag } from '@/components/ui/Tag';
import type { Student } from '@/types';

const quickAmounts = [50, 100, 200, 500, 1000];

const paymentMethods = [
  { value: 'wechat', label: '微信支付', icon: '💚' },
  { value: 'alipay', label: '支付宝', icon: '💙' },
  { value: 'card', label: '银行卡', icon: '💳' },
];

export default function ParentHome() {
  const { currentUser, getBoundStudents, updateStudentBalance, init: initAuth } = useAuthStore();
  const {
    recharges,
    getRechargesByParent,
    addRecharge,
    getStudentBalance,
    init: initConsumption,
  } = useConsumptionStore();

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay' | 'card'>('wechat');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastRecharge, setLastRecharge] = useState<{ amount: number; studentName: string } | null>(null);

  useEffect(() => {
    initAuth();
    initConsumption();
  }, [initAuth, initConsumption]);

  const parentId = currentUser?.role === 'parent' ? currentUser.id : '';
  const boundStudents = getBoundStudents(parentId);
  const myRecharges = getRechargesByParent(parentId);

  useEffect(() => {
    if (boundStudents.length > 0 && !selectedStudent) {
      setSelectedStudent(boundStudents[0]);
    }
  }, [boundStudents, selectedStudent]);

  const totalRecharged = myRecharges
    .filter((r) => r.status === 'success')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleQuickAmount = (value: number) => {
    setAmount(value);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomAmount(value);
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handleRecharge = async () => {
    if (!selectedStudent || amount <= 0) return;

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const currentBalance = getStudentBalance(selectedStudent.id);
    const newBalance = currentBalance + amount;

    addRecharge(parentId, selectedStudent.id, selectedStudent.name, amount, paymentMethod);
    updateStudentBalance(selectedStudent.id, newBalance);

    setLoading(false);
    setShowRechargeModal(false);
    setLastRecharge({ amount, studentName: selectedStudent.name });
    setShowSuccessModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="绑定学生"
          value={boundStudents.length.toString()}
          subtitle="位孩子"
          icon={<User className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="累计充值"
          value={`¥${totalRecharged.toFixed(2)}`}
          subtitle="已成功充值"
          subtitleValue={`${myRecharges.filter((r) => r.status === 'success').length}笔`}
          icon={<CreditCard className="w-6 h-6" />}
          variant="success"
        />
        <StatCard
          title="本月充值"
          value={`¥${myRecharges
            .filter((r) => {
              const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              return r.status === 'success' && new Date(r.timestamp) > monthAgo;
            })
            .reduce((sum, r) => sum + r.amount, 0)
            .toFixed(2)}`}
          subtitle="充值次数"
          subtitleValue={`${myRecharges.filter((r) => {
            const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return r.status === 'success' && new Date(r.timestamp) > monthAgo;
          }).length}次`}
          icon={<History className="w-6 h-6" />}
          variant="info"
        />
      </div>

      {boundStudents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>选择孩子</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boundStudents.map((student) => {
                const balance = getStudentBalance(student.id);
                const isSelected = selectedStudent?.id === student.id;

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl ${
                        isSelected ? 'bg-primary-500 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {student.avatar || '👦'}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-stone-900 text-lg">{student.name}</div>
                        <div className="text-sm text-stone-500 mt-0.5">{student.className}</div>
                        <div className="text-sm text-stone-500">{student.studentNo}</div>
                      </div>
                      {isSelected && (
                        <CheckCircle className="w-6 h-6 text-primary-500" />
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">账户余额</span>
                        <span className="text-xl font-bold text-accent-600">¥{balance.toFixed(2)}</span>
                      </div>
                      {balance < 50 && (
                        <Badge variant="warning" className="mt-2 w-full justify-center">
                          余额不足，请及时充值
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedStudent && (
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">为 {selectedStudent.name} 充值</h3>
                <p className="text-white/80">当前余额：¥{getStudentBalance(selectedStudent.id).toFixed(2)}</p>
              </div>
              <Button
                size="lg"
                variant="accent"
                onClick={() => setShowRechargeModal(true)}
                className="text-white shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                立即充值
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>最近充值记录</CardTitle>
        </CardHeader>
        <CardContent>
          {myRecharges.length > 0 ? (
            <div className="space-y-3">
              {myRecharges.slice(0, 5).map((recharge) => (
                <div
                  key={recharge.id}
                  className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">
                        {recharge.method === 'wechat' ? '💚' : recharge.method === 'alipay' ? '💙' : '💳'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-stone-900">
                        为 {recharge.studentName} 充值
                      </div>
                      <div className="text-sm text-stone-500">{recharge.timestamp}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-600">+¥{recharge.amount.toFixed(2)}</div>
                    <Badge variant={recharge.status === 'success' ? 'success' : 'warning'} className="mt-1">
                      {recharge.status === 'success' ? '充值成功' : '处理中'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">暂无充值记录</h3>
              <p className="text-stone-500">为孩子充值后，记录将显示在这里</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        title="账户充值"
        size="md"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
              {selectedStudent?.avatar || '👦'}
            </div>
            <div>
              <div className="font-semibold text-stone-900 text-lg">{selectedStudent?.name}</div>
              <div className="text-sm text-stone-500">{selectedStudent?.className}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">选择金额</label>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {quickAmounts.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleQuickAmount(value)}
                  className={`py-3 rounded-xl font-semibold text-lg transition-all ${
                    amount === value && !customAmount
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  ¥{value}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-stone-400">¥</span>
              <Input
                type="number"
                value={customAmount}
                onChange={handleCustomAmountChange}
                placeholder="输入自定义金额"
                className="pl-10 text-lg h-14"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-3">支付方式</label>
            <div className="grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value as any)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentMethod === method.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{method.icon}</div>
                  <div className="text-sm font-medium text-stone-700">{method.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-stone-600">充值金额</span>
              <span className="font-bold text-stone-900">¥{amount.toFixed(2)}</span>
            </div>
          </div>

          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={handleRecharge}
            loading={loading}
            disabled={amount <= 0}
          >
            {loading ? '充值中...' : `确认充值 ¥${amount.toFixed(2)}`}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="充值成功"
        size="sm"
      >
        <div className="text-center py-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-2xl font-bold text-stone-900 mb-2">充值成功！</h3>
          <p className="text-stone-500 mb-6">
            已成功为 {lastRecharge?.studentName} 充值 ¥{lastRecharge?.amount.toFixed(2)}
          </p>
          <Button variant="primary" fullWidth onClick={() => setShowSuccessModal(false)}>
            完成
          </Button>
        </div>
      </Modal>
    </div>
  );
}
