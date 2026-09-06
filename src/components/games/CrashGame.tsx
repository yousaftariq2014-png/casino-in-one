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
  ShieldAlert,
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

  // Keep refs in sync
  useEffect(() => {
    currentBetRef.current = currentBet;
  }, [currentBet]);

  // Clean up animations on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Calculate random crash point with house edge (~97% RTP)
  const generateCrashPoint = (): number => {
    // 4% instant crash chance at 1.00x
    if (Math.random() < 0.04) {
      return 1.0;
    }
    // Exponential distribution
    const e = 2 ** 32;
    const h = Math.floor(Math.random() * e);
    const r = Math.floor((100 * e - h) / (e - h));
    const result = Math.max(1.01, parseFloat((r / 100).toFixed(2)));
    return Math.min(result, 250.0);
  };

  const handleStartFlight = () => {
    if (gameState === 'flying') return;
    if (currentBet <= 0) return;
    if (currentBet > balance) {
      sound.playLose();
      return;
    }

    const deducted = modifyBalance(-currentBet, 'crash', currentBet);
    if (!deducted) return;

    sound.playChip();

    const targetCrash = generateCrashPoint();
    setCrashPoint(targetCrash);
    crashPointRef.current = targetCrash;
    hasCashedOutRef.current = false;
    setMultiplier(1.0);
    setGameState('flying');
    startTimeRef.current = performance.now();

    const durationFactor = 0.0007; // Speed curve

    const loop = (now: number) => {
      const elapsedSec = (now - startTimeRef.current) / 1000;
      // Multiplier grows exponentially over time: 1.00 * e^(0.075 * t^1.15)
      const currentMult = parseFloat(Math.max(1.0, Math.exp(0.08 * Math.pow(elapsedSec, 1.25))).toFixed(2));

      // Play sound tick
      if (Math.random() < 0.25) {
        sound.playRocketAscend(currentMult);
      }

      // Check for auto-cashout
      if (
        autoCashoutEnabled &&
        !hasCashedOutRef.current &&
        currentMult >= autoCashout &&
        currentMult < crashPointRef.current
      ) {
        handleCashout(currentMult);
      }

      if (currentMult >= crashPointRef.current) {
        // Rocket Crashed!
        setMultiplier(crashPointRef.current);
        setGameState(hasCashedOutRef.current ? 'cashed-out' : 'crashed');
        sound.playRocketCrash();

        // Add to history
        setHistory((prev) => [crashPointRef.current, ...prev.slice(0, 9)]);

        // Draw explosion
        drawCanvas(crashPointRef.current, true);
        return;
      }

      setMultiplier(currentMult);
      drawCanvas(currentMult, false);

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);
  };

  const handleCashout = (atMultiplier?: number) => {
    if (gameState !== 'flying' || hasCashedOutRef.current) return;

    const mult = atMultiplier ?? multiplier;
    hasCashedOutRef.current = true;
    setCashoutMultiplier(mult);

    const winnings = Math.floor(currentBetRef.current * mult);
    modifyBalance(winnings, 'crash');

    sound.playCashout();

    if (mult >= 5.0) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#60a5fa', '#93c5fd', '#ffffff'],
      });
    }
  };

  // Canvas drawing function for the flight path and animated stars
  const drawCanvas = (currentMult: number, isCrashed: boolean) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Deep Royal Navy / Sapphire gradient sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, '#09152e');
    skyGrad.addColorStop(1, '#0f274d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle Grid lines
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = height - 30; y > 0; y -= 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Rocket Flight coordinates
    // Logarithmic map to fit canvas nicely
    const progress = Math.min(1, Math.log2(currentMult) / 6);
    const startX = 50;
    const startY = height - 40;
    const targetX = startX + progress * (width - 120);
    const targetY = startY - progress * (height - 90);

    // Curve control point
    const cpX = startX + (targetX - startX) * 0.4;
    const cpY = startY;

    // Glowing Curve
    ctx.shadowBlur = 12;
    ctx.shadowColor = isCrashed ? '#ef4444' : '#38bdf8';
    ctx.strokeStyle = isCrashed ? '#f87171' : '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Gradient fill under the curve
    const areaGrad = ctx.createLinearGradient(0, targetY, 0, startY);
    if (isCrashed) {
      areaGrad.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
      areaGrad.addColorStop(1, 'rgba(239, 68, 68, 0.0)');
    } else {
      areaGrad.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      areaGrad.addColorStop(1, 'rgba(37, 99, 235, 0.0)');
    }
    ctx.fillStyle = areaGrad;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
    ctx.lineTo(targetX, startY);
    ctx.closePath();
    ctx.fill();

    if (isCrashed) {
      // Explosion burst
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(targetX, targetY, 9, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw Rocket at (targetX, targetY)
      ctx.save();
      ctx.translate(targetX, targetY);
      // Angle tangent
      const angle = -Math.PI / 4;
      ctx.rotate(angle);

      // Flame behind rocket
      ctx.fillStyle = '#f97316';
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
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(20, 0);
      ctx.lineTo(10, 5);
      ctx.closePath();
      ctx.fill();

      // Rocket fins
      ctx.fillStyle = '#1d4ed8';
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

  // Initial draw
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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Casino Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
            Multiplier Rocket
          </span>
          <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
            RTP 97.5%
          </span>
        </div>
      </div>

      {/* Recent Crash Multipliers Bar */}
      <div className="flex items-center gap-2 overflow-x-auto p-3 bg-white rounded-2xl border border-blue-100 shadow-sm no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 shrink-0 mr-1">
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span>Recent:</span>
        </div>
        {history.map((h, i) => {
          const isHigh = h >= 3.0;
          const isMid = h >= 1.8 && h < 3.0;
          return (
            <span
              key={i}
              className={`text-xs font-black px-2.5 py-1 rounded-lg shrink-0 border ${
                isHigh
                  ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm'
                  : isMid
                  ? 'bg-sky-50 text-sky-700 border-sky-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          );
        })}
      </div>

      {/* Main Canvas & Flight Arena */}
      <div className="relative rounded-3xl overflow-hidden border-2 border-blue-200 shadow-xl bg-slate-900">
        <canvas
          ref={canvasRef}
          width={800}
          height={380}
          className="w-full h-72 sm:h-96 object-cover block"
        />

        {/* Big Center Multiplier Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {gameState === 'idle' && (
            <div className="text-center p-4 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-blue-400/30">
              <Rocket className="w-10 h-10 text-blue-400 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider font-serif-luxury">
                Crash Rocket
              </h2>
              <p className="text-xs sm:text-sm text-blue-200 mt-1">
                Place your bet, launch into orbit, and cash out before the rocket crashes!
              </p>
            </div>
          )}

          {gameState === 'flying' && (
            <div className="text-center">
              <span className="text-5xl sm:text-7xl font-black text-white tracking-tight font-serif-luxury drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {multiplier.toFixed(2)}
                <span className="text-blue-400 text-4xl sm:text-5xl">x</span>
              </span>
              <p className="text-xs sm:text-sm font-bold text-sky-300 tracking-wider uppercase mt-1">
                Current Altitude
              </p>
            </div>
          )}

          {gameState === 'crashed' && (
            <div className="text-center p-4 rounded-2xl bg-rose-950/80 backdrop-blur-md border border-rose-500/40 animate-shake">
              <span className="text-xs font-extrabold text-rose-300 uppercase tracking-widest block mb-1">
                Crashed At
              </span>
              <span className="text-5xl sm:text-6xl font-black text-rose-400 font-serif-luxury">
                {multiplier.toFixed(2)}x
              </span>
              <p className="text-xs text-rose-200 font-medium mt-1">Better luck next flight!</p>
            </div>
          )}

          {gameState === 'cashed-out' && (
            <div className="text-center p-4 rounded-2xl bg-blue-950/85 backdrop-blur-md border border-blue-400/50">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase mb-2">
                <Trophy className="w-3.5 h-3.5 text-blue-400" />
                <span>Cashed Out Successfully!</span>
              </div>
              <span className="text-4xl sm:text-5xl font-black text-white font-serif-luxury block">
                +${Math.floor(currentBet * cashoutMultiplier).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-blue-300">
                Locked in at {cashoutMultiplier.toFixed(2)}x (Crashed at {crashPoint.toFixed(2)}x)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Control Console: White & Blue */}
      <div className="white-panel rounded-3xl p-6 space-y-6">
        
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
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Current Wager:
              </label>
              <span className="text-lg font-black text-blue-700 font-serif-luxury">
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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  } disabled:opacity-40`}
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Auto Cashout Config */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-cashout-toggle"
                  checked={autoCashoutEnabled}
                  disabled={gameState === 'flying'}
                  onChange={(e) => setAutoCashoutEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
                />
                <label
                  htmlFor="auto-cashout-toggle"
                  className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none"
                >
                  Auto Cashout Target:
                </label>
              </div>
              <span className="text-sm font-black text-blue-600">
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
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
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
              className="w-full py-4 rounded-2xl font-black text-lg uppercase tracking-wider text-white bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:brightness-105 shadow-xl shadow-blue-500/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              <Rocket className="w-6 h-6 animate-bounce" />
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
