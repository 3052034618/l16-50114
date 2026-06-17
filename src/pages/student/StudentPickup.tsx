import { useEffect, useState } from 'react';
import { QrCode, Clock, CheckCircle, Info } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { QRCodeDisplay } from '@/components/business/QRCodeDisplay';
import { getMealType } from '@/utils/date';
import type { Booking } from '@/types';

export default function StudentPickup() {
  const { currentUser } = useAuthStore();
  const { bookings, getBookingsByStudent, confirmPickup, init: initBookings } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    initBookings();
  }, [initBookings]);

  const studentId = currentUser?.role === 'student' ? currentUser.id : '';
  const myBookings = getBookingsByStudent(studentId);

  const currentMealType = getMealType();

  const todayBookings = myBookings.filter((b) => {
    const today = new Date().toISOString().split('T')[0];
    return b.bookingTime.startsWith(today) && b.status !== 'cancelled';
  });

  const lunchBookings = todayBookings.filter((b) => b.mealType === 'lunch');
  const dinnerBookings = todayBookings.filter((b) => b.mealType === 'dinner');

  const handleConfirmPickup = (bookingId: string) => {
    if (confirm('确认已经取餐了吗？')) {
      confirmPickup(bookingId);
    }
  };

  const renderBookingList = (bookingList: Booking[], mealType: 'lunch' | 'dinner') => {
    if (bookingList.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-2xl">
          <div className="text-5xl mb-4">🍽️</div>
          <h3 className="text-lg font-semibold text-stone-900 mb-2">
            暂无{mealType === 'lunch' ? '午餐' : '晚餐'}预订
          </h3>
          <p className="text-stone-500">
            {currentMealType === mealType
              ? '现在去预订，还来得及哦！'
              : '请在对应时段前完成预订'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {bookingList.map((booking) => {
          const isPicked = booking.status === 'picked';
          const isCurrentMeal = currentMealType === mealType;

          return (
            <Card key={booking.id} className={`animate-slide-up ${isPicked ? 'opacity-70' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">
                    {mealType === 'lunch' ? '🌞 午餐' : '🌙 晚餐'}
                  </CardTitle>
                  <Badge variant={isPicked ? 'success' : isCurrentMeal ? 'warning' : 'secondary'}>
                    {isPicked ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        已取餐
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        待取餐
                      </span>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1 bg-stone-50 rounded-xl p-4">
                      <div className="space-y-2">
                        {booking.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-stone-700">
                              {item.quantity}x {item.dishName}
                            </span>
                            <span className="text-stone-600">¥{item.subtotal.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between">
                        <span className="text-sm text-stone-500">取餐码</span>
                        <span className="font-mono font-semibold text-primary-600">
                          {booking.pickupCode}
                        </span>
                      </div>
                    </div>

                    <div className="w-32 h-32 bg-white rounded-xl border border-stone-200 flex items-center justify-center">
                      {!isPicked ? (
                        <QRCodeDisplay booking={booking} compact />
                      ) : (
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-xs text-stone-500">已取餐</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-stone-500">预订时间</p>
                      <p className="text-stone-700">{booking.bookingTime}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-stone-500">总计金额</p>
                      <p className="text-xl font-bold text-accent-600">
                        ¥{booking.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {!isPicked && (
                    <div className="flex gap-3 pt-3 border-t border-stone-100">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => handleConfirmPickup(booking.id)}
                        className="gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        确认取餐
                      </Button>
                    </div>
                  )}

                  {isPicked && booking.pickupTime && (
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg py-2">
                      <CheckCircle className="w-4 h-4" />
                      取餐时间：{booking.pickupTime}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">取餐核销</h2>
                <p className="text-white/80 mt-1">出示二维码，扫码取餐</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-white/70">当前时段</p>
              <p className="text-lg font-semibold">
                {currentMealType === 'lunch' ? '🌞 午餐' : '🌙 晚餐'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-3 text-sm text-stone-600 bg-blue-50 rounded-xl p-4">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-stone-900">取餐须知</p>
              <ul className="mt-1 space-y-1 text-stone-500">
                <li>• 请在对应餐时段内前往对应档口取餐</li>
                <li>• 出示取餐二维码或报取餐码给工作人员扫码</li>
                <li>• 取餐后请点击「确认取餐」完成核销</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue={currentMealType}>
        <TabsList>
          <TabsTrigger value="lunch">
            🌞 午餐
            <Badge variant="success" className="ml-2">
              {lunchBookings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="dinner">
            🌙 晚餐
            <Badge variant="info" className="ml-2">
              {dinnerBookings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lunch" className="mt-6">
          {renderBookingList(lunchBookings, 'lunch')}
        </TabsContent>

        <TabsContent value="dinner" className="mt-6">
          {renderBookingList(dinnerBookings, 'dinner')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
