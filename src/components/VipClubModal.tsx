import React from 'react';
import { useCasino, VIP_TIERS } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Crown, Sparkles, Gift, Zap, ShieldCheck, X, Timer } from 'lucide-react';

export const VipClubModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    vipTier,
    vipProgress,
    nextVipTier,
    stats,
    rakebackAvailable,
    claimRakeback,
    faucetCooldown,
    claimFaucet,
  } = useCasino();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#141926] via-[#0f131f] to-[#0a0d14] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center text-slate-950">
              <Crown className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-serif-luxury text-white">
                Grand Royale VIP Club
              </h2>
              <p className="text-xs text-amber-400 font-medium">
                High-Roller Prestige & Automated Rakeback Rewards
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playChip();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 text-xs">
          
          {/* Current VIP Status Card */}
          <div className="rounded-2xl bg-[#111624] border border-amber-500/30 p-4 sm:p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase text-slate-400 tracking-wider block font-bold">
                  Current VIP Rank
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl">{vipTier.icon}</span>
                  <span className="text-2xl font-black font-serif-luxury text-amber-300 tracking-wide">
                    {vipTier.tier} VIP
                  </span>
                </div>
                <p className="text-xs text-emerald-400 font-semibold mt-1">
                  ✓ Active Perk: {vipTier.perk}
                </p>
              </div>

              <div className="sm:text-right bg-slate-950/60 p-3 rounded-xl border border-slate-800 w-full sm:w-auto">
                <span className="text-[10px] uppercase text-slate-400 font-bold block">
                  Total Casino Turnover
                </span>
                <span className="text-lg font-black font-mono text-amber-400">
                  ${stats.totalWagered.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Rank Progress Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-bold">
                <span className="text-slate-300">
                  Progress to {nextVipTier ? `${nextVipTier.tier} VIP` : 'Maximum Tier'}
                </span>
                <span className="text-amber-400 font-mono">{vipProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500 shadow-sm shadow-amber-500/50"
                  style={{ width: `${vipProgress}%` }}
                />
              </div>
              {nextVipTier && (
                <span className="text-[10px] text-slate-500 block mt-1">
                  Wager ${(nextVipTier.minWager - stats.totalWagered).toLocaleString()} more to unlock {nextVipTier.tier} VIP
                </span>
              )}
            </div>
          </div>

          {/* Instant Rewards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Rakeback Box */}
            <div className="rounded-2xl bg-gradient-to-b from-[#161f30] to-[#0e1320] border border-amber-500/30 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>Instant Rakeback</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold">
                    {(vipTier.cashbackPct * 100).toFixed(1)}% on every bet
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif-luxury text-amber-300 my-2">
                  ${rakebackAvailable.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Accumulated instantly with every single bet across all 6 casino games.
                </p>
              </div>

              <button
                onClick={claimRakeback}
                disabled={rakebackAvailable < 1}
                className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 disabled:opacity-40 hover:brightness-110 shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Claim Rakeback</span>
              </button>
            </div>

            {/* Faucet / Free Reload Box */}
            <div className="rounded-2xl bg-gradient-to-b from-[#13222a] to-[#0c161d] border border-cyan-500/30 p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Zap className="w-4 h-4" />
                    <span>VIP Chip Reload Faucet</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold">
                    Free Every 5m
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black font-serif-luxury text-cyan-300 my-2">
                  +1,000 Chips
                </div>
                <p className="text-[11px] text-slate-400 mb-3">
                  Never run dry! VIP members receive complimentary reload chips on cooldown.
                </p>
              </div>

              <button
                onClick={claimFaucet}
                disabled={faucetCooldown > 0}
                className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-teal-400 text-slate-950 disabled:opacity-50 hover:brightness-110 shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                {faucetCooldown > 0 ? (
                  <>
                    <Timer className="w-3.5 h-3.5 animate-spin" />
                    <span>Cooldown: {Math.floor(faucetCooldown / 60)}:{(faucetCooldown % 60).toString().padStart(2, '0')}</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Claim +1,000 Free Chips</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* VIP Tiers Table */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              All VIP Club Tiers & Privileges
            </h3>
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950/40">
              {VIP_TIERS.map((tier) => {
                const isCurrent = tier.tier === vipTier.tier;
                return (
                  <div
                    key={tier.tier}
                    className={`flex items-center justify-between p-3 border-b border-slate-900 last:border-0 ${
                      isCurrent ? 'bg-amber-500/10 border-l-4 border-l-amber-400' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{tier.icon}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-xs">{tier.tier}</span>
                          {isCurrent && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black">
                              YOUR LEVEL
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Min Wager: ${tier.minWager.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-amber-300 text-xs block">
                        {(tier.cashbackPct * 100).toFixed(1)}% Rakeback
                      </span>
                      <span className="text-[10px] text-slate-400">{tier.perk}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Automated Tier Progression • Instant Claims</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
