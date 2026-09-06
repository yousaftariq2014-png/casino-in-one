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
