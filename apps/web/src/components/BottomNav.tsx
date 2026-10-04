import React, { useState } from 'react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { Home, Star, MessageSquare, User, Search, Package, Flame, Plus } from 'lucide-react'
import { Language, t } from '../lib/i18n'

export type TabId = 'home' | 'my-bids' | 'explore' | 'chat' | 'account' | 'market' | 'mine'
export type AppMode = 'rent' | 'services' | 'market'

export interface BottomNavProps {
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  mode: AppMode
  onCentralAction?: () => void
  onBlockedClick?: () => void
  currentLang?: Language
  unreadChatCount?: number
  unreadBidsCount?: number
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  mode,
  onCentralAction,
  onBlockedClick,
  currentLang = 'ru',
  unreadChatCount = 0,
  unreadBidsCount = 0,
}) => {
  const [isFabClicked, setIsFabClicked] = useState(false)

  const isLocked = mode !== 'rent'

  const handleFabClick = () => {
    if (isLocked) {
      triggerNotificationFeedback('error')
      if (onBlockedClick) onBlockedClick()
      return
    }
    setIsFabClicked(true)
    triggerHapticFeedback('heavy')
    if (onCentralAction) onCentralAction()
    setTimeout(() => setIsFabClicked(false), 200)
  }

  const handleTabClick = (tab: TabId) => {
    if (isLocked) {
      triggerNotificationFeedback('error')
      if (onBlockedClick) onBlockedClick()
      return
    }
    triggerHapticFeedback('light')
    onSelectTab(tab)
  }

  const navItems: { id: TabId; labelKey: string; icon: React.ElementType }[] = [
    { id: 'home', labelKey: 'tab_home', icon: Home },
    { id: 'my-bids', labelKey: 'tab_my_bids', icon: Star },
    { id: 'chat', labelKey: 'tab_chat', icon: MessageSquare },
    { id: 'account', labelKey: 'tab_account', icon: User },
  ]

  return (
    <nav className={`fixed bottom-0 left-0 right-0 backdrop-blur-2xl px-4 pt-3 pb-6 sm:pb-3 z-40 transition-all duration-300 ${
      isLocked ? 'bg-black/80 opacity-60 border-t border-white/5' : 'bg-white/[0.08]'
    }`}>
      <div className="max-w-[390px] mx-auto flex justify-between items-center relative">
        {/* Lock Overlay Banner when in Services or Market mode */}
        {isLocked && (
          <div 
            onClick={() => {
              triggerNotificationFeedback('error')
              if (onBlockedClick) onBlockedClick()
            }}
            className="absolute -top-7 left-1/2 -translate-x-1/2 bg-amber-500/90 text-black px-3 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase shadow-[0_0_12px_rgba(245,158,11,0.5)] z-50 flex items-center gap-1 cursor-pointer animate-pulse"
          >
            <span>🔒 Нижнее меню доступно только в «Аренде»</span>
          </div>
        )}

        {navItems.map((item, index) => {
          const isActive = activeTab === item.id || (item.id === 'home' && activeTab === 'market')
          const Icon = item.icon
          
          return (
            <React.Fragment key={item.id}>
              {index === 2 && (
                <div className="relative flex justify-center items-center w-[60px]">
                  {/* Pulsing Glow Background */}
                  <div className={`absolute -top-6 w-[64px] h-[64px] rounded-full animate-pulse blur-md opacity-60 ${
                    mode === 'rent'
                      ? 'bg-[#00F2FE]'
                      : mode === 'services'
                      ? 'bg-[#FF2A85]'
                      : 'bg-[#CCFF00]'
                  }`} />
                  
                  <button
                    type="button"
                    onClick={handleFabClick}
                    aria-label={mode === 'market' ? 'Добавить лот' : 'Создать заказ'}
                    className={`absolute -top-6 flex items-center justify-center w-[64px] h-[64px] rounded-full border transition-all duration-300 shadow-xl z-[60] overflow-hidden group backdrop-blur-xl ${
                      isLocked
                        ? 'bg-gray-800/80 border-gray-600 opacity-60 cursor-not-allowed'
                        : mode === 'rent'
                        ? 'bg-[#00F2FE]/20 border-white/20 shadow-[0_4px_25px_rgba(0,242,254,0.4)] hover:bg-[#00F2FE]/30 hover:border-white/40'
                        : mode === 'services'
                        ? 'bg-[#FF2A85]/20 border-white/20 shadow-[0_4px_25px_rgba(255,42,133,0.4)] hover:bg-[#FF2A85]/30 hover:border-white/40'
                        : 'bg-[#CCFF00]/20 border-white/20 shadow-[0_4px_25px_rgba(204,255,0,0.4)] hover:bg-[#CCFF00]/30 hover:border-white/40'
                    } ${
                      isFabClicked
                        ? 'scale-95 shadow-none'
                        : 'hover:scale-105'
                    }`}
                  >
                    {/* Glass shine animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-full h-full animate-glass-shine" />
                    <Plus 
                      className="w-9 h-9 transition-all duration-300 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] relative z-10" 
                      strokeWidth={3} 
                    />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleTabClick(item.id)}
                className={`flex flex-col items-center gap-1 text-center w-[60px] relative transition-opacity ${
                  isLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon 
                    className={`w-[24px] h-[24px] transition-all duration-300 nav-icon-morph ${
                      isActive && !isLocked
                        ? (mode === 'rent' 
                            ? 'text-[#00F2FE] drop-shadow-[0_0_12px_rgba(0,242,254,0.7)] scale-110' 
                            : mode === 'services'
                            ? 'text-[#FF2A85] drop-shadow-[0_0_12px_rgba(255,42,133,0.7)] scale-110'
                            : 'text-[#CCFF00] drop-shadow-[0_0_12px_rgba(204,255,0,0.7)] scale-110')
                        : 'text-white/90 hover:text-white'
                    }`} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {/* Neon Unread Bids Badge on OTKLIKI icon */}
                  {item.id === 'my-bids' && unreadBidsCount > 0 && !isLocked && (
                    <span className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-[#CCFF00] text-black font-mono font-black text-[10px] flex items-center justify-center border border-black shadow-[0_0_10px_#CCFF00] animate-pulse">
                      ⚡{unreadBidsCount}
                    </span>
                  )}
                  {/* Unread Chat Messages Badge on the Chat / Deals icon */}
                  {(item.id === 'chat' || item.id === 'mine') && unreadChatCount > 0 && !isLocked && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00F2FE] text-[#050811] font-black text-[10px] flex items-center justify-center border border-black shadow-[0_0_8px_#00F2FE]">
                      {unreadChatCount}
                    </span>
                  )}
                </div>

                <span className={`text-[9px] tracking-wider transition-colors duration-300 font-display uppercase ${
                  isActive && !isLocked
                    ? (mode === 'rent'
                        ? 'font-black text-[#00F2FE] drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]'
                        : mode === 'services'
                        ? 'font-black text-[#FF2A85] drop-shadow-[0_0_8px_rgba(255,42,133,0.6)]'
                        : 'font-black text-[#CCFF00] drop-shadow-[0_0_8px_rgba(204,255,0,0.6)]')
                    : 'font-semibold text-white/90'
                }`}>
                  {t(currentLang, item.labelKey)}
                </span>
              </button>
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}

