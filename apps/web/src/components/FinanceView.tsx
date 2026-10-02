import React, { useState } from 'react'
import { Sparkles, Copy, Check, ChevronLeft, CreditCard, Wallet, AlertCircle, History, ArrowUpRight, ArrowDownRight, TrendingUp, Download, Coins } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { TokenWalletModal } from './TokenWalletModal'

import { useTokenBalance } from '../lib/balance'

interface FinanceViewProps {
  onBack: () => void
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onBack }) => {
  const [copiedRef, setCopiedRef] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [tokenBalance, setTokenBalance] = useTokenBalance()

  const handleCopyRef = () => {
    navigator.clipboard.writeText(`https://t.me/tuttominutto_bot?start=ref_phuket999`)
    setCopiedRef(true)
    triggerHapticFeedback('light')
    setTimeout(() => setCopiedRef(false), 2000)
  }

  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs relative">
      <button
        onClick={() => {
          triggerHapticFeedback('light')
          onBack()
        }}
        className="flex items-center gap-2 text-amber-400 font-bold mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        Назад в профиль
      </button>

      {/* Balance Summary */}
      <div className="glass-card p-5 relative overflow-hidden border-amber-400/30 text-center space-y-2">
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Ваш баланс токенов</div>
        <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <Coins className="w-7 h-7 text-amber-400" />
          <span>{tokenBalance} TUTTO</span>
        </div>
        <div className="text-[10px] text-amber-400/90 font-mono font-bold">
          ≈ ${(tokenBalance * 0.1).toFixed(2)} USD (Telegram Stars &amp; TON Pay)
        </div>
        <div className="pt-2">
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setIsWalletOpen(true)
            }}
            className="px-4 py-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] cursor-pointer"
          >
            <Coins className="w-4 h-4" />
            <span>Пополнить в Кошелек TUTTO</span>
          </button>
        </div>
      </div>


      {/* Payment Methods */}
      <div className="glass-card p-5 border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <div>
              <h4 className="font-display font-bold text-sm text-white">Способы оплаты и пополнения</h4>
              <p className="text-[11px] text-gray-400">Для работы в сервисе и покупки токенов</p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Telegram Stars Card */}
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setIsWalletOpen(true)
            }}
            className="w-full p-3 bg-amber-400/10 border border-amber-400/30 rounded-2xl flex items-center justify-between hover:bg-amber-400/20 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-400/20 rounded-xl flex items-center justify-center border border-amber-400/40">
                <StarIcon className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Telegram Stars ⭐</div>
                <div className="text-[10px] text-amber-300">Оплата прямо в Telegram без комиссии</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg">
              Пополнить
            </span>
          </button>

          {/* TON Crypto Pay Card */}
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setIsWalletOpen(true)
            }}
            className="w-full p-3 bg-[#00F2FE]/10 border border-[#00F2FE]/30 rounded-2xl flex items-center justify-between hover:bg-[#00F2FE]/20 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00F2FE]/20 rounded-xl flex items-center justify-center border border-[#00F2FE]/40">
                <Wallet className="w-5 h-5 text-[#00F2FE]" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">TON &amp; Crypto Pay 💎</div>
                <div className="text-[10px] text-cyan-300">TON Connect / Web3 Wallet</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-[#00F2FE] text-slate-950 px-2.5 py-1 rounded-lg">
              Пополнить
            </span>
          </button>

          {/* Bank Card */}
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setIsWalletOpen(true)
            }}
            className="w-full p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-between hover:bg-purple-500/20 transition-all text-left cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-500/40">
                <CreditCard className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Банковская карта 💳</div>
                <div className="text-[10px] text-purple-300">Visa / Mastercard / СБП</div>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-purple-500 text-white px-2.5 py-1 rounded-lg">
              Пополнить
            </span>
          </button>
        </div>
      </div>

      {/* Partner Referral Link Card */}
      <div className="glass-card p-5 border-amber-400/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h4 className="font-display font-bold text-sm text-white">Партнёрская программа</h4>
          </div>
          <span className="badge-pro text-[10px] px-2 py-0.5 rounded-full font-bold">20% Пассивный доход</span>
        </div>
        <p className="text-gray-300 text-xs mb-4">
          Делитесь реферальной ссылкой с коллегами и бизнесом. Получайте 20% от их подписок пожизненно.
        </p>

        <div className="flex items-center gap-2 bg-slate-950/80 p-2 rounded-xl border border-white/10 mb-4">
          <input
            type="text"
            readOnly
            value="https://t.me/tuttominutto_bot?start=ref_phuket999"
            className="w-full bg-transparent text-gray-300 text-xs outline-none font-mono"
          />
          <button
            onClick={handleCopyRef}
            className="px-3 py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs shrink-0 flex items-center gap-1 cursor-pointer"
          >
            {copiedRef ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedRef ? 'Скопировано' : 'Копировать'}</span>
          </button>
        </div>

        <div className="bg-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs">Приглашено:</span>
                <span className="text-white font-bold">0 партнеров</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">Заработано:</span>
                <span className="text-amber-400 font-bold">0.00 Stars</span>
            </div>
        </div>
      </div>

      {/* Payment Statistics & History */}
      <div className="glass-card p-5 border-white/10 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h4 className="font-display font-bold text-sm text-white">Статистика оплат</h4>
          </div>
          <button className="text-[10px] text-gray-400 flex items-center gap-1 hover:text-white">
             <Download className="w-3 h-3" /> Отчет
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-emerald-400/10 border border-emerald-400/20 rounded-xl p-3">
              <p className="text-[10px] text-emerald-400/80 mb-1 uppercase font-bold">Доход за месяц</p>
              <div className="text-emerald-400 font-black text-lg">+1,450 <span className="text-xs">TUTTO</span></div>
           </div>
           <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3">
              <p className="text-[10px] text-red-400/80 mb-1 uppercase font-bold">Расход (Комиссии)</p>
              <div className="text-red-400 font-black text-lg">-150 <span className="text-xs">TUTTO</span></div>
           </div>
        </div>

        <div className="space-y-4 pt-2">
            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Последние транзакции</h5>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Покупка лота "Yamaha NMAX"</p>
                    <p className="text-gray-500 text-[10px]">Сегодня, 10:42</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-black text-sm">
                  + 350 <span className="text-[9px]">TUTTO</span>
                </div>
            </div>
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Услуга "Тайский массаж"</p>
                    <p className="text-gray-500 text-[10px]">Вчера, 18:20</p>
                  </div>
                </div>
                <div className="text-emerald-400 font-black text-sm">
                  + 60 <span className="text-[9px]">TUTTO</span>
                </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-xs font-bold">Комиссия платформы (10%)</p>
                    <p className="text-gray-500 text-[10px]">Вчера, 18:21</p>
                  </div>
                </div>
                <div className="text-red-400 font-black text-sm">
                  - 6 <span className="text-[9px]">TUTTO</span>
                </div>
            </div>
        </div>
      </div>

      <TokenWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        currentBalance={tokenBalance}
        onTopUp={(added) => setTokenBalance(added)}
      />
    </div>
  )
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
