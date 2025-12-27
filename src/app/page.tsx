"use client";

import { useState } from "react";

interface Fault {
  id: number;
  faultCode: string;
  displayCode: string | null;
  faultName: string;
  faultContent: string | null;
  solution: string | null;
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFault, setSelectedFault] = useState<Fault | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setFaults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/faults/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setFaults(data.faults || []);
    } catch (error) {
      console.error("検索エラー:", error);
      setFaults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          故障コード検索
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          故障コード、故障名称、故障内容で検索できます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              検索
            </label>
            <input
              type="text"
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="故障コード、故障名称、故障内容を入力"
              className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 sm:py-2 text-base sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? "検索中..." : "検索"}
          </button>
        </form>
      </div>

      {faults.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              検索結果: {faults.length}件
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {faults.map((fault) => {
              const isInactive = fault.faultName === '欠番' || !fault.isActive;
              return (
                <div
                  key={fault.id}
                  className={`px-4 sm:px-6 py-4 sm:py-5 min-h-[60px] flex items-center ${
                    isInactive
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-gray-50 active:bg-gray-100 cursor-pointer touch-manipulation'
                  }`}
                  onClick={() => {
                    if (!isInactive) {
                      setSelectedFault(fault);
                    }
                  }}
                >
                  <div className="flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2 mb-1 sm:mb-2">
                      <span
                        className={`text-base sm:text-lg font-semibold ${
                          isInactive ? 'text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {fault.faultCode}
                      </span>
                    </div>
                    <h4
                      className={`text-base sm:text-lg font-medium mb-1 sm:mb-2 ${
                        isInactive ? 'text-gray-500' : 'text-gray-900'
                      }`}
                    >
                      {fault.faultName}
                    </h4>
                    {fault.faultContent && (
                      <p
                        className={`text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 ${
                          isInactive ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {fault.faultContent}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {query && faults.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">
            検索結果が見つかりませんでした
          </p>
        </div>
      )}

      {selectedFault && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                故障コード詳細
              </h3>
              <button
                onClick={() => setSelectedFault(null)}
                className="text-gray-400 hover:text-gray-600 active:text-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="閉じる"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {(() => {
                const isInactive =
                  selectedFault.faultName === '欠番' || !selectedFault.isActive;
                return (
                  <>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                        故障コード
                      </label>
                      <p
                        className={`text-base sm:text-lg font-semibold ${
                          isInactive ? 'text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {selectedFault.faultCode}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                        故障名称
                      </label>
                      <p
                        className={`text-base sm:text-lg ${
                          isInactive ? 'text-gray-500' : 'text-gray-900'
                        }`}
                      >
                        {selectedFault.faultName}
                      </p>
                    </div>
                    {selectedFault.faultContent && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                          故障内容
                        </label>
                        <p
                          className={`text-sm sm:text-base whitespace-pre-wrap break-words ${
                            isInactive ? 'text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {selectedFault.faultContent}
                        </p>
                      </div>
                    )}
                    {selectedFault.solution && (
                      <div>
                        <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                          対応方法・チェック項目
                        </label>
                        <p
                          className={`text-sm sm:text-base whitespace-pre-wrap break-words ${
                            isInactive ? 'text-gray-400' : 'text-gray-900'
                          }`}
                        >
                          {selectedFault.solution}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedFault(null)}
                className="w-full min-h-[44px] px-4 py-3 sm:py-2 text-base sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 touch-manipulation"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

