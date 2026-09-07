import React, { useState, useEffect } from 'react';
import { GameType } from '../types';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { LiveBetsFeed } from './LiveBetsFeed';
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Coins, 
  ArrowRight, 
  Users, 
  ShieldCheck, 
  Award,
  Lock,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Gift,
  Zap,
  Music
} from 'lucide-react';

interface LobbyProps {
  onSelectGame: (game: GameType) => void;
  onOpenCertificates?: () => void;
  onOpenStore?: () => void;
  onOpenVipClub?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onSelectGame, onOpenCertificates, onOpenStore, onOpenVipClub }) => {
  const {
    balance,
    liveWins,
    setShowBonusWheel,
    vipTier,
    rakebackAvailable,
    claimRakeback,
    faucetCooldown,
    claimFaucet,
    loungeMusicEnabled,
    toggleLoungeMusic,
  } = useCasino();
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
      subtitle: '5-Reel • 20 Paylines • Wild 7s & Diamonds',
      tag: 'PROGRESSIVE JACKPOT',
      tagColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
      icon: '🎰',
      rtp: '98.8% RTP',
      activePlayers: 512,
      maxWin: '500x',
      description: 'Spin gold-encrusted reels with wild 7s, scatter crowns, and free spin multipliers.',
    },
    {
      id: 'roulette' as GameType,
      title: 'European Roulette',
      subtitle: 'Monte Carlo Single Zero • 37 Pockets',
      tag: 'MONTE CARLO VIP',
      tagColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
      icon: '🎡',
      rtp: '97.3% RTP',
      activePlayers: 384,
      maxWin: '36:1',
      description: 'Place inside and outside bets on authentic velvet emerald felt with physics-based ball rotation.',
    },
    {
      id: 'blackjack' as GameType,
      title: 'Blackjack 21',
      subtitle: 'Vegas Strip Rules • 3:2 Payout • Dealer AI',
      tag: 'HIGH ROLLER',
      tagColor: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
      icon: '♠️',
      rtp: '99.5% RTP',
      activePlayers: 340,
      maxWin: '3:2 Payout',
      description: 'Test your optimal strategy against the dealer with Hit, Stand, and Double Down options.',
    },
    {
      id: 'plinko' as GameType,
      title: 'Plinko Galaxy',
      subtitle: '12-Row Peg Pyramid • 100x Multipliers',
      tag: 'TRENDING #1',
      tagColor: 'bg-purple-500/15 text-purple-300 border-purple-500/40',
      icon: '⚡',
      rtp: '99.0% RTP',
      activePlayers: 628,
      maxWin: '100x',
      description: 'Drop luminous golden chips down the peg pyramid and watch them ricochet into high-multiplier buckets.',
    },
    {
      id: 'crash' as GameType,
      title: 'Crash Rocket',
      subtitle: 'Exponential Ascent • Real-time Cashout',
      tag: 'ADRENALINE',
      tagColor: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
      icon: '🚀',
      rtp: '98.5% RTP',
      activePlayers: 742,
      maxWin: '250x+',
      description: 'Watch the gold-tipped rocket soar through deep space and cash out your multiplier before explosion!',
    },
    {
      id: 'mines' as GameType,
      title: 'Diamond Mines',
      subtitle: '5x5 Diamond Grid • Configurable Bombs',
      tag: 'STRATEGY',
      tagColor: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40',
      icon: '💎',
      rtp: '99.2% RTP',
      activePlayers: 495,
      maxWin: '1,000x+',
      description: 'Uncover sparkling emerald diamonds on the 5x5 grid and bank your accumulated profit before detonating.',
    },
  ];

  return (
    <div id="casino-lobby" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* Official Trust & Regulatory Certification Ribbon */}
      <section className="bg-gradient-to-r from-[#141926] via-[#10141f] to-[#141926] border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-300">
          
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-[11px] block">Curacao eGaming</span>
              <span className="text-[10px] text-amber-400 font-mono">License #8048/JAZ</span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-[11px] block">eCOGRA Certified RNG</span>
              <span className="text-[10px] text-emerald-400 font-bold">98.8% Verified RTP</span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-[11px] block">256-Bit SSL Cloudflare</span>
              <span className="text-[10px] text-slate-400">Provably Fair SHA-256</span>
            </div>
          </div>

        </div>

        {/* Action Button to inspect official certificates */}
        <button
          onClick={() => {
            sound.playChip();
            if (onOpenCertificates) onOpenCertificates();
          }}
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <FileCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>Verify Official Certificates & RNG</span>
        </button>
      </section>

      {/* Hero Marquee & Progressive Jackpot in 24K Champagne Gold & Obsidian */}
      <section className="relative rounded-3xl overflow-hidden border-2 border-amber-500/30 p-6 sm:p-10 bg-gradient-to-br from-[#161c2b] via-[#0f131d] to-[#0a0d14] shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-white">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-yellow-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Welcome & CTAs */}
          <div className="text-center lg:text-left max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>International High-Roller VIP Lounge</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury text-white tracking-wide leading-tight mb-3">
              The #1 Rated Virtual{' '}
              <span className="gold-gradient-text block sm:inline">
                Luxury Casino
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
              Experience the pinnacle of virtual gaming. Enjoy 6 certified games—Neon Slots, 
              European Roulette, Blackjack 21, Plinko, Crash Rocket, and Diamond Mines—with 
              complimentary virtual chips and realistic sound.
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="hero-play-btn"
                onClick={() => {
                  sound.playChip();
                  onSelectGame('slots');
                }}
                className="px-6 py-3.5 rounded-xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Play Neon Slots</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>

              <button
                id="hero-buy-chips-btn"
                onClick={() => {
                  sound.playChip();
                  if (onOpenStore) onOpenStore();
                }}
                className="px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 shadow-lg shadow-emerald-950/40 border border-emerald-400/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <Coins className="w-4 h-4 text-yellow-300" />
                <span>Buy Chips (Cashier)</span>
              </button>

              <button
                id="hero-bonus-btn"
                onClick={() => {
                  sound.playChip();
                  setShowBonusWheel(true);
                }}
                className="px-5 py-3.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all active:scale-95"
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span>Spin Bonus Wheel</span>
              </button>

              <button
                onClick={() => {
                  sound.playChip();
                  if (onOpenCertificates) onOpenCertificates();
                }}
                className="px-4 py-3.5 rounded-xl font-bold text-xs text-amber-300 hover:text-amber-200 bg-amber-950/30 hover:bg-amber-900/40 border border-amber-500/30 flex items-center gap-1.5 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Provably Fair</span>
              </button>
            </div>
          </div>

          {/* Right Column: Progressive Grand Jackpot Box */}
          <div className="w-full lg:w-auto shrink-0 bg-[#121622]/90 backdrop-blur-xl border-2 border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl text-center relative max-w-sm">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] tracking-widest uppercase px-4 py-1 rounded-full shadow-md">
              Progressive Grand Jackpot
            </div>
            
            <div className="my-3 flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-amber-400 animate-bounce" />
              <span className="text-2xl sm:text-4xl font-black font-serif-luxury text-amber-300 tracking-wider drop-shadow-[0_2px_12px_rgba(245,197,66,0.3)]">
                ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <p className="text-[11px] text-amber-400/80 uppercase tracking-widest font-bold mb-4">
              Triggerable Across All 6 VIP Games
            </p>

            <div className="grid grid-cols-2 gap-2.5 text-left bg-slate-950/70 p-3 rounded-2xl border border-slate-800 text-xs">
              <button
                onClick={() => {
                  sound.playChip();
                  if (onOpenStore) onOpenStore();
                }}
                className="text-left group cursor-pointer"
                title="Click to view Cashier Store & Buy Chips"
              >
                <span className="text-[10px] text-slate-400 uppercase block font-semibold group-hover:text-amber-300 transition-colors">Your Balance ↗</span>
                <span className="font-black text-amber-400 font-serif-luxury text-sm group-hover:text-amber-300">${balance.toLocaleString()}</span>
              </button>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">VIP Status</span>
                <button
                  onClick={() => {
                    sound.playChip();
                    if (onOpenVipClub) onOpenVipClub();
                  }}
                  className="font-black text-amber-300 flex items-center gap-1 text-xs hover:underline"
                >
                  <span>{vipTier.icon}</span>
                  <span>{vipTier.tier} VIP</span>
                </button>
              </div>
            </div>

            {/* Quick Rakeback / Free Faucet in Jackpot Box */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  sound.playChip();
                  if (onOpenVipClub) onOpenVipClub();
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rakeback: ${rakebackAvailable.toFixed(1)}</span>
              </button>

              <button
                onClick={claimFaucet}
                disabled={faucetCooldown > 0}
                className="py-1.5 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-50 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1 transition-all"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{faucetCooldown > 0 ? `${Math.floor(faucetCooldown / 60)}m` : 'Free +1k'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Live VIP Winners Ticker */}
      <section className="bg-[#0f131d] border border-amber-500/20 rounded-2xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs overflow-hidden shadow-lg">
        <div className="flex items-center gap-2 shrink-0 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Live High-Roller Wins</span>
        </div>

        {/* Scrolling list */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full py-1">
          {liveWins.map((win) => (
            <div
              key={win.id}
              className="flex items-center gap-2 bg-[#141824] px-3 py-1.5 rounded-xl border border-slate-800/80 shrink-0 text-[11px]"
            >
              <span className="text-slate-200 font-bold">{win.player}</span>
              <span className="text-slate-500">won</span>
              <span className="text-emerald-400 font-black font-serif-luxury">+${win.amount.toLocaleString()}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                {win.multiplier}
              </span>
              <span className="text-slate-400">on {win.game}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Luxury Games Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-white">
                Official Casino Suites
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/15 text-amber-300 border border-amber-500/30">
                6 Verified Tables
              </span>
            </div>
            <p className="text-xs text-slate-400">Select any suite to place your virtual bets with certified fair RNG</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {games.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                sound.playChip();
                onSelectGame(g.id);
              }}
              className="group relative rounded-3xl bg-gradient-to-b from-[#141926] to-[#0c1018] border border-amber-500/20 hover:border-amber-500/60 p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-500/15 flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Active Players */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${g.tagColor}`}>
                    {g.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{g.activePlayers} VIPs</span>
                  </div>
                </div>

                {/* Big Game Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/15 to-yellow-500/5 border border-amber-500/30 flex items-center justify-center text-3xl mb-4 group-hover:scale-105 transition-transform">
                  <span>{g.icon}</span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors font-serif-luxury">
                  {g.title}
                </h3>
                <p className="text-xs text-amber-400/90 mb-2 font-bold">
                  {g.subtitle}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Bottom Card Footer with RTP & Max Multiplier */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Max Win • {g.rtp}</span>
                  <span className="text-sm font-black text-amber-300 font-serif-luxury">{g.maxWin}</span>
                </div>

                <div className="w-10 h-10 rounded-xl bg-amber-500/15 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 border border-amber-500/30 flex items-center justify-center transition-all shadow-md">
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Bets Feed Component */}
      <section className="space-y-2">
        <LiveBetsFeed />
      </section>

      {/* Safety, Regulatory & Responsible Play Notice */}
      <footer className="rounded-2xl bg-[#0f131d] border border-amber-500/20 p-5 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 shadow-xl">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
          <div>
            <span className="text-white font-bold block text-sm">Official Certified Virtual Casino Simulation</span>
            <span>All games operate using certified random seeds and virtual simulation chips. No real money gambling. Entertainment purposes only.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              sound.playChip();
              if (onOpenCertificates) onOpenCertificates();
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition-colors"
          >
            Licensing Details & Certificates
          </button>
        </div>
      </footer>

    </div>
  );
};
