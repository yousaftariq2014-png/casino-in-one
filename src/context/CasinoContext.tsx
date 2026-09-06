import React, { createContext, useContext, useState, useEffect } from 'react';
import { PlayerStats, LiveWinFeedItem } from '../types';
import { sound } from '../utils/audio';

interface CasinoContextType {
  balance: number;
  selectedChip: number;
  setSelectedChip: (chip: number) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  stats: PlayerStats;
  modifyBalance: (amount: number, game: string, wager?: number) => boolean;
  claimDailyBonus: (amount: number) => void;
  resetBalance: () => void;
  liveWins: LiveWinFeedItem[];
  showBonusWheel: boolean;
  setShowBonusWheel: (show: boolean) => void;
  showStatsModal: boolean;
  setShowStatsModal: (show: boolean) => void;
}

const INITIAL_BALANCE = 5000;

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
    return saved ? Math.max(0, parseInt(saved, 10)) : INITIAL_BALANCE;
  });

  const [selectedChip, setSelectedChip] = useState<number>(50);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [showBonusWheel, setShowBonusWheel] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  const [stats, setStats] = useState<PlayerStats>(() => {
    const saved = localStorage.getItem('royal_casino_stats');
    return saved ? JSON.parse(saved) : DEFAULT_STATS;
  });

  const [liveWins, setLiveWins] = useState<LiveWinFeedItem[]>(INITIAL_LIVE_WINS);

  // Sync balance to local storage
  useEffect(() => {
    localStorage.setItem('royal_casino_balance', balance.toString());
  }, [balance]);

  // Sync stats to local storage
  useEffect(() => {
    localStorage.setItem('royal_casino_stats', JSON.stringify(stats));
  }, [stats]);

  const setSoundEnabled = (enabled: boolean) => {
    sound.enabled = enabled;
    setSoundEnabledState(enabled);
  };

  const modifyBalance = (amount: number, game: string, wager: number = 0): boolean => {
    if (amount < 0 && balance + amount < 0) {
      return false; // Insufficient balance
    }

    setBalance((prev) => Math.max(0, prev + amount));

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

  // Periodic random live wins simulator to make lobby feel bustling and alive
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

  return (
    <CasinoContext.Provider
      value={{
        balance,
        selectedChip,
        setSelectedChip,
        soundEnabled,
        setSoundEnabled,
        stats,
        modifyBalance,
        claimDailyBonus,
        resetBalance,
        liveWins,
        showBonusWheel,
        setShowBonusWheel,
        showStatsModal,
        setShowStatsModal,
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
