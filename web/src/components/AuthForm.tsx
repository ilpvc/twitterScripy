import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await router.push('/');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('注册成功，请检查邮箱验证！');
        setIsLogin(true);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <div>
        <label className="block text-sm font-medium text-gray-700">电子邮箱</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">密码</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      {/* 可扩展注册时的确认密码等 */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
        </button>
      </div>
      <div className="mt-6 text-center">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="font-medium text-blue-600 hover:text-blue-500"
        >
          {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
        </button>
      </div>
    </form>
  );
} 