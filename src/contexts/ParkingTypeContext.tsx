'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ParkingType = 
  | 'tower_m'
  | 'tower_mt'
  | 'lift_c'
  | 'lift_vertical_front'
  | 'lift_vertical_back'
  | 'slide_common'
  | 'slide_slmt_slm'
  | 'slide_sl_tl_sl_l'
  | 'shift';

const ParkingTypeContext = createContext<{
  parkingType: ParkingType;
  setParkingType: (type: ParkingType) => void;
  parkingTypeLabel: string;
} | null>(null);

const parkingTypeLabels: Record<ParkingType, string> = {
  tower_m: 'タワーパーク（M）',
  tower_mt: 'タワーパーク（MT）',
  lift_c: 'リフトパーク（C）',
  lift_vertical_front: 'リフトパーク（縦列・前側）',
  lift_vertical_back: 'リフトパーク（縦列・奥側）',
  slide_common: 'スライドパーク円（共通）',
  slide_slmt_slm: 'スライドパーク円（SLMT、SLM）',
  slide_sl_tl_sl_l: 'スライドパーク円（SL-TL、SL-L）',
  shift: 'シフトパーク',
};

export function ParkingTypeProvider({ children }: { children: ReactNode }) {
  const [parkingType, setParkingTypeState] = useState<ParkingType>('tower_mt');

  // ローカルストレージから読み込み
  useEffect(() => {
    const stored = localStorage.getItem('parkingType');
    if (stored && stored in parkingTypeLabels) {
      setParkingTypeState(stored as ParkingType);
    }
  }, []);

  const setParkingType = (type: ParkingType) => {
    setParkingTypeState(type);
    localStorage.setItem('parkingType', type);
  };

  return (
    <ParkingTypeContext.Provider
      value={{
        parkingType,
        setParkingType,
        parkingTypeLabel: parkingTypeLabels[parkingType],
      }}
    >
      {children}
    </ParkingTypeContext.Provider>
  );
}

export function useParkingType() {
  const context = useContext(ParkingTypeContext);
  if (!context) {
    throw new Error('useParkingType must be used within ParkingTypeProvider');
  }
  return context;
}


