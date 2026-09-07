import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { GameLogEntry, GameType, HouseRtpPreset } from '../types';
import { sound } from '../utils/audio';
import {
  ShieldAlert,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Activity,
  Layers,
  Users,
  Search,
  Download,
  Trash2,
  PlusCircle,
  Sliders,
  CheckCircle,
  XCircle,
  Coins,
  RefreshCw,
  Wallet,
  Smartphone,
  QrCode,
  CreditCard,
  Crown,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToCasino?: () => void;
  onExit?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToCasino, onExit }) => {
  const handleExit = () => {
    sound.playChip();
    if (onBackToCasino) {
      onBackToCasino();
    } else if (onExit) {
      onExit();
    }
  };
  const {
    gameLogs,
    depositOrders,
    balance,
    stats,
    houseRtpPreset,
    setHouseRtpPreset,
    adminCreditChips,
    adminDebitChips,
    clearGameLogs,
    recordGameRound,
    playerName,
    setPlayerName,
  } = useCasino();

  const [activeTab, setActiveTab] = useState<'rounds' | 'deposits' | 'settings'>('rounds');
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [manualCreditAmount, setManualCreditAmount] = useState<number>(10000);
  const [customGrantNote, setCustomGrantNote] = useState<string>('VIP Loyalty Reward');

  // Calculate Metrics from Game Logs
  const totalRounds = gameLogs.length;
  const totalWagered = gameLogs.reduce((sum, log) => sum + log.betAmount, 0);
  const totalPayouts = gameLogs.reduce((sum, log) => sum + log.payoutAmount, 0);
  const houseNetProfit = totalWagered - totalPayouts;
  const houseMarginPct = totalWagered > 0 ? ((houseNetProfit / totalWagered) * 100).toFixed(1) : '0.0';

  // Total Real Money Cashier Volume
  const totalUsdDeposits = depositOrders.reduce((sum, order) => sum + order.amountUsd, 0);
  const totalChipsSold = depositOrders.reduce((sum, order) => sum + order.chipsAmount, 0);

  // Filter logs
  const filteredLogs = gameLogs.filter((log) => {
    if (selectedGameFilter !== 'all' && log.game !== selectedGameFilter) return false;
    if (selectedOutcomeFilter !== 'all' && log.outcome !== selectedOutcomeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchesId = log.id.toLowerCase().includes(q);
      const matchesPlayer = log.player.toLowerCase().includes(q);
      const matchesGame = log.gameName.toLowerCase().includes(q);
      const matchesDetails = (log.details || '').toLowerCase().includes(q);
      if (!matchesId && !matchesPlayer && !matchesGame && !matchesDetails) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExportCSV = () => {
    sound.playChip();
    const headers = ['Round ID', 'Date', 'Time', 'Player', 'Game', 'Bet Amount', 'Payout Amount', 'Multiplier', 'Outcome', 'House Profit', 'Details'];
    const rows = gameLogs.map((l) => [
      l.id,
      l.date,
      l.timestamp,
      `"${l.player}"`,
      l.gameName,
      l.betAmount,
      l.payoutAmount,
      l.multiplier,
      l.outcome,
      l.houseProfit,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `casino_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add a sample test round to verify telemetry
  const handleAddSampleRound = (type: 'win' | 'loss') => {
    sound.playChip();
    if (type === 'loss') {
      recordGameRound({
        game: 'roulette',
        gameName: 'European Roulette',
        bet: 200,
        payout: 0,
        multiplier: 0,
        outcome: 'loss',
        details: 'Admin Live Simulation: Ball landed on 26 Black',
      });
    } else {
      recordGameRound({
        game: 'slots',
        gameName: 'Neon Slots',
        bet: 100,
        payout: 500,
        multiplier: 5.0,
        outcome: 'win',
        details: 'Admin Live Simulation: 4x Clover Hit (+5.0x)',
      });
    }
  };

  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/30 bg-[#0a0e17]/95 backdrop-blur-md shadow-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Casino Floor</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black font-serif-luxury gold-gradient-text tracking-wide uppercase">
                Owner Central Command & Telemetry
              </h1>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Feed Active • Curacao #8048 Certified
              </span>
            </div>
          </div>
        </div>

        {/* Right Info: Current Player Bankroll */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141926] border border-amber-500/20 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Client:</span>
            <strong className="text-white">{playerName}</strong>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-black">${balance.toLocaleString()} Chips</span>
          </div>

          <button
            onClick={handleExit}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-amber-500/20"
          >
            Play Games
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* House Net Profit */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-amber-500/30 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>House GGR Profit</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className={`text-xl font-black font-serif-luxury ${houseNetProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {houseNetProfit >= 0 ? `+$${houseNetProfit.toLocaleString()}` : `-$${Math.abs(houseNetProfit).toLocaleString()}`}
            </div>
            <span className="text-[10px] text-slate-400">Owner Net Earnings</span>
          </div>

          {/* Total Turnover */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Total Wagered</span>
              <Activity className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-white">
              ${totalWagered.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Total Betting Volume</span>
          </div>

          {/* Total Payouts */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Total Payouts</span>
              <Coins className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-sky-400">
              ${totalPayouts.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-400">Client Cashouts</span>
          </div>

          {/* House Hold Margin */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>House Hold %</span>
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-amber-300">
              {houseMarginPct}%
            </div>
            <span className="text-[10px] text-slate-400">Mathematical Margin</span>
          </div>

          {/* Cashier Real USD Volume */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-emerald-500/30 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Cashier Revenue</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-emerald-400">
              ${totalUsdDeposits}.00 <span className="text-xs font-normal">USD</span>
            </div>
            <span className="text-[10px] text-slate-400">Real Money Deposited</span>
          </div>

          {/* Rounds Counter */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Logged Rounds</span>
              <Layers className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-white">
              {totalRounds}
            </div>
            <span className="text-[10px] text-slate-400">Full Audit History</span>
          </div>

        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('rounds');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rounds'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Game Rounds ({gameLogs.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('deposits');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'deposits'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Cashier & Deposits ({depositOrders.length})</span>
          </button>

          <button
            onClick={() => {
              sound.playChip();
              setActiveTab('settings');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>House RTP & Rigging Controls</span>
          </button>
        </div>

        {/* TAB 1: LIVE GAME TELEMETRY LOGS */}
        {activeTab === 'rounds' && (
          <div className="space-y-4">
            
            {/* Filter and Action Bar */}
            <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
              
              {/* Search input */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search round ID, player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Game Filter */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Games</option>
                  <option value="slots">🎰 Neon Slots</option>
                  <option value="roulette">🎡 European Roulette</option>
                  <option value="blackjack">♠️ Blackjack 21</option>
                  <option value="plinko">⚡ Plinko Galaxy</option>
                  <option value="crash">🚀 Crash Rocket</option>
                  <option value="mines">💎 Diamond Mines</option>
                </select>

                <select
                  value={selectedOutcomeFilter}
                  onChange={(e) => setSelectedOutcomeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs font-bold focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Outcomes</option>
                  <option value="win">🟢 Player Won</option>
                  <option value="loss">🔴 Player Lost (House Won)</option>
                  <option value="push">⚪ Push / Tie</option>
                </select>

                {/* Export Button */}
                <button
                  onClick={handleExportCSV}
                  title="Download all telemetry records to CSV spreadsheet"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold border border-slate-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>

                {/* Clear Button */}
                <button
                  onClick={() => {
                    if (confirm('Clear all game round records from memory?')) {
                      clearGameLogs();
                    }
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-xs font-bold border border-rose-800 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

            </div>

            {/* Live Telemetry Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1018] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#121622] text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Time / Date</th>
                      <th className="py-3 px-4">Round ID</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Game</th>
                      <th className="py-3 px-4">Wager</th>
                      <th className="py-3 px-4">Payout</th>
                      <th className="py-3 px-4">Multiplier</th>
                      <th className="py-3 px-4">Result</th>
                      <th className="py-3 px-4 text-right">House Profit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          No game rounds found matching criteria. Play any game in the lobby to see live telemetry!
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isWin = log.outcome === 'win';
                        const isLoss = log.outcome === 'loss';
                        const isHouseProfit = log.houseProfit > 0;

                        return (
                          <tr key={log.id} className="hover:bg-slate-900/50 transition-colors font-medium">
                            {/* Time */}
                            <td className="py-3 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                              {log.timestamp} <span className="text-slate-600 block text-[9px]">{log.date}</span>
                            </td>

                            {/* Round ID */}
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-amber-300/90 text-[11px]">
                              {log.id}
                            </td>

                            {/* Player */}
                            <td className="py-3 px-4 whitespace-nowrap text-white font-bold">
                              {log.player}
                            </td>

                            {/* Game */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold">
                                {log.gameName}
                              </span>
                              {log.details && (
                                <span className="block text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">
                                  {log.details}
                                </span>
                              )}
                            </td>

                            {/* Bet */}
                            <td className="py-3 px-4 whitespace-nowrap text-slate-200 font-bold">
                              ${log.betAmount.toLocaleString()}
                            </td>

                            {/* Payout */}
                            <td className="py-3 px-4 whitespace-nowrap text-slate-200">
                              {log.payoutAmount > 0 ? (
                                <span className="text-emerald-400 font-bold">+${log.payoutAmount.toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-500">$0</span>
                              )}
                            </td>

                            {/* Multiplier */}
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                              {log.multiplier.toFixed(2)}x
                            </td>

                            {/* Result */}
                            <td className="py-3 px-4 whitespace-nowrap">
                              {isWin ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>Player Won</span>
                                </span>
                              ) : isLoss ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
                                  <XCircle className="w-3 h-3" />
                                  <span>House Won</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                                  <span>Push</span>
                                </span>
                              )}
                            </td>

                            {/* House Profit */}
                            <td className="py-3 px-4 whitespace-nowrap text-right font-black font-serif-luxury text-sm">
                              {isHouseProfit ? (
                                <span className="text-emerald-400">+${log.houseProfit.toLocaleString()}</span>
                              ) : log.houseProfit < 0 ? (
                                <span className="text-rose-400">-${Math.abs(log.houseProfit).toLocaleString()}</span>
                              ) : (
                                <span className="text-slate-500">$0</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Owner Quick Test Controls */}
            <div className="p-3.5 rounded-2xl bg-[#0f1420] border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">
                Want to test telemetry stream? Add a sample round directly to test the feed:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddSampleRound('loss')}
                  className="px-3 py-1 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 font-bold hover:bg-emerald-900/40"
                >
                  + Simulate House Win ($200)
                </button>
                <button
                  onClick={() => handleAddSampleRound('win')}
                  className="px-3 py-1 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-500/30 font-bold hover:bg-rose-900/40"
                >
                  + Simulate Player Win ($500)
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CASHIER DEPOSITS & PAYMENTS */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            
            {/* Quick Manual Credit Console */}
            <div className="p-5 rounded-3xl bg-[#0f1420] border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-serif-luxury">
                    Admin Manual Chips Grant / Debit Tool
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Directly manage player's bankroll without payment gateway
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Chips Amount:
                  </label>
                  <input
                    type="number"
                    value={manualCreditAmount}
                    onChange={(e) => setManualCreditAmount(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
                    Grant Reason / Audit Note:
                  </label>
                  <input
                    type="text"
                    value={customGrantNote}
                    onChange={(e) => setCustomGrantNote(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      adminCreditChips(manualCreditAmount, customGrantNote);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow"
                  >
                    + Credit Chips
                  </button>

                  <button
                    onClick={() => {
                      adminDebitChips(manualCreditAmount, customGrantNote);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow"
                  >
                    - Debit Chips
                  </button>
                </div>
              </div>
            </div>

            {/* Deposits Ledger Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1018] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-serif-luxury">
                    Real Money Deposit Transactions Ledger
                  </h3>
                  <p className="text-xs text-slate-400">
                    Client orders placed via JazzCash, EasyPaisa, USDT Crypto & Card
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Total Collected: ${totalUsdDeposits}.00 USD
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#121622] text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Order ID</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Package</th>
                      <th className="py-3 px-4">Amount USD</th>
                      <th className="py-3 px-4">Chips Granted</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Sender / Wallet</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {depositOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-mono text-amber-300 font-bold">{order.id}</td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{order.timestamp} <span className="text-slate-600 block text-[9px]">{order.date}</span></td>
                        <td className="py-3 px-4 text-white font-bold">{order.player}</td>
                        <td className="py-3 px-4 text-slate-300">{order.packageTitle}</td>
                        <td className="py-3 px-4 font-black font-serif-luxury text-emerald-400 text-sm">
                          ${order.amountUsd}.00
                        </td>
                        <td className="py-3 px-4 font-black text-amber-300">
                          +{order.chipsAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold uppercase text-[10px]">
                            {order.paymentMethod.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {order.accountOrWallet}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: HOUSE RTP & RIGGING CONTROLS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* RTP Preset Cards */}
            <div className="p-6 rounded-3xl bg-[#0f1420] border border-amber-500/30 shadow-xl space-y-5">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-serif-luxury gold-gradient-text">
                  Casino Mathematical RTP & House Edge Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjust the global Return to Player (RTP) algorithm that controls casino hold and profitability.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* High Profit Mode */}
                <div
                  onClick={() => {
                    sound.playChip();
                    setHouseRtpPreset('high_profit');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    houseRtpPreset === 'high_profit'
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-[#121724] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      High Hold / Max Profit
                    </span>
                    {houseRtpPreset === 'high_profit' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white font-serif-luxury mb-1">
                    92.5% RTP
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    House Edge: <strong>7.5%</strong>. High house profit retention. Ideal for maximizing daily net GGR revenue.
                  </p>
                </div>

                {/* Standard Vegas Mode */}
                <div
                  onClick={() => {
                    sound.playChip();
                    setHouseRtpPreset('standard');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    houseRtpPreset === 'standard'
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-[#121724] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Vegas Certified (Recommended)
                    </span>
                    {houseRtpPreset === 'standard' && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white font-serif-luxury mb-1">
                    97.0% RTP
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    House Edge: <strong>3.0%</strong>. True Monte Carlo European standards. High player engagement and steady house gains.
                  </p>
                </div>

                {/* Promotional Magnet Mode */}
                <div
                  onClick={() => {
                    sound.playChip();
                    setHouseRtpPreset('generous');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    houseRtpPreset === 'generous'
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-[#121724] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                      Player Promo Magnet
                    </span>
                    {houseRtpPreset === 'generous' && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-white font-serif-luxury mb-1">
                    99.2% RTP
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    House Edge: <strong>0.8%</strong>. Frequent player wins and high thrill. Great for user acquisition and viral sharing.
                  </p>
                </div>

              </div>

            </div>

            {/* Game Mathematical Mechanics Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0f1420] border border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-serif-luxury">
                Mathematical Margin Breakdown by Game:
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">🎡 European Roulette</div>
                  <p className="text-slate-400">Single Zero (0) gives the house a built-in mathematical 2.70% margin on all outside and inside bets.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">🎰 Neon Slots 5-Reel</div>
                  <p className="text-slate-400">10 Paylines with weighted reel strips. Mathematical volatility calibrated to 96.8% RTP.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">♠️ Royal Blackjack</div>
                  <p className="text-slate-400">Dealer draws to soft-17 and player acts first (double bust rule gives house 1.5% natural edge).</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">🚀 Multiplier Rocket (Crash)</div>
                  <p className="text-slate-400">3.5% instant crash probability at 1.00x creates guaranteed house edge on all flight launches.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">💎 Diamond Mines</div>
                  <p className="text-slate-400">2% mathematical deduction applied to all progressive tile discovery multiplier matrices.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div className="font-bold text-amber-300 mb-1">⚡ Plinko Galaxy</div>
                  <p className="text-slate-400">Binomial Gaussian distribution ensures center buckets (0.2x–0.5x) absorb the majority of ball drops.</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
