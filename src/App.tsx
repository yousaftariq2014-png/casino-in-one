import React, { useState, useEffect, useCallback } from 'react';
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
import { ChipStoreModal } from './components/ChipStoreModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BigWinModal } from './components/BigWinModal';
import { VipClubModal } from './components/VipClubModal';
import { LiveCasinoChat } from './components/LiveCasinoChat';

function CasinoApp() {
  const [currentGame, setCurrentGame] = useState<GameType>('lobby');
  const [showCertificates, setShowCertificates] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showVipClub, setShowVipClub] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Check whether URL points to the Admin portal
  const checkIsAdminUrl = useCallback(() => {
    const hash = window.location.hash.toLowerCase();
    const search = window.location.search.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    return hash === '#admin' || hash.startsWith('#/admin') || search.includes('page=admin') || search.includes('admin=true') || path.endsWith('/admin');
  }, []);

  const [isAdminView, setIsAdminView] = useState<boolean>(() => checkIsAdminUrl());

  // Listen for hashchange and popstate events (e.g. back button or entering #admin in URL)
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminView(checkIsAdminUrl());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [checkIsAdminUrl]);

  const handleOpenAdmin = () => {
    window.location.hash = 'admin';
    setIsAdminView(true);
  };

  const handleExitAdmin = () => {
    if (window.location.hash) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
    setIsAdminView(false);
  };

  if (isAdminView) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
        <AdminDashboard onExit={handleExitAdmin} onBackToCasino={handleExitAdmin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#0a0d14] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      <Navbar
        currentGame={currentGame}
        onSelectGame={(game) => setCurrentGame(game)}
        onOpenCertificates={() => setShowCertificates(true)}
        onOpenStore={() => setShowStore(true)}
        onOpenVipClub={() => setShowVipClub(true)}
        onToggleChat={() => setIsChatOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
      />

      <main className="flex-1 w-full max-w-full pb-8">
        {currentGame === 'lobby' && (
          <Lobby
            onSelectGame={(game) => setCurrentGame(game)}
            onOpenCertificates={() => setShowCertificates(true)}
            onOpenStore={() => setShowStore(true)}
            onOpenVipClub={() => setShowVipClub(true)}
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

      {/* Discreet Footer at the absolute bottom of the page */}
      <footer className="w-full mt-auto py-5 px-3 sm:px-6 border-t border-slate-900/90 bg-[#06080d] text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-500 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 shrink-0" />
            <span>Grand Royale VIP Entertainment • RNG Provably Fair SHA-256 Simulation</span>
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-slate-600">
            <button
              onClick={() => setShowCertificates(true)}
              className="hover:text-amber-400/80 transition-colors"
            >
              Fair Play & License
            </button>
            <span>•</span>
            <button
              onClick={() => setShowStore(true)}
              className="hover:text-emerald-400/80 transition-colors"
            >
              Cashier
            </button>
            <span>•</span>
            {/* Discreet Admin link placed at the very end so normal users do not notice it */}
            <button
              id="footer-admin-discreet-btn"
              onClick={handleOpenAdmin}
              title="System Terminal"
              className="text-slate-800/40 hover:text-slate-500 transition-colors text-[9px] tracking-widest uppercase"
            >
              Sys
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals & Live Feed Overlays */}
      <DailyBonusModal />
      <StatsModal />
      <BigWinModal />
      <VipClubModal
        isOpen={showVipClub}
        onClose={() => setShowVipClub(false)}
      />
      <LiveCasinoChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
      <CertificatesModal
        isOpen={showCertificates}
        onClose={() => setShowCertificates(false)}
      />
      <ChipStoreModal
        isOpen={showStore}
        onClose={() => setShowStore(false)}
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
