import React from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { Crown, Volume2, VolumeX, Gift, BarChart3, Coins, Sparkles } from 'lucide-react';
import { GameType } from '../types';

interface NavbarProps {
  currentGame: GameType;
  onSelectGame: (game: GameType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentGame, onSelectGame }) => {
  const { balance, soundEnabled, setSoundEnabled, setShowBonusWheel, setShowStatsModal } = useCasino();

  const handleSoundToggle = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    if (nextState) {
      sound.playChip();
    }
  };

  const navItems: { id: GameType; label: string; icon: string }[] = [
    { id: 'lobby', label: 'Lobby', icon: '🏛️' },
    { id: 'slots', label: 'Neon Slots', icon: '🎰' },
    { id: 'roulette', label: 'Roulette', icon: '🎡' },
    { id: 'blackjack', label: 'Blackjack 21', icon: '♠️' },
    { id: 'plinko', label: 'Plinko', icon: '⚡' },
    { id: 'crash', label: 'Crash Rocket', icon: '🚀' },
    { id: 'mines', label: 'Diamond Mines', icon: '💎' },
  ];

  return (
    <header id="casino-navbar" className="sticky top-0 z-40 w-full border-b border-blue-100 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Logo in Royal Blue */}
        <button
          id="nav-brand-btn"
          onClick={() => {
            sound.playChip();
            onSelectGame('lobby');
          }}
          className="flex items-center gap-2.5 text-left group transition-transform active:scale-95"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/20 flex items-center justify-center">
            <div className="w-full h-full rounded-[10px] bg-white flex items-center justify-center">
              <Crown className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif-luxury font-black tracking-wider text-base sm:text-lg blue-gradient-text uppercase">
                Grand Royale
              </span>
              <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 tracking-wider">
                VIP
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide">Premier Virtual Casino</p>
          </div>
        </button>

        {/* Center Game Switcher for md+ screens */}
        <nav id="nav-game-menu" className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-xl border border-slate-200">
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Side: Chips Balance & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Virtual Chips Balance Pill */}
          <div
            id="user-balance-badge"
            className="flex items-center bg-blue-50/90 border border-blue-200 rounded-full pl-2.5 sm:pl-3 pr-1 py-1 shadow-inner"
          >
            <Coins className="w-4 h-4 text-blue-600 mr-1.5" />
            <div className="mr-2 sm:mr-3">
              <span className="text-[9px] uppercase tracking-wider text-blue-700 block font-bold leading-none">
                Play Chips
              </span>
              <span className="font-extrabold text-sm sm:text-base text-blue-900 tracking-tight leading-tight">
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
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-sky-500 text-white hover:brightness-105 font-extrabold text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Free Bonus</span>
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
            title="VIP Statistics"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-slate-700 hover:text-blue-700 flex items-center justify-center transition-colors shadow-sm"
          >
            <BarChart3 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Sound Toggle */}
          <button
            id="toggle-sound-btn"
            onClick={handleSoundToggle}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white hover:bg-blue-50 border border-blue-200 text-slate-700 hover:text-blue-700 flex items-center justify-center transition-colors shadow-sm"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
            ) : (
              <VolumeX className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-400" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile & Tablet Sub-Nav for all 6 games */}
      <div className="xl:hidden flex items-center overflow-x-auto no-scrollbar px-4 py-2 border-t border-blue-100 bg-slate-50/80 gap-1.5">
        {navItems.map((item) => {
          const isActive = currentGame === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playChip();
                onSelectGame(item.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 shrink-0 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow'
                  : 'text-slate-600 hover:text-blue-600 bg-white border border-slate-200'
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
