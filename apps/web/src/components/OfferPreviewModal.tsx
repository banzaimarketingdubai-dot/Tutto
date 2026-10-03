import React from 'react'
import { X, Check, ShieldCheck, Star, MapPin, Clock, MessageSquare, Sparkles, Share2, Award, Zap } from 'lucide-react'
import { BidItem, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface OfferPreviewModalProps {
  isOpen: boolean
  offer: BidItem | null
  request: RequestItem
  onClose: () => void
  onAccept: (bid: BidItem) => void
  onClarify?: (bid: BidItem) => void
}

export const OfferPreviewModal: React.FC<OfferPreviewModalProps> = ({
  isOpen,
  offer,
  request,
  onClose,
  onAccept,
  onClarify,
}) => {
  if (!isOpen || !offer) return null

  const getFallbackPhoto = (reqTitle: string) => {
    const t = reqTitle.toLowerCase()
    if (t.includes('байк') || t.includes('nmax') || t.includes('pcx') || t.includes('скутер')) {
      return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1080&auto=format&fit=crop&q=80'
    }
    if (t.includes('авто') || t.includes('машин')) {
      return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=1080&auto=format&fit=crop&q=80'
    }
    if (t.includes('вилл') || t.includes('дом') || t.includes('жиль')) {
      return 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1080&auto=format&fit=crop&q=80'
    }
    if (t.includes('обмен') || t.includes('деньг') || t.includes('usdt')) {
      return 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1080&auto=format&fit=crop&q=80'
    }
    return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1080&auto=format&fit=crop&q=80'
  }

  const photoUrl = (offer as any).mediaUrl || getFallbackPhoto(request.title)

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#050811] text-white animate-fadeIn font-sans overflow-y-auto">
      {/* Background Image / Top Hero Cover */}
      <div className="relative w-full h-[45vh] min-h-[300px] shrink-0 overflow-hidden bg-slate-900">
        <img
          src={photoUrl}
          alt={offer.providerName}
          className="w-full h-full object-cover filter brightness-[0.85] transition-transform duration-700"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#050811]" />

        {/* Top Header Controls */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between safe-area-top">
          <span className="px-3 py-1 rounded-xl bg-black/60 backdrop-blur-md text-xs font-black text-[#00F2FE] border border-[#00F2FE]/40 uppercase tracking-wider flex items-center gap-1 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
            Карточка предложения
          </span>

          <button
            onClick={() => {
              triggerHapticFeedback('light')
              onClose()
            }}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white border border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Price Tag on Hero */}
        <div className="absolute bottom-6 left-5 right-5 z-10 flex items-end justify-between">
          <div>
            <div className="text-[11px] font-bold text-gray-300 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>📍 {request.district}</span> • <span>Категория: {request.categoryL1Name}</span>
            </div>
            <h1 className="text-2xl font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
              {offer.providerName}
            </h1>
          </div>

          <div className="bg-gradient-to-r from-[#00F2FE] to-[#00DFEA] text-black px-4 py-2 rounded-2xl font-mono font-black text-2xl shadow-[0_0_25px_rgba(0,242,254,0.6)] shrink-0">
            ${offer.proposedPrice}
          </div>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 space-y-5 -mt-2 bg-[#050811] rounded-t-3xl border-t border-white/10 relative z-20">
        {/* Provider Profile Badge */}
        <div className="p-4 rounded-2xl bg-[#161B22] border border-white/10 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <img
              src={offer.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={offer.providerName}
              className="w-12 h-12 rounded-full border-2 border-[#00F2FE] object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-white text-base leading-tight">
                  {offer.providerName}
                </span>
                {offer.isPro && (
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs font-black rounded-lg border border-amber-500/40 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    PRO
                  </span>
                )}
                {offer.isAiAgent && (
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 text-xs font-black rounded-lg border border-cyan-500/40 flex items-center gap-1">
                    🤖 AI Agent
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {offer.providerRating} (Отличная репутация)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Original Request Reference */}
        <div className="p-3.5 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 text-xs space-y-1">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
            Ваш исходный запрос:
          </span>
          <div className="text-white font-bold">{request.title}</div>
          <div className="text-gray-400 line-clamp-1">{request.description}</div>
        </div>

        {/* Attached Catalog Item from Provider's Shop Profile */}
        {offer.attachedOffer && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-[#0F172A] to-[#121824] border-2 border-cyan-400/60 space-y-2.5 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Прикреплено из витрины исполнителя
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">
                Каталог: ${offer.attachedOffer.price}
              </span>
            </div>

            <div className="flex gap-3 items-center">
              {offer.attachedOffer.imageUrl && (
                <img
                  src={offer.attachedOffer.imageUrl}
                  alt={offer.attachedOffer.title}
                  className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10 shadow-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-sm text-white line-clamp-1">
                  {offer.attachedOffer.title}
                </h4>
                <p className="text-xs text-gray-300 line-clamp-2 mt-0.5 leading-snug">
                  {offer.attachedOffer.description}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Offer Terms & Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <span>📝 Условия и подробности оффера</span>
          </h3>
          <div className="p-4 rounded-2xl bg-[#161B22] border border-white/10 text-sm text-gray-200 leading-relaxed space-y-3">
            <p className="whitespace-pre-line font-medium">
              {offer.comment || 'Оффер подготовлен специально для вашей заявки со 100% гарантией соответствия.'}
            </p>
          </div>
        </div>

        {/* Service Guarantees Grid */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Безопасная сделка</div>
              <div className="text-[10px] text-gray-400">Гарантия возврата</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Быстрая подача</div>
              <div className="text-[10px] text-gray-400">Доставка в {request.district}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sticky CTA Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-[#0A101D] border-t border-white/10 safe-area-bottom flex flex-col gap-2 z-30">
        <button
          onClick={() => {
            triggerHapticFeedback('heavy')
            triggerNotificationFeedback('success')
            onAccept(offer)
            onClose()
          }}
          className="w-full py-4 bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-base rounded-2xl shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check className="w-5 h-5 stroke-[3]" />
          <span>ПРИНЯТЬ ОФФЕР ЗА ${offer.proposedPrice}</span>
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          {onClarify && (
            <button
              onClick={() => {
                triggerHapticFeedback('light')
                onClarify(offer)
                onClose()
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Задать вопрос</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-bold text-xs border border-white/10 transition-colors flex items-center justify-center gap-1"
          >
            <span>Закрыть предпросмотр</span>
          </button>
        </div>
      </div>
    </div>
  )
}
