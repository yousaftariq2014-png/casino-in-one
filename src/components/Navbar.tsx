import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { 
  Crown, 
  Volume2, 
  VolumeX, 
  Gift, 
  BarChart3, 
  Coins, 
  ShieldCheck, 
  ShoppingCart, 
  Music, 
  MessageSquare, 
  Menu, 
  X,
  Plus
} from 'lucide-react';
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

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header id="casino-navbar" className="sticky top-0 z-40 w-full border-b border-amber-500/20 bg-[#090c13]/95 backdrop-blur-md shadow-2xl pt-[env(safe-area-inset-top,0px)]">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3 w-full">
        
        {/* Brand & Logo in 24K Gold & Obsidian */}
        <button
          id="nav-brand-btn"
          onClick={() => {
            sound.playChip();
            setMobileMenuOpen(false);
            onSelectGame('lobby');
          }}
          className="flex items-center gap-1.5 sm:gap-2.5 text-left group transition-transform active:scale-95 shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-md shadow-amber-500/25 flex items-center justify-center shrink-0">
            <div className="w-full h-full rounded-[10px] bg-[#0c1017] flex items-center justify-center">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform drop-shadow-[0_2px_8px_rgba(245,197,66,0.5)]" />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="font-serif-luxury font-black tracking-wider text-xs sm:text-base md:text-lg gold-gradient-text uppercase leading-none">
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

        {/* Right Side: Chips Balance & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          
          {/* Official License & Certificate Badge (Desktop only) */}
          <button
            id="nav-certificates-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenCertificates) onOpenCertificates();
            }}
            title="View Official Curacao License & eCOGRA RNG Certification"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/40 hover:border-emerald-400 text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] tracking-wide">Certified #1</span>
          </button>

          {/* Virtual Chips Balance Pill - Click opens Cashier Store */}
          <button
            id="user-balance-badge"
            onClick={() => {
              sound.playChip();
              if (onOpenStore) onOpenStore();
            }}
            title="Your Chips Balance • Click to Open Cashier Store"
            className="flex items-center bg-[#141824] hover:bg-[#1a2030] border border-amber-500/30 hover:border-amber-400/50 rounded-full px-2 sm:px-2.5 py-1 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] transition-colors shrink-0 active:scale-95"
          >
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 mr-1 sm:mr-1.5 animate-pulse shrink-0" />
            <span className="font-black text-xs sm:text-sm text-white tracking-tight leading-tight font-serif-luxury whitespace-nowrap">
              ${balance.toLocaleString()}
            </span>
            <span className="ml-1 sm:ml-1.5 px-1 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40 flex items-center justify-center">
              <Plus className="w-2.5 h-2.5" />
            </span>
          </button>

          {/* Buy Chips / Store Button (sm+ screens) */}
          <button
            id="nav-store-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenStore) onOpenStore();
            }}
            title="Buy Virtual Chips (JazzCash, EasyPaisa, USDT & Card)"
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 hover:brightness-110 text-white font-bold text-xs shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition-all active:scale-95 shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-white shrink-0" />
            <span>Store</span>
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
            <span className="hidden md:inline">Bonus</span>
          </button>

          {/* VIP Club & Rakeback Button (md+ screens) */}
          <button
            id="nav-vip-club-btn"
            onClick={() => {
              sound.playChip();
              if (onOpenVipClub) onOpenVipClub();
            }}
            title="Open VIP Club & Claim Rakeback Rewards"
            className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/30 to-yellow-600/20 border border-amber-500/50 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-black transition-all shadow-sm active:scale-95 group shrink-0"
          >
            <Crown className="w-3.5 h-3.5 text-yellow-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-[11px]">{vipTier.tier} VIP</span>
          </button>

          {/* Lounge Beats Music Toggle (lg+ screens) */}
          <button
            id="nav-lounge-music-btn"
            onClick={toggleLoungeMusic}
            title={loungeMusicEnabled ? 'Casino Lounge Jazz Music ON' : 'Casino Lounge Jazz Music OFF'}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-sm active:scale-95 shrink-0 ${
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

          {/* Live Community Chat Toggle (md+ screens) */}
          <button
            id="nav-chat-btn"
            onClick={() => {
              sound.playChip();
              if (onToggleChat) onToggleChat();
            }}
            title="Open Live VIP Players Chat"
            className={`hidden md:flex relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border items-center justify-center transition-all shadow-md active:scale-95 shrink-0 ${
              isChatOpen
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-[#141824] hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-amber-300'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 border border-[#090c13] animate-pulse" />
          </button>

          {/* Player Stats Button (lg+ screens) */}
          <button
            id="view-stats-btn"
            onClick={() => {
              sound.playChip();
              setShowStatsModal(true);
            }}
            title="VIP Player Telemetry & Statistics"
            className="hidden lg:flex w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#141824] hover:bg-slate-800 border border-slate-700 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 items-center justify-center transition-colors shadow-md shrink-0"
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

          {/* Mobile Menu Dropdown Toggle (visible ONLY on mobile < md) */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => {
              sound.playChip();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            title="Open Casino Menu"
            className="md:hidden w-8 h-8 rounded-xl bg-[#141824] border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-md active:scale-95 shrink-0"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Menu Dropdown Modal (Compact & Clean) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-amber-500/20 bg-[#0c1018]/98 px-3 py-3 shadow-2xl space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                if (onOpenStore) onOpenStore();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-left active:scale-95"
            >
              <ShoppingCart className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block">Cashier Store</span>
                <span className="text-[10px] text-emerald-400/80 font-normal">Buy Chips</span>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                if (onOpenVipClub) onOpenVipClub();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141824] border border-amber-500/40 text-amber-300 text-xs font-bold text-left active:scale-95"
            >
              <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block">{vipTier.tier} VIP Club</span>
                <span className="text-[10px] text-amber-400/80 font-normal">Rakeback Rewards</span>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                if (onToggleChat) onToggleChat();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141824] border border-slate-700 text-slate-200 text-xs font-bold text-left active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block">Live Chat</span>
                <span className="text-[10px] text-slate-400 font-normal">VIP Community</span>
              </div>
            </button>

            <button
              onClick={() => {
                toggleLoungeMusic();
              }}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold text-left active:scale-95 ${
                loungeMusicEnabled
                  ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                  : 'bg-[#141824] border-slate-700 text-slate-300'
              }`}
            >
              <Music className={`w-4 h-4 shrink-0 ${loungeMusicEnabled ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
              <div>
                <span className="block">Lounge Beats</span>
                <span className="text-[10px] text-slate-400 font-normal">{loungeMusicEnabled ? 'Music: ON' : 'Music: OFF'}</span>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                setShowStatsModal(true);
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141824] border border-slate-700 text-slate-200 text-xs font-bold text-left active:scale-95"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="block">Player Stats</span>
                <span className="text-[10px] text-slate-400 font-normal">History & RTP</span>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                if (onOpenCertificates) onOpenCertificates();
              }}
              className="flex items-center gap-2 p-2.5 rounded-xl bg-[#141824] border border-emerald-500/30 text-emerald-300 text-xs font-bold text-left active:scale-95"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="block">Fairness Certs</span>
                <span className="text-[10px] text-slate-400 font-normal">eCOGRA & Curacao</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Sub-Nav for all 6 games */}
      <div className="xl:hidden flex items-center overflow-x-auto no-scrollbar px-2 sm:px-4 py-1.5 border-t border-slate-800/80 bg-[#0c1018] gap-1.5 w-full touch-pan-x">
        {navItems.map((item) => {
          const isActive = currentGame === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playChip();
                setMobileMenuOpen(false);
                onSelectGame(item.id);
              }}
              className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
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
