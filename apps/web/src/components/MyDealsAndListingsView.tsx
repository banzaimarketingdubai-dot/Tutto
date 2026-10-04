import React, { useState } from 'react'
import { RequestItem, MarketItem, BidItem } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'
import { Clock, MessageSquare, Flame, CheckCircle2, AlertCircle, Trash2, Eye, Award, MapPin, Sparkles } from 'lucide-react'
import { PlatformRulesModal } from './PlatformRulesModal'
import { OfferInstancesManager } from './OfferInstancesManager'
import { ClientOffersStream } from './ClientOffersStream'

interface MyDealsAndListingsViewProps {
  myRequests: RequestItem[]
  myMarketItems: MarketItem[]
  bidsByRequestId?: Record<string, BidItem[]>
  onOpenDealChat: (req: RequestItem, bid: BidItem, isPreDeal?: boolean) => void
  onOpenMarketItem: (item: MarketItem) => void
  onDeleteMarketItem: (itemId: string) => void
  onDeleteRequest: (reqId: string) => void
  onOpenQuickRequest?: () => void
}

export const CreateRequestDashedCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <div
      onClick={() => {
        triggerHapticFeedback('heavy')
        onClick()
      }}
      className="w-full rounded-3xl p-8 bg-[#0A101D]/40 backdrop-blur-md border-2 border-dashed border-[#00F2FE]/60 hover:border-[#00F2FE] hover:bg-[#00F2FE]/10 transition-all cursor-pointer group flex flex-col items-center justify-center text-center gap-3.5 shadow-[0_0_25px_rgba(0,242,254,0.15)] animate-fadeIn"
    >
      <div className="w-16 h-16 rounded-2xl bg-[#00F2FE]/15 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.3)] group-hover:scale-110 transition-transform">
        <Sparkles className="w-8 h-8 text-[#00F2FE] animate-pulse" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-extrabold text-white group-hover:text-[#00F2FE] transition-colors flex items-center justify-center gap-2">
          <span>Создать первую заявку с ИИ</span>
          <span className="text-[10px] bg-[#00F2FE]/20 text-[#00F2FE] px-2 py-0.5 rounded font-black border border-[#00F2FE]/30">
            FAST
          </span>
        </h3>
        <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
          Опишите голосом или текстом — ИИ за секунды оформит заказ и соберет лучшие отклики
        </p>
      </div>

      <div className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00A3FF] text-black font-black text-xs shadow-[0_0_15px_rgba(0,242,254,0.4)] group-hover:brightness-110 transition-all flex items-center gap-1.5 mt-1">
        <Sparkles className="w-3.5 h-3.5 fill-black" />
        <span>Создать заявку</span>
      </div>
    </div>
  )
}

export const MyDealsAndListingsView: React.FC<MyDealsAndListingsViewProps> = ({
  myRequests,
  myMarketItems,
  bidsByRequestId = {},
  onOpenDealChat,
  onOpenMarketItem,
  onDeleteMarketItem,
  onDeleteRequest,
  onOpenQuickRequest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'market' | 'bids' | 'templates'>('requests')
  const [isRulesOpen, setIsRulesOpen] = useState(false)

  // Real bids submitted by user or providers
  const allSubmittedBids = Object.values(bidsByRequestId).flat()

  return (
    <div className="w-full space-y-4 pb-28 animate-fadeIn">
      {/* 1. Header & Sub-Tab Navigation */}
      <div className="bg-[#121824] border border-white/10 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Центр Управления Откликами</span>
              <span className="text-[10px] bg-[#00F2FE]/20 text-[#00F2FE] px-2 py-0.5 rounded font-bold border border-[#00F2FE]/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">Отслеживайте отклики, лоты и ваши предложения</p>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="flex flex-wrap gap-1 bg-[#070B12] p-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSubTab('requests')
            }}
            className={`py-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'requests'
                ? 'bg-[#00F2FE] text-black font-extrabold shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>📋 Мои Заявки</span>
            <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">{myRequests.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSubTab('templates')
            }}
            className={`py-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'templates'
                ? 'bg-amber-500 text-black font-extrabold shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>✨ Шаблоны</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSubTab('market')
            }}
            className={`py-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'market'
                ? 'bg-[#CCFF00] text-black font-extrabold shadow-[0_0_12px_rgba(204,255,0,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🔥 Мои Лоты</span>
            <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">{myMarketItems.length}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSubTab('bids')
            }}
            className={`py-2 px-3 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'bids'
                ? 'bg-purple-500 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>⭐ Мои Отклики</span>
            <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">{allSubmittedBids.length}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'templates' && (
        <OfferInstancesManager />
      )}

      {/* 2. SUB-TAB 1: MY REQUESTS (Входящие офферы по заявкам клиента) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <CreateRequestDashedCard onClick={() => onOpenQuickRequest?.()} />
          ) : (
            myRequests.map((req) => {
              const bids = bidsByRequestId[req.id] || []
              return (
                <div
                  key={req.id}
                  className="w-full rounded-3xl p-4.5 bg-gradient-to-br from-[#0A101D] via-[#0F172A] to-[#0A101D] border-2 border-[#00F2FE]/70 shadow-[0_0_30px_rgba(0,242,254,0.25)] flex flex-col gap-3 relative overflow-hidden animate-fadeIn"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 uppercase">
                          {req.categoryL1Name}
                        </span>
                        <span className="text-[11px] text-cyan-300 font-bold bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                          📍 {req.district}
                        </span>
                      </div>
                      <h3 className="font-extrabold text-white text-base mt-1.5 leading-tight">{req.title}</h3>
                      <p className="text-xs text-gray-300 leading-snug mt-1">{req.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRequest(req.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors shrink-0"
                      title="Удалить заявку"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* InDrive Stream of incoming offer cards for this request */}
                  <ClientOffersStream
                    request={req}
                    bids={bids}
                    onAcceptOffer={(bid) => {
                      onOpenDealChat(req, bid, false)
                    }}
                    onClarifyOffer={(bid) => {
                      onOpenDealChat(req, bid, true)
                    }}
                  />
                </div>
              )
            })
          )}
        </div>
      )}

      {/* 3. SUB-TAB 2: MY FLASH MARKET LISTINGS (Лоты) */}
      {activeSubTab === 'market' && (
        <div className="space-y-3">
          {myMarketItems.length === 0 ? (
            <div className="glass-card p-6 text-center rounded-2xl border border-white/10 space-y-2">
              <p className="text-xs text-gray-400">Вы пока не опубликовали ни одного горящего лота в Маркете.</p>
            </div>
          ) : (
            myMarketItems.map((item) => (
              <div
                key={item.id}
                className="glass-card p-3 rounded-2xl border border-[#CCFF00]/30 flex gap-3 relative overflow-hidden"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 rounded-xl object-cover border border-[#CCFF00]/40 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] bg-[#CCFF00]/20 text-[#CCFF00] font-black px-1.5 py-0.2 rounded uppercase border border-[#CCFF00]/30">
                        {item.condition}
                      </span>
                      <h3 className="font-extrabold text-white text-xs leading-snug mt-0.5 line-clamp-1">{item.title}</h3>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <span className="text-gray-500 line-through">${item.oldPrice}</span>
                        <span className="text-[#CCFF00] font-black text-xs">${item.price} USD</span>
                        <span>• {item.district}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteMarketItem(item.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Снять с продажи"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px]">
                    <span className="text-gray-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-[#CCFF00]" />
                      Таймер: {item.expiresIn}
                    </span>

                    <button
                      type="button"
                      onClick={() => onOpenMarketItem(item)}
                      className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-bold hover:bg-white/20 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#00F2FE]" />
                      <span>Просмотр</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 4. SUB-TAB 3: MY SUBMITTED BIDS (Отклики PRO Исполнителя) */}
      {activeSubTab === 'bids' && (
        <div className="space-y-3">
          {allSubmittedBids.length === 0 ? (
            <div className="glass-card p-6 text-center rounded-2xl border border-white/10 space-y-2">
              <p className="text-xs text-gray-400">Вы пока не выставляли откликов на заявки других пользователей.</p>
            </div>
          ) : (
            allSubmittedBids.map((bid) => (
              <div
                key={bid.id}
                className="glass-card p-4 rounded-2xl border border-purple-500/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40 uppercase">
                      PRO Отклик (${bid.proposedPrice} USD)
                    </span>
                    <h3 className="font-extrabold text-white text-xs mt-1.5">{bid.comment || 'Отклик на заявку'}</h3>
                    <p className="text-[11px] text-gray-300 font-normal mt-1 italic bg-white/[0.03] p-2 rounded-xl border border-white/10">
                      Исполнитель: {bid.providerName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold">
                  <span className="inline-flex items-center gap-1 text-[#CCFF00] bg-[#CCFF00]/15 px-2 py-0.5 rounded-full border border-[#CCFF00]/40 text-[10px]">
                    <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" />
                    {bid.status === 'accepted' ? 'Принят клиентом' : 'Ожидает ответа'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Platform Rules Link */}
      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => setIsRulesOpen(true)}
          className="text-[11px] text-gray-500 hover:text-cyan-400 underline transition-colors"
        >
          Правила пользования платформой
        </button>
      </div>

      <PlatformRulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
        type="user" 
      />
    </div>
  )
}
