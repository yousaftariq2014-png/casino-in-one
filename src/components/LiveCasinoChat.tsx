import React, { useState, useEffect, useRef } from 'react';
import { useCasino } from '../context/CasinoContext';
import { sound } from '../utils/audio';
import { MessageSquare, Send, CloudRain, X, Crown } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  badge: 'vip' | 'whale' | 'mod' | 'player';
  text: string;
  time: string;
  isRain?: boolean;
  rainAmount?: number;
  rainClaimed?: boolean;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: '1', user: 'CryptoWhale', badge: 'whale', text: 'LFG just hit 28x on Crash Rocket 🚀🚀', time: '12:01' },
  { id: '2', user: 'Sultana_VIP', badge: 'vip', text: 'Nice win bro! Anyone playing European Roulette right now?', time: '12:02' },
  { id: '3', user: 'NeonAce', badge: 'player', text: 'Just hit natural Blackjack with $200 bet 🔥', time: '12:03' },
  { id: '4', user: 'Admin_Mod', badge: 'mod', text: 'Welcome all VIPs! Provably Fair RNG active on all 6 tables.', time: '12:04' },
];

export const LiveCasinoChat: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { playerName, modifyBalance } = useCasino();
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Periodic simulated community chat & chip rain drops
  useEffect(() => {
    const chatInterval = setInterval(() => {
      const bots = [
        { user: 'Vegas_King', badge: 'whale' as const, text: 'Slots just paid 50x bonus round!! 🎰' },
        { user: 'LuckyGirl77', badge: 'vip' as const, text: 'Mines 5 bombs is pure adrenaline lol' },
        { user: 'DubaiTrader', badge: 'whale' as const, text: 'Plinko 29x on green peg lets gooo!' },
        { user: 'Alex_Pro', badge: 'player' as const, text: 'Good luck everyone at the tables 🍀' },
        { user: 'Whale_Host', badge: 'mod' as const, text: '🌧️ CHIP RAIN INCOMING! Fast fingers claim first!', isRain: true, rainAmount: 250 },
      ];

      const chosen = bots[Math.floor(Math.random() * bots.length)];
      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      setMessages((prev) => [
        ...prev.slice(-40),
        {
          id: Date.now().toString(),
          user: chosen.user,
          badge: chosen.badge,
          text: chosen.text,
          time,
          isRain: chosen.isRain,
          rainAmount: chosen.rainAmount,
          rainClaimed: false,
        },
      ]);
    }, 12000);

    return () => clearInterval(chatInterval);
  }, []);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sound.playChip();
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      user: playerName || 'You',
      badge: 'vip',
      text: inputText.trim(),
      time,
    };

    setMessages((prev) => [...prev.slice(-40), newMsg]);
    setInputText('');
  };

  const handleClaimRain = (msgId: string, amount: number) => {
    sound.playWin();
    modifyBalance(amount, 'Chat Rain Bonus');
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, rainClaimed: true } : m))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-3 right-2 sm:right-4 z-40 w-[calc(100vw-16px)] sm:w-[380px] max-w-[380px] h-[480px] max-h-[85vh] bg-[#0c1018] border-2 border-amber-500/40 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
      
      {/* Chat Header */}
      <div className="px-4 py-3 bg-[#121622] border-b border-amber-500/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-serif-luxury">
                VIP Lounge Live Chat
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-[10px] text-slate-400">548 Players Online</span>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playChip();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
        {messages.map((m) => (
          <div key={m.id} className="space-y-1">
            <div className="flex items-center gap-1.5 text-[11px]">
              {m.badge === 'whale' && (
                <span className="px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[9px] font-black flex items-center gap-0.5">
                  <Crown className="w-2.5 h-2.5" /> WHALE
                </span>
              )}
              {m.badge === 'mod' && (
                <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] font-black">
                  MOD
                </span>
              )}
              {m.badge === 'vip' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black">
                  VIP
                </span>
              )}
              <span className="font-bold text-slate-300">{m.user}</span>
              <span className="text-[9px] text-slate-500 ml-auto">{m.time}</span>
            </div>

            {m.isRain ? (
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-400/40 space-y-2">
                <div className="flex items-center gap-1.5 text-blue-300 font-bold text-[11px]">
                  <CloudRain className="w-4 h-4 text-cyan-400 animate-bounce" />
                  <span>Chip Rain Drop (+${m.rainAmount} Chips!)</span>
                </div>
                {m.rainClaimed ? (
                  <span className="text-[10px] text-emerald-400 font-bold block">
                    ✓ You claimed this rain!
                  </span>
                ) : (
                  <button
                    onClick={() => handleClaimRain(m.id, m.rainAmount || 250)}
                    className="w-full py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black text-[11px] uppercase tracking-wider hover:brightness-110 shadow-sm"
                  >
                    Grab +${m.rainAmount} Chips!
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-200 bg-slate-900/60 p-2 rounded-xl border border-slate-800/80 leading-relaxed break-words">
                {m.text}
              </p>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSendMessage} className="p-2.5 bg-[#121622] border-t border-amber-500/20 flex gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Chat with VIP players..."
          maxLength={100}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold transition-all shrink-0"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

    </div>
  );
};
