import React, { useState, useEffect } from 'react';
import { GameType } from '../types';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { LiveBetsFeed } from './LiveBetsFeed';
import { CasinoGameArt } from './CasinoGameArt';
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
  Music,
  Volume2,
  VolumeX,
  Play,
  Search,
  Check,
  Trophy,
  ChevronRight
} from 'lucide-react';

interface LobbyProps {
  onSelectGame: (game: GameType) => void;
  onOpenCertificates?: () => void;
  onOpenStore?: () => void;
  onOpenVipClub?: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ 
  onSelectGame, 
  onOpenCertificates, 
  onOpenStore, 
  onOpenVipClub 
}) => {
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
    modifyBalance,
  } = useCasino();

  const [jackpot, setJackpot] = useState(2489240.50);
  const [activeCategory, setActiveCategory] = useState<'all' | 'slots' | 'table' | 'instant' | 'vip'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSlide, setActiveSlide] = useState(0);
  const [claimedQuests, setClaimedQuests] = useState<Record<string, boolean>>({});
  const [questNotification, setQuestNotification] = useState<string | null>(null);

  // Progressive jackpot ticker that gently increments
  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot((prev) => prev + (Math.random() * 3.5 + 1.2));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  // Auto-cycle hero banner carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Claim Daily Quest Reward
  const handleClaimQuest = (questId: string, rewardAmount: number, title: string) => {
    if (claimedQuests[questId]) return;
    sound.playWin();
    modifyBalance(rewardAmount, `Quest: ${title}`, 0);
    setClaimedQuests((prev) => ({ ...prev, [questId]: true }));
    setQuestNotification(`+${rewardAmount.toLocaleString()} Virtual Chips Claimed for "${title}"!`);
    setTimeout(() => setQuestNotification(null), 3500);
  };

  const games = [
    {
      id: 'slots' as GameType,
      title: 'Neon Vegas Slots',
      subtitle: '5-Reel • 20 Paylines • Wild 7s & Diamonds',
      tag: 'MEGA JACKPOT',
      category: 'slots',
      tagColor: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      rtp: '98.8% RTP',
      activePlayers: 1248,
      maxWin: '500x Max',
      recentWin: '$34,500 (82x)',
      description: 'Experience genuine Vegas thrills with triple gold reels, flaming wild 7s, free spins, and the Grand Progressive Jackpot!',
    },
    {
      id: 'roulette' as GameType,
      title: 'Monte Carlo Roulette',
      subtitle: 'European Single Zero • 37 Pockets',
      tag: 'MONTE CARLO VIP',
      category: 'table',
      tagColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
      rtp: '97.3% RTP',
      activePlayers: 842,
      maxWin: '36:1 Payout',
      recentWin: '$72,000 (36:1)',
      description: 'Spin on genuine velvet emerald green felt with physics-based ivory ball momentum, racetrack bets, and instant live odds.',
    },
    {
      id: 'blackjack' as GameType,
      title: 'Vegas Blackjack 21',
      subtitle: 'Vegas Strip Rules • 3:2 Payout • Dealer AI',
      tag: 'HIGH ROLLER',
      category: 'table',
      tagColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      rtp: '99.5% RTP',
      activePlayers: 964,
      maxWin: '3:2 Blackjack',
      recentWin: '$15,000 (Blackjack)',
      description: 'Test your optimal mathematical strategy against the dealer with authentic Hit, Stand, Double Down, and Split actions.',
    },
    {
      id: 'plinko' as GameType,
      title: 'Plinko Galaxy',
      subtitle: '12-Row Peg Pyramid • 100x Multipliers',
      tag: 'TRENDING #1',
      category: 'instant',
      tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
      rtp: '99.0% RTP',
      activePlayers: 1420,
      maxWin: '100x Multiplier',
      recentWin: '$48,000 (100x)',
      description: 'Drop luminous golden chips down the cosmic peg pyramid and watch them ricochet dynamically into high-payout buckets.',
    },
    {
      id: 'crash' as GameType,
      title: 'Crash Rocket',
      subtitle: 'Exponential Ascent • Real-time Cashout',
      tag: 'ADRENALINE',
      category: 'instant',
      tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/50',
      rtp: '98.5% RTP',
      activePlayers: 1890,
      maxWin: '250x+ Climb',
      recentWin: '$94,200 (142.5x)',
      description: 'Watch the gold-tipped rocket soar into outer space. Cash out your multiplying chips before the sudden explosive crash!',
    },
    {
      id: 'mines' as GameType,
      title: 'Diamond Mines',
      subtitle: '5x5 Diamond Grid • Configurable Bombs',
      tag: 'TACTICAL VIP',
      category: 'instant',
      tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50',
      rtp: '99.2% RTP',
      activePlayers: 1115,
      maxWin: '1,000x Max',
      recentWin: '$52,500 (84x)',
      description: 'Uncover radiant emerald cut diamonds on the 5x5 minefield. Bank your accumulating multiplier before striking dynamite!',
    },
  ];

  // Filter games by category & search query
  const filteredGames = games.filter((g) => {
    const matchesCategory = 
      activeCategory === 'all' ? true :
      activeCategory === 'slots' ? g.category === 'slots' :
      activeCategory === 'table' ? g.category === 'table' :
      activeCategory === 'instant' ? g.category === 'instant' :
      activeCategory === 'vip' ? (g.id === 'blackjack' || g.id === 'roulette' || g.id === 'slots') : true;

    const matchesSearch = 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const quests = [
    {
      id: 'quest-wheel',
      title: 'Spin the Lucky Wheel',
      desc: 'Take your complimentary daily spin on the 24K wheel',
      reward: 1000,
      icon: <Gift className="w-4 h-4 text-amber-400" />,
      actionLabel: 'Spin Wheel',
      onAction: () => {
        sound.playChip();
        setShowBonusWheel(true);
      },
    },
    {
      id: 'quest-slots',
      title: 'Hit 7s on Vegas Slots',
      desc: 'Play 5 rounds on the high-yield 20-payline slot machine',
      reward: 1500,
      icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
      actionLabel: 'Play Slots',
      onAction: () => {
        sound.playChip();
        onSelectGame('slots');
      },
    },
    {
      id: 'quest-blackjack',
      title: 'VIP 21 Table Challenge',
      desc: 'Place bets on European Blackjack with optimal strategy',
      reward: 2000,
      icon: <Crown className="w-4 h-4 text-emerald-400" />,
      actionLabel: 'Play 21',
      onAction: () => {
        sound.playChip();
        onSelectGame('blackjack');
      },
    },
    {
      id: 'quest-crash',
      title: 'Reach 2.0x in Crash',
      desc: 'Cash out at or above 2.0x on the soaring rocket',
      reward: 2500,
      icon: <Zap className="w-4 h-4 text-rose-400" />,
      actionLabel: 'Play Crash',
      onAction: () => {
        sound.playChip();
        onSelectGame('crash');
      },
    },
  ];

  return (
    <div id="casino-lobby" className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      
      {/* Toast Notification for Quests */}
      {questNotification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-4 py-3 rounded-2xl font-black text-sm shadow-2xl border-2 border-white flex items-center gap-3 animate-bounce">
          <Coins className="w-5 h-5 text-slate-950" />
          <span>{questNotification}</span>
        </div>
      )}

      {/* Vegas Strip Marquee Light Bulbs Header */}
      <div className="w-full bg-slate-950/80 border-y border-amber-500/30 py-1.5 px-4 flex items-center justify-between text-[11px] font-bold text-amber-300">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
            <span className="w-2 h-2 rounded-full bg-yellow-200 animate-marquee-2" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
            <span className="w-2 h-2 rounded-full bg-yellow-200 animate-marquee-2" />
          </div>
          <span className="uppercase tracking-widest text-[10px] font-black text-amber-400">
            ★ LAS VEGAS VIP SALON PRIVÉ ★
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-block text-slate-400">Live Table RTP: <strong className="text-emerald-400">98.8%</strong></span>
          <span className="text-slate-400">Players Online: <strong className="text-amber-300">6,479 Active</strong></span>
          <div className="flex gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-200 animate-marquee-2" />
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
          </div>
        </div>
      </div>

      {/* Live High-Roller Recent Wins Marquee Ticker */}
      <section className="bg-gradient-to-r from-[#0d1017] via-[#121622] to-[#0d1017] border border-amber-500/25 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3 text-xs overflow-hidden shadow-xl">
        <div className="flex items-center gap-2 shrink-0 bg-amber-500/15 border border-amber-500/40 px-3 py-1 rounded-xl text-amber-300 font-black tracking-wider text-[11px] uppercase">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          <span className="hidden sm:inline">Recent High Wins</span>
          <span className="sm:hidden">Wins</span>
        </div>

        {/* Scrolling list */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full py-0.5">
          {liveWins.map((win) => (
            <div
              key={win.id}
              className="flex items-center gap-2 bg-[#161c2b] px-3 py-1 rounded-xl border border-amber-500/20 shrink-0 text-[11px] shadow-sm"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-white font-bold">{win.player}</span>
              <span className="text-slate-400">won</span>
              <span className="text-emerald-400 font-black font-serif-luxury">+${win.amount.toLocaleString()}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                {win.multiplier}
              </span>
              <span className="text-slate-400 text-[10px]">on {win.game}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Hero Marquee & Progressive Grand Jackpot Section */}
      <section className="relative rounded-3xl overflow-hidden border-2 border-amber-500/40 p-6 sm:p-8 md:p-10 bg-gradient-to-br from-[#181f30] via-[#0f1420] to-[#0a0d14] shadow-[0_25px_60px_rgba(0,0,0,0.85)] text-white">
        
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[350px] h-[350px] bg-yellow-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[250px] h-[250px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left Column: Interactive Promo Showcase Slider */}
          <div className="text-center lg:text-left max-w-xl w-full">
            
            {/* Promo Selector Tabs */}
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              {[0, 1, 2].map((idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    sound.playChip();
                    setActiveSlide(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx 
                      ? 'w-8 bg-gradient-to-r from-amber-400 to-yellow-300 shadow-sm' 
                      : 'w-2 bg-slate-700 hover:bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Slide 0: High Roller Welcome Package */}
            {activeSlide === 0 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider shadow-inner">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span>+$500 Welcome Bonus Chips</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury text-white tracking-wide leading-tight">
                  Welcome to{' '}
                  <span className="gold-gradient-text block sm:inline">
                    Grand Royale
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  The ultimate Las Vegas & Monte Carlo high-roller experience. Every new client starts with 500 complimentary welcome chips. Spin the daily wheel once every 24 hours.
                </p>
              </div>
            )}

            {/* Slide 1: Weekly $50,000 Grand Royale Cup Tournament */}
            {activeSlide === 1 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 text-xs font-black uppercase tracking-wider shadow-inner">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>$50,000 Grand Royale Cup</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury text-white tracking-wide leading-tight">
                  Climb The{' '}
                  <span className="text-yellow-300 block sm:inline">
                    VIP Leaderboard
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Weekly tournament active right now! Top 10 high-rollers share the $50,000 prize pool. Current leader: <strong className="text-amber-300">KingVegas ($384k)</strong>.
                </p>
              </div>
            )}

            {/* Slide 2: High Roller VIP Club & Rakeback */}
            {activeSlide === 2 && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-black uppercase tracking-wider shadow-inner">
                  <Crown className="w-3.5 h-3.5 text-emerald-400" />
                  <span>25% Instant VIP Rakeback</span>
                </div>

                <h1 className="text-3xl sm:text-5xl font-black font-serif-luxury text-white tracking-wide leading-tight">
                  Elite High Roller{' '}
                  <span className="text-emerald-400 block sm:inline">
                    Privileges
                  </span>
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  Earn continuous rakeback on every single spin and hand. Level up your VIP tier for private concierge gifts and bonus multipliers.
                </p>
              </div>
            )}

            {/* CTAs Bar */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="hero-play-btn"
                onClick={() => {
                  sound.playChip();
                  onSelectGame('slots');
                }}
                className="px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm tracking-wider uppercase bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-xl shadow-amber-500/30 flex items-center gap-2 transition-all active:scale-95 shimmer-sweep"
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
                className="px-5 py-3.5 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:brightness-110 shadow-lg shadow-emerald-950/40 border border-emerald-400/50 flex items-center gap-2 transition-all active:scale-95"
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
                className="px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 flex items-center gap-2 transition-all active:scale-95 shadow-md"
              >
                <Gift className="w-4 h-4 text-amber-400" />
                <span>Spin Bonus Wheel</span>
              </button>
            </div>
          </div>

          {/* Right Column: Progressive Grand Jackpot Marquee Box */}
          <div className="w-full lg:w-auto shrink-0 bg-gradient-to-b from-[#141926] via-[#0d1017] to-[#07090f] border-2 border-amber-400/50 rounded-3xl p-6 sm:p-7 shadow-[0_15px_45px_rgba(245,197,66,0.15)] text-center relative max-w-sm neon-gold-box">
            
            {/* Top Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 text-slate-950 font-black text-[10px] tracking-widest uppercase px-4 py-1 rounded-full shadow-lg border border-amber-200">
              ★ MEGA GRAND JACKPOT ★
            </div>
            
            {/* Pulsing Light Bulbs Ring */}
            <div className="flex items-center justify-center gap-1.5 my-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
              <span className="w-2 h-2 rounded-full bg-yellow-200 animate-marquee-2" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
              <span className="w-2 h-2 rounded-full bg-yellow-200 animate-marquee-2" />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-marquee-1" />
            </div>

            {/* Jackpot Ticker */}
            <div className="my-2 flex items-center justify-center gap-2">
              <Crown className="w-7 h-7 text-amber-400 animate-bounce" />
              <span className="text-3xl sm:text-4xl font-black font-serif-luxury text-amber-300 tracking-wider drop-shadow-[0_2px_18px_rgba(245,197,66,0.5)]">
                ${jackpot.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            
            <p className="text-[11px] text-amber-400/90 uppercase tracking-widest font-black mb-3">
              TRIGGERABLE ON ANY GAME • ANY BET
            </p>

            {/* Jackpot Hot Meter */}
            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 mb-3 text-left">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-bold">
                <span>Jackpot Drop Probability</span>
                <span className="text-amber-400">96.8% HIGH</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 w-[96.8%] rounded-full animate-pulse" />
              </div>
            </div>

            {/* Balance & VIP Status Mini-Dashboard */}
            <div className="grid grid-cols-2 gap-2 text-left bg-slate-950/90 p-3 rounded-2xl border border-slate-800 text-xs">
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
                <span className="text-[10px] text-slate-400 uppercase block font-semibold">VIP Level</span>
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

            {/* Quick Faucet & Rakeback Buttons */}
            <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  sound.playChip();
                  if (onOpenVipClub) onOpenVipClub();
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-[10px] font-bold text-amber-300 flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Rakeback: ${rakebackAvailable.toFixed(1)}</span>
              </button>

              <button
                onClick={claimFaucet}
                disabled={faucetCooldown > 0}
                className="py-1.5 px-2.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 disabled:opacity-50 border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1 transition-all shadow-sm"
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span>{faucetCooldown > 0 ? `${Math.floor(faucetCooldown / 60)}m` : 'Free +1k'}</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Casino Floor Lounge Atmosphere Audio Bar */}
      <section className="rounded-2xl bg-gradient-to-r from-[#111624] via-[#0d1018] to-[#111624] border border-amber-500/30 p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-white text-xs sm:text-sm font-serif-luxury">
                Casino Floor Lounge Audio
              </span>
              {loungeMusicEnabled && (
                <div className="flex items-center gap-0.5 text-amber-400 text-xs">
                  <span className="inline-block w-1 h-3 bg-amber-400 animate-pulse" />
                  <span className="inline-block w-1 h-4 bg-amber-300 animate-bounce" />
                  <span className="inline-block w-1 h-2 bg-yellow-400 animate-pulse" />
                  <span className="inline-block w-1 h-5 bg-amber-400 animate-bounce" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Immerse yourself in authentic Monte Carlo jazz chords & velvet piano ambiance
            </p>
          </div>
        </div>

        <button
          onClick={toggleLoungeMusic}
          className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
            loungeMusicEnabled 
              ? 'bg-amber-500 text-slate-950 shadow-amber-500/20' 
              : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {loungeMusicEnabled ? (
            <>
              <Volume2 className="w-4 h-4" />
              <span>Lounge Beats Playing</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Turn On Casino Music</span>
            </>
          )}
        </button>
      </section>

      {/* Daily Casino Quests (Interactive Chip Earning) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-serif-luxury text-white">
                Daily Casino Missions
              </h2>
              <p className="text-[11px] text-slate-400">Complete challenges to claim complimentary chips instantly</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {quests.map((q) => {
            const isClaimed = claimedQuests[q.id];
            return (
              <div 
                key={q.id}
                className="bg-[#101420] border border-amber-500/20 hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        {q.icon}
                      </div>
                      <span className="font-black text-white text-xs font-serif-luxury">{q.title}</span>
                    </div>
                    <span className="text-[10px] font-black text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      +${q.reward.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-3">{q.desc}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={q.onAction}
                    className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>{q.actionLabel}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleClaimQuest(q.id, q.reward, q.title)}
                    disabled={isClaimed}
                    className={`py-1.5 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-1 transition-all ${
                      isClaimed 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                        : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-3 h-3" />
                        <span>Claim</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Casino Games Catalog Grid & Category Tabs */}
      <section className="space-y-4">
        
        {/* Navigation / Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury text-white">
                Official Casino Suites
              </h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                6 Verified Tables
              </span>
            </div>
            <p className="text-xs text-slate-400">Select any VIP suite to enter the real-time gaming floor</p>
          </div>

          {/* Search & Category Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search games..."
                className="w-full bg-[#121622] border border-slate-800 focus:border-amber-500/60 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            {/* Category Selectors */}
            <div className="flex items-center gap-1 bg-[#101420] p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
              <button
                onClick={() => { sound.playChip(); setActiveCategory('all'); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'all'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Games (6)
              </button>

              <button
                onClick={() => { sound.playChip(); setActiveCategory('slots'); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'slots'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎰 Slots
              </button>

              <button
                onClick={() => { sound.playChip(); setActiveCategory('table'); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'table'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎡 Table Games
              </button>

              <button
                onClick={() => { sound.playChip(); setActiveCategory('instant'); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'instant'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⚡ Instant & Crash
              </button>

              <button
                onClick={() => { sound.playChip(); setActiveCategory('vip'); }}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  activeCategory === 'vip'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                👑 VIP Lounge
              </button>
            </div>
          </div>
        </div>

        {/* 6 Luxury Game Cards with Vivid Casino Artwork */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredGames.map((g) => (
            <div
              key={g.id}
              onClick={() => {
                sound.playChip();
                onSelectGame(g.id);
              }}
              className="group relative rounded-3xl bg-gradient-to-b from-[#141926] to-[#0c1018] border border-amber-500/25 hover:border-amber-400/80 p-5 sm:p-6 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(245,197,66,0.18)] flex flex-col justify-between"
            >
              <div>
                {/* Header Tag & Active Players */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider border ${g.tagColor}`}>
                    {g.tag}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{g.activePlayers} VIPs Playing</span>
                  </div>
                </div>

                {/* Stunning Casino Artwork Preview */}
                <div className="mb-4 group-hover:scale-[1.02] transition-transform duration-300">
                  <CasinoGameArt gameId={g.id} className="w-full h-36 sm:h-40 shadow-xl" />
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors font-serif-luxury mb-1">
                  {g.title}
                </h3>
                <p className="text-xs text-amber-400/90 mb-2 font-bold">
                  {g.subtitle}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {/* Bottom Card Footer with RTP, Recent Win & Action Button */}
              <div className="pt-3 border-t border-slate-800/90 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase font-semibold">
                    <span>{g.rtp}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{g.maxWin}</span>
                  </div>
                  <span className="text-[11px] font-bold text-amber-300/90">
                    Recent Win: {g.recentWin}
                  </span>
                </div>

                {/* Play Now Glowing Button */}
                <div className="px-3.5 py-2 rounded-xl bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 border border-amber-500/40 font-black text-xs flex items-center gap-1.5 transition-all shadow-md group-hover:shadow-amber-500/30">
                  <span>PLAY</span>
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
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

      {/* Official Trust & Regulatory Certification Ribbon */}
      <section className="bg-gradient-to-r from-[#141926] via-[#10141f] to-[#141926] border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-300">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-[11px] block">Curacao eGaming</span>
              <span className="text-[10px] text-amber-400 font-mono">License #8048/JAZ</span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-black text-white text-[11px] block">eCOGRA Certified RNG</span>
              <span className="text-[10px] text-emerald-400 font-bold">98.8% Verified RTP</span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/40 flex items-center justify-center text-blue-400">
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
          className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 hover:text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <FileCheck className="w-4 h-4 text-amber-400" />
          <span>Verify Official Certificates & RNG</span>
        </button>
      </section>

      {/* Safety, Regulatory & Responsible Play Footer */}
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
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition-colors"
          >
            Licensing Details & Certificates
          </button>
        </div>
      </footer>

    </div>
  );
};
