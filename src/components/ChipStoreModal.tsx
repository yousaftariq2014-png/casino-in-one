import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { CHIP_PACKAGES, ChipPackage } from '../data/packages';
import { sound } from '../utils/audio';
import {
  X,
  Coins,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  Clock,
  AlertCircle,
  History,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';

interface ChipStoreModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ChipStoreModal: React.FC<ChipStoreModalProps> = ({ isOpen, onClose }) => {
  const { showStoreModal, setShowStoreModal, recordDeposit, depositOrders, playerName } = useCasino();

  const [activeTab, setActiveTab] = useState<'store' | 'history'>('store');
  const [selectedPkg, setSelectedPkg] = useState<ChipPackage>(CHIP_PACKAGES[1]); // Default to $20 pack
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'crypto_usdt' | 'card'>('jazzcash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [submittedOrder, setSubmittedOrder] = useState<{
    id: string;
    chips: number;
    amountUsd: number;
    method: string;
    account: string;
    txRef: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const isVisible = isOpen !== undefined ? isOpen : showStoreModal;

  if (!isVisible) return null;

  const totalChips = selectedPkg.chips + selectedPkg.bonusChips;

  // Filter player orders
  const playerOrders = depositOrders.filter(
    (o) => o.player.toLowerCase() === playerName.toLowerCase() || o.player === 'VIP Guest #8821'
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentMethod === 'jazzcash' || paymentMethod === 'easypaisa') {
      if (!accountNumber.trim()) {
        setErrorMsg('Please enter your sender mobile account number');
        return;
      }
      if (!transactionRef.trim()) {
        setErrorMsg('Please enter the Transaction ID (TID) from your confirmation SMS');
        return;
      }
    } else if (paymentMethod === 'crypto_usdt') {
      if (!accountNumber.trim() && !transactionRef.trim()) {
        setErrorMsg('Please enter your USDT Sender Address or Transaction Hash');
        return;
      }
    }

    setIsProcessing(true);
    sound.playChip();

    setTimeout(() => {
      setIsProcessing(false);

      const generatedTx = transactionRef.trim() || `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      const senderInfo = accountNumber.trim() || (paymentMethod === 'crypto_usdt' ? 'TRC20 Wallet' : 'Online Visa/Mastercard');

      // Submit strictly as PENDING! Chips will ONLY be credited when Admin approves.
      recordDeposit({
        player: playerName,
        packageTitle: `${selectedPkg.name} ($${selectedPkg.priceUsd})`,
        amountUsd: selectedPkg.priceUsd,
        chipsAmount: totalChips,
        paymentMethod,
        accountOrWallet: senderInfo,
        status: 'pending',
        txRef: generatedTx,
      });

      setSubmittedOrder({
        id: `DEP-${Date.now().toString().slice(-6)}`,
        chips: totalChips,
        amountUsd: selectedPkg.priceUsd,
        method: paymentMethod,
        account: senderInfo,
        txRef: generatedTx,
      });
    }, 1000);
  };

  const handleClose = () => {
    if (onClose) onClose();
    setShowStoreModal(false);
    setSubmittedOrder(null);
    setIsProcessing(false);
    setErrorMsg('');
    setActiveTab('store');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(212,175,55,0.25)] max-h-[92vh] overflow-y-auto no-scrollbar">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
              <div className="w-full h-full rounded-[14px] bg-[#0c1017] flex items-center justify-center">
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif-luxury gold-gradient-text">
                VIP Chips Cashier
              </h2>
              <p className="text-xs text-slate-400">
                JazzCash, EasyPaisa, USDT & Card • Manual Admin Verification Required
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('store');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'store'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Buy Chips
            </button>
            <button
              onClick={() => {
                sound.playChip();
                setActiveTab('history');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>My Orders ({playerOrders.length})</span>
            </button>
          </div>
        </div>

        {/* TAB 1: BUY CHIPS & STORE */}
        {activeTab === 'store' && (
          <>
            {!submittedOrder ? (
              <form onSubmit={handleSubmitDeposit}>
                
                {/* Important Notice: Admin Approval Required */}
                <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block">Security Policy: Admin Approval Required</strong>
                    <span>
                      کوئی بھی چپس بغیر ایڈمن کی تصدیق کے خود بخود اکاؤنٹ میں شامل نہیں ہوں گی۔ پیمنٹ بھیجنے کے بعد درخواست جمع کرائیں، ایڈمن کی منظوری کے بعد چپس فوراً کریڈٹ ہو جائیں گی۔
                    </span>
                  </div>
                </div>

                {/* Step 1: Select Package */}
                <div className="space-y-3 mb-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center justify-between">
                    <span>1. Select Chip Package</span>
                    <span className="text-[11px] text-slate-400 font-normal">All packs include VIP instant bonus</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {CHIP_PACKAGES.map((pkg) => {
                      const isSelected = selectedPkg.id === pkg.id;
                      const total = pkg.chips + pkg.bonusChips;
                      return (
                        <button
                          type="button"
                          key={pkg.id}
                          onClick={() => {
                            sound.playChip();
                            setSelectedPkg(pkg);
                          }}
                          className={`relative p-3.5 rounded-2xl border text-left transition-all ${
                            isSelected
                              ? 'bg-gradient-to-b from-[#1c2438] to-[#121724] border-amber-400 shadow-lg shadow-amber-500/20 scale-[1.02]'
                              : 'bg-[#10141f] border-slate-800 hover:border-slate-700 hover:bg-[#141a28]'
                          }`}
                        >
                          {pkg.badge && (
                            <span className="absolute -top-2 right-3 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow">
                              {pkg.badge}
                            </span>
                          )}

                          <div className="text-xs font-bold text-slate-400 mb-1">{pkg.name}</div>
                          <div className="text-lg font-black text-white font-serif-luxury leading-tight">
                            ${pkg.priceUsd} <span className="text-xs text-slate-400 font-normal">USD</span>
                          </div>

                          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-300">
                              +{total.toLocaleString()} Chips
                            </span>
                            {pkg.bonusChips > 0 && (
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                +{pkg.bonusChips.toLocaleString()} Free
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Payment Method */}
                <div className="space-y-3 mb-5">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    2. Select Deposit Payment Gateway
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('jazzcash')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'jazzcash'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow'
                          : 'bg-[#141926] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-red-500" />
                      <span className="text-xs font-black">JazzCash</span>
                      <span className="text-[9px] text-slate-400">Mobile Account</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('easypaisa')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'easypaisa'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow'
                          : 'bg-[#141926] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-black">EasyPaisa</span>
                      <span className="text-[9px] text-slate-400">Instant Wallet</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('crypto_usdt')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'crypto_usdt'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow'
                          : 'bg-[#141926] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-teal-400" />
                      <span className="text-xs font-black">USDT (Crypto)</span>
                      <span className="text-[9px] text-slate-400">TRON TRC-20</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-amber-500/15 border-amber-400 text-amber-300 shadow'
                          : 'bg-[#141926] border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-sky-400" />
                      <span className="text-xs font-black">Credit/Debit</span>
                      <span className="text-[9px] text-slate-400">Visa / Mastercard</span>
                    </button>
                  </div>
                </div>

                {/* Step 3: Gateway Instructions & Transaction ID Input */}
                <div className="p-4 rounded-2xl bg-[#141926] border border-amber-500/20 mb-5 space-y-3">
                  {paymentMethod === 'jazzcash' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Send JazzCash To Account:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-amber-300 font-mono text-sm">0300-8492019</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('03008492019')}
                            className="text-slate-400 hover:text-amber-300 p-1"
                            title="Copy Number"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        Account Title: <strong className="text-white">Grand Royale VIP Cashier</strong>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Your Sender Mobile Number:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 0301-1234567"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Transaction ID (TID from SMS):
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. TID 9874102948"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'easypaisa' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Send EasyPaisa To Account:</span>
                        <div className="flex items-center gap-1.5">
                          <strong className="text-amber-300 font-mono text-sm">0345-7654321</strong>
                          <button
                            type="button"
                            onClick={() => handleCopy('03457654321')}
                            className="text-slate-400 hover:text-amber-300 p-1"
                            title="Copy Number"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        Account Title: <strong className="text-white">Grand Royale VIP Cashier</strong>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            Your EasyPaisa Sender Number:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 0345-1234567"
                            value={accountNumber}
                            onChange={(e) => setAccountNumber(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">
                            TRX ID / Reference Number:
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. TRX 8492019482"
                            value={transactionRef}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'crypto_usdt' && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Official TRC-20 Address:</span>
                        <button
                          type="button"
                          onClick={() => handleCopy('TXz8hQ2V9sN1uP7L5kR4wE6mB9aC3dF8gY')}
                          className="text-amber-300 hover:underline flex items-center gap-1 text-[11px]"
                        >
                          {copied ? 'Copied!' : 'Copy Address'}
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-950 font-mono text-[11px] text-teal-300 break-all border border-slate-800">
                        TXz8hQ2V9sN1uP7L5kR4wE6mB9aC3dF8gY
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-400 block mb-1">
                          Your Sender USDT Wallet Address or TxHash:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 0x... or TXz... (Sender Address)"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'card' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="text-slate-400">Card Payment Verification:</div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Cardholder Full Name"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          className="col-span-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="Card Number: 4242 •••• •••• 4242"
                          className="col-span-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                        <input
                          type="text"
                          placeholder="CVC"
                          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="mb-4 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Summary & Submit Button */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div>
                    <div className="text-xs text-slate-400">Total Chips to Credit:</div>
                    <div className="text-xl font-black text-amber-300 font-serif-luxury">
                      +{totalChips.toLocaleString()} Chips
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="submit-deposit-btn"
                    disabled={isProcessing}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Submitting Request...</span>
                    ) : (
                      <>
                        <span>Submit Deposit for Admin Approval</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              /* Awaiting Admin Approval View */
              <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
                  <Clock className="w-9 h-9 animate-pulse" />
                </div>

                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-black uppercase tracking-wider mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Admin Approval</span>
                  </span>

                  <h3 className="text-2xl font-black font-serif-luxury text-white">
                    Deposit Request Submitted!
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                    آپ کی پیمنٹ کی تفصیلات ایڈمن تصدیقی پینل میں منتقل ہو گئی ہیں۔ ایڈمن کی تصدیق ہوتے ہی <strong>+{submittedOrder.chips.toLocaleString()} چپس</strong> خود بخود آپ کے بیلنس میں شامل ہو جائیں گی!
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#141926] border border-amber-500/30 max-w-md mx-auto text-left text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Order Reference ID:</span>
                    <span className="font-mono font-bold text-amber-300">{submittedOrder.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Player Name:</span>
                    <span className="font-bold text-white">{playerName}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Package Amount:</span>
                    <span className="font-bold text-white">${submittedOrder.amountUsd}.00 USD</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Chips to Credit:</span>
                    <span className="font-bold text-amber-300">+{submittedOrder.chips.toLocaleString()} Chips</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Payment Method:</span>
                    <span className="font-bold text-white uppercase">{submittedOrder.method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Sender Info:</span>
                    <span className="font-mono text-slate-300 text-[11px]">{submittedOrder.account}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Transaction / TID:</span>
                    <span className="font-mono text-slate-300 text-[11px]">{submittedOrder.txRef}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Approval Status:</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase">
                      ⏳ Pending Admin Verification
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedOrder(null);
                      setActiveTab('history');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                  >
                    View My Orders Status
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 shadow transition-all"
                  >
                    Back to Casino
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB 2: MY DEPOSIT ORDERS HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span>Your Deposit Requests & Status</span>
              </h3>
              <span className="text-xs text-slate-400">
                Track pending approvals in real-time
              </span>
            </div>

            {playerOrders.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <FileText className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-xs">No deposit orders found yet.</p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="text-xs font-bold text-amber-400 hover:underline"
                >
                  Buy Chips Now
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {playerOrders.map((order) => {
                  const isPending = order.status === 'pending';
                  const isApproved = order.status === 'completed';
                  const isRejected = order.status === 'rejected';

                  return (
                    <div
                      key={order.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        isPending
                          ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                          : isApproved
                          ? 'bg-[#121824] border-emerald-500/30'
                          : 'bg-[#161218] border-rose-500/30'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-white">{order.id}</span>
                            <span className="text-[10px] text-slate-400">
                              {order.timestamp} • {order.date}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-300">
                            {order.packageTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Method: <span className="uppercase text-slate-200">{order.paymentMethod.replace('_', ' ')}</span> • TID: <span className="text-amber-300">{order.txRef}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col sm:items-end justify-between items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          <span className="text-xs font-black text-amber-300 font-serif-luxury">
                            +{order.chipsAmount.toLocaleString()} Chips
                          </span>

                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase">
                              <Clock className="w-3 h-3 animate-spin" />
                              <span>Pending Admin Approval</span>
                            </span>
                          )}

                          {isApproved && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Approved & Credited</span>
                            </span>
                          )}

                          {isRejected && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase">
                              <XCircle className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
