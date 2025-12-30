import { getSession } from '@/lib/auth';
import Header from './Header';

export default async function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // 認証済みの場合はヘッダーを表示
  if (session) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="header-spacer" aria-hidden="true"></div>
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-4 sm:pb-6 lg:pb-8 flex-1 w-full">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <p className="text-center text-xs sm:text-sm text-gray-500">
              © 2025 立体駐車場故障対応検索システム
            </p>
          </div>
        </footer>
      </div>
    );
  }

  // 未認証の場合はヘッダーなし（ログインページ）
  return <>{children}</>;
}

