import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { X, Trophy, Flame, History, RotateCcw, Crown } from 'lucide-react';

export const StatsModal: React.FC = () => {
  const { showStatsModal, setShowStatsModal, stats, balance, resetBalance } = useCasino();

  if (!showStatsModal) return null;

  const netProfit = stats.totalWon - stats.totalWagered;
  const winRatio = stats.totalWagered > 0 ? ((stats.totalWon / stats.totalWagered) * 100).toFixed(1) : '100.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0f141d] border-2 border-amber-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(212,175,55,0.2)] overflow-hidden">
        
        {/* Close button */}
        <button
          onClick={() => setShowStatsModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black font-serif-luxury gold-gradient-text">VIP Player Career Telemetry</h2>
            <p className="text-xs text-slate-400">Audited virtual wagering telemetry and records</p>
          </div>
        </div>

        {/* Top Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-[#141926] border border-amber-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block mb-1">
              Current Chips
            </span>
            <span className="text-lg font-black text-white font-serif-luxury">
              ${balance.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#141926] border border-amber-500/20 rounded-2xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block mb-1">
              Biggest Single Win
            </span>
            <span className="text-lg font-black text-emerald-400 font-serif-luxury">
              ${stats.biggestWin.toLocaleString()}
            </span>
          </div>

          <div className="bg-[#141926] border border-amber-500/20 rounded-2xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-amber-300 tracking-wider block mb-1">
              Payout Ratio
            </span>
            <span className={`text-lg font-black font-serif-luxury ${Number(winRatio) >= 100 ? 'text-emerald-400' : 'text-slate-200'}`}>
              {winRatio}%
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center py-2 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Total Wagered:</span>
            <span className="font-bold text-white">${stats.totalWagered.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Total Payouts Won:</span>
            <span className="font-bold text-emerald-400">+${stats.totalWon.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Net Profit / P&L:</span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {netProfit >= 0 ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
            <span className="text-slate-400 font-medium">Total Rounds Played:</span>
            <span className="font-bold text-white">{stats.gamesPlayed}</span>
          </div>
        </div>

        {/* 6 Games Activity grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center mb-6">
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">🎰</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Slots</span>
            <span className="text-xs font-black text-amber-300">{stats.slotsSpins}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">🎡</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Roulette</span>
            <span className="text-xs font-black text-amber-300">{stats.rouletteSpins}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">♠️</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Blackjack</span>
            <span className="text-xs font-black text-amber-300">{stats.blackjackHands}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">⚡</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Plinko</span>
            <span className="text-xs font-black text-amber-300">{stats.plinkoDrops}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">🚀</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Crash</span>
            <span className="text-xs font-black text-amber-300">{stats.crashRounds || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#141926] border border-amber-500/20">
            <span className="text-base block">💎</span>
            <span className="text-[10px] text-slate-400 block font-semibold">Mines</span>
            <span className="text-xs font-black text-amber-300">{stats.minesRounds || 0}</span>
          </div>
        </div>

        {/* Reset Bankroll action */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm('Reset your chips balance back to standard $5,000?')) {
                resetBalance();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bankroll ($5,000)</span>
          </button>

          <button
            onClick={() => setShowStatsModal(false)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-xs font-black transition-all hover:brightness-110 shadow-md shadow-amber-500/20"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
