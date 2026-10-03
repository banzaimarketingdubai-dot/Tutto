import React, { useState, useEffect } from 'react'
import { X, Zap, DollarSign, Bot, ShieldCheck, Share2, CheckCircle2 } from 'lucide-react'
import { RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { shareToTelegram } from '../lib/deeplink'
import { OfferCard } from './OfferCard'
import { MOCK_OFFER_INSTANCES } from '../data/mockData'
import { OfferInstance } from '../types'
interface BidModalProps {
  request: RequestItem | null
  isOpen: boolean
  onClose: () => void
  onSubmitBid: (requestId: string, price: number, comment: string, attachedOffer?: OfferInstance) => void
}

export const BidModal: React.FC<BidModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmitBid,
}) => {
  const [price, setPrice] = useState('180')
  const [comment, setComment] = useState('Готовы выполнить в лучшем виде. Доставим в течение 30 минут!')
  const [isClarifying, setIsClarifying] = useState(false)
  const [clarifyText, setClarifyText] = useState('')
  const [selectedOffer, setSelectedOffer] = useState<OfferInstance | null>(null)

  useEffect(() => {
    if (request) {
      setPrice(request.budget ? String(request.budget) : '180')
      setIsClarifying(false)
      setClarifyText('')
      setSelectedOffer(null)
    }
  }, [request])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen || !request) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isClarifying) {
      if (!clarifyText.trim()) {
        triggerNotificationFeedback('error')
        alert('Введите ваш вопрос!')
        return
      }
      triggerHapticFeedback('medium')
      triggerNotificationFeedback('success')
      onSubmitBid(request.id, 0, `[CLARIFICATION] ${clarifyText}`)
      onClose()
      return
    }

    if (!price || parseFloat(price) <= 0) {
      triggerNotificationFeedback('error')
      alert('Укажите корректную стоимость!')
      return
    }

    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')
    onSubmitBid(request.id, parseFloat(price), comment, selectedOffer || undefined)
    onClose()
  }

  const handleSelectOffer = (offer: OfferInstance) => {
    setSelectedOffer(offer)
    setPrice(String(offer.price))
    setComment(`Предлагаю: ${offer.title}\n${offer.description}`)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full sm:max-w-md glass-panel rounded-3xl border border-white/10 p-5 max-h-[85vh] overflow-y-auto my-auto shadow-2xl overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#CCFF00] flex items-center justify-center shadow-[0_0_10px_rgba(0,242,254,0.3)]">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">
                {isClarifying ? 'Уточнить детали' : 'Сделать предложение'}
              </h3>
              <p className="text-sm text-[#00F2FE] line-clamp-1 font-medium">{request.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Request Details */}
        <div className="flex flex-col gap-3 mb-5 p-3 rounded-2xl bg-black/40 border border-white/5">
          <div className="flex gap-3">
            {request.mediaUrls && request.mediaUrls.length > 0 && (
              <img src={request.mediaUrls[0]} alt="Request" className="w-20 h-20 rounded-xl object-cover shrink-0 border border-white/10" />
            )}
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <span className="text-[16px] font-bold text-white leading-tight">{request.title}</span>
              <span className="text-[13px] text-gray-300 line-clamp-2 leading-snug">
                {request.description || 'Описание не указано'}
              </span>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-[15px] font-black text-[#CCFF00]">Бюджет: ${request.budget || 'Не указан'}</span>
                <span className="text-[12px] text-gray-400 font-medium truncate">📍 {request.district}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {!isClarifying ? (
            <>
              {/* My Offer Instances Carousel */}
              <div className="mb-4">
                <label className="block text-gray-300 font-semibold mb-2 text-[14px]">
                  Готовые шаблоны <span className="text-gray-500 font-normal text-[12px]">(нажмите, чтобы прикрепить к ответу)</span>
                </label>
                <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 snap-x snap-mandatory after:content-[''] after:w-6 after:shrink-0">
                  {MOCK_OFFER_INSTANCES.map((offer) => (
                    <div 
                      key={offer.id} 
                      className={`w-[260px] shrink-0 snap-start transition-transform ${selectedOffer?.id === offer.id ? 'scale-[1.02] ring-2 ring-cyan-400 rounded-2xl' : 'opacity-80 hover:opacity-100'}`}
                    >
                      <OfferCard 
                        offer={offer} 
                        mode="chat" 
                        onAction={(offer) => handleSelectOffer(offer)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Proposed Price */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-[14px]">Предлагаемая цена ($ USD)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3.5 text-white text-xl font-extrabold pr-16 focus:border-cyan-400 outline-none"
                  />
                  <span className="absolute right-4 top-4 text-cyan-400 font-bold text-[15px]">USD</span>
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-[14px]">Сообщение для клиента</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Напишите, почему клиенту стоит выбрать именно вас..."
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-4 text-white text-[14px] focus:border-cyan-400 outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Attached Card Preview */}
              {selectedOffer && (
                <div className="p-3 rounded-2xl bg-cyan-900/20 border border-cyan-500/30 flex flex-col gap-2">
                  <div className="text-[12px] text-cyan-400 font-bold flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Прикреплено к ответу:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHapticFeedback('light')
                        setSelectedOffer(null)
                        setPrice(request.budget ? String(request.budget) : '180')
                        setComment('Готовы выполнить в лучшем виде. Доставим в течение 30 минут!')
                      }}
                      className="text-gray-400 hover:text-red-400 uppercase tracking-wider text-[10px]"
                    >
                      Открепить
                    </button>
                  </div>
                  <div className="pointer-events-none">
                    <OfferCard offer={selectedOffer} mode="chat" />
                  </div>
                </div>
              )}

              {/* Business Guarantee Info */}
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-200 text-[13px] flex items-start gap-2.5 leading-snug">
                <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span>Ваш профиль и рейтинг будут видны клиенту. Оплата производится напрямую.</span>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-amber-300 font-semibold mb-1.5">Какой вопрос вы хотите задать клиенту?</label>
              <textarea
                rows={4}
                value={clarifyText}
                onChange={(e) => setClarifyText(e.target.value)}
                placeholder="Например: В какие даты планируете аренду? Нужна ли доставка до отеля?"
                className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-white focus:border-amber-400 outline-none resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-2">
                Клиент получит уведомление. Как только он ответит, вы сможете предложить точную цену.
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="submit"
              className={`w-full py-3 rounded-xl font-extrabold text-[14px] shadow-lg active:scale-[0.98] transition-all ${
                isClarifying
                  ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                  : 'bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)] hover:opacity-90'
              }`}
            >
              {isClarifying ? 'Отправить вопрос клиенту' : 'Отправить предложение'}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const res = shareToTelegram('request', request.id, request.title)
                  if (res.copied) {
                    alert('🔗 Прямая ссылка скопирована! Поделитесь в Telegram.')
                  }
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-500/20 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Поделиться</span>
              </button>

              {!isClarifying ? (
                <button
                  type="button"
                  onClick={() => setIsClarifying(true)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 font-semibold text-xs hover:bg-white/5 transition-all cursor-pointer"
                >
                  Уточнить детали
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsClarifying(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-400 font-semibold text-xs hover:bg-white/5 transition-all cursor-pointer"
                >
                  Вернуться
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
