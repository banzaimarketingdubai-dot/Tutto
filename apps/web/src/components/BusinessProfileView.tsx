import React, { useState } from 'react'
import { Shield, Sparkles, Bot, Check, Star, Edit3, ChevronRight, Store, Wallet, LayoutTemplate } from 'lucide-react'
import { MOCK_BUSINESS_CARDS } from '../data/mockData'
import { getTelegramUser, triggerHapticFeedback } from '../lib/telegram'
import { PlatformRulesModal } from './PlatformRulesModal'
import { MyBusinessView } from './MyBusinessView'
import { AIManagerView } from './AIManagerView'
import { FinanceView } from './FinanceView'

interface BusinessProfileViewProps {
  onOpenAdmin?: () => void
}

export const BusinessProfileView: React.FC<BusinessProfileViewProps> = ({ onOpenAdmin }) => {
  const user = getTelegramUser()
  const bizCard = MOCK_BUSINESS_CARDS[0]

  const [activeSection, setActiveSection] = useState<'hub' | 'business' | 'ai' | 'finance'>('hub')
  const [isRulesOpen, setIsRulesOpen] = useState(false)

  if (activeSection === 'business') {
    return <MyBusinessView onBack={() => setActiveSection('hub')} />
  }

  if (activeSection === 'ai') {
    return <AIManagerView onBack={() => setActiveSection('hub')} />
  }

  if (activeSection === 'finance') {
    return <FinanceView onBack={() => setActiveSection('hub')} />
  }

  // Hub View
  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs">
      
      {/* Profile Header (Main Hub Info) */}
      <div className="glass-card p-4 border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={user?.photo_url || bizCard.logoUrl}
            alt="Profile"
            className="w-16 h-16 rounded-2xl border-2 border-cyan-400/50 object-cover"
          />
          <div className="flex-1">
            <h3 className="font-display font-extrabold text-lg text-white">
              {user?.first_name || bizCard.companyName}
            </h3>
            <div className="text-[11px] text-gray-300 flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-400">{bizCard.rating}</span>
              <span>Рейтинг доверия</span>
            </div>
            <div className="mt-1 flex gap-1">
               <span className="badge-pro text-[9px] px-1.5 py-0.5 rounded font-extrabold">PRO ACCOUNT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="space-y-3">
        {/* 1. Мой Бизнес */}
        <button
          onClick={() => {
            triggerHapticFeedback('light')
            setActiveSection('business')
          }}
          className="w-full glass-card p-4 flex items-center justify-between border-cyan-400/30 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
              <Store className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Мой Бизнес</h4>
              <p className="text-[10px] text-gray-400">Профиль, карточки товаров и история</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>

        {/* 2. Менеджер ИИ */}
        <button
          onClick={() => {
            triggerHapticFeedback('light')
            setActiveSection('ai')
          }}
          className="w-full glass-card p-4 flex items-center justify-between border-purple-500/30 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Менеджер ИИ</h4>
              <p className="text-[10px] text-gray-400">Настройки автопилота и база знаний</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>

        {/* 3. Финансовая информация */}
        <button
          onClick={() => {
            triggerHapticFeedback('light')
            setActiveSection('finance')
          }}
          className="w-full glass-card p-4 flex items-center justify-between border-amber-400/30 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
              <Wallet className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-white text-sm">Фин. информация</h4>
              <p className="text-[10px] text-gray-400">Баланс, выплаты и партнерская программа</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
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
    </div>
  )
}
