"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import ParkingTypeSelector from "@/components/ParkingTypeSelector";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 pointer-events-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* タイトルと駐車場タイプセレクター */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-3 sm:py-4 border-b border-gray-200">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
            立体駐車場故障対応検索システム
          </h1>
          <ParkingTypeSelector />
        </div>
        {/* ナビゲーションリンク */}
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <Link
            href="/"
            className={`border-b-2 py-3 sm:py-4 px-2 sm:px-1 text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] flex items-center cursor-pointer touch-manipulation transition-colors ${
              pathname === "/"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            故障コード検索
          </Link>
          <Link
            href="/sensors"
            className={`border-b-2 py-3 sm:py-4 px-2 sm:px-1 text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] flex items-center cursor-pointer touch-manipulation transition-colors ${
              pathname === "/sensors"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            センサ状態
          </Link>
        </nav>
      </div>
    </header>
  );
}

