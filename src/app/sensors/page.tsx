'use client';

import { useState, useEffect } from 'react';

interface Sensor {
  id: number;
  sensorCode: string;
  sensorName: string;
  description: string | null;
}

export default function SensorsPage() {
  const [query, setQuery] = useState('');
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);

  // 初期データの読み込み
  useEffect(() => {
    loadSensors();
  }, []);

  const loadSensors = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sensors');
      const data = await response.json();
      setSensors(data.sensors || []);
    } catch (error) {
      console.error('データ読み込みエラー:', error);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      loadSensors();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/sensors/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();
      setSensors(data.sensors || []);
    } catch (error) {
      console.error('検索エラー:', error);
      setSensors([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          センサ状態
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          センサ状態の一覧を確認できます。センサコードまたはセンサ名で検索できます。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="sensor-search"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              検索
            </label>
            <input
              type="text"
              id="sensor-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="センサコード（X000など）またはセンサ名を入力"
              className="w-full px-4 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto min-h-[44px] px-6 py-3 sm:py-2 text-base sm:text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
          >
            {loading ? '検索中...' : '検索'}
          </button>
        </form>
      </div>

      {sensors.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-900">
              検索結果: {sensors.length}件
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {sensors.map((sensor) => (
              <div
                key={sensor.id}
                className="px-4 sm:px-6 py-4 sm:py-5 hover:bg-gray-50 active:bg-gray-100 cursor-pointer touch-manipulation min-h-[60px] flex items-center"
                onClick={() => setSelectedSensor(sensor)}
              >
                <div className="flex-1 w-full">
                  <div className="mb-1 sm:mb-2">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {sensor.sensorCode}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                    {sensor.sensorName}
                  </h4>
                  {sensor.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
                      {sensor.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {query && sensors.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">
            検索結果が見つかりませんでした
          </p>
        </div>
      )}

      {!query && sensors.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">
            センサ状態データがありません
          </p>
        </div>
      )}

      {selectedSensor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                センサ状態詳細
              </h3>
              <button
                onClick={() => setSelectedSensor(null)}
                className="text-gray-400 hover:text-gray-600 active:text-gray-800 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
                aria-label="閉じる"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                  センサコード
                </label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {selectedSensor.sensorCode}
                </p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                  センサ名称
                </label>
                <p className="text-base sm:text-lg text-gray-900">
                  {selectedSensor.sensorName}
                </p>
              </div>
              {selectedSensor.description && (
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                    説明
                  </label>
                  <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap break-words">
                    {selectedSensor.description}
                  </p>
                </div>
              )}
            </div>
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 sticky bottom-0 bg-white">
              <button
                onClick={() => setSelectedSensor(null)}
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
