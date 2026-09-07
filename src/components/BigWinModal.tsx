import React, { useEffect, useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Sparkles, Trophy, Crown, Flame, X, Coins } from 'lucide-react';

export const BigWinModal: React.FC = () => {
  const { bigWinData, closeBigWinModal } = useCasino();
  const [displayAmount, setDisplayAmount] = useState(0);

  useEffect(() => {
    if (!bigWinData) return;

    sound.playBigWin();
    setDisplayAmount(0);

    const target = bigWinData.amount;
    const duration = 1200; // 1.2s count up
    const startTime = performance.now();

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const current = Math.round(target * Math.pow(progress, 2));
      setDisplayAmount(current);

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      } else {
        setDisplayAmount(target);
      }
    };

    const animId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(animId);
  }, [bigWinData]);

  if (!bigWinData) return null;

  const titles: Record<string, { label: string; color: string; bgGradient: string }> = {
    big: {
      label: 'BIG WIN!',
      color: 'from-amber-400 to-yellow-200',
      bgGradient: 'from-amber-500/20 via-yellow-500/10 to-transparent',
    },
    mega: {
      label: 'MEGA WIN!!',
      color: 'from-yellow-300 via-amber-400 to-orange-400',
      bgGradient: 'from-yellow-500/25 via-amber-500/15 to-transparent',
    },
    epic: {
      label: 'EPIC HIGH-ROLLER WIN!!!',
      color: 'from-cyan-300 via-teal-300 to-emerald-400',
      bgGradient: 'from-teal-500/25 via-emerald-500/15 to-transparent',
    },
    jackpot: {
      label: 'GRAND JACKPOT HIT!!!!',
      color: 'from-pink-400 via-purple-400 to-amber-300',
      bgGradient: 'from-purple-500/30 via-amber-500/20 to-transparent',
    },
  };

  const currentTheme = titles[bigWinData.tier] || titles.big;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      {/* Golden celebratory rays background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] bg-gradient-to-tr from-amber-500/20 to-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute w-full h-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0,transparent_70%)]" />
      </div>

      <div className="relative w-full max-w-lg bg-[#0e121a] border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 text-center shadow-[0_0_80px_rgba(245,197,66,0.4)] overflow-hidden">
        
        {/* Top glowing ambient highlight */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 bg-gradient-to-b ${currentTheme.bgGradient} blur-xl pointer-events-none`} />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playChip();
            closeBigWinModal();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Animated Trophy Icon */}
        <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/30 flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-[#121622] rounded-[14px] flex items-center justify-center">
            {bigWinData.tier === 'jackpot' ? (
              <Crown className="w-10 h-10 text-yellow-400" />
            ) : bigWinData.tier === 'epic' ? (
              <Flame className="w-10 h-10 text-emerald-400" />
            ) : (
              <Trophy className="w-10 h-10 text-amber-400" />
            )}
          </div>
        </div>

        {/* Tier Title */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 font-black text-xs uppercase tracking-widest mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{bigWinData.gameName}</span>
        </div>

        <h2 className={`text-3xl sm:text-5xl font-black font-serif-luxury tracking-wider bg-gradient-to-r ${currentTheme.color} bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(245,197,66,0.4)] mb-3`}>
          {currentTheme.label}
        </h2>

        {/* Payout Display */}
        <div className="my-6 py-4 px-6 rounded-2xl bg-[#080a0f] border border-amber-500/30 shadow-inner">
          <span className="text-xs uppercase text-slate-400 tracking-wider block font-bold mb-1">
            Total Payout Received
          </span>
          <div className="text-4xl sm:text-6xl font-black font-serif-luxury text-amber-300 tracking-wider drop-shadow-md">
            +${displayAmount.toLocaleString()}
          </div>
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-black">
            <span>{bigWinData.multiplier}x MULTIPLIER</span>
          </div>
        </div>

        {/* Collect Button */}
        <button
          onClick={() => {
            sound.playChip();
            closeBigWinModal();
          }}
          className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Coins className="w-5 h-5 text-slate-950" />
          <span>COLLECT YOUR CHIPS</span>
        </button>

      </div>
    </div>
  );
};
