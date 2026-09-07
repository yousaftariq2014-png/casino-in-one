export type GameType = 'lobby' | 'slots' | 'roulette' | 'blackjack' | 'plinko' | 'crash' | 'mines';

export interface ChipConfig {
  value: number;
  label: string;
  color: string;
  borderColor: string;
  accentColor: string;
}

export interface PlayerStats {
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  biggestWin: number;
  slotsSpins: number;
  rouletteSpins: number;
  blackjackHands: number;
  plinkoDrops: number;
  crashRounds: number;
  minesRounds: number;
}

export interface LiveWinFeedItem {
  id: string;
  player: string;
  game: string;
  amount: number;
  multiplier: string;
  timeAgo: string;
}

export interface LiveCasinoBet {
  id: string;
  player: string;
  game: GameType;
  gameName: string;
  bet: number;
  multiplier: number;
  payout: number;
  time: string;
  isHighRoller?: boolean;
}

export interface BigWinData {
  amount: number;
  multiplier: number;
  gameName: string;
  tier: 'big' | 'mega' | 'epic' | 'jackpot';
}

export interface VipTierInfo {
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Royal Crown';
  icon: string;
  minWager: number;
  color: string;
  perk: string;
  cashbackPct: number;
}

// Game Telemetry Logs for Owner/Admin
export interface GameLogEntry {
  id: string;
  timestamp: string;
  date: string;
  player: string;
  game: GameType;
  gameName: string;
  betAmount: number;
  payoutAmount: number;
  multiplier: number;
  outcome: 'win' | 'loss' | 'push';
  houseProfit: number; // positive = House won money, negative = Player won payout
  details?: string;
}

// Chip Store & Deposit Transactions
export interface DepositOrder {
  id: string;
  timestamp: string;
  date: string;
  player: string;
  packageTitle: string;
  amountUsd: number;
  chipsAmount: number;
  paymentMethod: 'easypaisa' | 'jazzcash' | 'crypto_usdt' | 'card';
  accountOrWallet: string;
  status: 'completed' | 'pending' | 'rejected';
  txRef: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export type HouseRtpPreset = 'high_profit' | 'standard' | 'generous';

// Roulette Types
export type RouletteBetType = 
  | 'number'
  | 'red'
  | 'black'
  | 'even'
  | 'odd'
  | 'low' // 1-18
  | 'high' // 19-36
  | 'dozen1' // 1-12
  | 'dozen2' // 13-24
  | 'dozen3' // 25-36
  | 'col1'
  | 'col2'
  | 'col3';

export interface RouletteBet {
  type: RouletteBetType;
  value?: number; // for number bets (0-36)
  amount: number;
}

// Blackjack Types
export interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: string; // '2'-'10', 'J', 'Q', 'K', 'A'
  numericValue: number;
  hidden?: boolean;
}

export type BlackjackGameStage = 'betting' | 'player-turn' | 'dealer-turn' | 'resolved';

// Slots Types
export interface SlotSymbol {
  id: string;
  name: string;
  emoji: string;
  multiplier3: number;
  multiplier4: number;
  multiplier5: number;
  color: string;
  isWild?: boolean;
  isScatter?: boolean;
}

// Plinko Types
export type PlinkoRisk = 'low' | 'medium' | 'high';
export type PlinkoRows = 8 | 12 | 16;
