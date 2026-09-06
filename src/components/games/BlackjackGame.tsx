import React, { useState } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { PlayingCard, BlackjackGameStage } from '../../types';
import { sound } from '../../utils/audio';
import { ChipSelector } from '../ChipSelector';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Sparkles, 
  ShieldAlert, 
  RotateCcw, 
  Coins, 
  Plus, 
  Hand, 
  Flame 
} from 'lucide-react';

const SUITS: ('hearts' | 'diamonds' | 'clubs' | 'spades')[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

const createDeck = (): PlayingCard[] => {
  const deck: PlayingCard[] = [];
  SUITS.forEach((suit) => {
    VALUES.forEach((val) => {
      let numVal = parseInt(val);
      if (['J', 'Q', 'K'].includes(val)) numVal = 10;
      if (val === 'A') numVal = 11;
      deck.push({ suit, value: val, numericValue: numVal });
    });
  });
  // Shuffle (Fisher-Yates)
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

// Calculate optimal hand value with Ace flexibility
const calculateHandValue = (cards: PlayingCard[]): number => {
  const visibleCards = cards.filter((c) => !c.hidden);
  let sum = visibleCards.reduce((acc, c) => acc + c.numericValue, 0);
  let aceCount = visibleCards.filter((c) => c.value === 'A').length;

  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }
  return sum;
};

interface BlackjackGameProps {
  onBackToLobby: () => void;
}

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip } = useCasino();

  const [deck, setDeck] = useState<PlayingCard[]>(createDeck());
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [dealerHand, setDealerHand] = useState<PlayingCard[]>([]);
  const [stage, setStage] = useState<BlackjackGameStage>('betting');
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [gameResult, setGameResult] = useState<{
    text: string;
    type: 'win' | 'lose' | 'push' | 'blackjack';
    payout: number;
  } | null>(null);

  // Draw card from deck
  const drawCard = (hidden = false): PlayingCard => {
    let currentDeck = deck;
    if (currentDeck.length < 10) {
      currentDeck = createDeck();
      setDeck(currentDeck);
    }
    const card = { ...currentDeck[0], hidden };
    setDeck(currentDeck.slice(1));
    return card;
  };

  // Add chip to current hand bet during betting phase
  const addBet = () => {
    if (stage !== 'betting') return;
    if (balance < currentBet + selectedChip) {
      sound.playLose();
      return;
    }
    sound.playChip();
    setCurrentBet((prev) => prev + selectedChip);
  };

  const clearBet = () => {
    if (stage !== 'betting') return;
    setCurrentBet(0);
    sound.playChip();
  };

  // Deal Initial 2 cards to player & dealer
  const handleDeal = () => {
    const betToUse = currentBet > 0 ? currentBet : selectedChip;
    if (balance < betToUse) {
      sound.playLose();
      return;
    }

    // Set active bet & deduct chips
    setCurrentBet(betToUse);
    modifyBalance(-betToUse, 'blackjack', betToUse);
    sound.playCardDeal();

    const p1 = drawCard();
    const d1 = drawCard();
    const p2 = drawCard();
    const d2 = drawCard(true); // Dealer hole card

    const newPlayerHand = [p1, p2];
    const newDealerHand = [d1, d2];

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameResult(null);

    // Check for natural Player Blackjack
    const pVal = calculateHandValue(newPlayerHand);
    if (pVal === 21) {
      // Reveal dealer hole card immediately
      const revealedDealer = newDealerHand.map((c) => ({ ...c, hidden: false }));
      setDealerHand(revealedDealer);
      const dVal = calculateHandValue(revealedDealer);

      if (dVal === 21) {
        // Push
        setStage('resolved');
        modifyBalance(betToUse, 'blackjack');
        setGameResult({ text: 'Both Blackjack! Push.', type: 'push', payout: betToUse });
        sound.playChip();
      } else {
        // Player Blackjack: 3:2 payout (bet + 1.5 * bet = 2.5x)
        const payout = betToUse + Math.floor(betToUse * 1.5);
        setStage('resolved');
        modifyBalance(payout, 'blackjack');
        setGameResult({ text: 'BLACKJACK! Pays 3:2!', type: 'blackjack', payout });
        sound.playBigWin();
        confetti({ particleCount: 100, spread: 70 });
      }
    } else {
      setStage('player-turn');
    }
  };

  // Player Hits
  const handleHit = () => {
    if (stage !== 'player-turn') return;
    sound.playCardDeal();

    const newCard = drawCard();
    const updatedHand = [...playerHand, newCard];
    setPlayerHand(updatedHand);

    const val = calculateHandValue(updatedHand);
    if (val > 21) {
      // Player Busts
      setStage('resolved');
      setGameResult({ text: 'Bust! Hand over 21.', type: 'lose', payout: 0 });
      sound.playLose();
    } else if (val === 21) {
      // Auto-stand on 21
      handleStand(updatedHand);
    }
  };

  // Player Double Down: Double bet, 1 card only, then dealer turn
  const handleDoubleDown = () => {
    if (stage !== 'player-turn' || playerHand.length !== 2) return;
    if (balance < currentBet) {
      sound.playLose();
      return;
    }

    modifyBalance(-currentBet, 'blackjack', currentBet);
    const doubledBet = currentBet * 2;
    setCurrentBet(doubledBet);
    sound.playCardDeal();

    const newCard = drawCard();
    const updatedHand = [...playerHand, newCard];
    setPlayerHand(updatedHand);

    const val = calculateHandValue(updatedHand);
    if (val > 21) {
      setStage('resolved');
      setGameResult({ text: 'Bust on Double Down!', type: 'lose', payout: 0 });
      sound.playLose();
    } else {
      handleStand(updatedHand, doubledBet);
    }
  };

  // Player Stands -> Dealer's turn
  const handleStand = (activePlayerHand: PlayingCard[] = playerHand, activeBet = currentBet) => {
    setStage('dealer-turn');

    // Reveal dealer hole card
    let currentDealerCards = dealerHand.map((c) => ({ ...c, hidden: false }));
    setDealerHand(currentDealerCards);
    sound.playCardDeal();

    // Dealer draws to soft 17
    let dVal = calculateHandValue(currentDealerCards);

    const runDealerDraws = () => {
      if (dVal < 17) {
        sound.playCardDeal();
        const extraCard = drawCard();
        currentDealerCards = [...currentDealerCards, extraCard];
        setDealerHand(currentDealerCards);
        dVal = calculateHandValue(currentDealerCards);
        setTimeout(runDealerDraws, 600);
      } else {
        // Resolve hands
        resolveWinner(activePlayerHand, currentDealerCards, activeBet);
      }
    };

    setTimeout(runDealerDraws, 600);
  };

  const resolveWinner = (pHand: PlayingCard[], dHand: PlayingCard[], betAmount: number) => {
    setStage('resolved');
    const pVal = calculateHandValue(pHand);
    const dVal = calculateHandValue(dHand);

    if (dVal > 21) {
      // Dealer bust -> Player wins 1:1 (payout 2x bet)
      const payout = betAmount * 2;
      modifyBalance(payout, 'blackjack');
      setGameResult({ text: 'Dealer Busts! You Win!', type: 'win', payout });
      sound.playWin();
      confetti({ particleCount: 80, spread: 60 });
    } else if (pVal > dVal) {
      // Player wins
      const payout = betAmount * 2;
      modifyBalance(payout, 'blackjack');
      setGameResult({ text: `You Win! (${pVal} vs ${dVal})`, type: 'win', payout });
      sound.playWin();
    } else if (pVal === dVal) {
      // Push
      modifyBalance(betAmount, 'blackjack');
      setGameResult({ text: `Push! Tied at ${pVal}.`, type: 'push', payout: betAmount });
      sound.playChip();
    } else {
      // Dealer wins
      setGameResult({ text: `Dealer Wins with ${dVal}.`, type: 'lose', payout: 0 });
      sound.playLose();
    }
  };

  // Helper to render card suit icon & color
  const renderCard = (card: PlayingCard, idx: number) => {
    if (card.hidden) {
      return (
        <div
          key={idx}
          className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-blue-900 via-blue-950 to-indigo-950 border-2 border-amber-400/60 shadow-xl flex items-center justify-center p-2 relative select-none transform hover:-translate-y-1 transition-transform"
        >
          <div className="w-full h-full rounded-lg border border-dashed border-amber-400/40 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-serif-luxury text-amber-400 font-black">GR</span>
          </div>
        </div>
      );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = card.suit === 'hearts' ? '♥' : card.suit === 'diamonds' ? '♦' : card.suit === 'clubs' ? '♣' : '♠';

    return (
      <div
        key={idx}
        className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border border-zinc-300 shadow-xl flex flex-col justify-between p-2 relative select-none animate-in zoom-in-95 duration-200"
      >
        <div className={`text-xs sm:text-sm font-black flex items-center gap-0.5 leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span>{card.value}</span>
          <span className="text-base">{suitSymbol}</span>
        </div>

        <div className={`text-2xl sm:text-3xl font-black text-center ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          {suitSymbol}
        </div>

        <div className={`text-xs sm:text-sm font-black flex items-center gap-0.5 self-end rotate-180 leading-none ${isRed ? 'text-red-600' : 'text-zinc-900'}`}>
          <span>{card.value}</span>
          <span className="text-base">{suitSymbol}</span>
        </div>
      </div>
    );
  };

  const pScore = calculateHandValue(playerHand);
  const dScore = calculateHandValue(dealerHand);

  return (
    <div id="blackjack-game-container" className="max-w-5xl mx-auto px-4 py-4 sm:py-6 space-y-4">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="blackjack-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold">
            Blackjack Pays 3:2 • Dealer stands on 17 • Certified Fair
          </span>
        </div>
      </div>

      {/* Royal Blackjack Emerald Felt Table */}
      <div className="rounded-3xl border-2 border-amber-500/40 p-5 sm:p-8 shadow-2xl felt-emerald min-h-[480px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Felt Arch Overlay */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 border-b-2 border-amber-400/30 rounded-b-[100%] pointer-events-none" />

        {/* Dealer Section */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
              Dealer's Hand
            </span>
            {dealerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-amber-400 font-bold text-xs border border-amber-500/30">
                Score: {dScore}
              </span>
            )}
          </div>

          {/* Dealer Cards */}
          <div className="flex items-center justify-center gap-2 min-h-[115px]">
            {dealerHand.length === 0 ? (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-xs text-zinc-400 font-medium">
                Dealer Box
              </div>
            ) : (
              dealerHand.map((card, idx) => renderCard(card, idx))
            )}
          </div>
        </div>

        {/* Center Felt Announcement or Chips on Felt */}
        <div className="py-2 text-center relative z-10">
          {gameResult ? (
            <div
              className={`inline-block px-6 py-2.5 rounded-2xl border text-center shadow-xl animate-in zoom-in-95 ${
                gameResult.type === 'win' || gameResult.type === 'blackjack'
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
                  : gameResult.type === 'push'
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300'
                  : 'bg-rose-950/90 border-rose-400 text-rose-300'
              }`}
            >
              <span className="text-base sm:text-xl font-black font-serif-luxury block">
                {gameResult.text}
              </span>
              {gameResult.payout > 0 && (
                <span className="text-xs font-bold block mt-0.5">
                  Payout: +${gameResult.payout.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <div className="text-xs font-semibold text-amber-300/60 uppercase tracking-widest">
              Insurance Pays 2:1 • Dealer must draw to 16 and stand on all 17s
            </div>
          )}
        </div>

        {/* Player Section */}
        <div className="flex flex-col items-center gap-2 relative z-10">
          {/* Player Cards */}
          <div className="flex items-center justify-center gap-2 min-h-[115px]">
            {playerHand.length === 0 ? (
              <div className="w-20 h-28 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-xs text-zinc-400 font-medium">
                Player Box
              </div>
            ) : (
              playerHand.map((card, idx) => renderCard(card, idx))
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
              Player's Hand
            </span>
            {playerHand.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-black/60 text-amber-400 font-bold text-xs border border-amber-500/30">
                Score: {pScore}
              </span>
            )}
          </div>
        </div>

        {/* Controls & Action Dashboard */}
        <div className="mt-6 pt-4 border-t border-emerald-500/30 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
          
          {/* Current Bet Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Current Bet</span>
              <span className="text-base font-black text-amber-400 font-serif-luxury">
                ${(currentBet > 0 ? currentBet : selectedChip).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {stage === 'betting' || stage === 'resolved' ? (
              <>
                <button
                  id="bj-clear-btn"
                  onClick={clearBet}
                  disabled={currentBet === 0}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors disabled:opacity-40"
                >
                  Clear Bet
                </button>

                <button
                  id="bj-add-bet-btn"
                  onClick={addBet}
                  className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-bold transition-colors"
                >
                  +${selectedChip}
                </button>

                <button
                  id="bj-deal-btn"
                  onClick={handleDeal}
                  disabled={balance < (currentBet > 0 ? currentBet : selectedChip)}
                  className="px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-lg shadow-amber-500/20 active:scale-95 transition-all disabled:opacity-40"
                >
                  Deal Hand
                </button>
              </>
            ) : stage === 'player-turn' ? (
              <>
                <button
                  id="bj-hit-btn"
                  onClick={handleHit}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Hit</span>
                </button>

                <button
                  id="bj-stand-btn"
                  onClick={() => handleStand()}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Hand className="w-4 h-4" />
                  <span>Stand</span>
                </button>

                {playerHand.length === 2 && balance >= currentBet && (
                  <button
                    id="bj-double-btn"
                    onClick={handleDoubleDown}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Flame className="w-4 h-4" />
                    <span>Double (2×)</span>
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs text-amber-400 font-bold animate-pulse">
                Dealer playing hand...
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Chip selector for betting */}
      <ChipSelector
        label="Select Chip Size"
        disabled={stage === 'player-turn' || stage === 'dealer-turn'}
        onClear={clearBet}
      />

    </div>
  );
};
