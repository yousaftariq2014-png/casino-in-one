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
  const { balance, modifyBalance, selectedChip, setSelectedChip, recordGameRound } = useCasino();

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

  // Multiplier table
  const getMultiplier = (gems: number, mines: number): number => {
    if (gems <= 0) return 1.0;
    let mult = 0.98; // 2% house edge
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

    modifyBalance(-currentBet, 'mines', currentBet);
    sound.playChip();

    // Randomize mine positions
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      const randIdx = Math.floor(Math.random() * 25);
      mineIndices.add(randIdx);
    }

    const newTiles: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      revealed: false,
      isMine: mineIndices.has(i),
    }));

    setTiles(newTiles);
    setGemsFound(0);
    setGameActive(true);
    setGameOver(false);
    setHasWon(false);
  };

  const handleTileClick = (index: number) => {
    if (!gameActive || gameOver || tiles[index].revealed) return;

    const clickedTile = tiles[index];

    if (clickedTile.isMine) {
      // Boom!
      sound.playLose();
      setGameOver(true);
      setGameActive(false);
      setHasWon(false);

      recordGameRound({
        game: 'mines',
        gameName: 'Diamond Mines',
        bet: currentBet,
        payout: 0,
        multiplier: 0,
        outcome: 'loss',
        details: `Hit a Mine after finding ${gemsFound} diamond(s) (${mineCount} mines grid)`,
      });

      // Reveal all mines
      setTiles((prev) =>
        prev.map((t) => (t.isMine ? { ...t, revealed: true } : t))
      );
    } else {
      // Found gem!
      sound.playWin();
      const updatedGems = gemsFound + 1;
      setGemsFound(updatedGems);

      setTiles((prev) =>
        prev.map((t) => (t.index === index ? { ...t, revealed: true } : t))
      );

      // Check if all non-mine gems were found
      if (updatedGems === 25 - mineCount) {
        handleCashout(updatedGems);
      }
    }
  };

  const handleCashout = (forcedGems?: number) => {
    if (!gameActive || gameOver) return;

    const activeGems = forcedGems !== undefined ? forcedGems : gemsFound;
    if (activeGems <= 0) return;

    const mult = getMultiplier(activeGems, mineCount);
    const winAmount = Math.floor(currentBet * mult);

    recordGameRound({
      game: 'mines',
      gameName: 'Diamond Mines',
      bet: currentBet,
      payout: winAmount,
      multiplier: mult,
      outcome: 'win',
      details: `Safely cashed out ${activeGems} diamond(s) at ${mult.toFixed(2)}x (${mineCount} mines grid)`,
    });

    modifyBalance(winAmount, 'mines');
    setLastWinAmount(winAmount);
    setGameOver(true);
    setGameActive(false);
    setHasWon(true);

    if (mult >= 4) {
      sound.playBigWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f59e0b', '#ffffff'],
      });
    } else {
      sound.playWin();
    }

    // Reveal remaining tiles peacefully
    setTiles((prev) => prev.map((t) => ({ ...t, revealed: true })));
  };

  return (
    <div id="mines-game-container" className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="mines-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-2.5 sm:px-3 py-1 rounded-full border border-amber-500/30">
            5×5 Grid
          </span>
          <span className="hidden sm:inline-block text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            RTP 98.0% • Provably Fair
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Game Grid */}
        <div className="lg:col-span-8 bg-[#0f141d] rounded-3xl p-6 shadow-2xl border border-amber-500/25 flex flex-col items-center">
          
          {/* Status Bar */}
          <div className="w-full flex items-center justify-between mb-5 bg-[#141926] border border-amber-500/20 p-3 rounded-2xl text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-300">
              <Gem className="w-4 h-4 text-amber-400" />
              <span>Gems: <strong className="text-amber-300 font-serif-luxury text-sm">{gemsFound}</strong> / {25 - mineCount}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Bomb className="w-4 h-4 text-rose-400" />
              <span>Mines: <strong className="text-rose-400 font-serif-luxury text-sm">{mineCount}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Next Tile: <strong className="text-emerald-400 font-serif-luxury text-sm">{nextMultiplier}x</strong></span>
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
                        ? 'bg-rose-950/80 border-2 border-rose-500 text-rose-400 shadow-inner'
                        : 'bg-amber-950/40 border-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : gameActive
                      ? 'bg-gradient-to-b from-[#1e2538] to-[#121622] hover:from-[#2a334d] hover:to-[#1a2030] text-amber-400 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer border border-amber-500/30'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-600 opacity-60 cursor-not-allowed'
                  }`}
                >
                  {isRevealed ? (
                    isMine ? (
                      <Bomb className="w-6 h-6 sm:w-8 sm:h-8 animate-shake text-rose-500" />
                    ) : (
                      <Gem className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 animate-bounce" />
                    )
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-amber-400/30" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Result Banner */}
          {gameOver && (
            <div className="mt-5 w-full">
              {hasWon ? (
                <div className="p-3.5 rounded-2xl bg-[#141d26] border border-amber-500/40 text-center animate-fade-in">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 block">
                    Cashout Successful!
                  </span>
                  <span className="text-2xl font-black text-white font-serif-luxury">
                    +${lastWinAmount.toLocaleString()} ({currentMultiplier}x)
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-center animate-shake">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 block">
                    Mine Detonated!
                  </span>
                  <span className="text-sm font-bold text-slate-300">
                    Better luck next time! Choose your moves carefully.
                  </span>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Bet Controls & Mine Configuration */}
        <div className="lg:col-span-4 bg-[#0f141d] rounded-3xl p-6 shadow-2xl border border-amber-500/25 space-y-5">
          
          <h3 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="gold-gradient-text">Diamond Mines Console</span>
          </h3>

          {/* Mine Count Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Mines on Grid:
              </label>
              <span className="text-sm font-black text-rose-400 font-serif-luxury">
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
                      ? 'bg-rose-600 text-white border-rose-500 shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
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
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Wager Amount:
              </label>
              <span className="text-base font-black text-amber-400 font-serif-luxury">
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
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  } disabled:opacity-40`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Potential Payout Multiplier preview */}
          <div className="p-3 rounded-2xl bg-[#141926] border border-slate-800 space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Multiplier:</span>
              <span className="font-bold text-amber-400">{currentMultiplier}x</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Next Tile Value:</span>
              <span className="font-bold text-emerald-400 font-serif-luxury">
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
                className="w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Gem className="w-4 h-4 text-slate-950" />
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
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
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
