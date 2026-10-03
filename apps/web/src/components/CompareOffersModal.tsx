import React from 'react'
import { X, Check, Star, ShieldCheck, Zap, Scale, DollarSign, Clock } from 'lucide-react'
import { BidItem, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface CompareOffersModalProps {
  isOpen: boolean
  offerA: BidItem | null
  offerB: BidItem | null
  request: RequestItem
  onClose: () => void
  onAcceptOffer: (bid: BidItem) => void
}

export const CompareOffersModal: React.FC<CompareOffersModalProps> = ({
  isOpen,
  offerA,
  offerB,
  request,
  onClose,
  onAcceptOffer,
}) => {
  if (!isOpen || !offerA || !offerB) return null

  const getFallbackPhoto = (reqTitle: string) => {
    const t = reqTitle.toLowerCase()
    if (t.includes('байк') || t.includes('скутер')) return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'
    if (t.includes('авто')) return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'
    return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600'
  }

  const photoA = (offerA as any).mediaUrl || getFallbackPhoto(request.title)
  const photoB = (offerB as any).mediaUrl || getFallbackPhoto(request.title)

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg bg-[#070B12] border border-cyan-500/40 rounded-3xl p-5 space-y-4 shadow-[0_0_40px_rgba(0,242,254,0.25)] relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#CCFF00] flex items-center justify-center text-black font-black">
              <Scale className="w-4 h-4 text-black" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">⚖️ Сравнение 2 лучших офферов</h3>
              <p className="text-[11px] text-cyan-300 font-medium line-clamp-1">{request.title}</p>
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

        {/* Side-by-Side Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          {/* Offer A */}
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border-2 border-[#00F2FE] space-y-3 shadow-[0_0_15px_rgba(0,242,254,0.2)] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] text-[9px] font-black uppercase tracking-wider border border-[#00F2FE]/40 block text-center">
                🏆 ОФФЕР #1 (ЛУЧШАЯ ЦЕНА)
              </span>

              <img src={photoA} alt={offerA.providerName} className="w-full h-24 rounded-xl object-cover border border-white/10" />

              <div className="flex items-center gap-2">
                <img src={offerA.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'} className="w-7 h-7 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="font-extrabold text-white text-xs truncate">{offerA.providerName}</div>
                  <div className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px]">
                    <Star className="w-3 h-3 fill-current" /> {offerA.providerRating}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                <div className="text-gray-400 text-[10px]">Предложенная цена:</div>
                <div className="text-amber-400 font-black text-lg">${offerA.proposedPrice} USD</div>
              </div>

              <p className="text-[11px] text-gray-300 line-clamp-3 leading-tight italic">
                «{offerA.comment}»
              </p>
            </div>

            <button
              onClick={() => {
                triggerHapticFeedback('heavy')
                triggerNotificationFeedback('success')
                onAcceptOffer(offerA)
                onClose()
              }}
              className="w-full py-2.5 bg-gradient-to-r from-[#00F2FE] to-[#00DFEA] text-black font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer mt-2"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Выбрать #${offerA.proposedPrice}</span>
            </button>
          </div>

          {/* Offer B */}
          <div className="p-3.5 rounded-2xl bg-[#0F172A] border-2 border-amber-500/60 space-y-3 shadow-[0_0_15px_rgba(245,158,11,0.2)] flex flex-col justify-between">
            <div className="space-y-2">
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-500/40 block text-center">
                ⭐ ОФФЕР #2 (ТОП РЕЙТИНГ)
              </span>

              <img src={photoB} alt={offerB.providerName} className="w-full h-24 rounded-xl object-cover border border-white/10" />

              <div className="flex items-center gap-2">
                <img src={offerB.providerAvatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80'} className="w-7 h-7 rounded-full object-cover" />
                <div className="min-w-0">
                  <div className="font-extrabold text-white text-xs truncate">{offerB.providerName}</div>
                  <div className="flex items-center gap-0.5 text-amber-400 font-bold text-[10px]">
                    <Star className="w-3 h-3 fill-current" /> {offerB.providerRating}
                  </div>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1 font-mono">
                <div className="text-gray-400 text-[10px]">Предложенная цена:</div>
                <div className="text-amber-400 font-black text-lg">${offerB.proposedPrice} USD</div>
              </div>

              <p className="text-[11px] text-gray-300 line-clamp-3 leading-tight italic">
                «{offerB.comment}»
              </p>
            </div>

            <button
              onClick={() => {
                triggerHapticFeedback('heavy')
                triggerNotificationFeedback('success')
                onAcceptOffer(offerB)
                onClose()
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs rounded-xl shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer mt-2"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Выбрать #${offerB.proposedPrice}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
