import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, User, Lock, Eye, EyeOff, ChefHat, UserCircle, Building2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'student', label: '学生', icon: <UserCircle className="w-5 h-5" />, description: '预订菜品、扫码取餐' },
  { value: 'parent', label: '家长', icon: <Building2 className="w-5 h-5" />, description: '充值额度、查看消费' },
  { value: 'admin', label: '管理员', icon: <ShoppingBag className="w-5 h-5" />, description: '菜品管理、销售统计' },
  { value: 'kitchen', label: '后厨', icon: <ChefHat className="w-5 h-5" />, description: '备料管理、查看预订' },
];

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const success = login(username, password, role);
    setLoading(false);

    if (success) {
      const redirectMap: Record<UserRole, string> = {
        student: '/student/home',
        parent: '/parent/home',
        admin: '/admin/dishes',
        kitchen: '/kitchen/preparation',
      };
      navigate(redirectMap[role]);
    } else {
      setError('用户名或密码错误，请重试');
    }
  };

  const quickLogin = (role: UserRole) => {
    const accounts: Record<UserRole, { username: string; password: string }> = {
      student: { username: 'student1', password: '123456' },
      parent: { username: 'parent1', password: '123456' },
      admin: { username: 'admin', password: '123456' },
      kitchen: { username: 'kitchen1', password: '123456' },
    };
    setUsername(accounts[role].username);
    setPassword(accounts[role].password);
    setRole(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="hidden lg:flex flex-col justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl text-white shadow-2xl">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
              <Utensils className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold mb-4 font-serif">智慧食堂</h1>
            <p className="text-lg text-white/90 font-light">
              便捷预订 · 营养均衡 · 智能管理
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📱</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">在线预订</h3>
                <p className="text-white/80 text-sm">提前预订午晚餐，取餐扫码快速核销</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🥗</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">营养分析</h3>
                <p className="text-white/80 text-sm">智能分析饮食结构，均衡营养摄入</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📊</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">数据统计</h3>
                <p className="text-white/80 text-sm">智能分析销售数据，优化菜单安排</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Utensils className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 font-serif">智慧食堂</h1>
          </div>

          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-stone-900 mb-2 font-serif">欢迎登录</h2>
              <p className="text-stone-500 mb-6">请选择您的身份并登录</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setRole(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      role === option.value
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className={`mb-2 ${role === option.value ? 'text-primary-600' : 'text-stone-400'}`}>
                      {option.icon}
                    </div>
                    <div className="font-semibold text-stone-900 text-sm">{option.label}</div>
                    <div className="text-xs text-stone-500 mt-0.5">{option.description}</div>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="用户名"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  icon={<User className="w-4 h-4" />}
                  required
                />

                <Input
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  icon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={loading}
                  className="mt-2"
                >
                  {loading ? '登录中...' : '登 录'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-stone-200">
                <div className="text-sm text-stone-500 mb-3 text-center">快速登录（演示账号）</div>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="green" clickable onClick={() => quickLogin('student')}>
                    学生
                  </Badge>
                  <Badge variant="blue" clickable onClick={() => quickLogin('parent')}>
                    家长
                  </Badge>
                  <Badge variant="orange" clickable onClick={() => quickLogin('admin')}>
                    管理员
                  </Badge>
                  <Badge variant="purple" clickable onClick={() => quickLogin('kitchen')}>
                    后厨
                  </Badge>
                </div>
                <div className="mt-3 text-xs text-stone-400 text-center">
                  密码均为：123456
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
