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
import { CertificatesModal } from './components/CertificatesModal';

function CasinoApp() {
  const [currentGame, setCurrentGame] = useState<GameType>('lobby');
  const [showCertificates, setShowCertificates] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentGame={currentGame}
        onSelectGame={(game) => setCurrentGame(game)}
        onOpenCertificates={() => setShowCertificates(true)}
      />

      <main className="flex-1 pb-12">
        {currentGame === 'lobby' && (
          <Lobby
            onSelectGame={(game) => setCurrentGame(game)}
            onOpenCertificates={() => setShowCertificates(true)}
          />
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
      <CertificatesModal
        isOpen={showCertificates}
        onClose={() => setShowCertificates(false)}
      />
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
