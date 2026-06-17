import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, Filter, ChefHat } from 'lucide-react';
import { useDishStore } from '@/store/dishStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/Tag';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import type { Dish, DishCategory } from '@/types';

const categories = ['全部', '主食', '荤菜', '素菜', '汤品', '饮品'];
const mealTypes = [
  { value: 'all', label: '全天供应' },
  { value: 'lunch', label: '仅午餐' },
  { value: 'dinner', label: '仅晚餐' },
];

export default function AdminDishes() {
  const {
    dishes,
    stalls,
    addDish,
    updateDish,
    deleteDish,
    toggleAvailability,
    updateStock,
    init: initDishes,
  } = useDishStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedStall, setSelectedStall] = useState<string | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<Omit<Dish, 'id' | 'isAvailable'>>({
    name: '',
    stallId: '',
    stallName: '',
    category: '荤菜' as DishCategory,
    price: 0,
    stock: 0,
    maxStock: 50,
    mealType: 'all' as 'all' | 'lunch' | 'dinner',
    description: '',
    image: '',
    tags: [] as string[],
    nutrition: {
      calories: 0,
      protein: 0,
      fat: 0,
      carbs: 0,
      vitamins: [] as string[],
      minerals: [] as string[],
    },
  });

  useEffect(() => {
    initDishes();
  }, [initDishes]);

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dish.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === '全部' || dish.category === selectedCategory;
    const matchesStall = selectedStall === 'all' || dish.stallId === selectedStall;
    return matchesSearch && matchesCategory && matchesStall;
  });

  const handleOpenAddModal = () => {
    setEditingDish(null);
    setFormData({
      name: '',
      stallId: stalls[0]?.id || '',
      stallName: stalls[0]?.name || '',
      category: '荤菜',
      price: 0,
      stock: 0,
      maxStock: 50,
      mealType: 'all',
      description: '',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delicious%20chinese%20food%20dish&image_size=square_hd',
      tags: [],
      nutrition: {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        vitamins: ['维生素C'],
        minerals: ['钙'],
      },
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      stallId: dish.stallId,
      stallName: dish.stallName,
      category: dish.category,
      price: dish.price,
      stock: dish.stock,
      maxStock: dish.maxStock,
      mealType: dish.mealType,
      description: dish.description,
      image: dish.image,
      tags: [...dish.tags],
      nutrition: { ...dish.nutrition },
    });
    setShowAddModal(true);
  };

  const handleSubmit = () => {
    if (!formData.name || formData.price <= 0) return;

    if (editingDish) {
      updateDish(editingDish.id, formData);
    } else {
      addDish({
        ...formData,
        isAvailable: true,
      });
    }

    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个菜品吗？')) {
      deleteDish(id);
    }
  };

  const handleAddTag = () => {
    const input = prompt('请输入标签：');
    if (input && !formData.tags.includes(input)) {
      setFormData({ ...formData, tags: [...formData.tags, input] });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const stats = {
    total: dishes.length,
    available: dishes.filter((d) => d.isAvailable).length,
    lowStock: dishes.filter((d) => d.stock > 0 && d.stock < 10).length,
    outOfStock: dishes.filter((d) => d.stock === 0).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">菜品总数</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <ChefHat className="w-10 h-10 text-white/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">在售菜品</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
              </div>
              <ToggleRight className="w-10 h-10 text-green-500/30" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">库存预警</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{stats.lowStock}</p>
              </div>
              <span className="text-3xl">⚠️</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-500 text-sm">已售罄</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.outOfStock}</p>
              </div>
              <span className="text-3xl">❌</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle>菜品管理</CardTitle>
          <Button variant="primary" onClick={handleOpenAddModal} className="gap-2">
            <Plus className="w-4 h-4" />
            添加菜品
          </Button>
        </CardHeader>
        <CardContent>
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
              <Filter className="w-4 h-4 text-stone-400 flex-shrink-0" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedStall}
                onChange={(e) => setSelectedStall(e.target.value)}
                className="px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">全部档口</option>
                {stalls.map((stall) => (
                  <option key={stall.id} value={stall.id}>
                    {stall.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredDishes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">菜品</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">档口</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">分类</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">价格</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">库存</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">供应</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-stone-500">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDishes.map((dish) => (
                    <tr key={dish.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={dish.image}
                            alt={dish.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-medium text-stone-900">{dish.name}</p>
                            <div className="flex gap-1 mt-0.5">
                              {dish.tags.slice(0, 2).map((tag, idx) => (
                                <Tag key={idx} variant="success" size="sm">
                                  {tag}
                                </Tag>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-stone-600">{dish.stallName}</td>
                      <td className="py-4 px-4">
                        <Badge variant="secondary">{dish.category}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-lg font-bold text-accent-600">¥{dish.price}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-medium ${
                              dish.stock === 0
                                ? 'text-red-500'
                                : dish.stock < 10
                                ? 'text-amber-500'
                                : 'text-green-500'
                            }`}
                          >
                            {dish.stock}
                          </span>
                          <span className="text-stone-400">/</span>
                          <span className="text-stone-400">{dish.maxStock}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={
                            dish.mealType === 'all'
                              ? 'success'
                              : dish.mealType === 'lunch'
                              ? 'warning'
                              : 'info'
                          }
                        >
                          {dish.mealType === 'all'
                            ? '全天'
                            : dish.mealType === 'lunch'
                            ? '午餐'
                            : '晚餐'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => toggleAvailability(dish.id)}
                          className="flex items-center gap-1"
                        >
                          {dish.isAvailable ? (
                            <>
                              <ToggleRight className="w-6 h-6 text-green-500" />
                              <span className="text-sm text-green-600">在售</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-6 h-6 text-stone-400" />
                              <span className="text-sm text-stone-500">下架</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(dish)}
                            className="!p-2"
                          >
                            <Edit2 className="w-4 h-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(dish.id)}
                            className="!p-2"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">暂无菜品</h3>
              <p className="text-stone-500 mb-4">点击上方按钮添加第一个菜品</p>
              <Button variant="primary" onClick={handleOpenAddModal}>
                <Plus className="w-4 h-4 mr-2" />
                添加菜品
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title={editingDish ? '编辑菜品' : '添加菜品'}
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">菜品名称</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入菜品名称"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">价格 (元)</label>
              <Input
                type="number"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="请输入价格"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">档口</label>
              <select
                value={formData.stallId}
                onChange={(e) => {
                  const stall = stalls.find((s) => s.id === e.target.value);
                  setFormData({
                    ...formData,
                    stallId: e.target.value,
                    stallName: stall?.name || '',
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {stalls.map((stall) => (
                  <option key={stall.id} value={stall.id}>
                    {stall.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">分类</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as DishCategory })}
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {['主食', '荤菜', '素菜', '汤品', '饮品'].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">当前库存</label>
              <Input
                type="number"
                value={formData.stock || ''}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">最大库存</label>
              <Input
                type="number"
                value={formData.maxStock || ''}
                onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                placeholder="50"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">供应时段</label>
              <select
                value={formData.mealType}
                onChange={(e) =>
                  setFormData({ ...formData, mealType: e.target.value as 'all' | 'lunch' | 'dinner' })
                }
                className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {mealTypes.map((mt) => (
                  <option key={mt.value} value={mt.value}>
                    {mt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">菜品图片URL</label>
            <Input
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="请输入图片链接"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">菜品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入菜品描述"
              className="w-full px-3 py-2 rounded-lg border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[80px]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-stone-700">标签</label>
              <Button variant="ghost" size="sm" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
                添加标签
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.length > 0 ? (
                formData.tags.map((tag, idx) => (
                  <Tag
                    key={idx}
                    variant="success"
                    className="cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Tag>
                ))
              ) : (
                <span className="text-sm text-stone-400">暂无标签，点击添加</span>
              )}
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4">
            <h4 className="font-medium text-stone-900 mb-3">营养信息</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-stone-500 mb-1">热量 (kcal)</label>
                <Input
                  type="number"
                  value={formData.nutrition.calories || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutrition: {
                        ...formData.nutrition,
                        calories: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">蛋白质 (g)</label>
                <Input
                  type="number"
                  value={formData.nutrition.protein || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutrition: {
                        ...formData.nutrition,
                        protein: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">脂肪 (g)</label>
                <Input
                  type="number"
                  value={formData.nutrition.fat || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutrition: {
                        ...formData.nutrition,
                        fat: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                  size="sm"
                />
              </div>
              <div>
                <label className="block text-xs text-stone-500 mb-1">碳水 (g)</label>
                <Input
                  type="number"
                  value={formData.nutrition.carbs || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nutrition: {
                        ...formData.nutrition,
                        carbs: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                  size="sm"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-stone-100">
            <Button variant="ghost" fullWidth onClick={() => setShowAddModal(false)}>
              取消
            </Button>
            <Button variant="primary" fullWidth onClick={handleSubmit}>
              {editingDish ? '保存修改' : '添加菜品'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
