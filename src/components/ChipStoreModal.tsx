import React, { useState } from 'react';
import { useCasino } from '../context/CasinoContext';
import { CHIP_PACKAGES, ChipPackage } from '../data/packages';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  X,
  Coins,
  CreditCard,
  QrCode,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
} from 'lucide-react';

export const ChipStoreModal: React.FC = () => {
  const { showStoreModal, setShowStoreModal, recordDeposit, playerName } = useCasino();

  const [selectedPkg, setSelectedPkg] = useState<ChipPackage>(CHIP_PACKAGES[1]); // Default to $20 pack
  const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'jazzcash' | 'crypto_usdt' | 'card'>('jazzcash');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  if (!showStoreModal) return null;

  const totalChips = selectedPkg.chips + selectedPkg.bonusChips;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCompletePurchase = () => {
    setIsProcessing(true);
    sound.playChip();

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      const generatedTx = `TX-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;

      recordDeposit({
        player: playerName,
        packageTitle: `${selectedPkg.name} ($${selectedPkg.priceUsd})`,
        amountUsd: selectedPkg.priceUsd,
        chipsAmount: totalChips,
        paymentMethod,
        accountOrWallet: accountNumber || (paymentMethod === 'crypto_usdt' ? 'TRC20 Wallet' : 'Card ending in 4242'),
        status: 'completed',
        txRef: generatedTx,
      });

      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#f59e0b', '#10b981'],
      });
    }, 1200);
  };

  const handleClose = () => {
    setShowStoreModal(false);
    setIsSuccess(false);
    setIsProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0d111a] border-2 border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(212,175,55,0.25)] max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 p-0.5 shadow-lg shadow-amber-500/25 flex items-center justify-center">
                <div className="w-full h-full rounded-[14px] bg-[#0c1017] flex items-center justify-center">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-serif-luxury gold-gradient-text">
                  VIP Chips Cashier & Store
                </h2>
                <p className="text-xs text-slate-400">
                  Instant chip delivery with EasyPaisa, JazzCash, USDT Crypto & Card
                </p>
              </div>
            </div>

            {/* Step 1: Select Package */}
            <div className="space-y-3 mb-6">
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
            <div className="space-y-3 mb-6">
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
                  <span className="text-[9px] text-slate-400">Mobile Wallet</span>
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
                  <span className="text-[9px] text-slate-400">Instant Transfer</span>
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
                  <span className="text-[9px] text-slate-400">TRC-20 / ERC-20</span>
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

            {/* Step 3: Gateway Instructions & Input */}
            <div className="p-4 rounded-2xl bg-[#141926] border border-amber-500/20 mb-6 space-y-3">
              {paymentMethod === 'jazzcash' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">JazzCash Till/Account:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-amber-300 font-mono">0300-8492019</strong>
                      <button
                        onClick={() => handleCopy('03008492019')}
                        className="text-slate-400 hover:text-amber-300 p-1"
                        title="Copy Number"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Title: <strong>Grand Royale VIP Cashier</strong></div>
                  <input
                    type="text"
                    placeholder="Enter your JazzCash sender mobile number..."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {paymentMethod === 'easypaisa' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">EasyPaisa Account:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-amber-300 font-mono">0345-7654321</strong>
                      <button
                        onClick={() => handleCopy('03457654321')}
                        className="text-slate-400 hover:text-amber-300 p-1"
                        title="Copy Number"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">Title: <strong>Grand Royale VIP Cashier</strong></div>
                  <input
                    type="text"
                    placeholder="Enter your EasyPaisa account number..."
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {paymentMethod === 'crypto_usdt' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Official TRC-20 Address:</span>
                    <button
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
                  <p className="text-[11px] text-slate-400">Network: <strong>TRON (TRC20)</strong> • Instant automated credit confirmation</p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-2 text-xs">
                  <div className="text-slate-400">256-Bit Encrypted Card Payment Processor:</div>
                  <div className="grid grid-cols-2 gap-2">
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

            {/* Summary & Confirm Button */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div>
                <div className="text-xs text-slate-400">You will receive:</div>
                <div className="text-xl font-black text-amber-300 font-serif-luxury">
                  +{totalChips.toLocaleString()} Chips
                </div>
              </div>

              <button
                onClick={handleCompletePurchase}
                disabled={isProcessing}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Processing Payment...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ${selectedPkg.priceUsd}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Payment Success View */
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-1">
                Payment Completed Successfully!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif-luxury text-white">
                +{totalChips.toLocaleString()} Chips Added
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Receipt recorded in Casino Treasury ledger. Your balance has been updated immediately.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#141926] border border-slate-800 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Player:</span>
                <span className="font-bold text-white">{playerName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="font-bold text-white">${selectedPkg.priceUsd}.00 USD</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Payment Gateway:</span>
                <span className="font-bold text-amber-300 uppercase">{paymentMethod.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="font-bold text-emerald-400">Delivered & Verified</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-sm uppercase tracking-wider hover:brightness-110 shadow-md shadow-amber-500/20 transition-all"
            >
              Continue Playing
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
