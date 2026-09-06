import React, { useState, useRef, useEffect } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { PlinkoRisk } from '../../types';
import { sound } from '../../utils/audio';
import { ChipSelector } from '../ChipSelector';
import confetti from 'canvas-confetti';
import { ArrowLeft, Play, Sparkles, Flame, Zap, HelpCircle } from 'lucide-react';

interface MultiplierBucket {
  multiplier: number;
  label: string;
  color: string;
  bg: string;
}

// Multipliers based on Risk Level (11 buckets for 10 rows)
const RISK_BUCKETS: Record<PlinkoRisk, MultiplierBucket[]> = {
  low: [
    { multiplier: 8.9, label: '8.9x', color: '#f43f5e', bg: 'bg-rose-500/20' },
    { multiplier: 3.0, label: '3.0x', color: '#f97316', bg: 'bg-orange-500/20' },
    { multiplier: 1.4, label: '1.4x', color: '#eab308', bg: 'bg-yellow-500/20' },
    { multiplier: 1.1, label: '1.1x', color: '#84cc16', bg: 'bg-lime-500/20' },
    { multiplier: 0.9, label: '0.9x', color: '#10b981', bg: 'bg-emerald-500/20' },
    { multiplier: 0.5, label: '0.5x', color: '#06b6d4', bg: 'bg-cyan-500/20' },
    { multiplier: 0.9, label: '0.9x', color: '#10b981', bg: 'bg-emerald-500/20' },
    { multiplier: 1.1, label: '1.1x', color: '#84cc16', bg: 'bg-lime-500/20' },
    { multiplier: 1.4, label: '1.4x', color: '#eab308', bg: 'bg-yellow-500/20' },
    { multiplier: 3.0, label: '3.0x', color: '#f97316', bg: 'bg-orange-500/20' },
    { multiplier: 8.9, label: '8.9x', color: '#f43f5e', bg: 'bg-rose-500/20' },
  ],
  medium: [
    { multiplier: 25.0, label: '25x', color: '#e11d48', bg: 'bg-rose-600/30' },
    { multiplier: 8.0, label: '8x', color: '#ea580c', bg: 'bg-orange-600/30' },
    { multiplier: 2.5, label: '2.5x', color: '#ca8a04', bg: 'bg-yellow-600/30' },
    { multiplier: 1.2, label: '1.2x', color: '#65a30d', bg: 'bg-lime-600/30' },
    { multiplier: 0.5, label: '0.5x', color: '#059669', bg: 'bg-emerald-600/30' },
    { multiplier: 0.2, label: '0.2x', color: '#0891b2', bg: 'bg-cyan-600/30' },
    { multiplier: 0.5, label: '0.5x', color: '#059669', bg: 'bg-emerald-600/30' },
    { multiplier: 1.2, label: '1.2x', color: '#65a30d', bg: 'bg-lime-600/30' },
    { multiplier: 2.5, label: '2.5x', color: '#ca8a04', bg: 'bg-yellow-600/30' },
    { multiplier: 8.0, label: '8x', color: '#ea580c', bg: 'bg-orange-600/30' },
    { multiplier: 25.0, label: '25x', color: '#e11d48', bg: 'bg-rose-600/30' },
  ],
  high: [
    { multiplier: 100.0, label: '100x', color: '#be123c', bg: 'bg-red-700/40' },
    { multiplier: 26.0, label: '26x', color: '#c2410c', bg: 'bg-orange-700/40' },
    { multiplier: 6.0, label: '6x', color: '#a16207', bg: 'bg-amber-700/40' },
    { multiplier: 1.8, label: '1.8x', color: '#4d7c0f', bg: 'bg-lime-700/40' },
    { multiplier: 0.3, label: '0.3x', color: '#047857', bg: 'bg-emerald-700/40' },
    { multiplier: 0.1, label: '0.1x', color: '#0e7490', bg: 'bg-cyan-700/40' },
    { multiplier: 0.3, label: '0.3x', color: '#047857', bg: 'bg-emerald-700/40' },
    { multiplier: 1.8, label: '1.8x', color: '#4d7c0f', bg: 'bg-lime-700/40' },
    { multiplier: 6.0, label: '6x', color: '#a16207', bg: 'bg-amber-700/40' },
    { multiplier: 26.0, label: '26x', color: '#c2410c', bg: 'bg-orange-700/40' },
    { multiplier: 100.0, label: '100x', color: '#be123c', bg: 'bg-red-700/40' },
  ],
};

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  betAmount: number;
  landed: boolean;
}

interface Pin {
  x: number;
  y: number;
  radius: number;
}

interface PlinkoGameProps {
  onBackToLobby: () => void;
}

export const PlinkoGame: React.FC<PlinkoGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip } = useCasino();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [risk, setRisk] = useState<PlinkoRisk>('medium');
  const [activeBucketIdx, setActiveBucketIdx] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number>(0);
  const [recentDrops, setRecentDrops] = useState<{ mult: number; payout: number }[]>([]);

  const ballsRef = useRef<Ball[]>([]);
  const pinsRef = useRef<Pin[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const buckets = RISK_BUCKETS[risk];
  const numRows = 10;

  // Initialize Pin Pyramid positions based on canvas size
  const setupPins = (width: number, height: number) => {
    const pins: Pin[] = [];
    const topMargin = 50;
    const bottomMargin = 70;
    const availableHeight = height - topMargin - bottomMargin;
    const rowSpacing = availableHeight / numRows;

    for (let row = 0; row < numRows; row++) {
      const pinsInRow = row + 3; // row 0 has 3 pins, row 9 has 12 pins
      const pinSpacing = (width * 0.75) / (numRows + 2);
      const rowWidth = (pinsInRow - 1) * pinSpacing;
      const startX = (width - rowWidth) / 2;
      const y = topMargin + row * rowSpacing;

      for (let col = 0; col < pinsInRow; col++) {
        pins.push({
          x: startX + col * pinSpacing,
          y,
          radius: 3.5,
        });
      }
    }
    pinsRef.current = pins;
  };

  // Canvas loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas internal resolution to match displayed client dimensions
    const updateSize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 480;
      setupPins(canvas.width, canvas.height);
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gravity = 0.28;
    const bounceFriction = 0.55;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Pins
      pinsRef.current.forEach((pin) => {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#f8fafc';
        ctx.shadowColor = 'rgba(245, 197, 66, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Update & Draw Balls
      const activeBalls: Ball[] = [];
      const bucketsY = canvas.height - 40;
      const bucketWidth = canvas.width / buckets.length;

      ballsRef.current.forEach((ball) => {
        if (ball.landed) return;

        // Apply physics
        ball.vy += gravity;
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Collide with pins
        pinsRef.current.forEach((pin) => {
          const dx = ball.x - pin.x;
          const dy = ball.y - pin.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + pin.radius;

          if (dist < minDist) {
            // Collision resolution
            sound.playPlinkoBounce();

            const angle = Math.atan2(dy, dx);
            // Slight random nudge so ball doesn't get stuck dead center
            const jitter = (Math.random() - 0.5) * 0.3;
            const targetAngle = angle + jitter;

            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            ball.vx = Math.cos(targetAngle) * speed * bounceFriction;
            ball.vy = Math.sin(targetAngle) * speed * bounceFriction;

            // Push out of pin overlap
            ball.x = pin.x + Math.cos(targetAngle) * minDist;
            ball.y = pin.y + Math.sin(targetAngle) * minDist;
          }
        });

        // Walls bounce
        if (ball.x - ball.radius < 10) {
          ball.x = 10 + ball.radius;
          ball.vx = Math.abs(ball.vx) * 0.5;
        } else if (ball.x + ball.radius > canvas.width - 10) {
          ball.x = canvas.width - 10 - ball.radius;
          ball.vx = -Math.abs(ball.vx) * 0.5;
        }

        // Check if landed in bottom buckets
        if (ball.y >= bucketsY) {
          ball.landed = true;
          // Determine bucket index
          let bucketIndex = Math.floor(ball.x / bucketWidth);
          bucketIndex = Math.max(0, Math.min(buckets.length - 1, bucketIndex));

          const hitBucket = buckets[bucketIndex];
          const payout = Math.round(ball.betAmount * hitBucket.multiplier);

          modifyBalance(payout, 'plinko');
          setLastWin(payout);
          setActiveBucketIdx(bucketIndex);

          setRecentDrops((prev) => [
            { mult: hitBucket.multiplier, payout },
            ...prev.slice(0, 7),
          ]);

          if (hitBucket.multiplier >= 20) {
            sound.playBigWin();
            confetti({ particleCount: 90, spread: 60 });
          } else if (hitBucket.multiplier >= 1.5) {
            sound.playWin();
          } else {
            sound.playChip();
          }

          setTimeout(() => {
            setActiveBucketIdx((curr) => (curr === bucketIndex ? null : curr));
          }, 350);

          return;
        }

        activeBalls.push(ball);

        // Draw glowing ball
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        const grad = ctx.createRadialGradient(
          ball.x - 2,
          ball.y - 2,
          1,
          ball.x,
          ball.y,
          ball.radius
        );
        grad.addColorStop(0, '#fef08a');
        grad.addColorStop(0.6, '#f59e0b');
        grad.addColorStop(1, '#b45309');
        ctx.fillStyle = grad;
        ctx.shadowColor = 'rgba(245, 158, 11, 0.7)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      ballsRef.current = activeBalls;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [risk, buckets]);

  // Drop 1 ball
  const handleDropBall = (count = 1) => {
    const totalCost = selectedChip * count;
    if (balance < totalCost) {
      sound.playLose();
      return;
    }

    modifyBalance(-totalCost, 'plinko', totalCost);
    sound.playChip();

    const canvas = canvasRef.current;
    if (!canvas) return;

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const offset = (Math.random() - 0.5) * 16;
        const newBall: Ball = {
          id: Math.random().toString(),
          x: canvas.width / 2 + offset,
          y: 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.5,
          radius: 7,
          betAmount: selectedChip,
          landed: false,
        };
        ballsRef.current.push(newBall);
      }, i * 200);
    }
  };

  return (
    <div id="plinko-game-container" className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="plinko-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        {/* Multiplier History Pill */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">History:</span>
          {recentDrops.length === 0 ? (
            <span className="text-zinc-500 text-[11px]">Drop orbs to start</span>
          ) : (
            recentDrops.map((drop, idx) => (
              <span
                key={idx}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  drop.mult >= 2
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : drop.mult >= 1
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {drop.mult}x
              </span>
            ))
          )}
        </div>
      </div>

      {/* Main Plinko Stage */}
      <div className="rounded-3xl border-2 border-amber-500/30 p-4 sm:p-6 bg-gradient-to-b from-[#131722] via-[#0d1017] to-[#080b10] shadow-2xl relative overflow-hidden">
        
        {/* Risk Level Selector & Last Win Display */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-zinc-400">Risk:</span>
            {(['low', 'medium', 'high'] as PlinkoRisk[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playChip();
                  setRisk(r);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                  risk === r
                    ? 'bg-amber-500 text-zinc-950 font-black shadow'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">
              Last Drop Payout
            </span>
            <span className={`text-base font-black font-serif-luxury ${lastWin > 0 ? 'text-emerald-400' : 'text-zinc-400'}`}>
              {lastWin > 0 ? `+$${lastWin.toLocaleString()}` : '$0'}
            </span>
          </div>
        </div>

        {/* Physics Canvas */}
        <div className="relative w-full rounded-2xl bg-[#090c12] border border-zinc-800/80 shadow-inner overflow-hidden flex flex-col items-center">
          
          {/* Top Drop Funnel Marker */}
          <div className="w-12 h-3 bg-amber-400/40 rounded-b-xl mb-1 shadow-[0_0_12px_rgba(245,197,66,0.6)]" />

          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-[460px] block"
          />

          {/* Bottom Multiplier Buckets */}
          <div className="w-full grid grid-cols-11 gap-1 px-2 py-2 bg-zinc-950 border-t border-zinc-800">
            {buckets.map((b, idx) => {
              const isPulsing = activeBucketIdx === idx;
              return (
                <div
                  key={idx}
                  className={`h-10 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-xs tracking-tight transition-all duration-150 ${b.bg} ${
                    isPulsing
                      ? 'scale-110 shadow-lg ring-2 ring-white z-10'
                      : 'opacity-90'
                  }`}
                  style={{ color: b.color, borderColor: b.color }}
                >
                  {b.label}
                </div>
              );
            })}
          </div>

        </div>

        {/* Control Dashboard */}
        <div className="mt-5 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Drop Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              id="drop-plinko-5x"
              disabled={balance < selectedChip * 5}
              onClick={() => handleDropBall(5)}
              className="px-4 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40"
            >
              Drop 5 Orbs (${(selectedChip * 5).toLocaleString()})
            </button>

            <button
              id="drop-plinko-1x"
              disabled={balance < selectedChip}
              onClick={() => handleDropBall(1)}
              className="px-8 py-3.5 rounded-xl font-black text-base uppercase tracking-widest bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-xl shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-40 flex items-center gap-2"
            >
              <Zap className="w-5 h-5 fill-current" />
              <span>DROP ORB (${selectedChip})</span>
            </button>
          </div>

        </div>

      </div>

      {/* Chip selector */}
      <ChipSelector label="Wager per Orb" />

    </div>
  );
};
