import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Activity, Crown, Zap, Flame, ShieldCheck } from 'lucide-react';

export const LiveBetsFeed: React.FC = () => {
  const { liveBets, onSelectGame } = useCasino() as any;
  const [activeTab, setActiveTab] = useState<'all' | 'high' | 'lucky'>('all');

  const filteredBets = liveBets.filter((bet: any) => {
    if (activeTab === 'high') return bet.isHighRoller || bet.bet >= 250;
    if (activeTab === 'lucky') return bet.multiplier >= 5;
    return true;
  });

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#111520] to-[#0a0d14] border border-amber-500/20 p-4 sm:p-6 shadow-2xl space-y-4">
      
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black font-serif-luxury text-white">
                Live Casino Floor Feed
              </h3>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                Active 24/7
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Live bets happening in real time across Grand Royale VIP suites
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-[#0b0e14] p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>All Bets</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('high');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'high'
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-yellow-300" />
            <span>High Rollers</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('lucky');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'lucky'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-200" />
            <span>Lucky Hits</span>
          </button>
        </div>

      </div>

      {/* Live Table */}
      <div className="w-full overflow-x-auto no-scrollbar">
        <table className="w-full min-w-[480px] text-left text-xs">
          <thead>
            <tr className="text-slate-500 border-b border-slate-800/60 uppercase tracking-wider text-[10px]">
              <th className="pb-2.5 font-bold">Game</th>
              <th className="pb-2.5 font-bold">VIP Player</th>
              <th className="pb-2.5 font-bold">Bet</th>
              <th className="pb-2.5 font-bold">Multiplier</th>
              <th className="pb-2.5 font-bold text-right">Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/60 font-medium">
            {filteredBets.slice(0, 10).map((b: any, idx: number) => {
              const isWin = b.payout > 0;
              return (
                <tr
                  key={b.id || idx}
                  className="hover:bg-slate-800/25 transition-colors group"
                >
                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
                      <span className="font-bold text-slate-200 group-hover:text-amber-300 transition-colors">
                        {b.gameName}
                      </span>
                    </div>
                  </td>

                  <td className="py-2.5 pr-2">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {b.isHighRoller && <Crown className="w-3 h-3 text-yellow-400" />}
                      <span className="font-mono text-[11px] font-semibold">{b.player}</span>
                    </div>
                  </td>

                  <td className="py-2.5 pr-2 text-slate-300 font-mono">
                    ${b.bet.toLocaleString()}
                  </td>

                  <td className="py-2.5 pr-2">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-black ${
                        isWin
                          ? b.multiplier >= 10
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {b.multiplier > 0 ? `${b.multiplier}x` : '0.00x'}
                    </span>
                  </td>

                  <td className="py-2.5 text-right font-black font-serif-luxury text-sm">
                    {isWin ? (
                      <span className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                        +${b.payout.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-600 font-sans text-xs">-${b.bet.toLocaleString()}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Provably Fair Badge */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>All bets cryptographically verified via Provably Fair SHA-256</span>
        </div>
        <div className="text-[10px] text-slate-500">
          Showing 10 of {liveBets.length} streaming rounds
        </div>
      </div>

    </div>
  );
};
