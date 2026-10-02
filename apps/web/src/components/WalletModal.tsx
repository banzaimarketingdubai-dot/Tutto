import React from 'react'
import { X, Coins, ArrowRightLeft, CreditCard, History, Wallet } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const handleTopup = () => {
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    alert('Mock: Открытие окна оплаты через Telegram Stars / Stripe')
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full sm:max-w-md bg-[#0D1117] sm:rounded-3xl rounded-t-3xl border border-amber-400/20 p-6 shadow-2xl relative text-white safe-area-bottom h-[90vh] sm:h-auto flex flex-col">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-lg font-black font-display text-white tracking-wide">Мой Кошелёк</h2>
          </div>
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              onClose()
            }}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 pb-10 space-y-5">
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border border-amber-400/40 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl" />
            <p className="text-xs text-amber-300/80 font-semibold mb-1 uppercase tracking-wider">Доступный баланс</p>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-white font-display">150</span>
              <span className="text-sm text-amber-400 font-bold mb-1.5 flex items-center gap-1">
                <Coins className="w-4 h-4" /> TUTTO Coins
              </span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">≈ 1.50 USD</p>
            
            <div className="flex gap-3 mt-5 relative z-10">
              <button onClick={handleTopup} className="flex-1 py-3 bg-amber-400 text-black rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(251,191,36,0.3)]">
                <CreditCard className="w-4 h-4" /> Пополнить
              </button>
              <button className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-white/15 transition-colors border border-white/5">
                <ArrowRightLeft className="w-4 h-4" /> Вывести
              </button>
            </div>
          </div>

          {/* History */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <History className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">История транзакций</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Награда за отзыв</p>
                    <p className="text-gray-500 text-[10px]">Вчера, 14:30</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-black text-sm">
                  + 15 <span className="text-[9px]">TUTTO</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <ArrowRightLeft className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Оплата комиссии платформы</p>
                    <p className="text-gray-500 text-[10px]">3 дня назад</p>
                  </div>
                </div>
                <div className="text-red-400 font-black text-sm">
                  - 50 <span className="text-[9px]">TUTTO</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
