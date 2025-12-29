'use client';

import { useParkingType } from '@/contexts/ParkingTypeContext';

export default function ParkingTypeSelector() {
  const { parkingType, setParkingType, parkingTypeLabel } = useParkingType();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="parking-type" className="text-sm sm:text-base text-gray-700 whitespace-nowrap">
        駐車場:
      </label>
      <select
        id="parking-type"
        value={parkingType}
        onChange={(e) => setParkingType(e.target.value as any)}
        className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 w-full sm:w-auto sm:min-w-[180px] lg:min-w-[220px]"
      >
        <option value="tower_m">タワーパーク（M）</option>
        <option value="tower_mt">タワーパーク（MT）</option>
        <option value="lift_c">リフトパーク（C）</option>
        <option value="lift_vertical_front">リフトパーク（縦列・前側）</option>
        <option value="lift_vertical_back">リフトパーク（縦列・奥側）</option>
        <option value="slide_common">スライドパーク円（共通）</option>
        <option value="slide_slmt_slm">スライドパーク円（SLMT、SLM）</option>
        <option value="slide_sl_tl_sl_l">スライドパーク円（SL-TL、SL-L）</option>
        <option value="shift">シフトパーク</option>
      </select>
    </div>
  );
}

