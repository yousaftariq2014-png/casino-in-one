import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Crown, Volume2, VolumeX, Gift, BarChart3, Coins, ShieldCheck, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface NavbarProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
  onOpenCertificates?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentGame, onSelectGame, onOpenCertificates }) => {
  const { balance, soundEnabled, setSoundEnabled, setShowBonusWheel, setShowStatsModal } = useCasino();

  const handleSoundToggle = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      sound.playChip();
    }
  };

  const navItems: { id: GameType; label: string; icon: string }[] = [
    { id: 'lobby', label: 'VIP Lobby', icon: '🏛️' },
    { id: 'slots', label: 'Neon Slots', icon: '🎰' },
    { id: 'roulette', label: 'Roulette', icon: '🎡' },
    { id: 'blackjack', label: 'Blackjack 21', icon: '♠️' },
    { id: 'plinko', label: 'Plinko Galaxy', icon: '⚡' },
    { id: 'crash', label: 'Crash Rocket', icon: '🚀' },
    { id: 'mines', label: 'Diamond Mines', icon: '💎' },
  ];

  return (
    <header id="casino-navbar" className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#090c13]/95 backdrop-blur-md shadow-2xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Logo in 24K Gold & Obsidian */}
        <button
          id="nav-brand-btn"
          onClick={() => {
            sound.playChip();
            onSelectGame('lobby');
          }}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#0c1017] flex items-center justify-center">
              <Crown className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform drop-shadow-[0_2px_8px_rgba(245,197,66,0.5)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-luxury font-black tracking-wider text-base sm:text-lg gold-gradient-text uppercase">
                Grand Royale
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 tracking-wider">
                VIP #1
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block tracking-wide">
              Licensed & Audited Virtual Casino
            </p>
          </div>
        </button>

        {/* Center Game Switcher for md+ screens */}
        <nav id="nav-game-menu" className="hidden xl:flex items-center gap-1 bg-[#121622]/90 p-1.5 rounded-2xl border border-amber-500/20 shadow-inner">
          {navItems.map((item) => {
            const isActive = currentGame === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  sound.playChip();
                  onSelectGame(item.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:text-amber-300 hover:bg-slate-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Certificates, Chips Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Official License & Certificate Badge Button */}
          <button
            id="nav-certificates-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenCertificates) onOpenCertificates();
            }}
            title="View Official Curacao License & eCOGRA RNG Certification"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] tracking-wide">Certified #1</span>
          </button>

          {/* Virtual Chips Balance Pill */}
          <div
            id="user-balance-badge"
            className="flex items-center bg-[#141824] border border-amber-500/30 rounded-full pl-2.5 sm:pl-3 pr-1 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
          >
            <Coins className="w-4 h-4 text-amber-400 mr-1.5 animate-pulse" />
            <div className="mr-2 sm:mr-3">
              <span className="text-[9px] uppercase tracking-wider text-amber-300/80 block font-bold leading-none">
                Play Chips
              </span>
              <span className="font-black text-sm sm:text-base text-white tracking-tight leading-tight font-serif-luxury">
                ${balance.toLocaleString()}
              </span>
            </div>
            
            {/* Free Bonus Wheel Button */}
            <button
              id="open-bonus-wheel-btn"
              onClick={() => {
                sound.playChip();
                setShowBonusWheel(true);
              }}
              title="Spin Daily Wheel for Free Chips"
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all active:scale-95 shadow-md shadow-amber-500/25"
            >
              <Gift className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Bonus Wheel</span>
              <span className="sm:hidden">Bonus</span>
            </button>
          </div>

          {/* Player Stats Button */}
          <button
            id="view-stats-btn"
            onClick={() => {
              sound.playChip();
              setShowStatsModal(true);
            }}
            title="VIP Player Telemetry & Statistics"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141824] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-colors shadow-md"
          >
            <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#141824] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-colors shadow-md"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Sub-Nav for all 6 games */}
      <div className="xl:hidden flex items-center overflow-x-auto no-scrollbar px-3 py-2 border-t border-slate-800/80 bg-[#0c1018] gap-1.5">
        {navItems.map((item) => {
          const isActive = currentGame === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playChip();
                onSelectGame(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/80 border border-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
