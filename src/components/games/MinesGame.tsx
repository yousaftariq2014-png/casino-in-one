import React, { useState } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { ChipSelector } from '../ChipSelector';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Bomb,
  Gem,
  Sparkles,
  Trophy,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface MinesGameProps {
  onBackToLobby: () => void;
}

interface TileState {
  index: number;
  revealed: boolean;
  isMine: boolean;
}

export const MinesGame: React.FC<MinesGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip, setSelectedChip } = useCasino();

  const [mineCount, setMineCount] = useState<number>(3);
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [tiles, setTiles] = useState<TileState[]>(() =>
    Array.from({ length: 25 }, (_, i) => ({ index: i, revealed: false, isMine: false }))
  );
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [lastWinAmount, setLastWinAmount] = useState<number>(0);

  // Mathematical multiplier table based on n diamonds revealed with m mines on 25 tiles
  // Multiplier = 0.98 * (25 / (25-m)) * (24 / (24-m)) * ...
  const getMultiplier = (gems: number, mines: number): number => {
    if (gems <= 0) return 1.0;
    let mult = 0.98; // house edge 2%
    for (let i = 0; i < gems; i++) {
      mult *= (25 - i) / (25 - mines - i);
    }
    return parseFloat(mult.toFixed(2));
  };

  const currentMultiplier = getMultiplier(gemsFound, mineCount);
  const nextMultiplier = getMultiplier(gemsFound + 1, mineCount);
  const currentCashout = Math.floor(currentBet * currentMultiplier);

  const startNewGame = () => {
    if (currentBet <= 0) return;
    if (currentBet > balance) {
      sound.playLose();
      return;
    }

    const deducted = modifyBalance(-currentBet, 'mines', currentBet);
    if (!deducted) return;

    sound.playChip();

    // Randomly place mines
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newTiles: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      revealed: false,
      isMine: mineIndices.has(i),
    }));

    setTiles(newTiles);
    setGameActive(true);
    setGameOver(false);
    setGemsFound(0);
    setHasWon(false);
    setLastWinAmount(0);
  };

  const handleTileClick = (index: number) => {
    if (!gameActive || gameOver) return;
    const tile = tiles[index];
    if (tile.revealed) return;

    if (tile.isMine) {
      // Hit a mine!
      sound.playMineExplosion();
      setGameOver(true);
      setGameActive(false);

      // Reveal all tiles
      setTiles((prev) =>
        prev.map((t) => ({
          ...t,
          revealed: true,
        }))
      );
    } else {
      // Revealed a diamond gem!
      sound.playGemReveal();
      const nextGems = gemsFound + 1;
      setGemsFound(nextGems);

      setTiles((prev) =>
        prev.map((t) => (t.index === index ? { ...t, revealed: true } : t))
      );

      // Check if all safe tiles found
      if (nextGems === 25 - mineCount) {
        handleCashout(nextGems);
      }
    }
  };

  const handleCashout = (gems: number = gemsFound) => {
    if (!gameActive || gems <= 0) return;

    const mult = getMultiplier(gems, mineCount);
    const payout = Math.floor(currentBet * mult);

    modifyBalance(payout, 'mines');
    sound.playCashout();

    setLastWinAmount(payout);
    setHasWon(true);
    setGameActive(false);
    setGameOver(true);

    // Reveal rest of grid
    setTiles((prev) =>
      prev.map((t) => ({
        ...t,
        revealed: true,
      }))
    );

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2563eb', '#38bdf8', '#60a5fa', '#ffffff'],
    });
  };

  return (
    <div id="mines-game-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button
          id="mines-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Casino Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
            5×5 Diamond Grid
          </span>
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            RTP 98.0%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Game Grid */}
        <div className="lg:col-span-8 white-panel rounded-3xl p-6 shadow-xl border border-blue-100 flex flex-col items-center">
          
          {/* Status Bar */}
          <div className="w-full flex items-center justify-between mb-5 bg-blue-50/70 border border-blue-100 p-3 rounded-2xl text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-700">
              <Gem className="w-4 h-4 text-blue-600" />
              <span>Gems Found: <strong className="text-blue-700 font-serif-luxury text-sm">{gemsFound}</strong> / {25 - mineCount}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Bomb className="w-4 h-4 text-rose-500" />
              <span>Mines: <strong className="text-rose-600 font-serif-luxury text-sm">{mineCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>Next Tile: <strong className="text-sky-600 font-serif-luxury text-sm">{nextMultiplier}x</strong></span>
            </div>
          </div>

          {/* 5x5 Mines Grid */}
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3.5 w-full max-w-md aspect-square">
            {tiles.map((tile) => {
              const isRevealed = tile.revealed;
              const isMine = tile.isMine;

              return (
                <button
                  key={tile.index}
                  id={`mines-tile-${tile.index}`}
                  disabled={!gameActive || isRevealed}
                  onClick={() => handleTileClick(tile.index)}
                  className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 aspect-square select-none ${
                    isRevealed
                      ? isMine
                        ? 'bg-rose-100 border-2 border-rose-400 text-rose-600 shadow-inner'
                        : 'bg-blue-50 border-2 border-blue-400 text-blue-600 shadow-inner'
                      : gameActive
                      ? 'bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-blue-400/40'
                      : 'bg-slate-100 border border-slate-200 text-slate-400 opacity-80 cursor-not-allowed'
                  }`}
                >
                  {isRevealed ? (
                    isMine ? (
                      <Bomb className="w-6 h-6 sm:w-8 sm:h-8 animate-shake text-rose-600" />
                    ) : (
                      <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 animate-bounce" />
                    )
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-blue-300/40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Banner */}
          {gameOver && (
            <div className="mt-5 w-full">
              {hasWon ? (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center animate-fade-in">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 block">
                    Cashout Successful!
                  </span>
                  <span className="text-2xl font-black text-blue-900 font-serif-luxury">
                    +${lastWinAmount.toLocaleString()} ({currentMultiplier}x)
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-center animate-shake">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-700 block">
                    Mine Detonated!
                  </span>
                  <span className="text-sm font-bold text-rose-800">
                    Better luck next time! Choose your moves carefully.
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Bet Controls & Mine Configuration */}
        <div className="lg:col-span-4 white-panel rounded-3xl p-6 shadow-xl border border-blue-100 space-y-5">
          
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Diamond Mines Console</span>
          </h3>

          {/* Mine Count Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Mines on Grid:
              </label>
              <span className="text-sm font-black text-rose-600 font-serif-luxury">
                {mineCount} Mines
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              {[1, 3, 5, 10, 24].map((count) => (
                <button
                  key={count}
                  disabled={gameActive}
                  onClick={() => {
                    sound.playChip();
                    setMineCount(count);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    mineCount === count
                      ? 'bg-rose-600 text-white border-rose-600 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  } disabled:opacity-40`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Current Bet Amount */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Wager Amount:
              </label>
              <span className="text-base font-black text-blue-700 font-serif-luxury">
                ${currentBet.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[25, 50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  disabled={gameActive}
                  onClick={() => {
                    sound.playChip();
                    setCurrentBet(amt);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentBet === amt
                      ? 'bg-blue-600 text-white border-blue-600 shadow'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  } disabled:opacity-40`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Payout Multiplier preview */}
          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Current Multiplier:</span>
              <span className="font-bold text-blue-800">{currentMultiplier}x</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Next Tile Value:</span>
              <span className="font-bold text-emerald-600 font-serif-luxury">
                ${Math.floor(currentBet * nextMultiplier).toLocaleString()} ({nextMultiplier}x)
              </span>
            </div>
          </div>

          {/* Action Buttons: Bet or Cash Out */}
          <div className="space-y-2 pt-2">
            {!gameActive ? (
              <button
                id="mines-start-btn"
                onClick={startNewGame}
                disabled={currentBet <= 0 || currentBet > balance}
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:brightness-105 shadow-xl shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Gem className="w-4 h-4" />
                <span>Start Mines Round (${currentBet.toLocaleString()})</span>
              </button>
            ) : (
              <button
                id="mines-cashout-btn"
                disabled={gemsFound === 0}
                onClick={() => handleCashout()}
                className={`w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-white transition-all shadow-xl flex items-center justify-center gap-2 ${
                  gemsFound > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-[0.99] shadow-emerald-500/25 cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>
                  {gemsFound > 0
                    ? `Cash Out $${currentCashout.toLocaleString()} (${currentMultiplier}x)`
                    : 'Pick at least 1 diamond'}
                </span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
