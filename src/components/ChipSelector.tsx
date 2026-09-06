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
  label = 'Select Bet Chip',
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
    <div id="chip-selector-container" className="flex flex-wrap items-center justify-between gap-3 p-3 sm:p-3.5 bg-[#121622]/95 rounded-2xl border border-amber-500/25 shadow-xl">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
          {label}:
        </span>
        <span className="text-sm font-black text-amber-300 font-serif-luxury bg-amber-950/40 px-2.5 py-0.5 rounded-lg border border-amber-500/30">
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
              className={`relative group shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-black text-xs sm:text-sm transition-all duration-200 ${
                chip.color
              } chip-shadow border-2 ${chip.borderColor} ${
                isSelected
                  ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#0a0d14] -translate-y-1.5 shadow-[0_0_15px_rgba(245,197,66,0.5)] scale-105'
                  : 'hover:-translate-y-0.5 opacity-90 hover:opacity-100'
              } ${isTooExpensive ? 'grayscale-[0.5] opacity-40' : ''} ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer active:scale-95'
              }`}
            >
              {/* Striped casino edge pattern */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-white/40 pointer-events-none" />
              <div className="absolute inset-1.5 rounded-full border border-black/20 pointer-events-none" />
              
              <span className="relative z-10 drop-shadow-sm select-none font-serif-luxury font-black">
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
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-40"
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
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-40"
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
              className="px-3.5 py-1.5 text-xs font-black rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 hover:brightness-110 transition-all disabled:opacity-40"
            >
              Max
            </button>
          )}
        </div>
      )}
    </div>
  );
};
