import React, { useState, useEffect, useRef } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { SlotSymbol } from '../../types';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Play, 
  RotateCcw, 
  Zap, 
  Info, 
  Sparkles, 
  Trophy, 
  ArrowLeft,
  Flame,
  Volume2
} from 'lucide-react';

const SYMBOLS: SlotSymbol[] = [
  { id: 'diamond', name: 'Diamond Wild', emoji: '💎', multiplier3: 50, multiplier4: 150, multiplier5: 500, color: 'text-cyan-300', isWild: true },
  { id: 'crown', name: 'Royal Crown', emoji: '👑', multiplier3: 30, multiplier4: 80, multiplier5: 250, color: 'text-amber-400' },
  { id: 'seven', name: 'Lucky 7', emoji: '7️⃣', multiplier3: 20, multiplier4: 50, multiplier5: 150, color: 'text-rose-400' },
  { id: 'bell', name: 'Liberty Bell', emoji: '🔔', multiplier3: 15, multiplier4: 35, multiplier5: 80, color: 'text-yellow-400' },
  { id: 'clover', name: 'Clover', emoji: '🍀', multiplier3: 10, multiplier4: 25, multiplier5: 50, color: 'text-emerald-400' },
  { id: 'cherry', name: 'Cherry', emoji: '🍒', multiplier3: 5, multiplier4: 15, multiplier5: 30, color: 'text-red-500' },
  { id: 'lemon', name: 'Lemon', emoji: '🍋', multiplier3: 3, multiplier4: 10, multiplier5: 20, color: 'text-yellow-300' },
  { id: 'grape', name: 'Grape', emoji: '🍇', multiplier3: 2, multiplier4: 8, multiplier5: 15, color: 'text-purple-400' },
];

// 10 Standard Paylines (indices [row0, row1, row2] across 5 reels [reel0 to reel4])
const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // Middle horizontal line
  [0, 0, 0, 0, 0], // Top horizontal line
  [2, 2, 2, 2, 2], // Bottom horizontal line
  [0, 1, 2, 1, 0], // V shape
  [2, 1, 0, 1, 2], // Inverted V
  [0, 0, 1, 2, 2], // Down-slope step
  [2, 2, 1, 0, 0], // Up-slope step
  [1, 0, 0, 0, 1], // Top dip
  [1, 2, 2, 2, 1], // Bottom dip
  [0, 1, 1, 1, 0], // Gentle V
];

interface SlotsGameProps {
  onBackToLobby: () => void;
}

export const SlotsGame: React.FC<SlotsGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip, setSelectedChip } = useCasino();

  // Grid is 5 columns x 3 rows
  const [grid, setGrid] = useState<SlotSymbol[][]>([
    [SYMBOLS[1], SYMBOLS[4], SYMBOLS[5]],
    [SYMBOLS[2], SYMBOLS[0], SYMBOLS[6]],
    [SYMBOLS[3], SYMBOLS[2], SYMBOLS[7]],
    [SYMBOLS[0], SYMBOLS[1], SYMBOLS[3]],
    [SYMBOLS[5], SYMBOLS[4], SYMBOLS[2]],
  ]);

  const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false, false, false]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [lastWin, setLastWin] = useState<number>(0);
  const [winningLineIndices, setWinningLineIndices] = useState<number[]>([]);
  const [winningCellCoords, setWinningCellCoords] = useState<{ col: number; row: number }[]>([]);
  const [showPaytable, setShowPaytable] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState<number>(0);

  const autoSpinRef = useRef<number>(0);
  autoSpinRef.current = autoSpinsRemaining;

  const currentBet = selectedChip;

  const getRandomSymbol = (): SlotSymbol => {
    // Weighted selection: fruit more common, diamond rarer
    const weights = [3, 6, 9, 12, 16, 20, 24, 28]; // cumulative sum approx
    const rand = Math.random() * 118;
    if (rand < 4) return SYMBOLS[0]; // Diamond (wild)
    if (rand < 12) return SYMBOLS[1]; // Crown
    if (rand < 24) return SYMBOLS[2]; // 7
    if (rand < 40) return SYMBOLS[3]; // Bell
    if (rand < 58) return SYMBOLS[4]; // Clover
    if (rand < 78) return SYMBOLS[5]; // Cherry
    if (rand < 98) return SYMBOLS[6]; // Lemon
    return SYMBOLS[7]; // Grape
  };

  const evaluateGridWins = (newGrid: SlotSymbol[][], betAmount: number) => {
    let totalWin = 0;
    const matchedLines: number[] = [];
    const matchedCoords: { col: number; row: number }[] = [];

    PAYLINES.forEach((line, lineIndex) => {
      // line is [row0, row1, row2, row3, row4]
      const symbolsOnLine = line.map((row, col) => newGrid[col][row]);
      
      // Check left-to-right matching
      let matchCount = 1;
      let targetSymbol = symbolsOnLine[0];

      // If first is wild, look for next non-wild to identify target
      if (targetSymbol.isWild) {
        const firstReal = symbolsOnLine.find(s => !s.isWild);
        if (firstReal) targetSymbol = firstReal;
      }

      for (let i = 1; i < symbolsOnLine.length; i++) {
        const curr = symbolsOnLine[i];
        if (curr.id === targetSymbol.id || curr.isWild) {
          matchCount++;
        } else {
          break;
        }
      }

      if (matchCount >= 3) {
        let mult = 0;
        if (matchCount === 3) mult = targetSymbol.multiplier3;
        else if (matchCount === 4) mult = targetSymbol.multiplier4;
        else if (matchCount === 5) mult = targetSymbol.multiplier5;

        // Line win payout (line bet is betAmount / 10)
        const lineBet = Math.max(1, Math.round(betAmount / 10));
        const lineWin = lineBet * mult;
        totalWin += lineWin;
        matchedLines.push(lineIndex);

        for (let c = 0; c < matchCount; c++) {
          matchedCoords.push({ col: c, row: line[c] });
        }
      }
    });

    return { totalWin, matchedLines, matchedCoords };
  };

  const handleSpin = () => {
    if (isSpinning) return;
    if (balance < currentBet) {
      sound.playLose();
      return;
    }

    // Deduct wager
    modifyBalance(-currentBet, 'slots', currentBet);
    sound.playChip();

    setIsSpinning(true);
    setWinningLineIndices([]);
    setWinningCellCoords([]);
    setLastWin(0);

    // Animate reels spinning
    setSpinningReels([true, true, true, true, true]);

    // Generate final grid
    const finalGrid: SlotSymbol[][] = Array.from({ length: 5 }, () => [
      getRandomSymbol(),
      getRandomSymbol(),
      getRandomSymbol(),
    ]);

    const spinInterval = turboMode ? 120 : 250;
    const baseDuration = turboMode ? 400 : 900;

    // Sequential reel stops
    [0, 1, 2, 3, 4].forEach((reelIdx) => {
      setTimeout(() => {
        sound.playSpinTick();
        setSpinningReels((prev) => {
          const updated = [...prev];
          updated[reelIdx] = false;
          return updated;
        });

        // Update this column in the grid
        setGrid((prev) => {
          const next = [...prev];
          next[reelIdx] = finalGrid[reelIdx];
          return next;
        });

        // If last reel stops, calculate win
        if (reelIdx === 4) {
          setIsSpinning(false);
          const { totalWin, matchedLines, matchedCoords } = evaluateGridWins(finalGrid, currentBet);

          if (totalWin > 0) {
            modifyBalance(totalWin, 'slots');
            setLastWin(totalWin);
            setWinningLineIndices(matchedLines);
            setWinningCellCoords(matchedCoords);

            const multiplier = totalWin / currentBet;
            if (multiplier >= 15) {
              sound.playBigWin();
              confetti({
                particleCount: 120,
                spread: 80,
                origin: { y: 0.6 },
              });
            } else {
              sound.playWin();
            }
          }

          // Handle auto spin decrement
          if (autoSpinRef.current > 0) {
            setAutoSpinsRemaining((prev) => prev - 1);
          }
        }
      }, baseDuration + reelIdx * spinInterval);
    });
  };

  // Auto-spin watcher
  useEffect(() => {
    if (autoSpinsRemaining > 0 && !isSpinning && balance >= currentBet) {
      const timer = setTimeout(() => {
        handleSpin();
      }, 700);
      return () => clearTimeout(timer);
    } else if (autoSpinsRemaining > 0 && balance < currentBet) {
      setAutoSpinsRemaining(0);
    }
  }, [autoSpinsRemaining, isSpinning, balance]);

  return (
    <div id="slots-game-container" className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      
      {/* Top Header / Bar */}
      <div className="flex items-center justify-between">
        <button
          id="slots-back-btn"
          onClick={() => {
            sound.playChip();
            setAutoSpinsRemaining(0);
            onBackToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            id="toggle-paytable-btn"
            onClick={() => setShowPaytable(!showPaytable)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-400 text-xs font-semibold border border-zinc-800 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Paytable</span>
          </button>

          <button
            id="toggle-turbo-btn"
            onClick={() => setTurboMode(!turboMode)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              turboMode
                ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Turbo</span>
          </button>
        </div>
      </div>

      {/* Slots Machine Housing */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#181a24] via-[#10131d] to-[#0a0d14] border-2 border-amber-500/40 p-4 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Machine Top Marquee */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">🎰</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-serif-luxury gold-gradient-text tracking-wider uppercase">
                Neon Vegas 5-Reel
              </h2>
              <span className="text-[10px] text-zinc-400 tracking-wider uppercase font-semibold">
                20 Active Paylines • Wild 💎 Multipliers
              </span>
            </div>
          </div>

          {/* Last Win announcement */}
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              Last Spin Win
            </span>
            <span className={`text-base sm:text-xl font-black font-serif-luxury ${lastWin > 0 ? 'text-emerald-400 animate-pulse' : 'text-zinc-400'}`}>
              {lastWin > 0 ? `+$${lastWin.toLocaleString()}` : '$0'}
            </span>
          </div>
        </div>

        {/* 5-Reel Slot Grid Display */}
        <div className="relative bg-zinc-950/90 rounded-2xl p-2 sm:p-4 border-2 border-zinc-800/90 shadow-inner grid grid-cols-5 gap-1.5 sm:gap-3 overflow-hidden">
          
          {/* Glass glare effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-black/20 pointer-events-none rounded-2xl" />

          {/* 5 Reels */}
          {grid.map((reel, reelIndex) => {
            const isReelSpinning = spinningReels[reelIndex];

            return (
              <div
                key={reelIndex}
                className="flex flex-col gap-2 relative bg-zinc-900/60 rounded-xl p-1 sm:p-2 border border-zinc-800/60 overflow-hidden"
              >
                {reel.map((symbol, rowIndex) => {
                  const isWinningCell = winningCellCoords.some(
                    (coord) => coord.col === reelIndex && coord.row === rowIndex
                  );

                  return (
                    <div
                      key={rowIndex}
                      className={`h-20 sm:h-28 rounded-xl flex flex-col items-center justify-center p-1 relative transition-all duration-300 ${
                        isReelSpinning ? 'blur-sm scale-95 opacity-60' : 'scale-100 opacity-100'
                      } ${
                        isWinningCell
                          ? 'bg-amber-500/20 border-2 border-amber-400 shadow-[0_0_15px_rgba(245,197,66,0.5)] scale-105 z-10'
                          : 'bg-zinc-950/70 border border-zinc-800/60'
                      }`}
                    >
                      <span className="text-3xl sm:text-5xl select-none filter drop-shadow-md">
                        {symbol.emoji}
                      </span>
                      <span className={`text-[9px] sm:text-[11px] font-bold tracking-tight mt-1 ${symbol.color}`}>
                        {symbol.name}
                      </span>

                      {/* Wild badge indicator */}
                      {symbol.isWild && (
                        <span className="absolute top-1 right-1 px-1 py-0.2 rounded text-[8px] font-black bg-cyan-500 text-black">
                          WILD
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Win announcement Banner */}
        {lastWin > 0 && (
          <div className="mt-4 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/20 border border-amber-400/40 text-center flex items-center justify-center gap-2 animate-in zoom-in-95">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
            <span className="text-sm sm:text-base font-extrabold text-amber-300 font-serif-luxury tracking-wide uppercase">
              Payout: Won +${lastWin.toLocaleString()}! ({winningLineIndices.length} Paylines Hit)
            </span>
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        )}

        {/* Slot Controls Dashboard */}
        <div className="mt-5 pt-4 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4">
          
          {/* Bet size selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-zinc-400">Wager:</span>
            <div className="flex items-center gap-1.5">
              {[25, 50, 100, 250, 500, 1000].map((val) => (
                <button
                  key={val}
                  disabled={isSpinning}
                  onClick={() => {
                    sound.playChip();
                    setSelectedChip(val);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedChip === val
                      ? 'bg-amber-500 text-zinc-950 font-black shadow-md'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  } disabled:opacity-50`}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          {/* Right Action buttons: Auto-spin & Big Spin Lever */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Auto-Spin Selector */}
            {autoSpinsRemaining > 0 ? (
              <button
                id="stop-autospin-btn"
                onClick={() => setAutoSpinsRemaining(0)}
                className="px-4 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Stop Auto ({autoSpinsRemaining})
              </button>
            ) : (
              <button
                id="autospin-20-btn"
                disabled={isSpinning || balance < currentBet}
                onClick={() => {
                  sound.playChip();
                  setAutoSpinsRemaining(10);
                }}
                className="px-3.5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-40"
              >
                Auto (10x)
              </button>
            )}

            {/* Primary Spin Button */}
            <button
              id="slots-spin-lever-btn"
              disabled={isSpinning || balance < currentBet}
              onClick={handleSpin}
              className="relative px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-widest bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center gap-2 group"
            >
              <Play className={`w-5 h-5 fill-current ${isSpinning ? 'animate-spin' : 'group-hover:translate-x-0.5 transition-transform'}`} />
              <span>{isSpinning ? 'Spinning...' : `SPIN ($${currentBet})`}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Paytable Modal / Drawer */}
      {showPaytable && (
        <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h3 className="font-bold text-white font-serif-luxury text-sm">Symbol Paytable & Multipliers</h3>
            <button
              onClick={() => setShowPaytable(false)}
              className="text-xs text-zinc-400 hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {SYMBOLS.map((s) => (
              <div key={s.id} className="bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-800 flex items-center gap-3">
                <span className="text-3xl">{s.emoji}</span>
                <div>
                  <span className="font-bold text-white block">{s.name}</span>
                  <span className="text-[11px] text-zinc-400 block">3x: {s.multiplier3}x</span>
                  <span className="text-[11px] text-zinc-400 block">4x: {s.multiplier4}x</span>
                  <span className="text-[11px] text-amber-400 font-bold block">5x: {s.multiplier5}x</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-500">
            Wild 💎 substitutes for any symbol across any active payline to form the highest winning combination.
          </p>
        </div>
      )}

    </div>
  );
};
