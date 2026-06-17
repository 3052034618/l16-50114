import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CartItem } from '@/store/bookingStore';
import { useBookingStore } from '@/store/bookingStore';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  onOpen?: () => void;
}

export const CartSidebar = ({ isOpen, onClose, onSubmit, onOpen }: CartSidebarProps) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, getCartTotal, mealType } =
    useBookingStore();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = getCartTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">我的订单</h3>
              <p className="text-sm text-stone-500">
                {mealType === 'lunch' ? '午餐' : '晚餐'} · {totalItems}件商品
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="!p-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-stone-300 mb-4" />
              <p className="text-stone-500">购物车是空的</p>
              <p className="text-sm text-stone-400 mt-1">快去添加喜欢的菜品吧</p>
            </div>
          ) : (
            cart.map((item) => (
              <CartItemRow
                key={item.dish.id}
                item={item}
                onAdd={() => updateCartQuantity(item.dish.id, item.quantity + 1)}
                onRemove={() => updateCartQuantity(item.dish.id, item.quantity - 1)}
                onDelete={() => removeFromCart(item.dish.id)}
              />
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t border-stone-200 bg-stone-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">商品小计</span>
                <span className="text-stone-900">¥{totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">优惠</span>
                <span className="text-primary-600">-¥0.00</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-stone-200">
                <span className="font-medium text-stone-900">应付金额</span>
                <span className="text-2xl font-bold text-accent-600">
                  ¥{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
              >
                <Trash2 className="w-4 h-4" />
                清空
              </Button>
              <Button variant="accent" className="flex-1" onClick={onSubmit} size="lg">
                提交预订
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CartItemRowProps {
  item: CartItem;
  onAdd: () => void;
  onRemove: () => void;
  onDelete: () => void;
}

const CartItemRow = ({ item, onAdd, onRemove, onDelete }: CartItemRowProps) => {
  const subtotal = item.dish.price * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
      <img
        src={item.dish.image}
        alt={item.dish.name}
        className="w-20 h-20 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-stone-900 truncate">{item.dish.name}</h4>
        <p className="text-sm text-stone-500">{item.dish.stallName}</p>
        <p className="text-accent-600 font-semibold mt-1">¥{item.dish.price}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onDelete}
          className="text-stone-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onRemove}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-stone-200 hover:bg-stone-100 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-6 text-center font-semibold text-stone-900">
            {item.quantity}
          </span>
          <button
            onClick={onAdd}
            disabled={item.quantity >= item.dish.stock}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <span className="text-sm font-semibold text-stone-900">¥{subtotal.toFixed(2)}</span>
      </div>
    </div>
  );
};
