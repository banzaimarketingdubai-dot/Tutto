import React, { useState } from 'react'
import { X, DollarSign, Send, Zap } from 'lucide-react'
import { BidItem, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { useScrollLock } from '../hooks/useScrollLock'

interface CounterOfferModalProps {
  isOpen: boolean
  offer: BidItem | null
  request: RequestItem
  onClose: () => void
  onSubmitCounter: (offer: BidItem, customPrice: number, message: string) => void
}

export const CounterOfferModal: React.FC<CounterOfferModalProps> = ({
  isOpen,
  offer,
  request,
  onClose,
  onSubmitCounter,
}) => {
  useScrollLock(isOpen)

  const defaultCounterPrice = offer ? Math.max(1, Math.round(offer.proposedPrice * 0.9)) : 100
  const [customPrice, setCustomPrice] = useState<string>(String(defaultCounterPrice))
  const [message, setMessage] = useState<string>(`Здравствуйте! Готов принять ваше предложение за $${defaultCounterPrice}. Договорились?`)

  if (!isOpen || !offer) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(customPrice)
    if (!val || val <= 0) {
      triggerNotificationFeedback('error')
      alert('Укажите корректную сумму встречного предложения!')
      return
    }

    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onSubmitCounter(offer, val, message)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[230] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn overscroll-contain">
      <div className="w-full max-w-sm bg-[#070B12] border border-cyan-500/50 rounded-3xl p-5 space-y-4 shadow-[0_0_40px_rgba(0,242,254,0.3)] overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-black font-black">
              <DollarSign className="w-4 h-4 text-black stroke-[3]" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">💸 Поторговаться с исполнителем</h3>
              <p className="text-[11px] text-cyan-300 font-medium">{offer.providerName}</p>
            </div>
          </div>
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              onClose()
            }}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs font-mono">
            <span className="text-gray-400">Текущая цена исполнителя:</span>
            <span className="text-gray-300 font-bold line-through">${offer.proposedPrice} USD</span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-cyan-300 uppercase tracking-wider mb-1.5">
              Ваше встречное предложение ($ USD)
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, ''))}
                className="w-full bg-slate-900 border-2 border-cyan-400 rounded-2xl px-4 py-3 text-white text-xl font-black outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <span className="absolute right-4 top-3.5 text-cyan-400 font-black text-sm">USD</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Сообщение исполнителю
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white outline-none resize-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-[#CCFF00] text-black font-black text-sm rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[3]" />
            <span>ОТПРАВИТЬ КОНТР-ПРЕДЛОЖЕНИЕ</span>
          </button>
        </form>
      </div>
    </div>
  )
}
