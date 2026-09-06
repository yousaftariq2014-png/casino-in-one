import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { X, Trophy, Flame, History, RotateCcw } from 'lucide-react';

export const StatsModal: React.FC = () => {
  const { showStatsModal, setShowStatsModal, stats, balance, resetBalance } = useCasino();

  if (!showStatsModal) return null;

  const netProfit = stats.totalWon - stats.totalWagered;
  const winRatio = stats.totalWagered > 0 ? ((stats.totalWon / stats.totalWagered) * 100).toFixed(1) : '100.0';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-2xl overflow-hidden">
        
        {/* Close button */}
        <button
          onClick={() => setShowStatsModal(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black font-serif-luxury text-slate-900">VIP Player Career</h2>
            <p className="text-xs text-slate-500">Your live virtual wagering telemetry and records</p>
          </div>
        </div>

        {/* Top Highlight Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-1">
              Current Chips
            </span>
            <span className="text-lg font-black text-blue-900 font-serif-luxury">
              ${balance.toLocaleString()}
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-1">
              Biggest Single Win
            </span>
            <span className="text-lg font-black text-emerald-600 font-serif-luxury">
              ${stats.biggestWin.toLocaleString()}
            </span>
          </div>

          <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider block mb-1">
              Payout Ratio
            </span>
            <span className={`text-lg font-black font-serif-luxury ${Number(winRatio) >= 100 ? 'text-emerald-600' : 'text-slate-800'}`}>
              {winRatio}%
            </span>
          </div>
        </div>

        {/* Breakdown Stats */}
        <div className="space-y-2 mb-6">
          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Total Wagered:</span>
            <span className="font-bold text-slate-900">${stats.totalWagered.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Total Payouts Won:</span>
            <span className="font-bold text-emerald-600">+${stats.totalWon.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Net Profit / P&L:</span>
            <span className={`font-bold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {netProfit >= 0 ? `+$${netProfit.toLocaleString()}` : `-$${Math.abs(netProfit).toLocaleString()}`}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 font-medium">Total Rounds Played:</span>
            <span className="font-bold text-slate-900">{stats.gamesPlayed}</span>
          </div>
        </div>

        {/* 6 Games Activity grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center mb-6">
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">🎰</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Slots</span>
            <span className="text-xs font-black text-blue-900">{stats.slotsSpins}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">🎡</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Roulette</span>
            <span className="text-xs font-black text-blue-900">{stats.rouletteSpins}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">♠️</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Blackjack</span>
            <span className="text-xs font-black text-blue-900">{stats.blackjackHands}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">⚡</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Plinko</span>
            <span className="text-xs font-black text-blue-900">{stats.plinkoDrops}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">🚀</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Crash</span>
            <span className="text-xs font-black text-blue-900">{stats.crashRounds || 0}</span>
          </div>
          <div className="p-2 rounded-xl bg-blue-50/60 border border-blue-100">
            <span className="text-base block">💎</span>
            <span className="text-[10px] text-slate-500 block font-semibold">Mines</span>
            <span className="text-xs font-black text-blue-900">{stats.minesRounds || 0}</span>
          </div>
        </div>

        {/* Reset Bankroll action */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              if (confirm('Reset your chips balance back to standard $5,000?')) {
                resetBalance();
              }
            }}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Bankroll ($5,000)</span>
          </button>

          <button
            onClick={() => setShowStatsModal(false)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
