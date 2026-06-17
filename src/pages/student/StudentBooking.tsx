import { useEffect, useState } from 'react';
import { Calendar, Clock, CheckCircle, XCircle, QrCode, Trash2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { QRCodeDisplay } from '@/components/business/QRCodeDisplay';
import type { Booking } from '@/types';

const statusConfig: Record<string, { label: string; variant: string; icon: React.ReactNode }> = {
  pending: { label: '待确认', variant: 'warning', icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: '已确认', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  picked: { label: '已取餐', variant: 'success', icon: <CheckCircle className="w-4 h-4" /> },
  cancelled: { label: '已取消', variant: 'danger', icon: <XCircle className="w-4 h-4" /> },
};

export default function StudentBooking() {
  const { currentUser } = useAuthStore();
  const { bookings, getBookingsByStudent, cancelBooking, init: initBookings } = useBookingStore();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    initBookings();
  }, [initBookings]);

  const studentId = currentUser?.role === 'student' ? currentUser.id : '';
  const myBookings = getBookingsByStudent(studentId);

  const pendingBookings = myBookings.filter((b) => b.status === 'confirmed');
  const historyBookings = myBookings.filter((b) => b.status !== 'confirmed');

  const handleShowQR = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('确定要取消这个预订吗？')) {
      cancelBooking(bookingId);
    }
  };

  const renderBookingCard = (booking: Booking) => {
    const config = statusConfig[booking.status];
    const canCancel = booking.status === 'confirmed';
    const canPickup = booking.status === 'confirmed';

    return (
      <Card key={booking.id} className="animate-slide-up overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">
                {booking.mealType === 'lunch' ? '🌞 午餐' : '🌙 晚餐'}
              </CardTitle>
              <p className="text-sm text-stone-500 mt-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />
                {booking.bookingTime}
              </p>
            </div>
            <Badge variant={config.variant as any}>
              <span className="flex items-center gap-1">
                {config.icon}
                {config.label}
              </span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="bg-stone-50 rounded-xl p-4">
              {booking.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      {item.quantity}
                    </span>
                    <span className="text-stone-700">{item.dishName}</span>
                  </div>
                  <span className="text-stone-600 font-medium">¥{item.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm text-stone-500">取餐码</p>
                <p className="font-mono text-lg font-semibold text-primary-600">{booking.pickupCode}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-500">总计</p>
                <p className="text-xl font-bold text-accent-600">¥{booking.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-stone-100">
              {canPickup && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleShowQR(booking)}
                  className="gap-2"
                >
                  <QrCode className="w-4 h-4" />
                  出示取餐码
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="ghost"
                  onClick={() => handleCancelBooking(booking.id)}
                  className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  取消
                </Button>
              )}
              {booking.pickupTime && (
                <div className="w-full text-center text-sm text-stone-500">
                  取餐时间：{booking.pickupTime}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            待取餐
            <Badge variant="warning" className="ml-2">
              {pendingBookings.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="history">
            历史记录
            <Badge variant="secondary" className="ml-2">
              {historyBookings.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pendingBookings.map(renderBookingCard)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">暂无待取餐的预订</h3>
              <p className="text-stone-500 mb-4">去菜单页面选择您喜欢的菜品吧</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {historyBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {historyBookings.map(renderBookingCard)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📜</div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">暂无历史预订</h3>
              <p className="text-stone-500">您的历史预订记录将显示在这里</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="取餐二维码"
        size="sm"
      >
        {selectedBooking && (
          <QRCodeDisplay booking={selectedBooking} />
        )}
      </Modal>
    </div>
  );
}
