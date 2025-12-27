"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-[60px] sm:top-[72px] z-30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
          <Link
            href="/"
            className={`border-b-2 py-3 sm:py-4 px-2 sm:px-1 text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] flex items-center ${
              pathname === "/"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            故障コード検索
          </Link>
          <Link
            href="/sensors"
            className={`border-b-2 py-3 sm:py-4 px-2 sm:px-1 text-sm sm:text-base font-medium whitespace-nowrap min-h-[44px] flex items-center ${
              pathname === "/sensors"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            センサ状態
          </Link>
        </div>
      </div>
    </nav>
  );
}

