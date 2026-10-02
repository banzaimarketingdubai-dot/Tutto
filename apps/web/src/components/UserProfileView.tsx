import React, { useState } from 'react'
import { Shield, Sparkles, Bot, Check, Star, Edit3, ChevronRight, Store, Wallet, LayoutTemplate, Coins, Link2, Mail, MessageCircle, Heart, Clock } from 'lucide-react'
import { MOCK_BUSINESS_CARDS } from '../data/mockData'
import { getTelegramUser, triggerHapticFeedback, triggerNotificationFeedback, isTelegramEnvironment } from '../lib/telegram'
import { PlatformRulesModal } from './PlatformRulesModal'
import { MyBusinessView } from './MyBusinessView'
import { AIManagerView } from './AIManagerView'
import { FinanceView } from './FinanceView'
import { WalletModal } from './WalletModal'

interface UserProfileViewProps {
  session?: any
  onOpenAdmin?: () => void
  onOpenAuth?: () => void
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ session, onOpenAdmin, onOpenAuth }) => {
  const user = getTelegramUser()
  const email = session?.user?.email
  const bizCard = MOCK_BUSINESS_CARDS.find(c => c.ownerEmail === email) || MOCK_BUSINESS_CARDS[0]

  const [activeSection, setActiveSection] = useState<'hub' | 'business' | 'ai' | 'finance'>('hub')
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  
  // Logic to determine name and avatar
  // In TMA: Telegram user data is the primary source
  const isTMA = isTelegramEnvironment()
  const displayName = user?.first_name
    ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}`
    : email
    ? (session?.user?.user_metadata?.name || bizCard.companyName)
    : 'Гость'
  const displayAvatar = user?.photo_url || (email ? session?.user?.user_metadata?.avatar_url : null) || bizCard.logoUrl
  
  // Account Binding Logic
  const hasEmailLinked = !!email
  const hasTelegramLinked = !!user

  const handleLinkTelegram = () => {
    triggerHapticFeedback('medium')
    // Mock linking telegram by opening bot link
    window.open('https://t.me/TuttoMinuttoBot', '_blank')
  }

  const handleLinkEmail = () => {
    triggerHapticFeedback('medium')
    if (onOpenAuth) onOpenAuth()
  }

  if (activeSection === 'business') {
    return <MyBusinessView onBack={() => setActiveSection('hub')} bizCard={bizCard} />
  }

  if (activeSection === 'ai') {
    return <AIManagerView onBack={() => setActiveSection('hub')} />
  }

  if (activeSection === 'finance') {
    return <FinanceView onBack={() => setActiveSection('hub')} />
  }

  // Hub View
  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs relative">
      
      {/* Profile Header (Main Hub Info) */}
      <div className="glass-card p-4 border-white/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <img
            src={displayAvatar}
            alt="Profile"
            className="w-16 h-16 rounded-2xl border-2 border-cyan-400/50 object-cover shadow-[0_0_15px_rgba(0,242,254,0.3)]"
          />
          <div className="flex-1">
            <h3 className="font-display font-extrabold text-lg text-white">
              {displayName}
            </h3>
            
            <div className="text-[11px] text-gray-300 flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-400">{bizCard.rating || '5.0'}</span>
              <span>Рейтинг доверия</span>
            </div>
            <div className="mt-1 flex gap-1">
               <span className="badge-pro text-[9px] px-1.5 py-0.5 rounded font-extrabold">PRO ACCOUNT</span>
            </div>
          </div>
        </div>
        
        {/* Account Bindings */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2">
          {!hasTelegramLinked && !isTMA && (
            <button onClick={handleLinkTelegram} className="flex items-center justify-between p-2.5 rounded-xl bg-[#0088cc]/10 border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-colors">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#0088cc]" />
                <span className="text-[#0088cc] font-bold text-xs">Привязать Telegram</span>
              </div>
              <ChevronRight className="w-4 h-4 text-[#0088cc]/50" />
            </button>
          )}
          {isTMA ? (
            // В ТМА показываем статус что авторизация уже есть
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-400/10 p-2 rounded-xl border border-emerald-400/20">
              <Shield className="w-3.5 h-3.5" />
              <span>Авторизован через Telegram ✓</span>
            </div>
          ) : (
            !hasEmailLinked && (
              <button onClick={handleLinkEmail} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 font-bold text-xs">Привязать Email</span>
                </div>
                <ChevronRight className="w-4 h-4 text-purple-400/50" />
              </button>
            )
          )}
          {(hasTelegramLinked && hasEmailLinked) && (
             <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-400/10 p-2 rounded-xl border border-emerald-400/20">
                <Shield className="w-3.5 h-3.5" />
                <span>Все аккаунты привязаны (Максимальный траст)</span>
             </div>
          )}
        </div>
      </div>

      {/* Wallet Widget */}
      <button 
        onClick={() => {
          triggerHapticFeedback('light')
          setIsWalletOpen(true)
        }}
        className="w-full glass-card p-4 border-amber-400/30 hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden group text-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent group-hover:from-amber-500/10 transition-colors" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Мой Кошелёк</h4>
              <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">Баланс: 150 TUTTO Coins</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </button>

      {/* Section: Я Заказчик */}
      <div>
        <h3 className="text-[10px] uppercase font-black tracking-wider text-gray-500 mb-2 pl-2">Я — Заказчик</h3>
        <div className="space-y-2">
          <button
            onClick={() => triggerHapticFeedback('light')}
            className="w-full glass-card p-3 flex items-center justify-between border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-xs">Мои Заказы</h4>
                <p className="text-[9px] text-gray-400">История запросов и покупок</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => triggerHapticFeedback('light')}
            className="w-full glass-card p-3 flex items-center justify-between border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-xs">Избранное</h4>
                <p className="text-[9px] text-gray-400">Сохраненные лоты и услуги</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Section: Я Исполнитель / Бизнес */}
      <div>
        <h3 className="text-[10px] uppercase font-black tracking-wider text-gray-500 mb-2 pl-2">Я — Бизнес</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('business')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-cyan-400/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <Store className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Моя Витрина</h4>
                <p className="text-[10px] text-gray-400">Управление карточками товаров</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('ai')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-purple-500/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Менеджер ИИ</h4>
                <p className="text-[10px] text-gray-400">Автопилот и база знаний</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('finance')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-emerald-400/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Финансы и Статистика</h4>
                <p className="text-[10px] text-gray-400">Доходы, выплаты, график продаж</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Dev / Admin Button */}
      <button
        data-testid="admin-panel-btn"
        onClick={() => {
          if (onOpenAdmin) onOpenAdmin()
        }}
        className="w-full py-4 mt-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer"
      >
        <Shield className="w-5 h-5" /> ПАНЕЛЬ АДМИНИСТРАТОРА (DEV)
      </button>

      {/* Platform Rules Link */}
      <div className="pt-2 text-center pb-8">
        <button
          type="button"
          onClick={() => setIsRulesOpen(true)}
          className="text-[11px] text-gray-500 hover:text-cyan-400 underline transition-colors"
        >
          Правила ведения бизнеса (PRO)
        </button>
      </div>

      <PlatformRulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
        type="business" 
      />
      
      <WalletModal 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />
    </div>
  )
}
