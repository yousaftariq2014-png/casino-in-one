import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Crown, Volume2, VolumeX, Gift, BarChart3, Coins, ShieldCheck, ShoppingCart, ShieldAlert, Music, MessageSquare, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface NavbarProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
  onOpenCertificates?: () => void;
  onOpenStore?: () => void;
  onOpenVipClub?: () => void;
  onToggleChat?: () => void;
  isChatOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentGame,
  onSelectGame,
  onOpenCertificates,
  onOpenStore,
  onOpenVipClub,
  onToggleChat,
  isChatOpen,
}) => {
  const {
    balance,
    soundEnabled,
    setSoundEnabled,
    setShowBonusWheel,
    setShowStatsModal,
    vipTier,
    loungeMusicEnabled,
    toggleLoungeMusic,
  } = useCasino();

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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 min-h-[56px] sm:min-h-[66px] py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 w-full">
        
        {/* Brand & Logo in 24K Gold & Obsidian */}
        <button
          id="nav-brand-btn"
          onClick={() => {
            sound.playChip();
            onSelectGame('lobby');
          }}
          className="flex items-center gap-2 text-left group transition-transform active:scale-95 shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-md shadow-amber-500/25 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-[#0c1017] flex items-center justify-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform drop-shadow-[0_2px_8px_rgba(245,197,66,0.5)]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-luxury font-black tracking-wider text-sm sm:text-base md:text-lg gold-gradient-text uppercase leading-none">
                Grand Royale
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/40 tracking-wider">
                VIP #1
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 hidden sm:block tracking-wide leading-tight mt-0.5">
              Certified Virtual Casino
            </p>
          </div>
        </button>

        {/* Center Game Switcher for xl+ screens */}
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

        {/* Right Side: Chips Balance & Key Actions (Optimized for Mobile & Desktop) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Official License & Certificate Badge Button (Desktop only) */}
          <button
            id="nav-certificates-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenCertificates) onOpenCertificates();
            }}
            title="View Official Curacao License & eCOGRA RNG Certification"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] tracking-wide">Certified #1</span>
          </button>

          {/* Virtual Chips Balance Pill */}
          <div
            id="user-balance-badge"
            className="flex items-center bg-[#141824] border border-amber-500/30 rounded-full px-2 sm:px-2.5 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mr-1 sm:mr-1.5 animate-pulse shrink-0" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase tracking-wider text-amber-300/80 font-bold leading-none hidden sm:block">
                Chips
              </span>
              <span className="font-black text-xs sm:text-sm text-white tracking-tight leading-tight font-serif-luxury whitespace-nowrap">
                ${balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Buy Chips / Store Button */}
          <button
            id="nav-store-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenStore) onOpenStore();
            }}
            title="Buy Virtual Chips (JazzCash, EasyPaisa, USDT & Card)"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-95 shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="hidden sm:inline">Store</span>
          </button>

          {/* Daily Bonus Wheel Button */}
          <button
            id="open-bonus-wheel-btn"
            onClick={() => {
              sound.playChip();
              setShowBonusWheel(true);
            }}
            title="Spin Daily Bonus Wheel for Free Chips"
            className="flex items-center gap-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 font-black text-xs px-2 sm:px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-amber-500/25 shrink-0"
          >
            <Gift className="w-3.5 h-3.5 text-slate-950 shrink-0" />
            <span className="hidden md:inline">Bonus Wheel</span>
            <span className="hidden sm:inline md:hidden">Bonus</span>
          </button>

          {/* VIP Club & Rakeback Button */}
          <button
            id="nav-vip-club-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenVipClub) onOpenVipClub();
            }}
            title="Open VIP Club & Claim Rakeback Rewards"
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-600/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-black transition-all shadow-sm active:scale-95 group shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="hidden sm:inline">{vipTier.tier} VIP</span>
            <span className="sm:hidden text-[11px]">VIP</span>
          </button>

          {/* Lounge Beats Music Toggle (Hidden on small mobile) */}
          <button
            id="nav-lounge-music-btn"
            onClick={toggleLoungeMusic}
            title={loungeMusicEnabled ? 'Casino Lounge Jazz Music (Playing - Click to Stop)' : 'Turn On Casino Lounge Jazz Music'}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 shrink-0 ${
              loungeMusicEnabled
                ? 'bg-amber-500/20 border-amber-400/80 text-amber-300 shadow-[0_0_12px_rgba(245,197,66,0.3)]'
                : 'bg-[#141824] hover:bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Music className={`w-3.5 h-3.5 ${loungeMusicEnabled ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
            <span className="hidden xl:inline">
              {loungeMusicEnabled ? 'Lounge: ON' : 'Beats'}
            </span>
          </button>

          {/* Live Community Chat Toggle */}
          <button
            id="nav-chat-btn"
            onClick={() => {
              sound.playChip();
              if (onToggleChat) onToggleChat();
            }}
            title="Open Live VIP Players Chat"
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
              isChatOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-[#141824] hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#090c13] animate-pulse" />
          </button>

          {/* Player Stats Button (Hidden on small screens) */}
          <button
            id="view-stats-btn"
            onClick={() => {
              sound.playChip();
              setShowStatsModal(true);
            }}
            title="VIP Player Telemetry & Statistics"
            className="hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#141824] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 items-center justify-center transition-colors shadow-md shrink-0"
          >
            <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#141824] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 flex items-center justify-center transition-colors shadow-md shrink-0"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Sub-Nav for all 6 games */}
      <div className="xl:hidden flex items-center overflow-x-auto no-scrollbar px-2 sm:px-4 py-1.5 border-t border-slate-800/80 bg-[#0c1018] gap-1.5 w-full">
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
