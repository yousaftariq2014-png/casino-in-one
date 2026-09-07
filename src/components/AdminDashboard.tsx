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
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  AlertTriangle,
  Check,
  ShieldCheck,
  BellRing,
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
    approveDepositOrder,
    rejectDepositOrder,
    clearGameLogs,
    recordGameRound,
    playerName,
    setPlayerName,
  } = useCasino();

  // Admin Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('royal_casino_admin_auth') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  // Change Password State (in Settings tab)
  const [currentPw, setCurrentPw] = useState<string>('');
  const [newPw, setNewPw] = useState<string>('');
  const [confirmPw, setConfirmPw] = useState<string>('');
  const [pwChangeMessage, setPwChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Notification Toast for actions
  const [toastMessage, setToastMessage] = useState<string>('');

  // Dashboard Tabs & Filters
  const [activeTab, setActiveTab] = useState<'rounds' | 'deposits' | 'settings'>('deposits');
  const [selectedGameFilter, setSelectedGameFilter] = useState<string>('all');
  const [selectedOutcomeFilter, setSelectedOutcomeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [manualCreditAmount, setManualCreditAmount] = useState<number>(10000);
  const [customGrantNote, setCustomGrantNote] = useState<string>('VIP Loyalty Reward');

  // Helper for stored password
  const getStoredPassword = (): string => {
    return localStorage.getItem('royal_casino_admin_password') || 'admin786';
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const correctPassword = getStoredPassword();
      if (passwordInput.trim() === correctPassword) {
        sessionStorage.setItem('royal_casino_admin_auth', 'true');
        setIsAuthenticated(true);
        setPasswordInput('');
        sound.playWin();
      } else {
        setAuthError('Incorrect Admin Password! Access Denied (غلط پاس ورڈ)');
        sound.playLose();
      }
      setIsAuthenticating(false);
    }, 400);
  };

  // Logout / Lock console
  const handleLogout = () => {
    sound.playChip();
    sessionStorage.removeItem('royal_casino_admin_auth');
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Password update handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwChangeMessage(null);

    const stored = getStoredPassword();
    if (currentPw !== stored) {
      setPwChangeMessage({ type: 'error', text: 'Current password does not match!' });
      return;
    }
    if (newPw.length < 4) {
      setPwChangeMessage({ type: 'error', text: 'New password must be at least 4 characters long.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwChangeMessage({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    localStorage.setItem('royal_casino_admin_password', newPw);
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setPwChangeMessage({ type: 'success', text: 'Admin Password updated successfully! Keep it safe.' });
    sound.playWin();
  };

  // Deposit Approvals
  const pendingOrders = depositOrders.filter((o) => o.status === 'pending');
  const completedOrders = depositOrders.filter((o) => o.status === 'completed');

  const handleApprove = (orderId: string, chips: number, player: string) => {
    approveDepositOrder(orderId);
    showToast(`Order #${orderId} Approved! +${chips.toLocaleString()} Chips credited to ${player}.`);
  };

  const handleReject = (orderId: string) => {
    rejectDepositOrder(orderId, 'Declined by Admin Verification');
    showToast(`Order #${orderId} has been Rejected.`);
  };

  // Calculate Metrics from Game Logs
  const totalRounds = gameLogs.length;
  const totalWagered = gameLogs.reduce((sum, log) => sum + log.betAmount, 0);
  const totalPayouts = gameLogs.reduce((sum, log) => sum + log.payoutAmount, 0);
  const houseNetProfit = totalWagered - totalPayouts;
  const houseMarginPct = totalWagered > 0 ? ((houseNetProfit / totalWagered) * 100).toFixed(1) : '0.0';

  // Total Real Money Cashier Volume
  const totalUsdDeposits = completedOrders.reduce((sum, order) => sum + order.amountUsd, 0);
  const totalChipsSold = completedOrders.reduce((sum, order) => sum + order.chipsAmount, 0);

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

  // ==========================================
  // VIEW 1: ADMIN LOGIN PASSWORD SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-md bg-[#0c1018] border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(212,175,55,0.2)]">
          
          {/* Header Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 mx-auto mb-5 shadow-lg shadow-amber-500/25">
            <div className="w-full h-full rounded-[14px] bg-[#0c1018] flex items-center justify-center">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
          </div>

          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl sm:text-2xl font-black font-serif-luxury gold-gradient-text uppercase tracking-wide">
              Grand Royale Admin
            </h2>
            <p className="text-xs text-slate-400">
              Executive Cashier & Deposit Approvals Terminal
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-[10px] font-bold text-amber-300 mt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Password Authentication Required</span>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Admin Master Password:</span>
                <span className="text-[10px] text-amber-400 font-mono">پاس ورڈ درج کریں</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password-input"
                  required
                  autoFocus
                  placeholder="Enter admin password..."
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (authError) setAuthError('');
                  }}
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 text-white text-sm placeholder:text-slate-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-shake">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            {/* Default Password Hint for Owner */}
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Default Admin Password:</span>
              <code className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">admin786</code>
            </div>

            <button
              type="submit"
              id="unlock-admin-btn"
              disabled={isAuthenticating}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isAuthenticating ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <Key className="w-4 h-4 text-slate-950" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Casino Floor */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleExit}
              className="text-xs text-slate-400 hover:text-amber-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Casino Games Floor</span>
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // ==========================================
  return (
    <div id="admin-dashboard-container" className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl bg-emerald-950/90 border border-emerald-400/60 text-emerald-300 shadow-2xl flex items-center gap-2.5 text-xs font-bold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-amber-500/30 bg-[#0a0e17]/95 backdrop-blur-md shadow-xl px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Casino</span>
          </button>

          <div className="h-5 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black font-serif-luxury gold-gradient-text tracking-wide uppercase">
                Owner Central Command & Approvals
              </h1>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live Terminal Active • Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Right Info: Pending Badge & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {pendingOrders.length > 0 && (
            <button
              onClick={() => setActiveTab('deposits')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black animate-pulse"
            >
              <BellRing className="w-3.5 h-3.5 text-amber-400" />
              <span>{pendingOrders.length} Pending Approval{pendingOrders.length > 1 ? 's' : ''}!</span>
            </button>
          )}

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141926] border border-amber-500/20 text-xs">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 hidden sm:inline">Player:</span>
            <strong className="text-white">{playerName}</strong>
            <span className="text-slate-600">|</span>
            <span className="text-amber-300 font-black">${balance.toLocaleString()} Chips</span>
          </div>

          <button
            onClick={handleLogout}
            title="Lock Console and Logout"
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lock / Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Pending Approvals Metric */}
          <div className={`p-4 rounded-2xl border shadow-lg transition-all ${
            pendingOrders.length > 0 
              ? 'bg-amber-950/20 border-amber-400/60 shadow-amber-500/10' 
              : 'bg-[#0f1420] border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Pending Approvals</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className={`text-xl font-black font-serif-luxury ${pendingOrders.length > 0 ? 'text-amber-300 animate-pulse' : 'text-slate-400'}`}>
              {pendingOrders.length} Orders
            </div>
            <span className="text-[10px] text-slate-400">Needs Admin Action</span>
          </div>

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
              <Crown className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-yellow-400">
              {houseMarginPct}%
            </div>
            <span className="text-[10px] text-slate-400">Actual Realized Hold</span>
          </div>

          {/* Cashier Approved Revenue */}
          <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase mb-1">
              <span>Real Deposits</span>
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black font-serif-luxury text-emerald-400">
              ${totalUsdDeposits}.00
            </div>
            <span className="text-[10px] text-slate-400">Approved Payments</span>
          </div>

        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            
            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('deposits');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'deposits'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-[#111520] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Cashier & Approvals</span>
              {pendingOrders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                  {pendingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('rounds');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'rounds'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-[#111520] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Game Rounds Telemetry ({totalRounds})</span>
            </button>

            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('settings');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'settings'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-[#111520] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>RTP & Password Settings</span>
            </button>

          </div>

          <div className="text-xs text-slate-400 font-mono">
            Active RTP Preset: <strong className="text-amber-300 uppercase">{houseRtpPreset.replace('_', ' ')}</strong>
          </div>
        </div>

        {/* ==========================================
            TAB: CASHIER DEPOSITS & APPROVALS
           ========================================== */}
        {activeTab === 'deposits' && (
          <div className="space-y-6">
            
            {/* 1. Dedicated Pending Approvals Section */}
            <div className="p-5 sm:p-6 rounded-3xl bg-[#0e131e] border-2 border-amber-500/40 shadow-xl space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Clock className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider font-serif-luxury">
                      Pending Deposit Requests (ایڈمن منظوری کے منتظر آرڈرز)
                    </h3>
                    <p className="text-xs text-slate-400">
                      Verify client payment reference (JazzCash / EasyPaisa / USDT / Card) then approve to credit chips
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                    {pendingOrders.length} Request{pendingOrders.length === 1 ? '' : 's'} Waiting
                  </span>
                </div>
              </div>

              {pendingOrders.length === 0 ? (
                <div className="p-8 rounded-2xl bg-[#090c13] border border-slate-800/80 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-75" />
                  <p className="text-sm font-bold text-slate-300">All Deposit Requests Processed</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    There are currently no pending orders waiting for manual approval. When any player submits a deposit via JazzCash, EasyPaisa, or USDT, it will instantly appear here for your approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 sm:p-5 rounded-2xl bg-[#141926] border-2 border-amber-400/50 shadow-lg shadow-amber-500/10 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-mono text-xs font-black">
                            {order.id}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {order.timestamp} • {order.date}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                            ⏳ Pending Approval
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs pt-1">
                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Player Name:</span>
                            <strong className="text-white text-sm">{order.player}</strong>
                          </div>

                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Package & Price:</span>
                            <span className="text-slate-200">{order.packageTitle}</span>
                            <strong className="text-emerald-400 text-sm block">${order.amountUsd}.00 USD</strong>
                          </div>

                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Chips to Credit:</span>
                            <strong className="text-amber-300 text-sm font-serif-luxury font-black">
                              +{order.chipsAmount.toLocaleString()} Chips
                            </strong>
                          </div>

                          <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Payment Method:</span>
                            <span className="text-white font-bold uppercase">{order.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div>
                            <span className="text-slate-400">Sender Account / Mobile: </span>
                            <strong className="text-amber-300 font-mono">{order.accountOrWallet}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Transaction ID (TID / TXID): </span>
                            <strong className="text-teal-300 font-mono">{order.txRef}</strong>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex sm:flex-col items-stretch gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                        <button
                          onClick={() => handleApprove(order.id, order.chipsAmount, order.player)}
                          id={`approve-btn-${order.id}`}
                          className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md shadow-emerald-950/40 flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <CheckCircle className="w-4 h-4 text-slate-950" />
                          <span>Approve & Credit Chips</span>
                        </button>

                        <button
                          onClick={() => handleReject(order.id)}
                          id={`reject-btn-${order.id}`}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Reject Order</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Quick Manual Credit / Debit Tool */}
            <div className="p-5 rounded-3xl bg-[#0f1420] border border-amber-500/30 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-serif-luxury">
                    Admin Manual Chips Grant / Debit Tool
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  Directly grant or remove chips for {playerName}
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
                    Audit Note / Reason:
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
                      showToast(`Granted +${manualCreditAmount.toLocaleString()} chips to ${playerName}`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow"
                  >
                    + Credit Chips
                  </button>

                  <button
                    onClick={() => {
                      adminDebitChips(manualCreditAmount, customGrantNote);
                      showToast(`Debited -${manualCreditAmount.toLocaleString()} chips from ${playerName}`);
                    }}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs uppercase tracking-wider hover:brightness-110 shadow"
                  >
                    - Debit Chips
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Full Deposits Ledger Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1018] overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider font-serif-luxury">
                    Real Money Deposit Transactions Ledger
                  </h3>
                  <p className="text-xs text-slate-400">
                    Complete history of client deposit requests & approval states
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                  Total Approved: ${totalUsdDeposits}.00 USD
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
                      <th className="py-3 px-4">Chips Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Sender / TID</th>
                      <th className="py-3 px-4 text-right">Status & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {depositOrders.map((order) => {
                      const isPending = order.status === 'pending';
                      const isApproved = order.status === 'completed';
                      const isRejected = order.status === 'rejected';

                      return (
                        <tr key={order.id} className={`transition-colors ${isPending ? 'bg-amber-500/5 hover:bg-amber-500/10' : 'hover:bg-slate-900/50'}`}>
                          <td className="py-3 px-4 font-mono text-amber-300 font-bold">{order.id}</td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {order.timestamp} <span className="text-slate-600 block text-[9px]">{order.date}</span>
                          </td>
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
                          <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                            <div>{order.accountOrWallet}</div>
                            <div className="text-[10px] text-amber-400 font-bold">Ref: {order.txRef}</div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApprove(order.id, order.chipsAmount, order.player)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase shadow"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleReject(order.id)}
                                  className="px-2 py-1 rounded-lg bg-rose-950 border border-rose-500/40 text-rose-300 text-[10px] uppercase font-bold"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : isApproved ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                                ✓ Approved
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase">
                                ✕ Rejected
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: GAME ROUNDS TELEMETRY
           ========================================== */}
        {activeTab === 'rounds' && (
          <div className="space-y-4">
            
            {/* Control Bar: Filters & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#0f1420] border border-slate-800">
              
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search logs by ID, player, game..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400 w-52 sm:w-64"
                  />
                </div>

                <select
                  value={selectedGameFilter}
                  onChange={(e) => setSelectedGameFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Games</option>
                  <option value="slots">Neon Slots</option>
                  <option value="roulette">European Roulette</option>
                  <option value="blackjack">Royal Blackjack</option>
                  <option value="plinko">Plinko Galaxy</option>
                  <option value="crash">Crash Rocket</option>
                  <option value="mines">Diamond Mines</option>
                </select>

                <select
                  value={selectedOutcomeFilter}
                  onChange={(e) => setSelectedOutcomeFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Outcomes</option>
                  <option value="win">Wins Only</option>
                  <option value="loss">Losses Only</option>
                  <option value="push">Push / Tie</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => {
                    sound.playChip();
                    if (confirm('Are you sure you want to clear telemetry game logs?')) {
                      clearGameLogs();
                      showToast('Telemetry logs cleared.');
                    }
                  }}
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear Telemetry Logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Rounds Table */}
            <div className="rounded-2xl border border-slate-800 bg-[#0c1018] overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#121622] text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="py-3 px-4">Round ID</th>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Player</th>
                      <th className="py-3 px-4">Game</th>
                      <th className="py-3 px-4 text-right">Wager</th>
                      <th className="py-3 px-4 text-right">Multiplier</th>
                      <th className="py-3 px-4 text-right">Payout</th>
                      <th className="py-3 px-4 text-right">House Net Profit</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredLogs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                          No game rounds matched your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLogs.map((log) => {
                        const isHouseProfit = log.houseProfit > 0;
                        const isPlayerWin = log.outcome === 'win';

                        return (
                          <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="py-3 px-4 font-mono text-amber-300 font-bold">{log.id}</td>
                            <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                            <td className="py-3 px-4 text-white font-bold">{log.player}</td>
                            <td className="py-3 px-4 text-slate-300">{log.gameName}</td>
                            <td className="py-3 px-4 text-right font-mono text-slate-200">${log.betAmount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-400">
                              {log.multiplier > 0 ? `${log.multiplier.toFixed(2)}x` : '—'}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-slate-200">
                              ${log.payoutAmount.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-black">
                              <span className={isHouseProfit ? 'text-emerald-400' : isPlayerWin ? 'text-rose-400' : 'text-slate-400'}>
                                {isHouseProfit ? `+$${log.houseProfit.toLocaleString()}` : log.houseProfit < 0 ? `-$${Math.abs(log.houseProfit).toLocaleString()}` : '$0'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">{log.details || '—'}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="p-4 rounded-2xl bg-[#0f1420] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">
                Simulate Live Round Test to verify Telemetry Engine:
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

        {/* ==========================================
            TAB: HOUSE RTP & ADMIN PASSWORD SETTINGS
           ========================================== */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            
            {/* 1. Admin Password Management Form */}
            <div className="p-6 rounded-3xl bg-[#0f1420] border border-amber-500/40 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider font-serif-luxury">
                    Change Admin Master Password (ایڈمن پاس ورڈ تبدیل کریں)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Set a confidential password to protect your approvals and cashier console
                  </p>
                </div>
              </div>

              {pwChangeMessage && (
                <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  pwChangeMessage.type === 'success'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                }`}>
                  {pwChangeMessage.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{pwChangeMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Current Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password..."
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    New Master Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password..."
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Confirm New Password:
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password..."
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="sm:col-span-3 flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
                  >
                    Save New Password
                  </button>
                </div>
              </form>
            </div>

            {/* 2. RTP Preset Cards */}
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
                    showToast('RTP Preset updated to High Hold / Max Profit (92.5%)');
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
                    showToast('RTP Preset updated to Vegas Certified (97.0%)');
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    houseRtpPreset === 'standard'
                      ? 'bg-amber-500/15 border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                      : 'bg-[#121724] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                      Vegas Certified (Standard)
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
                    showToast('RTP Preset updated to Player Promo Magnet (99.2%)');
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

            {/* 3. Mathematical Mechanics Breakdown */}
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
