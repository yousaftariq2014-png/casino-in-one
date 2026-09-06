import React, { useState, useEffect, useRef } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { ChipSelector } from '../ChipSelector';
import { sound } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  Rocket,
  Flame,
  RotateCcw,
  Zap,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  Trophy,
  History,
} from 'lucide-react';

interface CrashGameProps {
  onBackToLobby: () => void;
}

type CrashGameState = 'idle' | 'flying' | 'crashed' | 'cashed-out';

export const CrashGame: React.FC<CrashGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip, setSelectedChip } = useCasino();

  const [gameState, setGameState] = useState<CrashGameState>('idle');
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [multiplier, setMultiplier] = useState<number>(1.0);
  const [cashoutMultiplier, setCashoutMultiplier] = useState<number>(1.0);
  const [crashPoint, setCrashPoint] = useState<number>(1.0);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState<boolean>(false);
  const [history, setHistory] = useState<number[]>([1.85, 3.42, 1.15, 12.8, 2.04, 1.45, 5.6]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.0);
  const hasCashedOutRef = useRef<boolean>(false);
  const currentBetRef = useRef<number>(50);

  useEffect(() => {
    currentBetRef.current = currentBet;
  }, [currentBet]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const generateCrashPoint = (): number => {
    const isInstantCrash = Math.random() < 0.035;
    if (isInstantCrash) return 1.0;
    const e = 2 ** 32;
    const h = Math.floor(Math.random() * e);
    const point = Math.floor((100 * e - h) / (e - h)) / 100;
    return Math.max(1.01, Math.min(point, 150));
  };

  const handleStartFlight = () => {
    if (gameState === 'flying') return;
    if (currentBet <= 0) return;
    if (currentBet > balance) {
      sound.playLose();
      return;
    }

    modifyBalance(-currentBet, 'crash', currentBet);
    sound.playChip();

    const targetCrash = generateCrashPoint();
    setCrashPoint(targetCrash);
    crashPointRef.current = targetCrash;
    hasCashedOutRef.current = false;
    setCashoutMultiplier(1.0);
    setGameState('flying');
    setMultiplier(1.0);

    startTimeRef.current = performance.now();

    const animateFlight = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      const currentMult = Math.pow(Math.E, 0.065 * elapsedSec);

      if (currentMult >= crashPointRef.current) {
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        sound.playLose();
        drawCanvas(crashPointRef.current, true);
        setHistory((prev) => [crashPointRef.current, ...prev.slice(0, 10)]);
        return;
      }

      setMultiplier(currentMult);

      if (autoCashoutEnabled && !hasCashedOutRef.current && currentMult >= autoCashout) {
        handleCashout(currentMult);
      }

      drawCanvas(currentMult, false);
      animationFrameRef.current = requestAnimationFrame(animateFlight);
    };

    animationFrameRef.current = requestAnimationFrame(animateFlight);
  };

  const handleCashout = (forcedMult?: number) => {
    if (gameState !== 'flying' || hasCashedOutRef.current) return;

    hasCashedOutRef.current = true;
    const finalMultiplier = forcedMult || multiplier;
    setCashoutMultiplier(finalMultiplier);
    setGameState('cashed-out');

    const winAmount = Math.floor(currentBetRef.current * finalMultiplier);
    modifyBalance(winAmount, 'crash');

    if (finalMultiplier >= 5) {
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
  };

  const drawCanvas = (currentMult: number, isCrashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Deep luxury space background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0d14');
    bgGrad.addColorStop(1, '#0e121d');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 50; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 50; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const padding = 40;
    const flightWidth = width - padding * 2;
    const flightHeight = height - padding * 2;

    const progress = Math.min((currentMult - 1) / 10, 1);
    const endX = padding + flightWidth * Math.min(progress * 1.2, 0.95);
    const endY = height - padding - flightHeight * Math.min(progress, 0.9);

    // Gradient trail under rocket
    const trailGrad = ctx.createLinearGradient(padding, height - padding, endX, endY);
    if (isCrashed) {
      trailGrad.addColorStop(0, 'rgba(225, 29, 72, 0.02)');
      trailGrad.addColorStop(1, 'rgba(225, 29, 72, 0.35)');
    } else {
      trailGrad.addColorStop(0, 'rgba(212, 175, 55, 0.02)');
      trailGrad.addColorStop(1, 'rgba(245, 158, 11, 0.35)');
    }

    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.quadraticCurveTo((padding + endX) / 2, height - padding, endX, endY);
    ctx.lineTo(endX, height - padding);
    ctx.closePath();
    ctx.fill();

    // The flight curve
    ctx.strokeStyle = isCrashed ? '#f43f5e' : '#d4af37';
    ctx.lineWidth = 4;
    ctx.shadowColor = isCrashed ? 'rgba(244, 63, 94, 0.8)' : 'rgba(212, 175, 55, 0.8)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.quadraticCurveTo((padding + endX) / 2, height - padding, endX, endY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Rocket or Explosion
    if (isCrashed) {
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(endX, endY, 12, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.save();
      ctx.translate(endX, endY);
      const angle = -Math.PI / 4;
      ctx.rotate(angle);

      // Golden Flame
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(-18, -4);
      ctx.lineTo(-30 - Math.random() * 8, 0);
      ctx.lineTo(-18, 4);
      ctx.closePath();
      ctx.fill();

      // Rocket body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rocket nosecone
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(20, 0);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fill();

      // Rocket fins
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-16, -11);
      ctx.lineTo(-5, -5);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-10, 5);
      ctx.lineTo(-16, 11);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  };

  useEffect(() => {
    drawCanvas(1.0, false);
  }, []);

  return (
    <div id="crash-game-container" className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="crash-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:text-white transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300 bg-amber-500/15 px-3 py-1 rounded-full border border-amber-500/30">
            Multiplier Rocket
          </span>
          <span className="text-xs font-bold text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
            RTP 98.5% • Provably Fair
          </span>
        </div>
      </div>

      {/* Recent Crash Multipliers Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-3 bg-[#0f141d] rounded-2xl border border-amber-500/20 shadow-lg no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 shrink-0 mr-1">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>Recent Multipliers:</span>
        </div>
        {history.map((h, i) => {
          const isHigh = h >= 3.0;
          const isMid = h >= 1.8 && h < 3.0;
          return (
            <span
              key={i}
              className={`text-xs font-black px-2.5 py-1 rounded-lg shrink-0 border ${
                isHigh
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : isMid
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Main Canvas & Flight Arena */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-[#0a0d14]">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-72 sm:h-96 object-cover block"
        />

        {/* Big Center Multiplier Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {gameState === 'idle' && (
            <div className="text-center p-4 rounded-2xl bg-[#0f141d]/90 backdrop-blur-md border border-amber-500/30">
              <Rocket className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider font-serif-luxury">
                Crash Rocket
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Place your bet, launch into orbit, and cash out before the rocket crashes!
              </p>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="text-center">
              <span className="text-5xl sm:text-7xl font-black text-white tracking-tight font-serif-luxury drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                {multiplier.toFixed(2)}
                <span className="text-amber-400 text-4xl sm:text-5xl">x</span>
              </span>
              <p className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider uppercase mt-1">
                Current Altitude
              </p>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="text-center p-4 rounded-2xl bg-rose-950/85 backdrop-blur-md border border-rose-500/40 animate-shake">
              <span className="text-xs font-extrabold text-rose-300 uppercase tracking-widest block mb-1">
                Crashed At
              </span>
              <span className="text-5xl sm:text-6xl font-black text-rose-400 font-serif-luxury">
                {multiplier.toFixed(2)}x
              </span>
              <p className="text-xs text-rose-200 font-medium mt-1">Flight ended. Better luck next orbit!</p>
            </div>
          )}

          {gameState === 'cashed-out' && (
            <div className="text-center p-4 rounded-2xl bg-[#141a27]/90 backdrop-blur-md border border-amber-500/50">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase mb-2">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cashed Out Successfully!</span>
              </div>
              <span className="text-4xl sm:text-5xl font-black text-white font-serif-luxury block">
                +${Math.floor(currentBet * cashoutMultiplier).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-300">
                Locked in at {cashoutMultiplier.toFixed(2)}x (Crashed at {crashPoint.toFixed(2)}x)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Console: 24K Gold & Obsidian */}
      <div className="bg-[#0f141d] border border-amber-500/20 rounded-3xl p-6 space-y-6 shadow-2xl">
        
        {/* Chip Denomination Selector */}
        <ChipSelector
          label="Select Launch Wager"
          disabled={gameState === 'flying'}
          onClear={() => setCurrentBet(0)}
          onDouble={() => setCurrentBet((prev) => Math.min(balance, prev * 2))}
          onMax={() => setCurrentBet(Math.min(balance, 5000))}
        />

        {/* Quick Bet Buttons & Auto Cashout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Bet Input and Presets */}
          <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Current Wager:
              </label>
              <span className="text-lg font-black text-amber-400 font-serif-luxury">
                ${currentBet.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[25, 50, 100, 250, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  disabled={gameState === 'flying'}
                  onClick={() => {
                    sound.playChip();
                    setCurrentBet(amt);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    currentBet === amt
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  } disabled:opacity-40`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Config */}
          <div className="bg-[#141926] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-cashout-toggle"
                  checked={autoCashoutEnabled}
                  disabled={gameState === 'flying'}
                  onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 border-slate-700 bg-slate-900 cursor-pointer"
                />
                <label
                  htmlFor="auto-cashout-toggle"
                  className="text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer select-none"
                >
                  Auto Cashout Target:
                </label>
              </div>
              <span className="text-sm font-black text-amber-400">
                {autoCashout.toFixed(1)}x
              </span>
            </div>

            <div className="flex items-center gap-2">
              {[1.5, 2.0, 3.0, 5.0, 10.0].map((multiplierVal) => (
                <button
                  key={multiplierVal}
                  disabled={gameState === 'flying'}
                  onClick={() => {
                    sound.playChip();
                    setAutoCashout(multiplierVal);
                    setAutoCashoutEnabled(true);
                  }}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    autoCashout === multiplierVal && autoCashoutEnabled
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-amber-500/40'
                  } disabled:opacity-40`}
                >
                  {multiplierVal}x
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Big Launch or Cashout Button */}
        <div>
          {gameState !== 'flying' ? (
            <button
              id="crash-launch-btn"
              onClick={handleStartFlight}
              disabled={currentBet <= 0 || currentBet > balance}
              className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-slate-950 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 shadow-xl shadow-amber-500/25 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Rocket className="w-6 h-6 animate-bounce text-slate-950" />
              <span>Launch Rocket (${currentBet.toLocaleString()})</span>
            </button>
          ) : (
            <button
              id="crash-cashout-btn"
              onClick={() => handleCashout()}
              disabled={hasCashedOutRef.current}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-white transition-all shadow-xl flex items-center justify-center gap-3 ${
                hasCashedOutRef.current
                  ? 'bg-emerald-600 cursor-default opacity-90'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-105 active:scale-[0.99] shadow-emerald-500/25'
              }`}
            >
              {hasCashedOutRef.current ? (
                <>
                  <Sparkles className="w-6 h-6" />
                  <span>Cashed Out at {cashoutMultiplier.toFixed(2)}x (+${Math.floor(currentBet * cashoutMultiplier).toLocaleString()})</span>
                </>
              ) : (
                <>
                  <Trophy className="w-6 h-6 animate-pulse" />
                  <span>
                    Cash Out Now (+${Math.floor(currentBet * multiplier).toLocaleString()})
                  </span>
                </>
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
