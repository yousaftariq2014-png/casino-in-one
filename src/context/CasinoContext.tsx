import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PlayerStats, LiveWinFeedItem, GameLogEntry, DepositOrder, HouseRtpPreset, GameType, LiveCasinoBet, BigWinData, VipTierInfo } from '../types';
import { sound } from '../utils/audio';
import { INITIAL_GAME_LOGS, INITIAL_DEPOSIT_ORDERS } from '../data/initialTelemetry';

interface RecordGameRoundParams {
  game: GameType;
  gameName: string;
  bet: number;
  payout: number;
  multiplier?: number;
  outcome?: 'win' | 'loss' | 'push';
  details?: string;
  player?: string;
}

export const VIP_TIERS: VipTierInfo[] = [
  { tier: 'Bronze', icon: '🥉', minWager: 0, color: 'text-amber-600 border-amber-600/40 bg-amber-950/20', perk: '0.5% Daily Rakeback', cashbackPct: 0.005 },
  { tier: 'Silver', icon: '🥈', minWager: 5000, color: 'text-slate-300 border-slate-400/40 bg-slate-800/30', perk: '0.8% Rakeback + Level Up Bonus', cashbackPct: 0.008 },
  { tier: 'Gold', icon: '🥇', minWager: 25000, color: 'text-yellow-400 border-yellow-500/40 bg-yellow-950/20', perk: '1.2% Rakeback + Weekly Reload', cashbackPct: 0.012 },
  { tier: 'Platinum', icon: '💎', minWager: 75000, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/20', perk: '1.6% Rakeback + VIP Host', cashbackPct: 0.016 },
  { tier: 'Diamond', icon: '👑', minWager: 200000, color: 'text-purple-400 border-purple-500/40 bg-purple-950/20', perk: '2.0% Rakeback + Instant Cashouts', cashbackPct: 0.020 },
  { tier: 'Royal Crown', icon: '🌟', minWager: 500000, color: 'text-rose-400 border-rose-500/40 bg-rose-950/20', perk: '2.5% Rakeback + High Roller Pool', cashbackPct: 0.025 },
];

interface CasinoContextType {
  balance: number;
  selectedChip: number;
  setSelectedChip: (chip: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  loungeMusicEnabled: boolean;
  toggleLoungeMusic: () => void;
  stats: PlayerStats;
  modifyBalance: (amount: number, game: string, wager?: number) => boolean;
  claimDailyBonus: (amount: number) => void;
  resetBalance: () => void;
  liveWins: LiveWinFeedItem[];
  showBonusWheel: boolean;
  setShowBonusWheel: (show: boolean) => void;
  showStatsModal: boolean;
  setShowStatsModal: (show: boolean) => void;
  showStoreModal: boolean;
  setShowStoreModal: (show: boolean) => void;
  // VIP & Rewards
  vipTier: VipTierInfo;
  vipProgress: number;
  nextVipTier: VipTierInfo | null;
  rakebackAvailable: number;
  claimRakeback: () => void;
  faucetCooldown: number;
  claimFaucet: () => boolean;
  // Live Streaming Bets Feed
  liveBets: LiveCasinoBet[];
  // Big Win Celebration Screen
  bigWinData: BigWinData | null;
  closeBigWinModal: () => void;
  triggerBigWin: (amount: number, multiplier: number, gameName: string) => void;
  // Admin & Telemetry System
  gameLogs: GameLogEntry[];
  depositOrders: DepositOrder[];
  recordGameRound: (params: RecordGameRoundParams) => void;
  recordDeposit: (order: Omit<DepositOrder, 'id' | 'timestamp' | 'date'>) => void;
  houseRtpPreset: HouseRtpPreset;
  setHouseRtpPreset: (preset: HouseRtpPreset) => void;
  adminCreditChips: (amount: number, reason?: string) => void;
  adminDebitChips: (amount: number, reason?: string) => void;
  clearGameLogs: () => void;
  playerName: string;
  setPlayerName: (name: string) => void;
}

const INITIAL_BALANCE = 500;

const DEFAULT_STATS: PlayerStats = {
  totalWagered: 0,
  totalWon: 0,
  gamesPlayed: 0,
  biggestWin: 0,
  slotsSpins: 0,
  rouletteSpins: 0,
  blackjackHands: 0,
  plinkoDrops: 0,
  crashRounds: 0,
  minesRounds: 0,
};

const INITIAL_LIVE_WINS: LiveWinFeedItem[] = [
  { id: '1', player: 'Alex R.', game: 'Neon Slots', amount: 4800, multiplier: '24x', timeAgo: 'just now' },
  { id: '2', player: 'Sophia K.', game: 'Roulette', amount: 3600, multiplier: '35x', timeAgo: '1m ago' },
  { id: '3', player: 'Tariq M.', game: 'Blackjack', amount: 1500, multiplier: '2.5x', timeAgo: '2m ago' },
  { id: '4', player: 'Zaid A.', game: 'Crash Rocket', amount: 8400, multiplier: '14.2x', timeAgo: '3m ago' },
  { id: '5', player: 'Elena B.', game: 'Diamond Mines', amount: 12500, multiplier: '25x', timeAgo: '4m ago' },
  { id: '6', player: 'Kenji S.', game: 'Plinko Galaxy', amount: 10000, multiplier: '100x', timeAgo: '5m ago' },
];

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

export const CasinoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('royal_casino_balance');
    if (!saved) return INITIAL_BALANCE;
    const parsed = parseInt(saved, 10);
    // If a fresh account still had the old default of 5000, enforce new client 500 chips policy
    const statsSaved = localStorage.getItem('royal_casino_stats');
    if (parsed === 5000 && (!statsSaved || JSON.parse(statsSaved).totalWagered === 0)) {
      return INITIAL_BALANCE;
    }
    return Math.max(0, parsed);
  });

  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem('royal_casino_player_name') || 'VIP Guest #8821';
  });

  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [showBonusWheel, setShowBonusWheel] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showStoreModal, setShowStoreModal] = useState<boolean>(false);

  // House RTP Rigging & Preset
  const [houseRtpPreset, setHouseRtpPresetState] = useState<HouseRtpPreset>(() => {
    return (localStorage.getItem('royal_casino_rtp_preset') as HouseRtpPreset) || 'standard';
  });

  // Persistent Game Telemetry Logs for Owner
  const [gameLogs, setGameLogs] = useState<GameLogEntry[]>(() => {
    const saved = localStorage.getItem('royal_casino_game_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_GAME_LOGS;
      }
    }
    return INITIAL_GAME_LOGS;
  });

  // Persistent Real Money Deposit Ledger
  const [depositOrders, setDepositOrders] = useState<DepositOrder[]>(() => {
    const saved = localStorage.getItem('royal_casino_deposit_orders');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_DEPOSIT_ORDERS;
      }
    }
    return INITIAL_DEPOSIT_ORDERS;
  });

  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('royal_casino_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [liveWins, setLiveWins] = useState<LiveWinFeedItem[]>(INITIAL_LIVE_WINS);

  const [loungeMusicEnabled, setLoungeMusicEnabled] = useState<boolean>(false);
  const [rakebackAvailable, setRakebackAvailable] = useState<number>(() => {
    const saved = localStorage.getItem('royal_casino_rakeback');
    return saved ? parseFloat(saved) : 45.50;
  });
  const [faucetCooldown, setFaucetCooldown] = useState<number>(0);
  const [bigWinData, setBigWinData] = useState<BigWinData | null>(null);

  // Initial simulated live casino bets feed
  const [liveBets, setLiveBets] = useState<LiveCasinoBet[]>([
    { id: 'b1', player: 'CryptoKing', game: 'crash', gameName: 'Crash Rocket', bet: 250, multiplier: 14.8, payout: 3700, time: '1s ago', isHighRoller: true },
    { id: 'b2', player: 'VegasWhale', game: 'blackjack', gameName: 'Royal Blackjack', bet: 1000, multiplier: 2.5, payout: 2500, time: '3s ago', isHighRoller: true },
    { id: 'b3', player: 'Sultana_VIP', game: 'slots', gameName: 'Neon Slots', bet: 50, multiplier: 32.0, payout: 1600, time: '5s ago' },
    { id: 'b4', player: 'LuckySpin99', game: 'roulette', gameName: 'European Roulette', bet: 100, multiplier: 36.0, payout: 3600, time: '8s ago', isHighRoller: true },
    { id: 'b5', player: 'DiamondHands', game: 'mines', gameName: 'Diamond Mines', bet: 300, multiplier: 6.4, payout: 1920, time: '11s ago' },
    { id: 'b6', player: 'NeonAce', game: 'plinko', gameName: 'Plinko Galaxy', bet: 75, multiplier: 29.0, payout: 2175, time: '14s ago' },
  ]);

  // Compute VIP Tier from total wagered
  const totalWagered = stats.totalWagered;
  let currentVipIdx = 0;
  for (let i = VIP_TIERS.length - 1; i >= 0; i--) {
    if (totalWagered >= VIP_TIERS[i].minWager) {
      currentVipIdx = i;
      break;
    }
  }
  const vipTier = VIP_TIERS[currentVipIdx];
  const nextVipTier = currentVipIdx < VIP_TIERS.length - 1 ? VIP_TIERS[currentVipIdx + 1] : null;
  const prevMin = vipTier.minWager;
  const nextMin = nextVipTier ? nextVipTier.minWager : prevMin * 1.5;
  const vipProgress = nextVipTier 
    ? Math.min(100, Math.max(0, Math.round(((totalWagered - prevMin) / (nextMin - prevMin)) * 100)))
    : 100;

  // Toggle ambient casino lounge music
  const toggleLoungeMusic = useCallback(() => {
    const isNowPlaying = sound.toggleLoungeMusic();
    setLoungeMusicEnabled(isNowPlaying);
  }, []);

  // Trigger Big Win Celebration overlay
  const triggerBigWin = useCallback((amount: number, multiplier: number, gameName: string) => {
    let tier: 'big' | 'mega' | 'epic' | 'jackpot' = 'big';
    if (multiplier >= 100 || amount >= 10000) tier = 'jackpot';
    else if (multiplier >= 50 || amount >= 5000) tier = 'epic';
    else if (multiplier >= 20 || amount >= 2500) tier = 'mega';
    else tier = 'big';

    setBigWinData({ amount, multiplier, gameName, tier });
    sound.playBigWin();
  }, []);

  const closeBigWinModal = useCallback(() => {
    setBigWinData(null);
  }, []);

  // Claim accumulated Rakeback
  const claimRakeback = useCallback(() => {
    if (rakebackAvailable <= 0) return;
    const rounded = Math.floor(rakebackAvailable);
    if (rounded <= 0) return;
    setBalance((prev) => prev + rounded);
    setRakebackAvailable((prev) => Math.max(0, prev - rounded));
    localStorage.setItem('royal_casino_rakeback', '0');
    sound.playWin();
  }, [rakebackAvailable]);

  // Faucet timer
  useEffect(() => {
    if (faucetCooldown <= 0) return;
    const t = setInterval(() => {
      setFaucetCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [faucetCooldown]);

  const claimFaucet = useCallback((): boolean => {
    if (faucetCooldown > 0) return false;
    const FAUCET_AMOUNT = 1000;
    setBalance((prev) => prev + FAUCET_AMOUNT);
    setFaucetCooldown(300); // 5 minute reload timer
    sound.playBigWin();
    return true;
  }, [faucetCooldown]);

  // Sync rakeback
  useEffect(() => {
    localStorage.setItem('royal_casino_rakeback', rakebackAvailable.toFixed(2));
  }, [rakebackAvailable]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('royal_casino_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('royal_casino_player_name', playerName);
  }, [playerName]);

  useEffect(() => {
    localStorage.setItem('royal_casino_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('royal_casino_game_logs', JSON.stringify(gameLogs));
  }, [gameLogs]);

  useEffect(() => {
    localStorage.setItem('royal_casino_deposit_orders', JSON.stringify(depositOrders));
  }, [depositOrders]);

  useEffect(() => {
    localStorage.setItem('royal_casino_rtp_preset', houseRtpPreset);
  }, [houseRtpPreset]);

  const setSoundEnabled = (enabled: boolean) => {
    sound.enabled = enabled;
    setSoundEnabledState(enabled);
  };

  const setHouseRtpPreset = (preset: HouseRtpPreset) => {
    setHouseRtpPresetState(preset);
  };

  // Record a complete, precise game round into the Admin Telemetry
  const recordGameRound = useCallback((params: RecordGameRoundParams) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];
    const bet = Math.max(0, params.bet);
    const payout = Math.max(0, params.payout);
    const mult = params.multiplier !== undefined ? params.multiplier : (bet > 0 ? parseFloat((payout / bet).toFixed(2)) : 0);

    let determinedOutcome: 'win' | 'loss' | 'push' = 'loss';
    if (payout > bet) determinedOutcome = 'win';
    else if (payout === bet && bet > 0) determinedOutcome = 'push';
    else determinedOutcome = 'loss';

    const finalOutcome = params.outcome || determinedOutcome;
    // House profit: what the player lost (+), or what house paid out (-)
    const houseProfit = bet - payout;

    const roundId = `RND-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;

    const newLog: GameLogEntry = {
      id: roundId,
      timestamp: timeStr,
      date: dateStr,
      player: params.player || playerName,
      game: params.game,
      gameName: params.gameName,
      betAmount: bet,
      payoutAmount: payout,
      multiplier: mult,
      outcome: finalOutcome,
      houseProfit,
      details: params.details || `${params.gameName} round played`,
    };

    setGameLogs((prev) => [newLog, ...prev.slice(0, 499)]); // Keep up to 500 detailed rounds

    // Add to live bets stream
    const userBetEntry: LiveCasinoBet = {
      id: roundId,
      player: params.player || playerName,
      game: params.game,
      gameName: params.gameName,
      bet,
      multiplier: mult,
      payout,
      time: 'just now',
      isHighRoller: bet >= 200,
    };
    setLiveBets((prev) => [userBetEntry, ...prev.slice(0, 24)]);

    // Check for Big Win celebration
    if (mult >= 12 || payout >= 2500) {
      triggerBigWin(payout, mult, params.gameName);
    }
  }, [playerName, triggerBigWin]);

  // Record real money chip deposit into Cashier ledger
  const recordDeposit = useCallback((order: Omit<DepositOrder, 'id' | 'timestamp' | 'date'>) => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toISOString().split('T')[0];
    const orderId = `DEP-${Date.now().toString().slice(-6)}`;

    const newOrder: DepositOrder = {
      ...order,
      id: orderId,
      timestamp: timeStr,
      date: dateStr,
    };

    setDepositOrders((prev) => [newOrder, ...prev]);
    // Credit player chips
    setBalance((prev) => prev + order.chipsAmount);
    sound.playBigWin();
  }, []);

  const modifyBalance = (amount: number, game: string, wager: number = 0): boolean => {
    if (amount < 0 && balance + amount < 0) {
      return false; // Insufficient balance
    }

    setBalance((prev) => Math.max(0, prev + amount));

    // Accumulate Rakeback rewards on wagers
    if (wager > 0) {
      const earnedRakeback = wager * vipTier.cashbackPct;
      setRakebackAvailable((prev) => prev + earnedRakeback);
    }

    setStats((prev) => {
      const isWin = amount > 0;
      const wonAmount = isWin ? amount : 0;
      const updated: PlayerStats = {
        ...prev,
        totalWagered: prev.totalWagered + wager,
        totalWon: prev.totalWon + wonAmount,
        gamesPlayed: prev.gamesPlayed + (wager > 0 ? 1 : 0),
        biggestWin: Math.max(prev.biggestWin, wonAmount),
        slotsSpins: prev.slotsSpins + (game === 'slots' && wager > 0 ? 1 : 0),
        rouletteSpins: prev.rouletteSpins + (game === 'roulette' && wager > 0 ? 1 : 0),
        blackjackHands: prev.blackjackHands + (game === 'blackjack' && wager > 0 ? 1 : 0),
        plinkoDrops: prev.plinkoDrops + (game === 'plinko' && wager > 0 ? 1 : 0),
        crashRounds: (prev.crashRounds || 0) + (game === 'crash' && wager > 0 ? 1 : 0),
        minesRounds: (prev.minesRounds || 0) + (game === 'mines' && wager > 0 ? 1 : 0),
      };
      return updated;
    });

    return true;
  };

  const claimDailyBonus = (amount: number) => {
    setBalance((prev) => prev + amount);
    sound.playWin();
  };

  const resetBalance = () => {
    setBalance(INITIAL_BALANCE);
    sound.playChip();
  };

  const adminCreditChips = (amount: number, reason: string = 'Admin Manual Grant') => {
    setBalance((prev) => prev + amount);
    const now = new Date();
    const newOrder: DepositOrder = {
      id: `ADM-${Date.now().toString().slice(-6)}`,
      timestamp: now.toTimeString().split(' ')[0],
      date: now.toISOString().split('T')[0],
      player: playerName,
      packageTitle: `Manual Grant: +${amount.toLocaleString()} Chips`,
      amountUsd: 0,
      chipsAmount: amount,
      paymentMethod: 'card',
      accountOrWallet: 'ADMIN_CONSOLE',
      status: 'completed',
      txRef: reason,
    };
    setDepositOrders((prev) => [newOrder, ...prev]);
    sound.playWin();
  };

  const adminDebitChips = (amount: number, reason: string = 'Admin Manual Deduction') => {
    setBalance((prev) => Math.max(0, prev - amount));
    sound.playLose();
  };

  const clearGameLogs = () => {
    setGameLogs([]);
    localStorage.removeItem('royal_casino_game_logs');
  };

  // Periodic random live wins simulator
  useEffect(() => {
    const interval = setInterval(() => {
      const names = ['Michael D.', 'Zayd K.', 'Liam W.', 'Farhan S.', 'Lucas P.', 'Jessica V.', 'Emma H.', 'Omar T.'];
      const games = ['Neon Slots', 'European Roulette', 'Blackjack 21', 'Plinko Galaxy', 'Crash Rocket', 'Diamond Mines'];
      const multipliers = ['5x', '10x', '15x', '24x', '35x', '50x', '100x'];
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomGame = games[Math.floor(Math.random() * games.length)];
      const randomMult = multipliers[Math.floor(Math.random() * multipliers.length)];
      const multNum = parseInt(randomMult);
      const randomAmount = multNum * (20 + Math.floor(Math.random() * 80));

      const newWin: LiveWinFeedItem = {
        id: Date.now().toString(),
        player: randomName,
        game: randomGame,
        amount: randomAmount,
        multiplier: randomMult,
        timeAgo: 'just now',
      };

      setLiveWins((prev) => [newWin, ...prev.slice(0, 4)]);
    }, 14000);

    return () => clearInterval(interval);
  }, []);

  // Continuous real-time casino floor live bets feed simulator (Stake / Roobet style)
  useEffect(() => {
    const playerPool = [
      'CryptoKing', 'VegasWhale', 'Sultana_VIP', 'DiamondHands', 'LuckySpin99', 
      'NeonAce', 'HighRoller77', 'KarachiKing', 'LahoreAce', 'DubaiPrince', 
      'GoldBull', 'RocketMan', 'QueenOfHearts', 'WhaleTrader'
    ];
    const gamePool: { game: GameType; name: string }[] = [
      { game: 'slots', name: 'Neon Slots' },
      { game: 'crash', name: 'Crash Rocket' },
      { game: 'mines', name: 'Diamond Mines' },
      { game: 'plinko', name: 'Plinko Galaxy' },
      { game: 'roulette', name: 'European Roulette' },
      { game: 'blackjack', name: 'Royal Blackjack' },
    ];

    const betTimer = setInterval(() => {
      const p = playerPool[Math.floor(Math.random() * playerPool.length)];
      const g = gamePool[Math.floor(Math.random() * gamePool.length)];
      const isHigh = Math.random() < 0.25;
      const bet = isHigh ? (Math.floor(Math.random() * 8) + 2) * 250 : (Math.floor(Math.random() * 10) + 1) * 20;

      // Realistic win/loss probability
      const didWin = Math.random() < 0.48;
      let mult = 0;
      if (didWin) {
        if (g.game === 'crash') mult = parseFloat((1.1 + Math.random() * 14).toFixed(2));
        else if (g.game === 'mines') mult = parseFloat((1.5 + Math.random() * 8).toFixed(2));
        else if (g.game === 'plinko') mult = [1.2, 1.8, 3.2, 5.6, 12.0, 29.0][Math.floor(Math.random() * 6)];
        else if (g.game === 'slots') mult = [2.0, 4.0, 8.0, 16.0, 25.0, 50.0][Math.floor(Math.random() * 6)];
        else if (g.game === 'roulette') mult = [2.0, 3.0, 36.0][Math.floor(Math.random() * 3)];
        else mult = 2.0;
      }
      const payout = Math.round(bet * mult);

      const newLiveBet: LiveCasinoBet = {
        id: `lb-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        player: p,
        game: g.game,
        gameName: g.name,
        bet,
        multiplier: mult,
        payout,
        time: 'just now',
        isHighRoller: bet >= 500,
      };

      setLiveBets((prev) => [newLiveBet, ...prev.slice(0, 29)]);
    }, 2800);

    return () => clearInterval(betTimer);
  }, []);

  return (
    <CasinoContext.Provider
      value={{
        balance,
        selectedChip,
        setSelectedChip,
        soundEnabled,
        setSoundEnabled,
        loungeMusicEnabled,
        toggleLoungeMusic,
        stats,
        modifyBalance,
        claimDailyBonus,
        resetBalance,
        liveWins,
        showBonusWheel,
        setShowBonusWheel,
        showStatsModal,
        setShowStatsModal,
        showStoreModal,
        setShowStoreModal,
        vipTier,
        vipProgress,
        nextVipTier,
        rakebackAvailable,
        claimRakeback,
        faucetCooldown,
        claimFaucet,
        liveBets,
        bigWinData,
        closeBigWinModal,
        triggerBigWin,
        gameLogs,
        depositOrders,
        recordGameRound,
        recordDeposit,
        houseRtpPreset,
        setHouseRtpPreset,
        adminCreditChips,
        adminDebitChips,
        clearGameLogs,
        playerName,
        setPlayerName,
      }}
    >
      {children}
    </CasinoContext.Provider>
  );
};

export const useCasino = () => {
  const context = useContext(CasinoContext);
  if (!context) {
    throw new Error('useCasino must be used within a CasinoProvider');
  }
  return context;
};
