import type { Metadata } from "next";
import "./globals.css";
import { ParkingTypeProvider } from "@/contexts/ParkingTypeContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "立体駐車場故障対応検索システム",
  description: "故障コードとセンサ状態を検索できるシステム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <ParkingTypeProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          {/* ヘッダーの高さ分のスペーサー（固定表示のため） */}
          {/* @layer utilities で定義された header-spacer クラスを使用（レスポンシブ: モバイル180px / デスクトップ150px） */}
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
        </ParkingTypeProvider>
      </body>
    </html>
  );
}
