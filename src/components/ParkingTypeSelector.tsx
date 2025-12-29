'use client';

import { useParkingType } from '@/contexts/ParkingTypeContext';

const parkingTypes = [
  { value: 'tower_m', label: 'タワーパーク（M）', enabled: true },
  { value: 'tower_mt', label: 'タワーパーク（MT）', enabled: true },
  { value: 'lift_c', label: 'リフトパーク（C）', enabled: false },
  { value: 'lift_vertical_front', label: 'リフトパーク（縦列・前側）', enabled: false },
  { value: 'lift_vertical_back', label: 'リフトパーク（縦列・奥側）', enabled: false },
  { value: 'slide_common', label: 'スライドパーク円（共通）', enabled: false },
  { value: 'slide_slmt_slm', label: 'スライドパーク円（SLMT、SLM）', enabled: false },
  { value: 'slide_sl_tl_sl_l', label: 'スライドパーク円（SL-TL、SL-L）', enabled: false },
  { value: 'shift', label: 'シフトパーク', enabled: false },
];

export default function ParkingTypeSelector() {
  const { parkingType, setParkingType, parkingTypeLabel } = useParkingType();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const selectedType = parkingTypes.find(type => type.value === selectedValue);
    // 有効なオプションのみ選択可能
    if (selectedType && selectedType.enabled) {
      setParkingType(selectedValue as any);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="parking-type" className="text-sm sm:text-base text-gray-700 whitespace-nowrap">
        駐車場:
      </label>
      <select
        id="parking-type"
        value={parkingType}
        onChange={handleChange}
        className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 w-full sm:w-auto sm:min-w-[180px] lg:min-w-[220px]"
      >
        {parkingTypes.map((type) => (
          <option
            key={type.value}
            value={type.value}
            disabled={!type.enabled}
            style={type.enabled ? {} : { color: '#9CA3AF' }}
          >
            {type.label}
          </option>
        ))}
      </select>
    </div>
  );
}

