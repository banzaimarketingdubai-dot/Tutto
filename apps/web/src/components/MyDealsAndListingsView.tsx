import React, { useState } from 'react'
import { RequestItem, MarketItem, BidItem } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'
import { Clock, MessageSquare, Flame, CheckCircle2, AlertCircle, Trash2, Eye, Award, MapPin } from 'lucide-react'
import { PlatformRulesModal } from './PlatformRulesModal'
import { OfferInstancesManager } from './OfferInstancesManager'
interface MyDealsAndListingsViewProps {
  myRequests: RequestItem[]
  myMarketItems: MarketItem[]
  onOpenDealChat: (req: RequestItem, bid: BidItem) => void
  onOpenMarketItem: (item: MarketItem) => void
  onDeleteMarketItem: (itemId: string) => void
  onDeleteRequest: (reqId: string) => void
}

export const MyDealsAndListingsView: React.FC<MyDealsAndListingsViewProps> = ({
  myRequests,
  myMarketItems,
  onOpenDealChat,
  onOpenMarketItem,
  onDeleteMarketItem,
  onDeleteRequest,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'requests' | 'market' | 'bids' | 'templates'>('requests')
  const [isRulesOpen, setIsRulesOpen] = useState(false)

  // Mock submitted bids for PRO provider view
  const myBids: { bid: BidItem; requestTitle: string; district: string }[] = [
    {
      bid: {
        id: 'bid-my-1',
        requestId: 'req-bike',
        providerId: 'usr-me',
        providerName: 'Вы (PRO Исполнитель)',
        providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        providerRating: 5.0,
        isPro: true,
        isAiAgent: false,
        proposedPrice: 220,
        currency: 'USD',
        comment: 'Готов доставить Yamaha NMAX 155cc в течение 30 минут с двумя шлемами.',
        status: 'accepted',
        createdAt: '10 мин назад',
      },
      requestTitle: 'Ищу Yamaha NMAX 155cc (Пхукет)',
      district: 'Patong',
    },
    {
      bid: {
        id: 'bid-my-2',
        requestId: 'req-car',
        providerId: 'usr-me',
        providerName: 'Вы (PRO Исполнитель)',
        providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        providerRating: 5.0,
        isPro: true,
        isAiAgent: false,
        proposedPrice: 380,
        currency: 'USD',
        comment: 'Новый Honda City 2024 года, полная страховка без залога паспорта.',
        status: 'pending',
        createdAt: '1 час назад',
      },
      requestTitle: 'Ищу Компактный авто (Honda City)',
      district: 'Rawai',
    },
  ]

  return (
    <div className="w-full space-y-4 pb-28 animate-fadeIn">
      {/* 1. Header & Sub-Tab Navigation */}
      <div className="bg-[#121824] border border-white/10 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Управление и Мои записи</span>
              <span className="text-[10px] bg-[#00F2FE]/20 text-[#00F2FE] px-2 py-0.5 rounded font-bold border border-[#00F2FE]/30">
                ACTIVE
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 font-medium">Отслеживайте ваши заявки, лоты и сделки</p>
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
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
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
            className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
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
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
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
            className={`py-2 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeSubTab === 'bids'
                ? 'bg-purple-500 text-white font-extrabold shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>⭐ Мои Отклики</span>
            <span className="text-[9px] bg-black/20 px-1.5 py-0.2 rounded font-black">{myBids.length}</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'templates' && (
        <OfferInstancesManager />
      )}

      {/* 2. SUB-TAB 1: MY REQUESTS (Услуги & Аукционы) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-3">
          {myRequests.length === 0 ? (
            <div className="glass-card p-6 text-center rounded-2xl border border-white/10 space-y-2">
              <p className="text-xs text-gray-400">У вас пока нет активных заявок в аукционе услуг.</p>
            </div>
          ) : (
            myRequests.map((req) => (
              <div
                key={req.id}
                className="glass-card p-4 rounded-2xl border border-[#00F2FE]/20 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded border border-[#00F2FE]/30 uppercase">
                      {req.categoryL1Name}
                    </span>
                    <h3 className="font-extrabold text-white text-sm mt-1">{req.title}</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00F2FE]" />
                        {req.district}
                      </span>
                      <span>• Бюджет: <strong>${req.budget || 0} USD</strong></span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteRequest(req.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Удалить заявку"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold">
                  <div className="flex items-center gap-1.5 text-gray-300">
                    <MessageSquare className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>Откликов от PRO-исполнителей: <strong className="text-[#00F2FE]">{req.bidsCount}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('heavy')
                      const dummyBid: BidItem = {
                        id: `bid-sys-${Date.now()}`,
                        requestId: req.id,
                        providerId: 'prov-pro-1',
                        providerName: 'Ayana Luxury Resort',
                        providerAvatar: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100',
                        providerRating: 4.9,
                        isPro: true,
                        isAiAgent: false,
                        proposedPrice: req.budget || 220,
                        currency: 'USD',
                        comment: 'Готовы выполнить в лучшем виде. Доставим в течение 30 минут!',
                        status: 'pending',
                        createdAt: 'Только что',
                      }
                      onOpenDealChat(req, dummyBid)
                    }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-cyan-500 text-black font-extrabold text-[11px] shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:brightness-110 active:scale-95 transition-all"
                  >
                    Открыть чат сделки
                  </button>
                </div>
              </div>
            ))
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
          {myBids.map(({ bid, requestTitle, district }) => (
            <div
              key={bid.id}
              className="glass-card p-4 rounded-2xl border border-purple-500/30 space-y-3 relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/40 uppercase">
                    PRO Отклик (${bid.proposedPrice} USD)
                  </span>
                  <h3 className="font-extrabold text-white text-xs mt-1.5">{requestTitle}</h3>
                  <p className="text-[11px] text-gray-300 font-normal mt-1 italic bg-white/[0.03] p-2 rounded-xl border border-white/10">
                    «{bid.comment}»
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-bold">
                <span className="inline-flex items-center gap-1 text-[#CCFF00] bg-[#CCFF00]/15 px-2 py-0.5 rounded-full border border-[#CCFF00]/40 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" />
                  Принят клиентом
                </span>

                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('heavy')
                    const targetReq: RequestItem = {
                      id: bid.requestId,
                      clientId: 'usr-client',
                      clientName: 'Александр',
                      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                      clientRating: 5.0,
                      hub: 'phuket' as any,
                      district,
                      categoryL1Id: 'cat-transport',
                      categoryL1Name: 'Транспорт',
                      title: requestTitle,
                      description: 'Детальное описание заказа...',
                      budget: bid.proposedPrice,
                      currency: 'USD',
                      mediaUrls: [],
                      isFeatured: true,
                      status: 'in_progress',
                      createdAt: new Date().toISOString(),
                      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
                      auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
                      bidsCount: 1,
                    }
                    onOpenDealChat(targetReq, bid)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-extrabold text-[11px] shadow-[0_0_12px_rgba(168,85,247,0.3)] hover:brightness-110 active:scale-95 transition-all"
                >
                  Перейти в чат сделки
                </button>
              </div>
            </div>
          ))}
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
