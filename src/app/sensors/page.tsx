'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParkingType } from '@/contexts/ParkingTypeContext';

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

// 駐車場タイプの値とparkingTypeフィールドの値をマッピング
function getParkingTypeValue(parkingType: string): string {
  const mapping: Record<string, string> = {
    tower_m: 'タワーパーク（M）',
    tower_mt: 'タワーパーク（MT）',
    lift_c: 'リフトパーク（C）',
    lift_vertical_front: 'リフトパーク（縦列・前側）',
    lift_vertical_back: 'リフトパーク（縦列・奥側）',
    slide_slmt_slm: 'スライドパーク円（SLMT、SLM）',
    slide_sl_tl_sl_l: 'スライドパーク円（SL-TL、SL-L）',
    shift: 'シフトパーク',
  };
  return mapping[parkingType] || 'タワーパーク（MT）';
}

export default function SensorsPage() {
  const { parkingType } = useParkingType();
  const [sensorDefinitions, setSensorDefinitions] = useState<SensorDefinitions>(
    {},
  );
  // 最大12グループまで対応（リフトパーク（縦列・前側）の場合）
  const [hexValues, setHexValues] = useState<string[]>(
    Array(12).fill('')
  );
  const [activeSensors, setActiveSensors] = useState<ActiveSensor[][]>(
    Array(12).fill([]).map(() => [])
  );
  const [availableGroups, setAvailableGroups] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // データベースからセンサデータを読み込んでグループ化
  useEffect(() => {
    const loadSensorDefinitions = async () => {
      setLoading(true);
      try {
        const parkingTypeValue = getParkingTypeValue(parkingType);
        console.log('駐車場タイプ:', parkingType, '→', parkingTypeValue);
        const response = await fetch(`/api/sensors?parkingType=${encodeURIComponent(parkingTypeValue)}`);
        const data = await response.json();
        const sensors: Sensor[] = data.sensors || [];
        console.log('読み込んだセンサ数:', sensors.length);

        // センサデータをグループ化（X000-X00F → グループ1, X010-X01F → グループ2, ...）
        const grouped: SensorDefinitions = {};
        const groupNumbers = new Set<number>();

        // まず、X120-X12Fが存在するかチェック（リフトパーク（縦列・前側）の判定用）
        const hasX120Range = sensors.some(s => s.sensorCode.match(/^X12[0-9A-F]$/i));
        
        sensors.forEach((sensor) => {
          const code = sensor.sensorCode;
          let groupNum: number | null = null;
          let index: number;
          
          // センサコードからグループ番号を判定
          if (code.match(/^X00[0-9A-F]$/i)) {
            // グループ1: X000-X00F
            groupNum = 1;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X01[0-9A-F]$/i)) {
            // グループ2: X010-X01F
            groupNum = 2;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X02[0-9A-F]$/i)) {
            // グループ3: X020-X02F
            groupNum = 3;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X03[0-9A-F]$/i)) {
            // グループ4: X030-X03F
            groupNum = 4;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X04[0-9A-F]$/i)) {
            // グループ5: X040-X04F
            groupNum = 5;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X05[0-9A-F]$/i)) {
            // グループ6: X050-X05F
            groupNum = 6;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X06[0-9A-F]$/i)) {
            // グループ7: X060-X06F
            groupNum = 7;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X07[0-9A-F]$/i)) {
            // X070-X07Fの処理
            // X120-X12Fが存在する場合（リフトパーク（縦列・前側））はグループ7に含める
            // そうでない場合（リフトパーク（C））はグループ8
            if (hasX120Range) {
              groupNum = 7;
              index = parseInt(code.slice(-1), 16) + 16; // X070-X07Fはグループ7の16-31番目
            } else {
              groupNum = 8;
              index = parseInt(code.slice(-1), 16);
            }
          } else if (code.match(/^X12[0-9A-F]$/i)) {
            // グループ8: X120-X12F（リフトパーク（縦列・前側）用）
            groupNum = 8;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X13[0-9A-F]$/i)) {
            // グループ9: X130-X13F（リフトパーク（縦列・前側）用）
            groupNum = 9;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^X14[0-9A-F]$/i)) {
            // グループ10: X140-X14F（リフトパーク（縦列・前側）用）
            groupNum = 10;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^2X00[0-9A-F]$/i)) {
            // グループ11: 2X000-2X00F（リフトパーク（縦列・前側）用）
            groupNum = 11;
            index = parseInt(code.slice(-1), 16);
          } else if (code.match(/^2X01[0-9A-F]$/i)) {
            // グループ12: 2X010-2X01F（リフトパーク（縦列・前側）用）
            groupNum = 12;
            index = parseInt(code.slice(-1), 16);
          }
          
          if (groupNum !== null) {
            const groupKey = String(groupNum);
            if (!grouped[groupKey]) {
              grouped[groupKey] = [];
            }
            if (!grouped[groupKey][index]) {
              grouped[groupKey][index] = `${code}: ${sensor.sensorName}`;
            }
            groupNumbers.add(groupNum);
          }
        });

        // 各グループを16個の要素で埋める（不足している場合は空文字列）
        // 存在するグループのみを処理
        const sortedGroupNumbers = Array.from(groupNumbers).sort((a, b) => a - b);
        sortedGroupNumbers.forEach((groupNum) => {
          const group = grouped[String(groupNum)];
          // グループ7でX070-X07Fが含まれている場合は32個まで必要
          const maxSize = (groupNum === 7 && hasX120Range) ? 32 : 16;
          for (let i = 0; i < maxSize; i++) {
            if (!group[i]) {
              group[i] = '';
            }
          }
        });

        setSensorDefinitions(grouped);
        setAvailableGroups(sortedGroupNumbers);
        // データ読み込み完了後、既存のhexValuesでdecodeを実行
        hexValues.forEach((val, index) => {
          if (val.length === 4) {
            decode(index + 1, val, grouped);
          }
        });
      } catch (error) {
        console.error('センサ定義データの読み込みエラー:', error);
        // エラーが発生した場合でも空のグループを設定してローディングを解除
        setSensorDefinitions({});
        setAvailableGroups([]);
      } finally {
        setLoading(false);
      }
    };

    loadSensorDefinitions();
  }, [parkingType]);

  // 駐車場の種類が変更されたときにhexValuesとactiveSensorsをリセット
  useEffect(() => {
    // すべての状態をリセット（最大12グループ分確保）
    setHexValues(Array(12).fill(''));
    setActiveSensors(Array(12).fill([]).map(() => []));
    setAvailableGroups([]);
    setLoading(true); // データ再読み込み中であることを示す
    // sensorDefinitionsも一旦クリア（新しいデータが読み込まれるまで）
    setSensorDefinitions({});
  }, [parkingType]);

  const decode = useCallback((num: number, valStr: string, currentDefinitions?: SensorDefinitions) => {
    if (valStr.length !== 4) {
      setActiveSensors((prev) => {
        const newActiveSensors = [...prev];
        newActiveSensors[num - 1] = [];
        return newActiveSensors;
      });
      return;
    }

    const val = parseInt(valStr, 16);
    if (isNaN(val)) {
      setActiveSensors((prev) => {
        const newActiveSensors = [...prev];
        newActiveSensors[num - 1] = [];
        return newActiveSensors;
      });
      return;
    }

    // sensorDefinitionsを直接参照する（引数で渡された場合はそれを使用、そうでなければstateから取得）
    const definitions = currentDefinitions || sensorDefinitions;
    const names = definitions[String(num)];
    if (!names || names.length === 0) {
      setActiveSensors((prev) => {
        const newActiveSensors = [...prev];
        newActiveSensors[num - 1] = [];
        return newActiveSensors;
      });
      return;
    }

    const sensors: ActiveSensor[] = [];
    for (let i = 0; i < 16; i++) {
      if ((val >> i) & 1) {
        const sensorStr = names[i];
        if (sensorStr && sensorStr.trim() !== '') {
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

    setActiveSensors((prev) => {
      const newActiveSensors = [...prev];
      newActiveSensors[num - 1] = sensors;
      return newActiveSensors;
    });
  }, [sensorDefinitions]);

  // sensorDefinitionsが読み込まれた後に、既存のhexValuesでdecodeを実行
  // ただし、駐車場タイプが変更された直後は実行しない（activeSensorsをクリアしたままにする）
  useEffect(() => {
    // sensorDefinitionsが空の場合は何もしない
    if (Object.keys(sensorDefinitions).length === 0 || loading) {
      return;
    }
    
    // hexValuesがすべて空の場合は、decodeを実行しない（リセット状態を維持）
    const hasAnyValue = hexValues.some(val => val.length === 4);
    if (!hasAnyValue) {
      // hexValuesがすべて空の場合は、activeSensorsも空のままにする（最大12グループ分）
      setActiveSensors(Array(12).fill([]).map(() => []));
      return;
    }
    
    // hexValuesに値がある場合のみ、decodeを実行
    hexValues.forEach((val, index) => {
      if (val.length === 4) {
        decode(index + 1, val, sensorDefinitions);
      } else {
        // 値が空の場合は、そのグループのactiveSensorsをクリア
        setActiveSensors((prev) => {
          const newActiveSensors = [...prev];
          newActiveSensors[index] = [];
          return newActiveSensors;
        });
      }
    });
  }, [sensorDefinitions, loading, decode, hexValues]);

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
        {availableGroups.map((num) => {
          let groupStart: string;
          let groupEnd: string;
          if (num === 1) {
            groupStart = 'X000';
            groupEnd = 'X00F';
          } else if (num === 2) {
            groupStart = 'X010';
            groupEnd = 'X01F';
          } else if (num === 3) {
            groupStart = 'X020';
            groupEnd = 'X02F';
          } else if (num === 4) {
            groupStart = 'X030';
            groupEnd = 'X03F';
          } else if (num === 5) {
            groupStart = 'X040';
            groupEnd = 'X04F';
          } else if (num === 6) {
            groupStart = 'X050';
            groupEnd = 'X05F';
          } else if (num === 7) {
            groupStart = 'X060';
            groupEnd = 'X06F';
          } else if (num === 8) {
            // X070-X07FまたはX120-X12Fのどちらか
            // データに基づいて判定（X120-X12Fが存在する場合はそれを優先）
            if (sensorDefinitions['8'] && sensorDefinitions['8'].some(s => s && s.startsWith('X12'))) {
              groupStart = 'X120';
              groupEnd = 'X12F';
            } else {
              groupStart = 'X070';
              groupEnd = 'X07F';
            }
          } else if (num === 9) {
            groupStart = 'X130';
            groupEnd = 'X13F';
          } else if (num === 10) {
            groupStart = 'X140';
            groupEnd = 'X14F';
          } else if (num === 11) {
            groupStart = '2X000';
            groupEnd = '2X00F';
          } else if (num === 12) {
            groupStart = '2X010';
            groupEnd = '2X01F';
          } else {
            groupStart = '';
            groupEnd = '';
          }
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
                    // 新しい値で直接デコード（sensorDefinitionsを明示的に渡す）
                    decode(num, filteredValue, sensorDefinitions);
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
