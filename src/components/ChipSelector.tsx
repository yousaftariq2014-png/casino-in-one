import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { CHIP_DENOMINATIONS } from '../data/chips';
import { sound } from '../utils/audio';

interface ChipSelectorProps {
  label?: string;
  onClear?: () => void;
  onDouble?: () => void;
  onMax?: () => void;
  disabled?: boolean;
}

export const ChipSelector: React.FC<ChipSelectorProps> = ({
  label = 'Select Chip Size',
  onClear,
  onDouble,
  onMax,
  disabled = false,
}) => {
  const { selectedChip, setSelectedChip, balance } = useCasino();

  const handleChipClick = (value: number) => {
    if (disabled) return;
    sound.playChip();
    setSelectedChip(value);
  };

  return (
    <div id="chip-selector-container" className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-blue-200 shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-600">
          {label}:
        </span>
        <span className="text-sm font-black text-blue-800 font-serif-luxury bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
          ${selectedChip.toLocaleString()}
        </span>
      </div>

      {/* Chips Row */}
      <div className="flex items-center gap-2 overflow-x-auto py-1 px-1">
        {CHIP_DENOMINATIONS.map((chip) => {
          const isSelected = selectedChip === chip.value;
          const isTooExpensive = chip.value > balance;

          return (
            <button
              key={chip.value}
              id={`chip-btn-${chip.value}`}
              disabled={disabled}
              onClick={() => handleChipClick(chip.value)}
              title={`Bet $${chip.value}`}
              className={`relative group shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-200 ${
                chip.color
              } chip-shadow border-2 ${chip.borderColor} ${
                isSelected
                  ? 'ring-4 ring-blue-600 ring-offset-2 ring-offset-white -translate-y-1.5 shadow-xl scale-105'
                  : 'hover:-translate-y-0.5 opacity-90 hover:opacity-100'
              } ${isTooExpensive ? 'grayscale-[0.4]' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
              }`}
            >
              {/* Striped casino edge pattern */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 pointer-events-none" />
              <div className="absolute inset-1.5 rounded-full border border-black/20 pointer-events-none" />
              
              <span className="relative z-10 drop-shadow-sm select-none">
                {chip.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Action shortcuts (Clear, 2x, Max) if provided */}
      {(onClear || onDouble || onMax) && (
        <div className="flex items-center gap-1.5 ml-auto">
          {onClear && (
            <button
              id="action-clear-bets"
              disabled={disabled}
              onClick={() => {
                sound.playChip();
                onClear();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40"
            >
              Clear
            </button>
          )}
          {onDouble && (
            <button
              id="action-double-bets"
              disabled={disabled}
              onClick={() => {
                sound.playChip();
                onDouble();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors disabled:opacity-40"
            >
              2×
            </button>
          )}
          {onMax && (
            <button
              id="action-max-bets"
              disabled={disabled}
              onClick={() => {
                sound.playChip();
                onMax();
              }}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors disabled:opacity-40"
            >
              Max
            </button>
          )}
        </div>
      )}
    </div>
  );
};
