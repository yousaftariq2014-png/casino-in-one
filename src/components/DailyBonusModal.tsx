import React, { useState, useEffect } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { X, Sparkles, Gift, RotateCw, Crown, Clock, AlertCircle } from 'lucide-react';

const COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Wheel prizes configuration - Slice 0 is strictly $0
const PRIZES = [
  { amount: 0, label: '$0', color: '#0f172a', textColor: '#ef4444', isZero: true },
  { amount: 1000, label: '$1,000', color: '#065f46', textColor: '#ffffff' },
  { amount: 2500, label: '$2,500', color: '#1e3a8a', textColor: '#ffffff' },
  { amount: 5000, label: '$5,000', color: '#7e22ce', textColor: '#ffffff' },
  { amount: 500, label: '$500', color: '#334155', textColor: '#f8fafc' },
  { amount: 10000, label: '$10,000', color: '#be123c', textColor: '#ffffff' },
  { amount: 2000, label: '$2,000', color: '#0f766e', textColor: '#ffffff' },
  { amount: 25000, label: '$25,000 ⭐', color: '#d97706', textColor: '#000000', jackpot: true },
];

export const DailyBonusModal: React.FC = () => {
  const { showBonusWheel, setShowBonusWheel, claimDailyBonus } = useCasino();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  // Check 24-hour spin lock from localStorage
  useEffect(() => {
    const checkCooldown = () => {
      const lastSpinStr = localStorage.getItem('royal_casino_last_wheel_spin');
      if (lastSpinStr) {
        const lastSpinTime = parseInt(lastSpinStr, 10);
        const elapsed = Date.now() - lastSpinTime;
        if (elapsed < COOLDOWN_MS) {
          setRemainingTime(COOLDOWN_MS - elapsed);
          return;
        }
      }
      setRemainingTime(0);
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [showBonusWheel]);

  if (!showBonusWheel) return null;

  // Format milliseconds into HH:MM:SS
  const formatCountdown = (ms: number): string => {
    const totalSecs = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  };

  const isLocked = remainingTime > 0;

  const handleSpin = () => {
    if (spinning || isLocked) return;
    setSpinning(true);
    setWonPrize(null);

    // Target slice is ALWAYS Slice 0 ($0)
    const targetIdx = 0; // Fixed to $0 slice
    const sliceAngle = 360 / PRIZES.length; // 45 degrees
    
    // Slice 0 center is at 22.5 deg clockwise from 12 o'clock (0 deg).
    // To land on slice 0 under the 12 o'clock arrow:
    // With small random jitter of +-8 deg, safely staying squarely inside the $0 slice (which is 45 deg wide)
    const jitter = (Math.random() - 0.5) * 16; // -8 to +8 degrees
    const targetSliceCenter = 22.5 + jitter;
    
    // Calculate final angle ensuring 5 full revolutions + aligning slice 0 to arrow
    const extraSpins = 6 * 360;
    const currentMod = rotation % 360;
    const neededRotationToZero = (360 - targetSliceCenter);
    const angleDelta = ((neededRotationToZero - currentMod + 360) % 360);
    const finalAngle = rotation + extraSpins + angleDelta;

    setRotation(finalAngle);

    // Play ticking sounds during deceleration
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playSpinTick();
      tickCount++;
      if (tickCount > 30) clearInterval(tickInterval);
    }, 110);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      const prize = PRIZES[targetIdx]; // Always $0
      setWonPrize(prize.amount);
      
      // Save 24-hour timestamp strictly to localStorage
      const now = Date.now();
      localStorage.setItem('royal_casino_last_wheel_spin', now.toString());
      setRemainingTime(COOLDOWN_MS);

      // Award zero chips
      claimDailyBonus(0);
      sound.playLose();
    }, 3800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f141d] border-2 border-amber-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] overflow-hidden text-center">
        
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setShowBonusWheel(false)}
          disabled={spinning}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Crown className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black font-serif-luxury gold-gradient-text tracking-wide uppercase">
            VIP Lucky Wheel
          </h2>
          <Crown className="w-5 h-5 text-amber-400" />
        </div>
        
        <p className="text-xs text-slate-400 mb-2 font-medium">
          Daily complimentary spin • Limited strictly to 1 spin per 24 hours
        </p>

        {/* 24-Hour Cooldown Timer Notice */}
        {isLocked && !spinning && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-bold mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Next Free Spin in: <strong>{formatCountdown(remainingTime)}</strong></span>
          </div>
        )}

        {!isLocked && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Daily Spin Ready to Play!</span>
          </div>
        )}

        {/* The Wheel Container */}
        <div className="relative w-64 h-64 mx-auto mb-5 flex items-center justify-center">
          
          {/* Top Indicator Arrow (Pointing down to 12 o'clock) */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 drop-shadow-[0_2px_8px_rgba(245,197,66,0.6)]" />

          {/* Outer Ring with gold border */}
          <div className="w-full h-full rounded-full border-4 border-amber-400/80 p-1 bg-amber-950/40 shadow-[0_0_25px_rgba(245,197,66,0.3)]">
            
            {/* Spinning disc */}
            <div
              className="w-full h-full rounded-full relative overflow-hidden transition-transform ease-out"
              style={{
                transform: `rotate(${rotation}deg)`,
                transitionDuration: spinning ? '3.8s' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.25, 1)',
              }}
            >
              {/* SVG Wheel slices */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {PRIZES.map((prize, idx) => {
                  const angle = 360 / PRIZES.length;
                  const startAngle = idx * angle;
                  const endAngle = (idx + 1) * angle;
                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  const textAngle = startAngle + angle / 2;

                  return (
                    <g key={idx}>
                      <path d={pathData} fill={prize.color} stroke="#0f141d" strokeWidth="0.8" />
                      <text
                        x="50"
                        y="18"
                        fill={prize.textColor}
                        fontSize={prize.isZero ? "5.5" : "4.2"}
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${textAngle}, 50, 50)`}
                      >
                        {prize.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Center Hub */}
          <div className="absolute z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 border-2 border-amber-200 flex items-center justify-center shadow-lg pointer-events-none">
            <Gift className="w-6 h-6 text-slate-950" />
          </div>
        </div>

        {/* Won Prize Announcement */}
        {wonPrize !== null && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/15 border border-rose-500/40 animate-in zoom-in-95">
            <div className="flex items-center justify-center gap-1.5 text-rose-400 font-bold text-xs uppercase mb-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Better Luck Next Time!</span>
            </div>
            <span className="text-2xl font-black text-rose-400 font-serif-luxury block">
              $0 Chips
            </span>
            <span className="text-[11px] text-slate-400">
              The house landed on $0. Your next free spin will unlock in 24 hours.
            </span>
          </div>
        )}

        {/* Spin Action */}
        <div className="flex flex-col gap-2">
          <button
            id="spin-bonus-wheel-btn"
            disabled={spinning || isLocked}
            onClick={handleSpin}
            className={`w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${
              isLocked
                ? 'bg-slate-800/80 text-slate-500 border border-slate-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/30 active:scale-98'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>
              {spinning
                ? 'Spinning...'
                : isLocked
                ? `Locked (${formatCountdown(remainingTime)})`
                : 'Spin The Wheel'}
            </span>
          </button>

          {isLocked && (
            <p className="text-[11px] text-slate-500">
              Each VIP account is permitted exactly 1 spin every 24 hours.
            </p>
          )}
        </div>

      </div>
    </div>
  );
};
