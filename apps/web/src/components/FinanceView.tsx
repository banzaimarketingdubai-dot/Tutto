import React, { useState } from 'react'
import { Sparkles, Copy, Check, ChevronLeft, CreditCard, Wallet, AlertCircle, History, ArrowUpRight, ArrowDownRight, TrendingUp, Download } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

interface FinanceViewProps {
  onBack: () => void
}

export const FinanceView: React.FC<FinanceViewProps> = ({ onBack }) => {
  const [copiedRef, setCopiedRef] = useState(false)

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
        <div className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Ваш баланс</div>
        <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
          <span>0.00</span>
          <StarIcon className="w-6 h-6 text-yellow-400 fill-yellow-400" />
        </div>
        <div className="text-[10px] text-gray-500">Telegram Stars (MVP)</div>
      </div>

      {/* Payment Methods */}
      <div className="glass-card p-5 border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Wallet className="w-5 h-5 text-green-400" />
          <div>
            <h4 className="font-display font-bold text-sm text-white">Способы оплаты</h4>
            <p className="text-[11px] text-gray-400">Для оплаты услуг платформы</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between opacity-50 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-6 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-md flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Банковская карта</div>
                <div className="text-[10px] text-gray-400">В разработке...</div>
              </div>
            </div>
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
               <span className="text-[10px] font-black bg-black/60 px-2 py-1 rounded text-white">СКОРО</span>
            </div>
          </div>

          <div className="p-3 bg-yellow-400/10 border border-yellow-400/30 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <StarIcon className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <div>
                <div className="font-bold text-white text-xs">Telegram Stars</div>
                <div className="text-[10px] text-yellow-400">Основной метод (MVP)</div>
              </div>
            </div>
            <Check className="w-4 h-4 text-yellow-400" />
          </div>
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
