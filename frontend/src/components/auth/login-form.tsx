'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 模拟后端登录验证（暂时写死判断：user==root and paw==root）
      if (username === 'root' && password === 'root') {
        // 登录成功，跳转到 workspace 页面
        window.location.href = '/workspace';
      } else {
        // 登录失败，显示错误信息
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">2026</h1>
        <p className="text-indigo-200">未来已来</p>
      </div>
      <Card className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md border-white/20 text-white">
        <CardHeader>
          <CardTitle className="text-white">登录</CardTitle>
          <CardDescription className="text-indigo-200">请输入用户名和密码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-indigo-100">用户名</label>
              <Input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="root"
                className="bg-white/10 border-white/20 text-white placeholder:text-indigo-300"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-indigo-100">密码</label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="root"
                className="bg-white/10 border-white/20 text-white placeholder:text-indigo-300"
              />
            </div>
            {error && (
              <p className="text-sm text-pink-400">{error}</p>
            )}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? '登录中...' : '登录'}
            </Button>
            <div className="text-center text-sm text-indigo-200">
              提示：用户名和密码均为 root
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
