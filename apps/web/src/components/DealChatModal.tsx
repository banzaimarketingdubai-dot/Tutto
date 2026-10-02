import React, { useState, useEffect } from 'react'
import { X, Send, ShieldCheck, CheckCircle2, AlertTriangle, Star, Clock, ChevronUp, ChevronDown, UserCheck, ShieldAlert, Award } from 'lucide-react'
import { RequestItem, BidItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { supabase } from '../lib/supabase'
import { ReviewModal } from './ReviewModal'
import { sendBrowserPushNotification, playNotificationChime } from '../lib/notifications'

interface DealChatModalProps {
  isOpen: boolean
  request: RequestItem | null
  bid: BidItem | null
  onClose: () => void
  onCompleteDeal: () => void
  onNewMessage?: (msg: ChatMessage) => void
  currentUserRole?: 'client' | 'provider'
}

interface ChatMessage {
  id: string
  senderRole: 'client' | 'provider' | 'system' | 'admin'
  senderName: string
  content: string
  timestamp: string
}

export type DealStatusType = 'in_progress' | 'awaiting_confirmation' | 'completed' | 'disputed'

export const DealChatModal: React.FC<DealChatModalProps> = ({
  isOpen,
  request,
  bid,
  onClose,
  onCompleteDeal,
  onNewMessage,
  currentUserRole = 'client',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [dealStatus, setDealStatus] = useState<DealStatusType>('in_progress')
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isNoticeExpanded, setIsNoticeExpanded] = useState(true)
  const [simulatedRole, setSimulatedRole] = useState<'client' | 'provider'>(currentUserRole)
  const [showDisputeConfirm, setShowDisputeConfirm] = useState(false)
  const [hideScamWarning, setHideScamWarning] = useState(() => localStorage.getItem('hide_scam_warning') === 'true')

  useEffect(() => {
    if (isOpen && request && bid) {
      setSimulatedRole(currentUserRole)
      setMessages([
        {
          id: 'msg-1',
          senderRole: 'system',
          senderName: 'TuttoMinutto System',
          content: `🎉 Оффер принят! Сделка по «${request.title}» переведена в статус «В процессе». Договоренная сумма: $${bid.proposedPrice}.`,
          timestamp: 'Только что',
        },
        {
          id: 'msg-2',
          senderRole: 'provider',
          senderName: bid.providerName,
          content: bid.comment || 'Здравствуйте! Готов к выполнению заказа.',
          timestamp: '1 мин назад',
        },
      ])
      setDealStatus('in_progress')
      setIsNoticeExpanded(true)
    }
  }, [isOpen, request, bid])

  // Supabase Realtime Channel Subscription for live deal chat
  useEffect(() => {
    if (!isOpen || !request || !bid) return

    const channelName = `deal_chat_${request.id}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `request_id=eq.${request.id}`,
        },
        (payload) => {
          const newMsg = payload.new
          if (newMsg) {
            const chatMsg: ChatMessage = {
              id: newMsg.id || `msg-${Date.now()}`,
              senderRole: newMsg.sender_role || 'provider',
              senderName: newMsg.sender_name || bid.providerName,
              content: newMsg.content,
              timestamp: 'Только что',
            }
            setMessages((prev) => [...prev, chatMsg])
            triggerNotificationFeedback('success')
            if (chatMsg.senderRole !== simulatedRole) {
              playNotificationChime()
              sendBrowserPushNotification(`Новое сообщение от ${chatMsg.senderName}`, { body: chatMsg.content })
              onNewMessage?.(chatMsg)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isOpen, request, bid])

  if (!isOpen || !request || !bid) return null

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || dealStatus === 'completed') return

    const text = newMessage.trim()
    setNewMessage('')
    triggerHapticFeedback('light')

    const isClient = simulatedRole === 'client'

    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: isClient ? 'client' : 'provider',
      senderName: isClient ? 'Вы (Заказчик)' : bid.providerName,
      content: text,
      timestamp: 'Только что',
    }

    setMessages((prev) => [...prev, msg])

    // Try posting message to Supabase DB for Realtime sync
    try {
      await supabase.from('chat_messages').insert({
        request_id: request.id,
        sender_role: isClient ? 'client' : 'provider',
        sender_name: isClient ? 'Вы (Заказчик)' : bid.providerName,
        content: text,
      })
    } catch {
      // Ignore if offline
    }

    // Auto-reply simulation based on role
    const autoReplyRole = isClient ? 'provider' : 'client'
    const autoReplyName = isClient ? bid.providerName : 'Александр (Заказчик)'
    const autoReplyContent = isClient ? 'Принято! Все условия согласованы.' : 'Отлично, жду выполнения.'

    if (dealStatus === 'in_progress') {
      setTimeout(() => {
        const replyMsg: ChatMessage = {
          id: `msg-reply-${Date.now()}`,
          senderRole: autoReplyRole,
          senderName: autoReplyName,
          content: autoReplyContent,
          timestamp: 'Только что',
        }
        setMessages((prev) => [...prev, replyMsg])
        triggerNotificationFeedback('success')
        playNotificationChime()
        sendBrowserPushNotification(`Новое сообщение от ${autoReplyName}`, { body: autoReplyContent })
        onNewMessage?.(replyMsg)
      }, 1800)
    }
  }

  // Provider Action: Mark completed & request client confirmation
  const handleProviderMarkDone = () => {
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setDealStatus('awaiting_confirmation')
    
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-sys-done-${Date.now()}`,
        senderRole: 'system',
        senderName: 'TuttoMinutto System',
        content: `✅ Исполнитель (${bid.providerName}) отметил услугу как «Выполненную». Заказчик, пожалуйста, подтвердите получение услуги.`,
        timestamp: 'Только что',
      },
    ])
  }

  // Client Action: Confirm completion -> open review modal
  const handleClientConfirm = () => {
    triggerHapticFeedback('heavy')
    setShowReviewModal(true)
  }


  // Client Action: Confirm Dispute/Appeals after modal approval
  const handleDispute = () => {
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('warning')
    setDealStatus('disputed')
    setShowDisputeConfirm(false)

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-sys-dispute-${Date.now()}`,
        senderRole: 'admin',
        senderName: '🕵️ Модератор Sherlock',
        content: `⚠️ Апелляция зарегистрирована. Внутренний арбитраж подключён. История переписки зафиксирована для разбора претензий.`,
        timestamp: 'Только что',
      },
    ])
  }

  // Determine product name context
  let productName = undefined
  const offerMatch = bid.comment.match(/\[📌 Прикреплен шаблон: (.*?)\]/)
  if (offerMatch) {
    productName = offerMatch[1]
  } else if (request.categoryL1Id === 'cat-market') {
    productName = request.title.replace('Покупка: «', '').replace('»', '')
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
        <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-[#00F2FE]/40 flex flex-col h-[92vh] sm:h-[85vh] overflow-hidden safe-area-bottom shadow-[0_0_40px_rgba(0,242,254,0.15)] relative">
          
          {/* 1. Header: Opponent Info + Perspective Switcher + Close */}
          <div className="p-3.5 bg-[#161B22] border-b border-white/10 flex items-center justify-between shrink-0 relative z-20">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img
                  src={bid.providerAvatar || 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=100'}
                  alt={bid.providerName}
                  className="w-10 h-10 rounded-xl border border-[#00F2FE] object-cover shadow-[0_0_10px_rgba(0,242,254,0.4)]"
                />
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-[#CCFF00] rounded-full border-2 border-[#161B22]" />
              </div>
              <div className="flex flex-col">
                <div className="font-extrabold text-white text-xs flex items-center gap-1.5">
                  <span>{bid.providerName}</span>
                  <span className="badge-pro text-[9px] px-1.5 py-0.2 rounded font-black bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40">PRO 4.9★</span>
                </div>
                <div className="text-[11px] text-gray-300 font-medium flex items-center gap-1 mt-0.5">
                  <span className="text-[#CCFF00] font-black">${bid.proposedPrice} USD</span>
                  <span>• {request.district}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Perspective Role Switcher (For Demo & Testing) */}
              <button
                onClick={() => setSimulatedRole(simulatedRole === 'client' ? 'provider' : 'client')}
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-[10px] font-bold text-cyan-300 flex items-center gap-1 transition-all"
                title="Переключить роль для теста"
              >
                <UserCheck className="w-3 h-3 text-[#00F2FE]" />
                <span>{simulatedRole === 'client' ? 'Роль: Клиент' : 'Роль: Бизнес'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. Status Progress Bar (Binance P2P style) */}
          <div className="px-4 py-2 bg-[#0D1117] border-b border-white/10 flex items-center justify-between text-[11px] font-bold tracking-wider shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="text-gray-400 uppercase">Статус:</span>
              {dealStatus === 'in_progress' && (
                <span className="inline-flex items-center gap-1 text-[#00F2FE] bg-[#00F2FE]/10 px-2 py-0.5 rounded-full border border-[#00F2FE]/30 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                  В процессе
                </span>
              )}
              {dealStatus === 'awaiting_confirmation' && (
                <span className="inline-flex items-center gap-1 text-amber-300 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Ждёт подтверждения
                </span>
              )}
              {dealStatus === 'completed' && (
                <span className="inline-flex items-center gap-1 text-[#CCFF00] bg-[#CCFF00]/15 px-2 py-0.5 rounded-full border border-[#CCFF00]/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CCFF00]" />
                  Сделка закрыта
                </span>
              )}
              {dealStatus === 'disputed' && (
                <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/15 px-2 py-0.5 rounded-full border border-red-500/40">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  Апелляция / Спор
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-gray-400 font-mono text-[10px]">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Авто-закрытие: 7 дн</span>
            </div>
          </div>

          {/* 3. Collapsible Platform Instructions Card (No Escrow Warning) */}
          <div className="bg-[#121824] border-b border-white/10 shrink-0">
            <div 
              onClick={() => setIsNoticeExpanded(!isNoticeExpanded)}
              className="px-4 py-1.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Безопасность Sherlock Deals (Без эскроу)</span>
              </div>
              {isNoticeExpanded ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
            </div>

            {isNoticeExpanded && (
              <div className="px-4 pb-2.5 pt-0 text-[11px] text-gray-300 leading-relaxed font-normal">
                ⚠️ Платформа не удерживает фиатные средства. Оплачивайте услугу <strong>только после ее фактического получения</strong>. Все договоренности фиксируйте в этом чате на случай апелляции.
              </div>
            )}
          </div>

          {/* 4. Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#070B12]/80">
            {messages.map((msg) => {
              if (msg.senderRole === 'system') {
                return (
                  <div key={msg.id} className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs text-center font-medium my-2 shadow-[0_0_15px_rgba(0,242,254,0.1)]">
                    <div className="flex items-center justify-center gap-1.5 mb-1 font-bold text-[#00F2FE]">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Системное уведомление TuttoMinutto</span>
                    </div>
                    {msg.content}
                  </div>
                )
              }

              if (msg.senderRole === 'admin') {
                return (
                  <div key={msg.id} className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-200 text-xs font-medium my-2 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <div className="flex items-center gap-1.5 mb-1 font-bold text-red-400 text-xs uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{msg.senderName}</span>
                    </div>
                    {msg.content}
                  </div>
                )
              }

              const isMe = (simulatedRole === 'client' && msg.senderRole === 'client') || (simulatedRole === 'provider' && msg.senderRole === 'provider')
              const hasExternalLink = /(https?:\/\/[^\s]+|@[a-zA-Z0-9_]+)/.test(msg.content)
              const showScamWarning = hasExternalLink && simulatedRole === 'client' && !isMe && !hideScamWarning

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">{msg.senderName}</span>
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-[#00F2FE] to-cyan-600 text-black font-semibold rounded-br-none shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                        : 'bg-[#161B22] border border-white/15 text-gray-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {showScamWarning && (
                    <div className="mt-1.5 ml-1 max-w-[85%] p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-200/90 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                      ⚠️ Платформа не сможет обеспечить арбитраж, если вы продолжите общение вне чата. Рекомендуем оставаться здесь для безопасной сделки.
                      <label className="flex items-center gap-1.5 mt-2 cursor-pointer text-amber-400/70 hover:text-amber-400 transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-3 h-3 accent-amber-500 cursor-pointer"
                          onChange={(e) => {
                            if (e.target.checked) {
                               setHideScamWarning(true);
                               localStorage.setItem('hide_scam_warning', 'true');
                            }
                          }}
                        />
                        <span className="font-medium">Понятно, больше не показывать</span>
                      </label>
                    </div>
                  )}
                  <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              );
            })}
          </div>

          {/* 5. Dynamic Role Action Bar (Липкий подвал действий) */}
          <div className="p-3 bg-[#121722] border-t border-white/10 space-y-2 shrink-0 relative z-20">
            {/* Contextual Action Buttons depending on role & deal state */}
            {simulatedRole === 'provider' && dealStatus === 'in_progress' && (
              <button
                onClick={handleProviderMarkDone}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#CCFF00] to-[#B8E600] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <CheckCircle2 className="w-4 h-4 text-black fill-black" />
                <span>✅ УСЛУГА ОКАЗАНА (Запросить подтверждение)</span>
              </button>
            )}

            {simulatedRole === 'client' && (dealStatus === 'in_progress' || dealStatus === 'awaiting_confirmation') && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setShowDisputeConfirm(true)
                  }}
                  className="px-3 py-2.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-red-500/25 transition-colors shrink-0 cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                  <span>Спор</span>
                </button>

                <button
                  type="button"
                  onClick={handleClientConfirm}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4 text-black fill-black" />
                  <span>✅ ПОДТВЕРДИТЬ ВЫПОЛНЕНИЕ (+15 Coins)</span>
                </button>
              </div>
            )}

            {dealStatus === 'completed' && (
              <div className="p-2 rounded-xl bg-[#CCFF00]/15 border border-[#CCFF00]/40 text-[#CCFF00] text-xs font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Сделка успешно закрыта! Отзыв опубликован (+15 Coins начислено).</span>
              </div>
            )}

            {/* Input form */}
            <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder={dealStatus === 'completed' ? 'Сделка завершена' : 'Напишите сообщение...'}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={dealStatus === 'completed'}
                className="flex-1 bg-[#070B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={dealStatus === 'completed' || !newMessage.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00F2FE] to-[#00F2FE] flex items-center justify-center text-black font-extrabold hover:scale-105 active:scale-95 transition-transform disabled:opacity-40"
              >
                <Send className="w-4 h-4 fill-black" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Dispute Confirmation Modal */}
      {showDisputeConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm bg-[#0D1117] border border-red-500/40 rounded-3xl p-5 shadow-2xl relative text-white space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Открыть спор по сделке?</h3>
                <p className="text-[11px] text-gray-400">Переписка будет зафиксирована для арбитража</p>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10">
              Вы уверены, что хотите передать дело модератору? Это подключит команду Sherlock для проверки претензий.
            </p>

            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDisputeConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleDispute}
                className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-extrabold text-xs shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all cursor-pointer"
              >
                Да, открыть спор
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Deal Review Modal */}
      <ReviewModal
        isOpen={showReviewModal}
        dealId={request.id}
        targetName={simulatedRole === 'client' ? bid.providerName : request.clientName}
        productName={productName}
        onClose={() => {
          setShowReviewModal(false)
          setDealStatus('completed')
        }}
        onSubmitReview={(review) => {
          setDealStatus('completed')
          setShowReviewModal(false)
          triggerNotificationFeedback('success')
          onCompleteDeal()
        }}
      />
    </>
  )
}
