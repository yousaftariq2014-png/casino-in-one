import React, { useState, useEffect, useRef } from 'react';
import { useCasino } from '../../context/CasinoContext';
import { RouletteBet, RouletteBetType } from '../../types';
import { sound } from '../../utils/audio';
import { ChipSelector } from '../ChipSelector';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  RotateCw, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Coins 
} from 'lucide-react';

// European Roulette Numbers in wheel order:
const WHEEL_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 
  5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

const getNumberColor = (num: number): 'green' | 'red' | 'black' => {
  if (num === 0) return 'green';
  return RED_NUMBERS.has(num) ? 'red' : 'black';
};

interface RouletteGameProps {
  onBackToLobby: () => void;
}

export const RouletteGame: React.FC<RouletteGameProps> = ({ onBackToLobby }) => {
  const { balance, modifyBalance, selectedChip } = useCasino();

  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastWin, setLastWin] = useState<number>(0);
  const [history, setHistory] = useState<number[]>([17, 4, 32, 11, 0, 26, 9]);

  const totalBetAmount = bets.reduce((acc, b) => acc + b.amount, 0);

  // Add bet to board
  const placeBet = (type: RouletteBetType, value?: number) => {
    if (isSpinning) return;
    if (balance < totalBetAmount + selectedChip) {
      sound.playLose();
      return;
    }

    sound.playChip();
    setBets((prev) => {
      const existingIdx = prev.findIndex(
        (b) => b.type === type && (value === undefined || b.value === value)
      );

      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          amount: updated[existingIdx].amount + selectedChip,
        };
        return updated;
      } else {
        return [...prev, { type, value, amount: selectedChip }];
      }
    });
  };

  const clearBets = () => {
    if (isSpinning) return;
    setBets([]);
    sound.playChip();
  };

  const doubleBets = () => {
    if (isSpinning) return;
    if (balance < totalBetAmount * 2) {
      sound.playLose();
      return;
    }
    sound.playChip();
    setBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  // Helper to evaluate bet wins against winning number
  const evaluateBet = (bet: RouletteBet, num: number): number => {
    const isRed = RED_NUMBERS.has(num);
    const isBlack = num !== 0 && !isRed;
    const isEven = num !== 0 && num % 2 === 0;
    const isOdd = num !== 0 && num % 2 !== 0;

    switch (bet.type) {
      case 'number':
        // Straight up: 35:1 payout (+ original bet = 36x)
        return bet.value === num ? bet.amount * 36 : 0;
      case 'red':
        return isRed ? bet.amount * 2 : 0;
      case 'black':
        return isBlack ? bet.amount * 2 : 0;
      case 'even':
        return isEven ? bet.amount * 2 : 0;
      case 'odd':
        return isOdd ? bet.amount * 2 : 0;
      case 'low': // 1-18
        return num >= 1 && num <= 18 ? bet.amount * 2 : 0;
      case 'high': // 19-36
        return num >= 19 && num <= 36 ? bet.amount * 2 : 0;
      case 'dozen1': // 1-12
        return num >= 1 && num <= 12 ? bet.amount * 3 : 0;
      case 'dozen2': // 13-24
        return num >= 13 && num <= 24 ? bet.amount * 3 : 0;
      case 'dozen3': // 25-36
        return num >= 25 && num <= 36 ? bet.amount * 3 : 0;
      case 'col1': // numbers % 3 === 1 (1, 4, 7... 34)
        return num !== 0 && num % 3 === 1 ? bet.amount * 3 : 0;
      case 'col2': // numbers % 3 === 2 (2, 5, 8... 35)
        return num !== 0 && num % 3 === 2 ? bet.amount * 3 : 0;
      case 'col3': // numbers % 3 === 0 (3, 6, 9... 36)
        return num !== 0 && num % 3 === 0 ? bet.amount * 3 : 0;
      default:
        return 0;
    }
  };

  const handleSpin = () => {
    if (isSpinning || bets.length === 0) return;
    if (balance < totalBetAmount) return;

    // Deduct wager
    modifyBalance(-totalBetAmount, 'roulette', totalBetAmount);
    sound.playChip();

    setIsSpinning(true);
    setWinningNumber(null);
    setLastWin(0);

    // Pick random winning number
    const winNum = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
    const winPocketIndex = WHEEL_NUMBERS.indexOf(winNum);
    const pocketDegrees = 360 / 37;

    // Wheel spins clockwise, ball spins counter-clockwise
    const extraWheelSpins = 4 * 360;
    const nextWheelRotation = wheelRotation + extraWheelSpins + (Math.random() * 360);
    setWheelRotation(nextWheelRotation);

    const extraBallSpins = 7 * 360;
    // Align ball to land on winPocketIndex
    const pocketAngle = winPocketIndex * pocketDegrees;
    const finalBallRotation = ballRotation - extraBallSpins - (pocketAngle + (nextWheelRotation % 360));
    setBallRotation(finalBallRotation);

    // Audio ticking simulation
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sound.playSpinTick();
      tickCount++;
      if (tickCount > 28) clearInterval(tickInterval);
    }, 110);

    // Resolve after 3.6s
    setTimeout(() => {
      clearInterval(tickInterval);
      setIsSpinning(false);
      setWinningNumber(winNum);
      setHistory((prev) => [winNum, ...prev.slice(0, 9)]);

      // Calculate total winnings
      let totalPayout = 0;
      bets.forEach((bet) => {
        totalPayout += evaluateBet(bet, winNum);
      });

      if (totalPayout > 0) {
        modifyBalance(totalPayout, 'roulette');
        setLastWin(totalPayout);
        if (totalPayout >= totalBetAmount * 10) {
          sound.playBigWin();
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } else {
          sound.playWin();
        }
      } else {
        sound.playLose();
      }
    }, 3600);
  };

  const getBetOn = (type: RouletteBetType, value?: number) => {
    return bets.find(
      (b) => b.type === type && (value === undefined || b.value === value)
    );
  };

  return (
    <div id="roulette-game-container" className="max-w-6xl mx-auto px-4 py-4 sm:py-6 space-y-5">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          id="roulette-back-btn"
          onClick={() => {
            sound.playChip();
            onBackToLobby();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold border border-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lobby</span>
        </button>

        {/* History Billboard */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">History:</span>
          {history.map((num, idx) => {
            const col = getNumberColor(num);
            return (
              <span
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow ${
                  col === 'green'
                    ? 'bg-emerald-600 text-white'
                    : col === 'red'
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-900 text-white border border-zinc-700'
                }`}
              >
                {num}
              </span>
            );
          })}
        </div>
      </div>

      {/* Main Table Felt Layout */}
      <div className="rounded-3xl border-2 border-emerald-600/40 p-4 sm:p-6 shadow-2xl felt-roulette space-y-6">
        
        {/* Upper Section: Animated Roulette Wheel + Live Result Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Wheel Display (col 1-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-[#3b2713] bg-[#1a1109] shadow-[0_0_40px_rgba(0,0,0,0.8)] p-2 flex items-center justify-center">
              
              {/* Spinning Wheel Face */}
              <div
                className="w-full h-full rounded-full relative overflow-hidden transition-transform ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transitionDuration: isSpinning ? '3.6s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.2, 0.85, 0.25, 1)',
                }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {WHEEL_NUMBERS.map((num, i) => {
                    const angle = 360 / 37;
                    const startAngle = i * angle;
                    const endAngle = (i + 1) * angle;
                    const x1 = 100 + 100 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                    const y1 = 100 + 100 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                    const x2 = 100 + 100 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                    const y2 = 100 + 100 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                    const colorType = getNumberColor(num);
                    const fillColor = colorType === 'green' ? '#047857' : colorType === 'red' ? '#b91c1c' : '#18181b';
                    const textAngle = startAngle + angle / 2;

                    return (
                      <g key={i}>
                        <path d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`} fill={fillColor} stroke="#27272a" strokeWidth="0.5" />
                        <text
                          x="100"
                          y="24"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          textAnchor="middle"
                          transform={`rotate(${textAngle}, 100, 100)`}
                        >
                          {num}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              {/* Counter-spinning ball orbit */}
              <div
                className="absolute inset-4 rounded-full pointer-events-none transition-transform ease-out"
                style={{
                  transform: `rotate(${ballRotation}deg)`,
                  transitionDuration: isSpinning ? '3.6s' : '0s',
                  transitionTimingFunction: 'cubic-bezier(0.1, 0.9, 0.2, 1)',
                }}
              >
                {/* Silver Ball */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-tr from-slate-300 via-white to-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.9)] border border-slate-500" />
              </div>

              {/* Center Turret (Bronze brass hub) */}
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-tr from-[#68411a] via-[#f5c542] to-[#68411a] border-4 border-[#331c06] shadow-xl flex items-center justify-center pointer-events-none">
                <div className="w-10 h-10 rounded-full bg-[#1e140a] border border-amber-500/50 flex items-center justify-center">
                  <span className="text-sm font-black gold-gradient-text font-serif-luxury">GR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome & Total Wager stats (col 6-12) */}
          <div className="lg:col-span-7 bg-zinc-950/80 rounded-2xl p-5 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold block">
                  European Single Zero
                </span>
                <h3 className="text-xl font-black font-serif-luxury text-white">
                  Table Limit: $10 – $10,000
                </h3>
              </div>

              {/* Spun number badge */}
              {winningNumber !== null && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black text-2xl shadow-xl animate-in zoom-in-95 ${
                      getNumberColor(winningNumber) === 'green'
                        ? 'bg-emerald-600 text-white'
                        : getNumberColor(winningNumber) === 'red'
                        ? 'bg-red-600 text-white'
                        : 'bg-zinc-900 text-white border-2 border-zinc-700'
                    }`}
                  >
                    <span>{winningNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-zinc-400 block">Winning Number</span>
                    <span className="text-sm font-bold text-amber-300 uppercase">
                      {getNumberColor(winningNumber)} • {winningNumber === 0 ? 'Zero' : winningNumber % 2 === 0 ? 'Even' : 'Odd'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Win announcement */}
            {lastWin > 0 && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-center animate-in zoom-in-95">
                <span className="text-xs font-bold text-emerald-300 uppercase block">Payout Winner!</span>
                <span className="text-xl font-black text-white font-serif-luxury">
                  +${lastWin.toLocaleString()} Payout Awarded
                </span>
              </div>
            )}

            {/* Active Bets Summary */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-zinc-400">Total Table Bet:</span>
                <span className="font-bold text-amber-400 font-serif-luxury text-sm">
                  ${totalBetAmount.toLocaleString()}
                </span>
              </div>
              <span className="text-zinc-500">
                {bets.length} Active {bets.length === 1 ? 'Position' : 'Positions'}
              </span>
            </div>
          </div>

        </div>

        {/* Felt Betting Grid */}
        <div className="space-y-2 overflow-x-auto pb-2">
          
          {/* Main 0 + 36 numbers grid */}
          <div className="min-w-[640px] grid grid-cols-13 gap-1 text-center font-bold text-sm">
            
            {/* 0 (green) spanning 3 rows */}
            <button
              id="bet-roulette-0"
              disabled={isSpinning}
              onClick={() => placeBet('number', 0)}
              className="row-span-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-lg flex flex-col items-center justify-center p-2 relative border border-emerald-400/40 shadow-md transition-all"
            >
              <span className="text-xl font-black font-serif-luxury">0</span>
              {getBetOn('number', 0) && (
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('number', 0)?.amount}
                </span>
              )}
            </button>

            {/* Rows of 12 columns: Row 1 (3, 6, 9 ... 36) */}
            {[3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].map((num) => {
              const isRed = RED_NUMBERS.has(num);
              const bet = getBetOn('number', num);
              return (
                <button
                  key={num}
                  id={`bet-roulette-${num}`}
                  disabled={isSpinning}
                  onClick={() => placeBet('number', num)}
                  className={`h-11 rounded-lg flex items-center justify-center relative font-black transition-all active:scale-95 shadow-md border ${
                    isRed
                      ? 'bg-red-700 hover:bg-red-600 text-white border-red-500/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
                  }`}
                >
                  <span>{num}</span>
                  {bet && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                      ${bet.amount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Row 2 (2, 5, 8 ... 35) */}
            {[2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].map((num) => {
              const isRed = RED_NUMBERS.has(num);
              const bet = getBetOn('number', num);
              return (
                <button
                  key={num}
                  id={`bet-roulette-${num}`}
                  disabled={isSpinning}
                  onClick={() => placeBet('number', num)}
                  className={`h-11 rounded-lg flex items-center justify-center relative font-black transition-all active:scale-95 shadow-md border ${
                    isRed
                      ? 'bg-red-700 hover:bg-red-600 text-white border-red-500/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
                  }`}
                >
                  <span>{num}</span>
                  {bet && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                      ${bet.amount}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Row 3 (1, 4, 7 ... 34) */}
            {[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((num) => {
              const isRed = RED_NUMBERS.has(num);
              const bet = getBetOn('number', num);
              return (
                <button
                  key={num}
                  id={`bet-roulette-${num}`}
                  disabled={isSpinning}
                  onClick={() => placeBet('number', num)}
                  className={`h-11 rounded-lg flex items-center justify-center relative font-black transition-all active:scale-95 shadow-md border ${
                    isRed
                      ? 'bg-red-700 hover:bg-red-600 text-white border-red-500/30'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border-zinc-700'
                  }`}
                >
                  <span>{num}</span>
                  {bet && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                      ${bet.amount}
                    </span>
                  )}
                </button>
              );
            })}

          </div>

          {/* Dozens Bets (1st 12, 2nd 12, 3rd 12) */}
          <div className="min-w-[640px] grid grid-cols-13 gap-1">
            <div className="col-span-1" />
            <button
              id="bet-dozen-1"
              disabled={isSpinning}
              onClick={() => placeBet('dozen1')}
              className="col-span-4 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-zinc-200 font-bold text-xs uppercase tracking-wider relative"
            >
              <span>1st 12 (1-12)</span>
              {getBetOn('dozen1') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('dozen1')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-dozen-2"
              disabled={isSpinning}
              onClick={() => placeBet('dozen2')}
              className="col-span-4 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-zinc-200 font-bold text-xs uppercase tracking-wider relative"
            >
              <span>2nd 12 (13-24)</span>
              {getBetOn('dozen2') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('dozen2')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-dozen-3"
              disabled={isSpinning}
              onClick={() => placeBet('dozen3')}
              className="col-span-4 py-2.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/40 text-zinc-200 font-bold text-xs uppercase tracking-wider relative"
            >
              <span>3rd 12 (25-36)</span>
              {getBetOn('dozen3') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('dozen3')?.amount}
                </span>
              )}
            </button>
          </div>

          {/* Outside Even-Money Bets: 1-18, EVEN, RED, BLACK, ODD, 19-36 */}
          <div className="min-w-[640px] grid grid-cols-13 gap-1">
            <div className="col-span-1" />
            <button
              id="bet-outside-low"
              disabled={isSpinning}
              onClick={() => placeBet('low')}
              className="col-span-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-zinc-200 font-bold text-xs relative"
            >
              <span>1 to 18</span>
              {getBetOn('low') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('low')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-outside-even"
              disabled={isSpinning}
              onClick={() => placeBet('even')}
              className="col-span-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-zinc-200 font-bold text-xs relative"
            >
              <span>EVEN</span>
              {getBetOn('even') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('even')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-outside-red"
              disabled={isSpinning}
              onClick={() => placeBet('red')}
              className="col-span-2 py-2 rounded-lg bg-red-700 hover:bg-red-600 text-white font-bold text-xs relative flex items-center justify-center gap-1.5 shadow"
            >
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span>RED</span>
              {getBetOn('red') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('red')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-outside-black"
              disabled={isSpinning}
              onClick={() => placeBet('black')}
              className="col-span-2 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs relative flex items-center justify-center gap-1.5 shadow"
            >
              <span className="w-3 h-3 rounded-full bg-zinc-400" />
              <span>BLACK</span>
              {getBetOn('black') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('black')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-outside-odd"
              disabled={isSpinning}
              onClick={() => placeBet('odd')}
              className="col-span-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-zinc-200 font-bold text-xs relative"
            >
              <span>ODD</span>
              {getBetOn('odd') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('odd')?.amount}
                </span>
              )}
            </button>
            <button
              id="bet-outside-high"
              disabled={isSpinning}
              onClick={() => placeBet('high')}
              className="col-span-2 py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/30 text-zinc-200 font-bold text-xs relative"
            >
              <span>19 to 36</span>
              {getBetOn('high') && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[9px] font-black flex items-center justify-center chip-shadow">
                  ${getBetOn('high')?.amount}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Chips Selector & Spin Action */}
        <div className="space-y-3 pt-2">
          <ChipSelector
            label="Active Chip"
            disabled={isSpinning}
            onClear={clearBets}
            onDouble={doubleBets}
          />

          <div className="flex items-center justify-between">
            <button
              onClick={clearBets}
              disabled={isSpinning || bets.length === 0}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Table</span>
            </button>

            <button
              id="roulette-spin-wheel-btn"
              disabled={isSpinning || bets.length === 0 || balance < totalBetAmount}
              onClick={handleSpin}
              className="px-8 py-3.5 rounded-2xl font-black text-base uppercase tracking-widest bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-zinc-950 hover:brightness-110 shadow-xl shadow-amber-500/30 transition-all duration-200 active:scale-95 disabled:opacity-40 flex items-center gap-2"
            >
              <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
              <span>{isSpinning ? 'Wheel Spinning...' : `SPIN ($${totalBetAmount})`}</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
