import { QRCodeSVG } from 'qrcode.react';
import { Clock, CheckCircle, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import type { Booking } from '@/types';
import { formatTime, getMealTypeName } from '@/utils/date';

interface QRCodeDisplayProps {
  booking: Booking;
  onPickup?: () => void;
  compact?: boolean;
}

const statusConfig = {
  pending: { label: '待确认', variant: 'warning' as const, icon: Clock },
  confirmed: { label: '待取餐', variant: 'info' as const, icon: Clock },
  picked: { label: '已取餐', variant: 'success' as const, icon: CheckCircle },
  cancelled: { label: '已取消', variant: 'danger' as const, icon: Clock },
};

export const QRCodeDisplay = ({ booking, onPickup, compact }: QRCodeDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const status = statusConfig[booking.status];
  const StatusIcon = status.icon;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(booking.pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-md mx-auto text-center animate-slide-up">
      <CardContent className="p-6">
        <div className="flex items-center justify-center gap-2 mb-4">
          <StatusIcon className="w-5 h-5" />
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <div className="mb-4">
          <p className="text-sm text-stone-500 mb-1">取餐码</p>
          <div className="flex items-center justify-center gap-2">
            <p className="font-mono text-2xl font-bold text-primary-600 tracking-wider">
              {booking.pickupCode}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="!p-2"
              onClick={handleCopy}
            >
              {copied ? (
                <Check className="w-4 h-4 text-primary-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="relative inline-block p-4 bg-white rounded-2xl border-4 border-primary-100 mb-6">
          <div className="absolute inset-0 bg-primary-500/10 rounded-xl animate-pulse-soft" />
          <QRCodeSVG
            value={booking.pickupCode}
            size={compact ? 120 : 200}
            level="H"
            includeMargin={false}
            className="relative z-10"
          />
          {booking.status === 'picked' && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-xl z-20">
              <CheckCircle className="w-16 h-16 text-primary-500" />
            </div>
          )}
        </div>

        <div className="space-y-3 text-left bg-stone-50 rounded-xl p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-500">时段</span>
            <span className="font-medium text-stone-900">
              {getMealTypeName(booking.mealType)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-500">菜品</span>
            <span className="font-medium text-stone-900">
              {booking.items.length}份
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-500">金额</span>
            <span className="font-bold text-accent-600">¥{booking.totalAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-500">预订时间</span>
            <span className="text-sm text-stone-600">{formatTime(booking.bookingTime)}</span>
          </div>
          {booking.pickupTime && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-500">取餐时间</span>
              <span className="text-sm text-stone-600">{formatTime(booking.pickupTime)}</span>
            </div>
          )}
        </div>

        {booking.status === 'confirmed' && onPickup && (
          <Button className="w-full mt-6" size="lg" onClick={onPickup}>
            <CheckCircle className="w-5 h-5" />
            确认取餐
          </Button>
        )}

        {booking.status === 'picked' && (
          <div className="mt-6 p-3 bg-primary-50 rounded-xl text-center">
            <p className="text-sm text-primary-700">
              ✅ 已成功取餐，请慢用！
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
