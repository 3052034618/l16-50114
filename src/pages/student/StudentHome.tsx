import { useState, useEffect } from 'react';
import { Clock, MapPin, Filter, Search, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDishStore } from '@/store/dishStore';
import { useBookingStore } from '@/store/bookingStore';
import { useConsumptionStore } from '@/store/consumptionStore';
import { getChineseDate, getMealType } from '@/utils/date';
import { DishCard } from '@/components/business/DishCard';
import { CartSidebar } from '@/components/business/CartSidebar';
import { StatCard } from '@/components/ui/StatCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Dish } from '@/types';

export default function StudentHome() {
  const { currentUser } = useAuthStore();
  const { dishes, stalls, getAvailableDishes, init: initDishes } = useDishStore();
  const { cart, addToCart, removeFromCart, updateCartQuantity, mealType, setMealType, submitBooking, init: initBookings } = useBookingStore();
  const { getStudentBalance, init: initConsumption } = useConsumptionStore();
  const [selectedStall, setSelectedStall] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    initDishes();
    initBookings();
    initConsumption();
  }, [initDishes, initBookings, initConsumption]);

  const currentMealType = getMealType();

  const availableDishes = getAvailableDishes(mealType);

  const filteredDishes = availableDishes.filter((dish) => {
    const matchesStall = selectedStall === 'all' || dish.stallId === selectedStall;
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStall && matchesSearch;
  });

  const getCartQuantity = (dishId: string) => {
    const item = cart.find((c) => c.dish.id === dishId);
    return item ? item.quantity : 0;
  };

  const handleAddToCart = (dish: Dish) => {
    addToCart(dish);
    setShowCart(true);
  };

  const student = currentUser?.role === 'student' ? currentUser : null;
  const studentId = student?.id || '';
  const balance = studentId ? getStudentBalance(studentId) : 0;

  const handleSubmitBooking = () => {
    if (!student) return;
    const result = submitBooking(student.id, student.name);
    if (result) {
      setShowCart(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div className="fixed top-6 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-xl animate-slide-up flex items-center gap-3">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">预订成功！</p>
            <p className="text-sm text-white/90">可在"取餐核销"页面查看取餐码</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="账户余额"
          value={`¥${balance.toFixed(2)}`}
          icon={<span className="text-2xl">💰</span>}
          variant="primary"
        />
        <StatCard
          title="今日日期"
          value={getChineseDate()}
          icon={<span className="text-2xl">📅</span>}
          subtitle="当前时段"
          subtitleValue={currentMealType === 'lunch' ? '午餐' : '晚餐'}
          variant="info"
        />
        <StatCard
          title="待取餐"
          value={cart.reduce((sum, item) => sum + item.quantity, 0).toString()}
          icon={<span className="text-2xl">🍱</span>}
          subtitle="购物车"
          subtitleValue={`${cart.length}种菜品`}
          variant="accent"
        />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-semibold text-stone-900">选择餐次</h3>
              <p className="text-sm text-stone-500">请选择您要预订的餐次</p>
            </div>
          </div>
          <Tabs
            value={mealType}
            onValueChange={(v) => setMealType(v as 'lunch' | 'dinner')}
            className="w-auto"
          >
            <TabsList>
              <TabsTrigger value="lunch">
                🌞 午餐
                <Badge variant="success" className="ml-2">
                  {getAvailableDishes('lunch').length}道
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="dinner">
                🌙 晚餐
                <Badge variant="info" className="ml-2">
                  {getAvailableDishes('dinner').length}道
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="搜索菜品名称或标签..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            <MapPin className="w-4 h-4 text-stone-400 flex-shrink-0" />
            <Button
              variant={selectedStall === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedStall('all')}
              className="whitespace-nowrap"
            >
              全部
            </Button>
            {stalls.map((stall) => (
              <Button
                key={stall.id}
                variant={selectedStall === stall.id ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedStall(stall.id)}
                className="whitespace-nowrap"
              >
                {stall.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredDishes.map((dish, index) => (
              <div key={dish.id} style={{ animationDelay: `${index * 0.05}s` }}>
                <DishCard
                  dish={dish}
                  quantity={getCartQuantity(dish.id)}
                  onAdd={() => handleAddToCart(dish)}
                  onRemove={() => removeFromCart(dish.id)}
                  onUpdateQuantity={(q) => updateCartQuantity(dish.id, q)}
                  showControls={true}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">暂无符合条件的菜品</h3>
            <p className="text-stone-500">请尝试其他筛选条件或搜索关键词</p>
          </div>
        )}
      </div>

      <CartSidebar
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onOpen={() => setShowCart(true)}
        onSubmit={handleSubmitBooking}
      />
    </div>
  );
}
