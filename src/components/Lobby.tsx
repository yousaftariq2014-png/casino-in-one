import React, { useState, useEffect } from 'react';
import { GameType } from '../types';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Coins, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Zap, 
  Trophy 
} from 'lucide-react';

interface LobbyProps {
  onSelectGame: (game: GameType) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onSelectGame }) => {
  const { balance, liveWins, setShowBonusWheel } = useCasino();
  const [jackpot, setJackpot] = useState(1489240.50);

  // Progressive jackpot ticker that gently increments
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + (Math.random() * 2.5 + 0.5));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const games = [
    {
      id: 'slots' as GameType,
      title: 'Neon Vegas Slots',
      subtitle: '5-Reel • 20 Paylines • Wild Diamonds',
      tag: 'HOT JACKPOT',
      tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: '🎰',
      bgGradient: 'from-blue-50/80 via-white to-white',
      borderColor: 'hover:border-blue-500',
      activePlayers: 482,
      maxWin: '500x',
      description: 'Spin vibrant neon reels with wild 7s, scatter crowns, and free spins.',
    },
    {
      id: 'roulette' as GameType,
      title: 'European Roulette',
      subtitle: 'Single Zero 37 Pockets • Real Ball Physics',
      tag: 'ROYAL VIP',
      tagColor: 'bg-sky-100 text-sky-800 border-sky-200',
      icon: '🎡',
      bgGradient: 'from-sky-50/80 via-white to-white',
      borderColor: 'hover:border-sky-500',
      activePlayers: 326,
      maxWin: '36:1',
      description: 'Place inside and outside bets on the authentic sapphire felt with smooth wheel rotation.',
    },
    {
      id: 'blackjack' as GameType,
      title: 'Blackjack 21',
      subtitle: 'Vegas Rules • 3:2 Payout • Dealer AI',
      tag: 'HIGH ROLLER',
      tagColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      icon: '♠️',
      bgGradient: 'from-indigo-50/80 via-white to-white',
      borderColor: 'hover:border-indigo-500',
      activePlayers: 290,
      maxWin: '3:2 Payout',
      description: 'Test your strategy against the dealer with Hit, Stand, and Double Down on royal felt.',
    },
    {
      id: 'plinko' as GameType,
      title: 'Plinko Galaxy',
      subtitle: 'Bouncing Peg Pyramid • 100x Multipliers',
      tag: 'TRENDING',
      tagColor: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: '⚡',
      bgGradient: 'from-blue-50/80 via-white to-white',
      borderColor: 'hover:border-blue-500',
      activePlayers: 541,
      maxWin: '100x',
      description: 'Drop luminous orbs down the peg pyramid and watch them ricochet into prize buckets.',
    },
    {
      id: 'crash' as GameType,
      title: 'Crash Rocket',
      subtitle: 'Exponential Ascent • Real-time Cashout',
      tag: 'ADRENALINE',
      tagColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      icon: '🚀',
      bgGradient: 'from-cyan-50/80 via-white to-white',
      borderColor: 'hover:border-cyan-500',
      activePlayers: 618,
      maxWin: '250x',
      description: 'Watch the rocket climb into deep space and cash out before it detonates!',
    },
    {
      id: 'mines' as GameType,
      title: 'Diamond Mines',
      subtitle: '5x5 Diamond Grid • Configurable Mines',
      tag: 'STRATEGY',
      tagColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: '💎',
      bgGradient: 'from-emerald-50/80 via-white to-white',
      borderColor: 'hover:border-emerald-500',
      activePlayers: 430,
      maxWin: '1000x+',
      description: 'Uncover glittering sapphire diamonds on the 5x5 grid and cash out before hitting bombs.',
    },
  ];

  return (
    <div id="casino-lobby" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      
      {/* Hero Marquee & Progressive Jackpot in White & Royal Blue */}
      <section className="relative rounded-3xl overflow-hidden border border-blue-200/80 p-6 sm:p-10 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-950 shadow-2xl text-white">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Text */}
          <div className="text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Welcome to Grand Royale VIP Suite</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury text-white tracking-wide leading-tight mb-3">
              The Premier <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-white to-sky-100">
                White & Royal Blue Casino
              </span>
            </h1>

            <p className="text-blue-100/90 text-sm sm:text-base mb-6 leading-relaxed">
              Step into our luxury lounge with 6 premier casino games: Neon Slots, European Roulette, 
              Blackjack 21, Plinko, Crash Rocket, and Diamond Mines with 100% free virtual chips!
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="lobby-play-slots-btn"
                onClick={() => {
                  sound.playChip();
                  onSelectGame('slots');
                }}
                className="px-6 py-3 rounded-xl font-black text-sm tracking-wider uppercase bg-white text-blue-900 hover:bg-blue-50 shadow-lg shadow-black/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Play Neon Slots</span>
                <ArrowRight className="w-4 h-4 text-blue-600" />
              </button>

              <button
                id="lobby-bonus-btn"
                onClick={() => {
                  sound.playChip();
                  setShowBonusWheel(true);
                }}
                className="px-5 py-3 rounded-xl font-bold text-sm bg-blue-700/80 hover:bg-blue-600 text-white border border-blue-400/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <Coins className="w-4 h-4 text-sky-300" />
                <span>Claim Free Bonus</span>
              </button>
            </div>
          </div>

          {/* Right: Royal Blue Progressive Jackpot Box */}
          <div className="w-full lg:w-auto shrink-0 bg-white/10 backdrop-blur-xl border-2 border-sky-300/40 rounded-2xl p-6 shadow-2xl text-center relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-400 text-slate-950 font-black text-[10px] tracking-widest uppercase px-3 py-0.5 rounded-full shadow">
              Progressive Grand Jackpot
            </div>
            
            <div className="mt-2 mb-2 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-yellow-300 animate-bounce" />
              <span className="text-2xl sm:text-4xl font-black font-serif-luxury text-white tracking-wider">
                ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-[11px] text-sky-200 uppercase tracking-widest font-semibold mb-4">
              Play Any Of The 6 Games To Win
            </p>

            <div className="grid grid-cols-2 gap-2 text-left bg-black/25 p-3 rounded-xl border border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-blue-200 uppercase block">Your Balance</span>
                <span className="font-bold text-white">${balance.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-[10px] text-blue-200 uppercase block">VIP Tier</span>
                <span className="font-bold text-sky-300">Sapphire Elite</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Live Winners Ticker */}
      <section className="bg-white border border-blue-100 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 shrink-0 text-blue-700 font-bold uppercase tracking-wider text-[11px]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
          </span>
          <Flame className="w-4 h-4 text-blue-600" />
          <span>Live VIP Wins</span>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto py-1">
          {liveWins.map((win) => (
            <div
              key={win.id}
              className="flex items-center gap-2 bg-blue-50/60 px-3 py-1.5 rounded-xl border border-blue-100 shrink-0 text-[11px]"
            >
              <span className="text-slate-800 font-bold">{win.player}</span>
              <span className="text-slate-500">won</span>
              <span className="text-blue-700 font-bold font-serif-luxury">+${win.amount.toLocaleString()}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200 font-bold">
                {win.multiplier}
              </span>
              <span className="text-slate-500">on {win.game}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Games Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif-luxury text-slate-900">
              Featured 6 Casino Suites
            </h2>
            <p className="text-xs text-slate-500">Choose your game table and place your bets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((g) => (
            <div
              key={g.id}
              id={`game-card-${g.id}`}
              onClick={() => {
                sound.playChip();
                onSelectGame(g.id);
              }}
              className={`group relative rounded-3xl bg-white border-2 border-slate-100 ${g.borderColor} p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-blue-500/10 flex flex-col justify-between`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border ${g.tagColor}`}>
                    {g.tag}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{g.activePlayers} playing</span>
                  </div>
                </div>

                {/* Big Game Icon */}
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {g.icon}
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  {g.title}
                </h3>
                <p className="text-xs text-blue-600 mb-2 font-bold">
                  {g.subtitle}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Max Payout</span>
                  <span className="text-sm font-black text-blue-700 font-serif-luxury">{g.maxWin}</span>
                </div>

                <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-700 group-hover:text-white flex items-center justify-center transition-all shadow-sm">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* Safety & Responsible Play Notice */}
      <footer className="rounded-2xl bg-white border border-blue-100 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 shadow-sm">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0" />
          <div>
            <span className="text-slate-800 font-bold block">100% Free Virtual Play Money</span>
            <span>All games use virtual simulation chips. No real money gambling or purchases required. Enjoy pure entertainment.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-[11px] font-bold text-blue-700">
            RNG Certified 98.4% RTP
          </span>
        </div>
      </footer>

    </div>
  );
};
