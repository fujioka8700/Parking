'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 既にログインしている場合はダッシュボードにリダイレクト
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/check');
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch {
        // セッションがない場合はログインページを表示
      }
    };
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'ログインに失敗しました');
        setLoading(false);
        return;
      }

      // ログイン成功後、ダッシュボードにリダイレクト
      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('ログイン処理中にエラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8 border border-gray-200">
          {/* 鍵アイコン */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username フィールド */}
            <div>
              <label htmlFor="username" className="block text-gray-700 mb-2">
                ユーザーID：
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ユーザーIDを入力してください"
                className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 border-b-2 border-gray-400 focus:border-blue-600 focus:outline-none py-2 px-1 transition-colors"
              />
            </div>

            {/* Password フィールド */}
            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                パスワード：
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力してください"
                className="w-full bg-gray-100 text-gray-800 placeholder-gray-500 border-b-2 border-gray-400 focus:border-blue-600 focus:outline-none py-2 px-1 transition-colors"
              />
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* ログイン ボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors uppercase tracking-wide"
            >
              {loading ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
