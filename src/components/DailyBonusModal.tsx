import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { X, Sparkles, Gift, RotateCw } from 'lucide-react';

const PRIZES = [
  { amount: 500, label: '$500', color: '#1e293b', textColor: '#f8fafc' },
  { amount: 1000, label: '$1,000', color: '#047857', textColor: '#ffffff' },
  { amount: 2500, label: '$2,500', color: '#1d4ed8', textColor: '#ffffff' },
  { amount: 5000, label: '$5,000', color: '#7e22ce', textColor: '#ffffff' },
  { amount: 1500, label: '$1,500', color: '#b45309', textColor: '#ffffff' },
  { amount: 10000, label: '$10,000', color: '#be123c', textColor: '#ffffff' },
  { amount: 2000, label: '$2,000', color: '#0f766e', textColor: '#ffffff' },
  { amount: 25000, label: '$25,000 ⭐', color: '#d97706', textColor: '#000000', jackpot: true },
];

export const DailyBonusModal: React.FC = () => {
  const { showBonusWheel, setShowBonusWheel, claimDailyBonus } = useCasino();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [wonPrize, setWonPrize] = useState<number | null>(null);

  if (!showBonusWheel) return null;

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setWonPrize(null);

    // Random target index
    const targetIdx = Math.floor(Math.random() * PRIZES.length);
    const sliceAngle = 360 / PRIZES.length;
    // Calculate angle: 5 full rotations (1800 deg) plus offset to target index
    const extraSpins = 5 * 360;
    // Note: arrow points at 270 deg (top) or 0 deg (top). Let's calculate offset so arrow at top aligns
    const targetSliceAngle = targetIdx * sliceAngle;
    const finalAngle = rotation + extraSpins + (360 - (targetSliceAngle % 360)) + sliceAngle / 2;

    setRotation(finalAngle);

    // Play ticking sounds during spin
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playSpinTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 120);

    setTimeout(() => {
      clearInterval(tickInterval);
      setSpinning(false);
      const prize = PRIZES[targetIdx];
      setWonPrize(prize.amount);
      claimDailyBonus(prize.amount);

      sound.playBigWin();
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }, 3800);
  };

  const handleInstantRefill = () => {
    claimDailyBonus(2500);
    sound.playWin();
    setShowBonusWheel(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-2xl overflow-hidden text-center">
        
        {/* Glow effect */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={() => setShowBonusWheel(false)}
          disabled={spinning}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-black font-serif-luxury blue-gradient-text tracking-wide uppercase">
            Lucky Bonus Wheel
          </h2>
          <Sparkles className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-xs text-slate-500 mb-6 font-medium">
          Spin to win up to $25,000 in free virtual play chips!
        </p>

        {/* The Wheel */}
        <div className="relative w-64 h-64 mx-auto mb-6 flex items-center justify-center">
          
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-blue-600 drop-shadow-[0_2px_8px_rgba(37,99,235,0.6)]" />

          {/* Outer Ring with blue border */}
          <div className="w-full h-full rounded-full border-4 border-blue-500 p-1 bg-blue-50 shadow-[0_0_25px_rgba(37,99,235,0.25)]">
            
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
                      <path d={pathData} fill={prize.color} stroke="#ffffff" strokeWidth="0.8" />
                      <text
                        x="50"
                        y="18"
                        fill={prize.textColor}
                        fontSize="4.2"
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
          <div className="absolute z-10 w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 via-blue-500 to-sky-400 border-2 border-white flex items-center justify-center shadow-lg pointer-events-none">
            <Gift className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Won Prize Announcement */}
        {wonPrize !== null && (
          <div className="mb-4 p-3 rounded-2xl bg-blue-50 border border-blue-200 animate-in zoom-in-95">
            <span className="text-xs text-blue-700 uppercase font-bold block">Congratulations!</span>
            <span className="text-2xl font-black text-blue-900 font-serif-luxury">
              +${wonPrize.toLocaleString()} Free Chips
            </span>
          </div>
        )}

        {/* Spin & Actions */}
        <div className="flex flex-col gap-2">
          <button
            id="spin-bonus-wheel-btn"
            disabled={spinning}
            onClick={handleSpin}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 text-white hover:brightness-105 shadow-lg shadow-blue-500/25 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} />
            <span>{spinning ? 'Spinning...' : 'Spin the Wheel'}</span>
          </button>

          <button
            onClick={handleInstantRefill}
            disabled={spinning}
            className="w-full py-2.5 rounded-xl font-bold text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 transition-colors"
          >
            Or get instant +$2,500 Refill
          </button>
        </div>

      </div>
    </div>
  );
};
