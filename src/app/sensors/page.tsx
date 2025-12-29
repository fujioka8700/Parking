'use client';

import { useState, useEffect } from 'react';

interface Sensor {
  id: number;
  sensorCode: string;
  sensorName: string;
  description: string | null;
}

interface SensorDefinitions {
  [key: string]: string[];
}

interface ActiveSensor {
  code: string;
  name: string;
  bit: number;
}

export default function SensorsPage() {
  const [sensorDefinitions, setSensorDefinitions] = useState<SensorDefinitions>(
    {},
  );
  const [hexValues, setHexValues] = useState<string[]>([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [activeSensors, setActiveSensors] = useState<ActiveSensor[][]>([
    [],
    [],
    [],
    [],
    [],
    [],
  ]);
  const [loading, setLoading] = useState(true);

  // データベースからセンサデータを読み込んでグループ化
  useEffect(() => {
    const loadSensorDefinitions = async () => {
      try {
        const response = await fetch('/api/sensors');
        const data = await response.json();
        const sensors: Sensor[] = data.sensors || [];

        // センサデータをグループ化（X000-X00F → グループ1, X010-X01F → グループ2, ...）
        const grouped: SensorDefinitions = {
          '1': [],
          '2': [],
          '3': [],
          '4': [],
          '5': [],
          '6': [],
        };

        sensors.forEach((sensor) => {
          const code = sensor.sensorCode;
          // センサコードからグループ番号を判定（X000-X00F → 1, X010-X01F → 2, ...）
          if (code.match(/^X00[0-9A-F]$/i)) {
            // グループ1: X000-X00F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['1'][index]) {
              grouped['1'][index] = `${code}: ${sensor.sensorName}`;
            }
          } else if (code.match(/^X01[0-9A-F]$/i)) {
            // グループ2: X010-X01F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['2'][index]) {
              grouped['2'][index] = `${code}: ${sensor.sensorName}`;
            }
          } else if (code.match(/^X02[0-9A-F]$/i)) {
            // グループ3: X020-X02F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['3'][index]) {
              grouped['3'][index] = `${code}: ${sensor.sensorName}`;
            }
          } else if (code.match(/^X03[0-9A-F]$/i)) {
            // グループ4: X030-X03F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['4'][index]) {
              grouped['4'][index] = `${code}: ${sensor.sensorName}`;
            }
          } else if (code.match(/^X04[0-9A-F]$/i)) {
            // グループ5: X040-X04F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['5'][index]) {
              grouped['5'][index] = `${code}: ${sensor.sensorName}`;
            }
          } else if (code.match(/^X05[0-9A-F]$/i)) {
            // グループ6: X050-X05F
            const index = parseInt(code.slice(-1), 16);
            if (!grouped['6'][index]) {
              grouped['6'][index] = `${code}: ${sensor.sensorName}`;
            }
          }
        });

        // 各グループを16個の要素で埋める（不足している場合は空文字列）
        for (let groupNum = 1; groupNum <= 6; groupNum++) {
          const group = grouped[String(groupNum)];
          for (let i = 0; i < 16; i++) {
            if (!group[i]) {
              group[i] = '';
            }
          }
        }

        setSensorDefinitions(grouped);
      } catch (error) {
        console.error('センサ定義データの読み込みエラー:', error);
        // エラーが発生した場合でも空のグループを設定してローディングを解除
        setSensorDefinitions({
          '1': [],
          '2': [],
          '3': [],
          '4': [],
          '5': [],
          '6': [],
        });
      } finally {
        setLoading(false);
      }
    };

    loadSensorDefinitions();
  }, []);

  const decode = (num: number, valStr: string) => {
    if (valStr.length !== 4) {
      const newActiveSensors = [...activeSensors];
      newActiveSensors[num - 1] = [];
      setActiveSensors(newActiveSensors);
      return;
    }

    const val = parseInt(valStr, 16);
    if (isNaN(val)) {
      const newActiveSensors = [...activeSensors];
      newActiveSensors[num - 1] = [];
      setActiveSensors(newActiveSensors);
      return;
    }

    const sensors: ActiveSensor[] = [];
    const names = sensorDefinitions[String(num)];

    if (!names || names.length === 0) {
      return;
    }

    for (let i = 0; i < 16; i++) {
      if ((val >> i) & 1) {
        const sensorStr = names[i];
        if (sensorStr) {
          const match = sensorStr.match(/^([^:]+):\s*(.+)$/);
          if (match) {
            sensors.push({
              code: match[1].trim(),
              name: match[2].trim(),
              bit: i,
            });
          }
        }
      }
    }

    const newActiveSensors = [...activeSensors];
    newActiveSensors[num - 1] = sensors;
    setActiveSensors(newActiveSensors);
  };

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            センサ状態
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            データを読み込み中...
          </p>
        </div>
      </div>
    );
  }

  // センサ定義が空の場合のエラー表示
  const hasSensorData = Object.keys(sensorDefinitions).some(
    (key) => sensorDefinitions[key].length > 0,
  );

  if (!hasSensorData) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            センサ状態
          </h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
            <p className="text-sm sm:text-base text-yellow-800 font-medium mb-2">
              センサデータが見つかりません
            </p>
            <p className="text-xs sm:text-sm text-yellow-700">
              データベースにセンサデータが登録されていない可能性があります。
              <br />
              データ初期化を実行してください：
              <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                npm run init:dev
              </code>
              または
              <code className="bg-yellow-100 px-2 py-1 rounded text-xs">
                npm run init:prod
              </code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          センサ状態
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          16進数（4桁）を入力すると、ONになっているセンサを表示します。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((num) => {
          const groupStart = `X0${num - 1}0`;
          const groupEnd = `X0${num - 1}F`;
          return (
            <div
              key={num}
              className="bg-white rounded-lg shadow p-4 sm:p-6 border-t-4 border-blue-500"
            >
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 flex justify-between items-center">
                <span>センサ状態{num}</span>
                <span className="text-xs sm:text-sm font-normal text-gray-500">
                  {groupStart}-{groupEnd}
                </span>
              </h3>
              <div className="mb-3">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="0000"
                  value={hexValues[num - 1] || ''}
                  onChange={(e) => {
                    // 16進数の文字（0-9, A-F, a-f）のみを受け付ける
                    const inputValue = e.target.value;
                    // 16進数の文字のみを抽出
                    const filteredValue = inputValue
                      .replace(/[^0-9A-Fa-f]/g, '')
                      .toUpperCase()
                      .slice(0, 4);
                    const newHexValues = [...hexValues];
                    newHexValues[num - 1] = filteredValue;
                    setHexValues(newHexValues);
                    // 新しい値で直接デコード
                    decode(num, filteredValue);
                  }}
                  className="w-full px-4 py-2 sm:py-3 text-lg sm:text-xl font-mono text-center text-gray-900 border border-gray-300 rounded-md shadow-sm focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-blue-500 uppercase bg-gray-50"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                />
              </div>
              <ul className="space-y-2 min-h-[20px]">
                {activeSensors[num - 1].length > 0 ? (
                  activeSensors[num - 1].map((sensor, idx) => (
                    <li
                      key={idx}
                      className="bg-red-50 text-red-700 px-3 py-2 rounded border-l-4 border-red-500 text-sm sm:text-base font-medium flex justify-between items-center"
                    >
                      <span>
                        {sensor.code}: {sensor.name}
                      </span>
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        BIT {sensor.bit}
                      </span>
                    </li>
                  ))
                ) : hexValues[num - 1].length === 4 ? (
                  <li className="text-sm sm:text-base text-gray-500 italic">
                    ONのセンサはありません
                  </li>
                ) : null}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
