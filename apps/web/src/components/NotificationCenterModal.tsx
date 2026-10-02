import React, { useState } from 'react'
import { X, Bell, CheckCheck, Sparkles, Volume2, VolumeX, MessageSquare, Zap, Coins, Flame, ArrowRight } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { NotificationItem, playNotificationChime, requestNotificationPermission, sendBrowserPushNotification } from '../lib/notifications'

interface NotificationCenterModalProps {
  isOpen: boolean
  notifications: NotificationItem[]
  onClose: () => void
  onMarkAllRead: () => void
  onSelectNotification: (item: NotificationItem) => void
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkAllRead,
  onSelectNotification,
}) => {
  if (!isOpen) return null

  const [activeFilter, setActiveFilter] = useState<'all' | 'bid' | 'market' | 'reward'>('all')
  const [soundEnabled, setSoundEnabled] = useState(true)

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'all') return true
    return n.type === activeFilter
  })

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const handleTestSound = () => {
    if (soundEnabled) {
      playNotificationChime()
      triggerNotificationFeedback('success')
    }
  }

  const getIconForType = (type: NotificationItem['type']) => {
    switch (type) {
      case 'bid':
        return <MessageSquare className="w-4 h-4 text-[#00F2FE]" />
      case 'urgent':
        return <Zap className="w-4 h-4 text-purple-400" />
      case 'reward':
        return <Coins className="w-4 h-4 text-amber-400" />
      case 'market':
        return <Flame className="w-4 h-4 text-[#CCFF00]" />
      default:
        return <Bell className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0D1117] border border-white/15 rounded-3xl p-5 shadow-2xl relative text-white overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#00F2FE]/20 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE]">
                <Bell className="w-5 h-5" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white font-black text-[9px] flex items-center justify-center border border-black animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-base font-display text-white flex items-center gap-1.5">
                <span>Центр Уведомлений</span>
              </h2>
              <p className="text-[10px] text-gray-400">Сигналы аукционов и P2P-активность в реальном времени</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Browser Push Notification Permission Request */}
            <button
              type="button"
              onClick={async () => {
                triggerHapticFeedback('medium')
                const perm = await requestNotificationPermission()
                if (perm === 'granted') {
                  playNotificationChime()
                  sendBrowserPushNotification('🔔 Пуш-уведомления включены!', {
                    body: 'Вы будете получать мгновенные сигналы о новых сообщениях и откликах.',
                  })
                }
              }}
              title="Разрешить Браузерные Push-уведомления"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer border border-[#00F2FE]/20"
            >
              <Sparkles className="w-4 h-4 text-[#00F2FE]" />
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled
                setSoundEnabled(next)
                if (next) handleTestSound()
              }}
              title={soundEnabled ? 'Звук включен' : 'Без звука'}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                triggerHapticFeedback('light')
                onClose()
              }}
              aria-label="Закрыть"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Actions Bar */}
        <div className="flex items-center justify-between py-3 shrink-0">
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'Все' },
              { id: 'bid', label: 'Отклики' },
              { id: 'market', label: 'Маркет' },
              { id: 'reward', label: 'Монеты' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                aria-label={`Фильтр ${f.label}`}
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveFilter(f.id as any)
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-[#00F2FE] text-black font-extrabold shadow-[0_0_10px_rgba(0,242,254,0.3)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('medium')
                onMarkAllRead()
              }}
              className="text-[10px] text-cyan-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Прочитать всё</span>
            </button>
          )}
        </div>

        {/* Notifications List Area */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-xs">
              Уведомлений в данной категории пока нет
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  triggerHapticFeedback('light')
                  if (soundEnabled && !item.isRead) playNotificationChime()
                  onSelectNotification(item)
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  !item.isRead
                    ? 'bg-gradient-to-r from-[#00F2FE]/10 to-transparent border-[#00F2FE]/40'
                    : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.06]'
                }`}
              >
                {!item.isRead && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-[#00F2FE] shadow-[0_0_8px_#00F2FE]" />
                )}

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>

                  <div className="flex-1 pr-3">
                    <div className="font-extrabold text-xs text-white leading-snug">
                      {item.title}
                    </div>
                    <p className="text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/5">
                      <span className="text-[9px] text-gray-400 font-mono">{item.timestamp}</span>
                      <span className="text-[10px] text-[#00F2FE] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span>Перейти</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
