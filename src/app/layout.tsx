import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

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
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                立体駐車場故障対応検索システム
              </h1>
            </div>
          </header>
          <Navigation />
          <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 flex-1 w-full">
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
      </body>
    </html>
  );
}
