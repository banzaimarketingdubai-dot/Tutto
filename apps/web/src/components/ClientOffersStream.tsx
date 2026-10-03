import React, { useState } from 'react'
import { Sparkles, Check, MessageSquare, X, ArrowUpDown, ShieldCheck, Star, Clock, Eye } from 'lucide-react'
import { BidItem, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { OfferPreviewModal } from './OfferPreviewModal'

interface ClientOffersStreamProps {
  request: RequestItem
  bids: BidItem[]
  onAcceptOffer: (bid: BidItem) => void
  onRejectOffer?: (bidId: string) => void
  onClarifyOffer?: (bid: BidItem) => void
}

export const ClientOffersStream: React.FC<ClientOffersStreamProps> = ({
  request,
  bids,
  onAcceptOffer,
  onRejectOffer,
  onClarifyOffer,
}) => {
  const [sortBy, setSortBy] = useState<'price_asc' | 'newest' | 'rating'>('price_asc')
  const [rejectedIds, setRejectedIds] = useState<string[]>([])
  const [previewOffer, setPreviewOffer] = useState<BidItem | null>(null)

  const activeBids = bids.filter(b => !rejectedIds.includes(b.id))

  const sortedBids = [...activeBids].sort((a, b) => {
    if (sortBy === 'price_asc') {
      return a.proposedPrice - b.proposedPrice
    }
    if (sortBy === 'rating') {
      return b.providerRating - a.providerRating
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleReject = (bidId: string) => {
    triggerHapticFeedback('medium')
    setRejectedIds(prev => [...prev, bidId])
    if (onRejectOffer) onRejectOffer(bidId)
  }

  const getFallbackPhoto = (reqTitle: string) => {
    const t = reqTitle.toLowerCase()
    if (t.includes('байк') || t.includes('nmax') || t.includes('pcx') || t.includes('скутер')) {
      return 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80'
    }
    if (t.includes('авто') || t.includes('машин')) {
      return 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80'
    }
    if (t.includes('вилл') || t.includes('дом') || t.includes('жиль')) {
      return 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop&q=80'
    }
    if (t.includes('обмен') || t.includes('деньг') || t.includes('usdt')) {
      return 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&auto=format&fit=crop&q=80'
    }
    return 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80'
  }

  return (
    <div className="w-full space-y-3.5 mt-2 animate-fadeIn">
      {/* Header & InDrive Style Sorting Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1">
            <span>ВХОДЯЩИЕ ОФФЕРЫ</span>
            <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] text-[11px] font-mono border border-[#00F2FE]/30">
              {sortedBids.length}
            </span>
          </span>
        </div>

        {/* Sorting Pills */}
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 text-[11px] font-bold">
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setSortBy('price_asc')
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              sortBy === 'price_asc'
                ? 'bg-[#00F2FE] text-black font-extrabold shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💸 Дешевле
          </button>
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setSortBy('newest')
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              sortBy === 'newest'
                ? 'bg-[#00F2FE] text-black font-extrabold shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⏱️ Свежие
          </button>
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setSortBy('rating')
            }}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              sortBy === 'rating'
                ? 'bg-[#00F2FE] text-black font-extrabold shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⭐ Рейтинг
          </button>
        </div>
      </div>

      {/* Offers List */}
      {sortedBids.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sortedBids.map((bid) => {
            const photoUrl = (bid as any).mediaUrl || getFallbackPhoto(request.title)

            return (
              <div
                key={bid.id}
                className="w-full rounded-2xl p-4 bg-[#0F172A]/90 border border-cyan-500/40 shadow-[0_0_20px_rgba(0,242,254,0.15)] hover:border-cyan-400 transition-all space-y-3 relative overflow-hidden group"
              >
                {/* Top Section: Provider Info + Price Badge */}
                <div
                  className="flex items-start justify-between gap-3 cursor-pointer"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setPreviewOffer(bid)
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={bid.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={bid.providerName}
                      className="w-10 h-10 rounded-full border border-cyan-500/40 object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-white text-sm leading-none">
                          {bid.providerName}
                        </span>
                        {bid.isPro && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded border border-amber-500/30 flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-amber-400" />
                            PRO
                          </span>
                        )}
                        {bid.isAiAgent && (
                          <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-300 text-[10px] font-black rounded border border-cyan-500/30 flex items-center gap-0.5">
                            🤖 AI Agent
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-1 font-medium">
                        <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {bid.providerRating}
                        </span>
                        <span>•</span>
                        <span className="text-gray-400">📍 {request.district}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Tag (inDrive Style) */}
                  <div className="text-right shrink-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 px-3 py-1.5 rounded-xl shadow-[0_0_12px_rgba(0,242,254,0.2)]">
                    <div className="text-amber-400 font-black text-[17px] leading-tight font-mono">
                      ${bid.proposedPrice}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider flex items-center justify-end gap-1">
                      <span>Предложение</span>
                      <Eye className="w-3 h-3" />
                    </div>
                  </div>
                </div>

                {/* Offer Details: Photo + Description (Clickable for full screen) */}
                <div
                  className="flex gap-3 items-center bg-black/40 p-2.5 rounded-xl border border-white/5 cursor-pointer hover:border-cyan-500/40 transition-colors"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setPreviewOffer(bid)
                  }}
                >
                  <img
                    src={photoUrl}
                    alt="Offer Item"
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-white/10"
                  />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-gray-200 leading-relaxed font-medium line-clamp-2">
                      {bid.comment || 'Готовы выполнить вашу заявку на лучшем уровне с гарантией.'}
                    </p>
                    <div className="text-[11px] text-cyan-400 font-bold flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Нажмите для предпросмотра карточки</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls (inDrive Style) */}
                <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
                  <button
                    onClick={() => handleReject(bid.id)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 transition-all cursor-pointer"
                    title="Отклонить предложение"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      triggerHapticFeedback('light')
                      setPreviewOffer(bid)
                    }}
                    className="px-3 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-bold text-xs border border-cyan-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Карточка</span>
                  </button>

                  {onClarifyOffer && (
                    <button
                      onClick={() => {
                        triggerHapticFeedback('light')
                        onClarifyOffer(bid)
                      }}
                      className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 font-bold text-xs border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Чат</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      triggerHapticFeedback('heavy')
                      triggerNotificationFeedback('success')
                      onAcceptOffer(bid)
                    }}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs rounded-xl shadow-[0_0_18px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                    <span>Принять ${bid.proposedPrice}</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-4 bg-black/40 rounded-2xl border border-white/10 text-center space-y-1">
          <p className="text-xs text-gray-400 font-medium">Нет активных входящих офферов.</p>
          <p className="text-[11px] text-cyan-400">Ожидайте откликов от исполнителей в вашем районе...</p>
        </div>
      )}

      {/* Fullscreen Offer Card Preview Modal */}
      <OfferPreviewModal
        isOpen={!!previewOffer}
        offer={previewOffer}
        request={request}
        onClose={() => setPreviewOffer(null)}
        onAccept={(bid) => {
          onAcceptOffer(bid)
          setPreviewOffer(null)
        }}
        onClarify={
          onClarifyOffer
            ? (bid) => {
                onClarifyOffer(bid)
                setPreviewOffer(null)
              }
            : undefined
        }
      />
    </div>
  )
}

