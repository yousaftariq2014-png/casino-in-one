import React, { useState } from 'react';
import { CasinoProvider } from './context/CasinoContext';
import { GameType } from './types';
import { Navbar } from './components/Navbar';
import { Lobby } from './components/Lobby';
import { SlotsGame } from './components/games/SlotsGame';
import { RouletteGame } from './components/games/RouletteGame';
import { BlackjackGame } from './components/games/BlackjackGame';
import { PlinkoGame } from './components/games/PlinkoGame';
import { CrashGame } from './components/games/CrashGame';
import { MinesGame } from './components/games/MinesGame';
import { DailyBonusModal } from './components/DailyBonusModal';
import { StatsModal } from './components/StatsModal';

function CasinoApp() {
  const [currentGame, setCurrentGame] = useState<GameType>('lobby');

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      <Navbar
        currentGame={currentGame}
        onSelectGame={(game) => setCurrentGame(game)}
      />

      <main className="flex-1 pb-12">
        {currentGame === 'lobby' && (
          <Lobby onSelectGame={(game) => setCurrentGame(game)} />
        )}

        {currentGame === 'slots' && (
          <SlotsGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}

        {currentGame === 'roulette' && (
          <RouletteGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}

        {currentGame === 'blackjack' && (
          <BlackjackGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}

        {currentGame === 'plinko' && (
          <PlinkoGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}

        {currentGame === 'crash' && (
          <CrashGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}

        {currentGame === 'mines' && (
          <MinesGame onBackToLobby={() => setCurrentGame('lobby')} />
        )}
      </main>

      {/* Global Modals */}
      <DailyBonusModal />
      <StatsModal />
    </div>
  );
}

export default function App() {
  return (
    <CasinoProvider>
      <CasinoApp />
    </CasinoProvider>
  );
}
