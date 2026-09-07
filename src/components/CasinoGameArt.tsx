import React from 'react';
import { GameType } from '../types';

interface CasinoGameArtProps {
  gameId: GameType;
  className?: string;
}

export const CasinoGameArt: React.FC<CasinoGameArtProps> = ({ gameId, className = 'w-full h-44' }) => {
  switch (gameId) {
    case 'slots':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/60 via-purple-950/50 to-slate-950 border border-amber-500/30 flex items-center justify-center ${className}`}>
          {/* Ambient light glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Slot Reel Machine Visual */}
          <div className="relative z-10 flex items-center gap-2 sm:gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-amber-500/40 shadow-2xl">
            {/* Reel 1 */}
            <div className="w-12 sm:w-14 h-18 sm:h-20 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,197,66,0.6)]">7</span>
              <span className="text-[9px] uppercase font-black text-amber-300/70 tracking-widest mt-0.5">WILD</span>
            </div>

            {/* Reel 2 (Center Jackpot 7) */}
            <div className="w-14 sm:w-16 h-20 sm:h-24 bg-gradient-to-b from-amber-900/50 via-yellow-600/30 to-amber-900/50 border-2 border-amber-400 rounded-lg flex flex-col items-center justify-center shadow-[0_0_15px_rgba(245,197,66,0.4)] scale-105">
              <span className="text-3xl sm:text-4xl font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.9)] animate-pulse">7</span>
              <span className="text-[10px] uppercase font-black text-yellow-200 tracking-wider">JACKPOT</span>
            </div>

            {/* Reel 3 */}
            <div className="w-12 sm:w-14 h-18 sm:h-20 bg-gradient-to-b from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 rounded-lg flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 drop-shadow-[0_0_8px_rgba(245,197,66,0.6)]">7</span>
              <span className="text-[9px] uppercase font-black text-amber-300/70 tracking-widest mt-0.5">BAR</span>
            </div>
          </div>

          {/* Floating gold chips & sparkles in background */}
          <div className="absolute top-2 left-3 text-xs font-black text-amber-300/60 font-serif-luxury tracking-widest">
            20 PAYLINES
          </div>
          <div className="absolute bottom-2 right-3 text-xs font-black text-emerald-400 font-mono tracking-wider">
            500x MAX WIN
          </div>
        </div>
      );

    case 'roulette':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#032e22] to-slate-950 border border-emerald-500/30 flex items-center justify-center ${className}`}>
          {/* Ambient roulette glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Roulette Wheel Illustration (Realistic SVG) */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-28 sm:w-32 h-28 sm:h-32 rounded-full border-4 border-amber-500/60 bg-gradient-to-tr from-amber-900 via-amber-800 to-yellow-950 p-2 shadow-2xl flex items-center justify-center relative">
              {/* Spinning wheel texture */}
              <div className="w-full h-full rounded-full border border-amber-400/40 bg-zinc-950 flex items-center justify-center relative overflow-hidden">
                {/* Number spokes ring */}
                <div className="absolute inset-0 border-[6px] border-emerald-900/60 rounded-full" />
                
                {/* Red/Black/Green segments */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-zinc-900 to-black border-2 border-amber-400/50 flex items-center justify-center text-center shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border border-yellow-200 flex items-center justify-center shadow-lg">
                    <span className="text-[10px] font-black text-slate-950">0</span>
                  </div>
                </div>

                {/* The Golden Roulette Ball */}
                <div className="absolute top-3 right-5 w-3 h-3 rounded-full bg-gradient-to-br from-white via-yellow-100 to-slate-300 shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-bounce" />
              </div>
            </div>
          </div>

          <div className="absolute top-2 left-3 text-xs font-black text-emerald-400 font-serif-luxury tracking-widest">
            MONTE CARLO
          </div>
          <div className="absolute bottom-2 right-3 text-xs font-black text-amber-300 font-mono tracking-wider">
            36:1 PAYOUT
          </div>
        </div>
      );

    case 'blackjack':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-950 to-amber-950/40 border border-emerald-500/30 flex items-center justify-center ${className}`}>
          {/* Ambient card table glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none" />
          
          {/* Blackjack Card Fan */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Card 1: Ace of Spades */}
            <div className="w-16 sm:w-18 h-24 sm:h-28 bg-gradient-to-b from-white via-slate-50 to-slate-200 rounded-xl p-2 shadow-2xl border border-slate-300 -rotate-12 -mr-5 flex flex-col justify-between transform transition-transform hover:-translate-y-2">
              <div className="text-left">
                <span className="text-sm sm:text-base font-black text-slate-900 leading-none block">A</span>
                <span className="text-xs text-slate-900 leading-none">♠</span>
              </div>
              <div className="text-center text-xl sm:text-2xl text-slate-950 font-black">
                ♠
              </div>
              <div className="text-right rotate-180">
                <span className="text-sm sm:text-base font-black text-slate-900 leading-none block">A</span>
                <span className="text-xs text-slate-900 leading-none">♠</span>
              </div>
            </div>

            {/* Card 2: King of Hearts (Blackjack 21!) */}
            <div className="w-16 sm:w-18 h-24 sm:h-28 bg-gradient-to-b from-white via-slate-50 to-slate-200 rounded-xl p-2 shadow-2xl border-2 border-amber-400 rotate-6 flex flex-col justify-between transform transition-transform hover:-translate-y-2 relative z-20">
              <div className="text-left">
                <span className="text-sm sm:text-base font-black text-rose-600 leading-none block">K</span>
                <span className="text-xs text-rose-600 leading-none">♥</span>
              </div>
              <div className="text-center text-xl sm:text-2xl text-rose-600 font-black">
                ♥
              </div>
              <div className="text-right rotate-180">
                <span className="text-sm sm:text-base font-black text-rose-600 leading-none block">K</span>
                <span className="text-xs text-rose-600 leading-none">♥</span>
              </div>
            </div>

            {/* 21 Badge in front */}
            <div className="absolute -bottom-2 -right-3 z-30 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] px-2.5 py-0.5 rounded-full border border-amber-200 shadow-xl">
              21 BLACKJACK!
            </div>
          </div>

          <div className="absolute top-2 left-3 text-xs font-black text-amber-300 font-serif-luxury tracking-widest">
            VEGAS RULES
          </div>
          <div className="absolute bottom-2 left-3 text-xs font-black text-emerald-400 font-mono tracking-wider">
            99.5% RTP
          </div>
        </div>
      );

    case 'plinko':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950/70 via-indigo-950/50 to-slate-950 border border-purple-500/30 flex items-center justify-center ${className}`}>
          {/* Cosmic nebula background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Pegs & Bouncing Golden Orb Visual */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            {/* Peg Row 1 */}
            <div className="flex gap-4 text-purple-300/40 text-[8px]">
              <span>•</span><span>•</span><span>•</span>
            </div>
            {/* Peg Row 2 */}
            <div className="flex gap-3 text-purple-300/50 text-[10px]">
              <span>•</span>
              {/* Luminous dropping chip */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-amber-500 shadow-[0_0_12px_rgba(253,224,71,0.9)] animate-pulse" />
              <span>•</span><span>•</span>
            </div>
            {/* Peg Row 3 */}
            <div className="flex gap-3.5 text-purple-300/60 text-[11px]">
              <span>•</span><span>•</span><span>•</span><span>•</span><span>•</span>
            </div>

            {/* Bottom Multiplier Buckets */}
            <div className="flex items-center gap-1 mt-1">
              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px]">100x</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[9px]">25x</span>
              <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-slate-950 font-black text-[9px]">9x</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[9px]">2x</span>
              <span className="px-1.5 py-0.5 rounded bg-rose-500 text-white font-black text-[9px]">100x</span>
            </div>
          </div>

          <div className="absolute top-2 left-3 text-xs font-black text-purple-300 font-serif-luxury tracking-widest">
            12-ROW PYRAMID
          </div>
          <div className="absolute bottom-2 right-3 text-xs font-black text-yellow-400 font-mono tracking-wider">
            100x MULTIPLIER
          </div>
        </div>
      );

    case 'crash':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-950/70 via-orange-950/50 to-slate-950 border border-rose-500/30 flex items-center justify-center ${className}`}>
          {/* Fiery space glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-rose-500/20 via-transparent to-transparent pointer-events-none" />

          {/* Exponential Ascent Rocket & Curve */}
          <div className="relative z-10 w-full max-w-[200px] h-24 flex flex-col justify-end p-2">
            {/* Curved Path */}
            <svg className="w-full h-16 overflow-visible" viewBox="0 0 100 50">
              <path
                d="M 0 48 Q 45 45 85 10"
                fill="none"
                stroke="rgba(244, 63, 94, 0.8)"
                strokeWidth="3"
                strokeDasharray="4,2"
              />
              {/* Rocket tip at endpoint */}
              <circle cx="85" cy="10" r="4" fill="#f43f5e" />
            </svg>

            {/* Soaring Rocket & Multiplier Display */}
            <div className="absolute top-2 right-4 flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1 rounded-xl border border-rose-500/40 shadow-xl">
              <span className="text-lg">🚀</span>
              <span className="text-xl font-black text-rose-400 font-mono animate-pulse">84.50x</span>
            </div>
          </div>

          <div className="absolute top-2 left-3 text-xs font-black text-rose-400 font-serif-luxury tracking-widest">
            REAL-TIME CASHOUT
          </div>
          <div className="absolute bottom-2 left-3 text-xs font-black text-amber-300 font-mono tracking-wider">
            250x+ ADRENALINE
          </div>
        </div>
      );

    case 'mines':
      return (
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-950/70 via-blue-950/50 to-slate-950 border border-cyan-500/30 flex items-center justify-center ${className}`}>
          {/* Diamond mines aura */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 via-transparent to-transparent pointer-events-none" />

          {/* 3x3 Preview Grid of Diamonds & Danger */}
          <div className="relative z-10 grid grid-cols-3 gap-2">
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-lg shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              💎
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-950/80 border border-emerald-400/60 flex items-center justify-center text-lg shadow-[0_0_10px_rgba(16,185,129,0.4)]">
              💎
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
              ?
            </div>
            <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
              ?
            </div>
            <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-400/60 flex items-center justify-center text-lg shadow-[0_0_10px_rgba(6,182,212,0.4)]">
              💎
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-950/80 border border-rose-500/60 flex items-center justify-center text-sm shadow-[0_0_10px_rgba(244,63,94,0.3)]">
              💣
            </div>
          </div>

          <div className="absolute top-2 left-3 text-xs font-black text-cyan-300 font-serif-luxury tracking-widest">
            5×5 GRID
          </div>
          <div className="absolute bottom-2 right-3 text-xs font-black text-emerald-400 font-mono tracking-wider">
            1,000x+ MAX WIN
          </div>
        </div>
      );

    default:
      return null;
  }
};
