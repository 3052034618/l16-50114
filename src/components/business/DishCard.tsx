import { Plus, Minus, Flame, Leaf, Wheat } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import type { Dish } from '@/types';
import { cn } from '@/lib/utils';

interface DishCardProps {
  dish: Dish;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  onUpdateQuantity?: (quantity: number) => void;
  showControls?: boolean;
  compact?: boolean;
}

const categoryColors: Record<string, string> = {
  '主食': 'bg-amber-100 text-amber-700',
  '荤菜': 'bg-red-100 text-red-700',
  '素菜': 'bg-green-100 text-green-700',
  '汤品': 'bg-blue-100 text-blue-700',
  '饮品': 'bg-purple-100 text-purple-700',
};

export const DishCard = ({
  dish,
  quantity = 0,
  onAdd,
  onRemove,
  onUpdateQuantity,
  showControls = false,
  compact = false,
}: DishCardProps) => {
  const stockPercentage = (dish.stock / dish.maxStock) * 100;
  const isLowStock = stockPercentage < 30;
  const isSoldOut = dish.stock === 0;

  return (
    <Card
      className={cn(
        'overflow-hidden group animate-slide-up',
        compact ? 'p-3' : 'p-0',
        isSoldOut && 'opacity-60'
      )}
      hover={!isSoldOut}
    >
      {!compact && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={dish.image}
            alt={dish.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={cn('tag', categoryColors[dish.category])}>
              {dish.category}
            </span>
            {isLowStock && !isSoldOut && (
              <Badge variant="warning">仅剩{dish.stock}份</Badge>
            )}
            {isSoldOut && <Badge variant="danger">已售罄</Badge>}
          </div>
        </div>
      )}

      <div className={cn('flex flex-col', compact ? 'gap-1' : 'p-5 gap-3')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3
              className={cn(
                'font-semibold text-stone-900 line-clamp-1',
                compact ? 'text-sm' : 'text-lg'
              )}
            >
              {dish.name}
            </h3>
            {!compact && (
              <p className="text-sm text-stone-500 mt-0.5">{dish.stallName}</p>
            )}
          </div>
          <p className="text-lg font-bold text-accent-600 whitespace-nowrap">
            ¥{dish.price}
          </p>
        </div>

        {!compact && (
          <>
            <div className="flex flex-wrap gap-1.5">
              {dish.tags.slice(0, 3).map((tag, idx) => (
                <Tag key={idx} variant="success">
                  {tag}
                </Tag>
              ))}
            </div>

            <div className="flex items-center gap-4 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                {dish.nutrition.calories}kcal
              </span>
              <span className="flex items-center gap-1">
                <Wheat className="w-3.5 h-3.5 text-amber-500" />
                {dish.nutrition.protein}g蛋白
              </span>
              <span className="flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-green-500" />
                {dish.nutrition.vitamins[0]}
              </span>
            </div>

            <div className="mt-1">
              <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
                <span>库存</span>
                <span>
                  {dish.stock}/{dish.maxStock}份
                </span>
              </div>
              <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isLowStock ? 'bg-amber-500' : 'bg-primary-500'
                  )}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>
            </div>
          </>
        )}

        {showControls && (
          <div className={cn('flex items-center justify-between mt-2', compact ? '' : 'pt-3 border-t border-stone-100')}>
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="!p-1.5"
                  onClick={onRemove}
                  disabled={isSoldOut}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-stone-900">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="!p-1.5"
                  onClick={onAdd}
                  disabled={isSoldOut || quantity >= dish.stock}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={onAdd}
                disabled={isSoldOut}
              >
                <Plus className="w-4 h-4" />
                加入
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
