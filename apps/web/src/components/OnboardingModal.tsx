import React, { useState } from 'react'
import { Sparkles, X, Check, MapPin, ArrowRight, Home, Star, MessageSquare, User, Plus, Clock, Search, Briefcase, Bot, ArrowDown } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { useScrollLock } from '../hooks/useScrollLock'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  useScrollLock(isOpen)

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState<'client' | 'business' | null>(null)
  const [locationStatus, setLocationStatus] = useState<string | null>(null)
  const [activeMenuHighlight, setActiveMenuHighlight] = useState<'all' | 'home' | 'bids' | 'plus' | 'chat' | 'account'>('all')

  if (!isOpen) return null

  const stepsCount = 6

  const handleRequestLocation = () => {
    triggerHapticFeedback('medium')
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationStatus('✅ Локация определена!')
          triggerNotificationFeedback('success')
          setTimeout(() => setCurrentStep(1), 500)
        },
        () => {
          setLocationStatus('📍 Использован гео-профиль хаба')
          setTimeout(() => setCurrentStep(1), 500)
        }
      )
    } else {
      setCurrentStep(1)
    }
  }

  const handleSelectGoal = (goal: 'client' | 'business') => {
    triggerHapticFeedback('heavy')
    setSelectedGoal(goal)
    localStorage.setItem('tutto_user_goal', goal)
    setCurrentStep(5)
  }

  const handleFinish = () => {
    triggerHapticFeedback('heavy')
    localStorage.setItem('needtnow_onboarding_completed', 'true')
    onClose()
  }

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticFeedback('medium')
    localStorage.setItem('needtnow_onboarding_completed', 'true')
    onClose()
  }

  const nextStep = () => {
    triggerHapticFeedback('light')
    if (currentStep < stepsCount - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleFinish()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col justify-start sm:justify-center items-center p-3 sm:p-4 pt-[max(env(safe-area-inset-top),16px)] sm:pt-4 bg-black/85 backdrop-blur-xl animate-fadeIn select-none overscroll-contain overflow-y-auto">
      {/* Top Bar: Progress Indicator & Skip Button */}
      <div className="w-full max-w-sm flex items-center justify-between mb-2 z-40 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-[#00F2FE] uppercase tracking-wider bg-[#00F2FE]/10 px-2.5 py-1 rounded-full border border-[#00F2FE]/30 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
            Шаг {currentStep + 1} из {stepsCount}
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-[11px] font-extrabold text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-white/15 backdrop-blur-md shadow-md active:scale-95"
        >
          <span>Пропустить</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Centered Card with Resolution Safety (Max height leave space for bottom menu) */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-sm max-h-[calc(100dvh-150px)] sm:max-h-[75vh] overflow-y-auto overscroll-contain bg-[#0A0F1D]/95 backdrop-blur-2xl rounded-[2.2rem] border border-cyan-500/30 shadow-[0_0_50px_rgba(0,242,254,0.2)] relative z-30 flex flex-col items-center p-5 sm:p-6 text-center animate-scaleUp scrollbar-none"
      >
        {/* Glow Accents */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-[#00F2FE]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-[#CCFF00]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Step Progress Line */}
        <div className="w-full bg-white/10 h-1.5 rounded-full mb-5 overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-[#00F2FE] via-cyan-400 to-[#CCFF00] transition-all duration-500 shadow-[0_0_10px_#00F2FE]"
            style={{ width: `${((currentStep + 1) / stepsCount) * 100}%` }}
          />
        </div>

        {/* STEP 0: LOCATION PERMISSION */}
        {currentStep === 0 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00F2FE]/20 to-cyan-500/10 border border-[#00F2FE]/40 flex items-center justify-center text-[#00F2FE] mb-4 shadow-[0_0_30px_rgba(0,242,254,0.35)] animate-pulse">
              <MapPin className="w-10 h-10 text-[#00F2FE]" />
            </div>

            <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-3">
              Разрешите доступ к локации 📍
            </h2>

            <p className="text-xs text-gray-300 font-medium leading-relaxed mb-5 px-1">
              Мы автоматически определим ваш курортный хаб и район (Пхукет, Бали, Дубай).<br/><br/>
              <span className="text-[#00F2FE] font-bold">Вам не придется вводить город и район вручную!</span>
            </p>

            {locationStatus && (
              <div className="mb-4 text-xs font-bold text-[#CCFF00] bg-[#CCFF00]/10 px-3 py-1.5 rounded-xl border border-[#CCFF00]/30 animate-fadeIn">
                {locationStatus}
              </div>
            )}

            <button
              type="button"
              onClick={handleRequestLocation}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#00A3FF] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <MapPin className="w-4 h-4 fill-black" />
              <span>Разрешить геопозицию</span>
            </button>
          </div>
        )}

        {/* STEP 1: HOW PLATFORM WORKS */}
        {currentStep === 1 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#CCFF00]/20 to-lime-500/10 border border-[#CCFF00]/40 flex items-center justify-center text-[#CCFF00] mb-4 shadow-[0_0_30px_rgba(204,255,0,0.35)]">
              <Sparkles className="w-10 h-10 text-[#CCFF00] animate-pulse" />
            </div>

            <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-3">
              Как устроена платформа? ⚡
            </h2>

            <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6 px-1">
              <strong className="text-white font-bold">TuttoMinutto</strong> — это быстрый обратный аукцион.<br/><br/>
              Вы диктуете что вам нужно — а проверенные исполнители сами предлагают лучшие цены в режиме реального времени. Экономьте время и не переплачивайте посредникам!
            </p>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Понятно, дальше</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* STEP 2: BOTTOM MENU EXPLANATION WITH INTERACTIVE HIGHLIGHTS */}
        {currentStep === 2 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Bot className="w-7 h-7 text-purple-300" />
            </div>

            <h2 className="font-display font-black text-lg text-white tracking-wide leading-tight mb-1">
              Удобное Нижнее Меню 🧭
            </h2>
            <p className="text-[10px] text-gray-400 font-medium mb-3">
              Нажмите на раздел, чтобы подсветить его в меню:
            </p>

            <div className="w-full space-y-1.5 text-left bg-black/60 p-2.5 rounded-2xl border border-white/10 text-[11px] mb-4">
              {/* Menu Item 1: Home */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveMenuHighlight('home')
                }}
                onMouseEnter={() => setActiveMenuHighlight('home')}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  activeMenuHighlight === 'home' || activeMenuHighlight === 'all'
                    ? 'bg-[#00F2FE]/20 text-white border border-[#00F2FE]/50 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#00F2FE]/20 flex items-center justify-center shrink-0 text-[#00F2FE]">
                  <Home className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-white">1. Главная:</span>
                  <span className="text-[10px] text-gray-300 block">Лента всех активных аукционов района</span>
                </div>
              </button>

              {/* Menu Item 2: Bids */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveMenuHighlight('bids')
                }}
                onMouseEnter={() => setActiveMenuHighlight('bids')}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  activeMenuHighlight === 'bids' || activeMenuHighlight === 'all'
                    ? 'bg-[#CCFF00]/20 text-white border border-[#CCFF00]/50 shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-[#CCFF00]/20 flex items-center justify-center shrink-0 text-[#CCFF00]">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-white">2. Отклики:</span>
                  <span className="text-[10px] text-gray-300 block">Входящие предложения цен от исполнителей</span>
                </div>
              </button>

              {/* Menu Item 3: Plus AI Button */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveMenuHighlight('plus')
                }}
                onMouseEnter={() => setActiveMenuHighlight('plus')}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  activeMenuHighlight === 'plus' || activeMenuHighlight === 'all'
                    ? 'bg-gradient-to-r from-[#00F2FE]/25 to-[#CCFF00]/25 text-white border border-[#00F2FE]/60 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-[#00F2FE] text-black font-black text-xs flex items-center justify-center shrink-0 shadow-[0_0_10px_#00F2FE]">
                  +
                </div>
                <div>
                  <span className="font-black text-white">3. Кнопка «+»:</span>
                  <span className="text-[10px] text-gray-300 block">Моментальный вызов ИИ для набора заявки</span>
                </div>
              </button>

              {/* Menu Item 4: Chat */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveMenuHighlight('chat')
                }}
                onMouseEnter={() => setActiveMenuHighlight('chat')}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  activeMenuHighlight === 'chat' || activeMenuHighlight === 'all'
                    ? 'bg-cyan-500/20 text-white border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-white">4. Чат:</span>
                  <span className="text-[10px] text-gray-300 block">Прямой диалог и обсуждение условий</span>
                </div>
              </button>

              {/* Menu Item 5: Account */}
              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setActiveMenuHighlight('account')
                }}
                onMouseEnter={() => setActiveMenuHighlight('account')}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl transition-all cursor-pointer ${
                  activeMenuHighlight === 'account' || activeMenuHighlight === 'all'
                    ? 'bg-purple-500/20 text-white border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-black text-white">5. Кабинет:</span>
                  <span className="text-[10px] text-gray-300 block">Профиль, привязка Telegram/Google и баланс</span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Дальше</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* STEP 3: COMING SOON SECTIONS */}
        {currentStep === 3 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#FF2A85]/20 to-pink-500/10 border border-[#FF2A85]/40 flex items-center justify-center text-[#FF2A85] mb-4 shadow-[0_0_30px_rgba(255,42,133,0.35)]">
              <Clock className="w-10 h-10 text-[#FF2A85] animate-pulse" />
            </div>

            <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-3">
              Скоро: Услуги и Маркет 🚀
            </h2>

            <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6 px-1">
              Сейчас платформа работает в режиме моментальной <strong className="text-[#00F2FE] font-bold">Аренды</strong> (байки, авто, виллы).<br/><br/>
              Разделы <strong className="text-[#FF2A85] font-bold">Услуги</strong> и быстрая продажа <strong className="text-[#CCFF00] font-bold">Маркет</strong> находятся в стадии закрытого запуска и откроются совсем скоро!
            </p>

            <button
              type="button"
              onClick={nextStep}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <span>Понятно</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        )}

        {/* STEP 4: GOAL QUESTION (CLIENT VS BUSINESS) */}
        {currentStep === 4 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-2">
              Зачем вы пришли в TuttoMinutto? 🤔
            </h2>
            <p className="text-xs text-gray-400 font-medium mb-5">
              Выберите вашу цель, чтобы настроить интерфейс под вас:
            </p>

            <div className="w-full space-y-3 mb-4">
              <button
                type="button"
                onClick={() => handleSelectGoal('client')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#00F2FE]/20 to-[#00A3FF]/20 border-2 border-[#00F2FE] hover:bg-[#00F2FE]/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.25)] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/20 flex items-center justify-center text-[#00F2FE] shrink-0">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-white text-xs group-hover:text-[#00F2FE] transition-colors">
                      Найти услугу или аренду
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">Я клиент (ищу байк, авто, виллу)</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#00F2FE] group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleSelectGoal('business')}
                className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#CCFF00]/20 to-[#A6E600]/20 border-2 border-[#CCFF00] hover:bg-[#CCFF00]/30 transition-all text-left flex items-center justify-between group cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.25)] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-white text-xs group-hover:text-[#CCFF00] transition-colors">
                      Вести бизнес и выполнять заказы
                    </div>
                    <div className="text-[10px] text-gray-400 font-medium">Я исполнитель / партнер</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#CCFF00] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: TAILORED FINAL SCREEN */}
        {currentStep === 5 && (
          <div className="w-full flex flex-col items-center animate-fadeIn">
            {selectedGoal === 'client' ? (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00F2FE]/20 to-cyan-500/10 border border-[#00F2FE]/50 flex items-center justify-center text-[#00F2FE] mb-4 shadow-[0_0_35px_rgba(0,242,254,0.45)] animate-bounce">
                  <Plus className="w-10 h-10 text-[#00F2FE] stroke-[3]" />
                </div>

                <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-3">
                  Диктуйте первую заявку! 🎯
                </h2>

                <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6 px-1">
                  Нажмите на плюс <strong className="text-[#00F2FE] font-bold">«+»</strong> в центре нижнего меню.<br/><br/>
                  Диктуйте или вводите заявку голосом — ИИ оптимизирует текст, а исполнители отправят предложения!
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#CCFF00]/20 to-lime-500/10 border border-[#CCFF00]/50 flex items-center justify-center text-[#CCFF00] mb-4 shadow-[0_0_35px_rgba(204,255,0,0.45)] animate-bounce">
                  <Briefcase className="w-10 h-10 text-[#CCFF00]" />
                </div>

                <h2 className="font-display font-black text-xl text-white tracking-wide leading-tight mb-3">
                  Успешного бизнеса! 🚀
                </h2>

                <p className="text-xs text-gray-300 font-medium leading-relaxed mb-6 px-1">
                  Смотрите ленту аукционов в вашем районе и предлагайте Ваши варианты в ответ на заявки клиентов.<br/><br/>
                  Желаем вам отличных сделок!
                </p>
              </>
            )}

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[3]" />
              <span>Понятно, начать!</span>
            </button>
          </div>
        )}

        {/* Step Dot Indicators */}
        <div className="relative z-10 flex items-center justify-center gap-1.5 mt-4 w-full">
          {Array.from({ length: stepsCount }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                triggerHapticFeedback('light')
                setCurrentStep(idx)
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStep
                  ? 'w-6 bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] shadow-[0_0_12px_rgba(0,242,254,0.6)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Шаг ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* 
        ========================================================================
        RESPONSIVE BOTTOM MENU SPOTLIGHT POINTER OVERLAY
        Fixed pixel-perfect positioning over the 5 items in BottomNav across all screen resolutions
        ========================================================================
      */}
      {(currentStep === 2 || (currentStep === 5 && selectedGoal === 'client')) && (
        <div className="fixed bottom-0 left-0 right-0 z-[10000] pointer-events-none pb-[calc(env(safe-area-inset-bottom)+8px)] sm:pb-2 flex justify-center animate-fadeIn">
          <div className="w-full max-w-[390px] px-4 flex justify-between items-center h-16 relative">
            
            {/* Pointer 1: Home / Лента */}
            <div className={`flex flex-col items-center justify-end w-[60px] h-full transition-all duration-300 ${
              currentStep === 2 && (activeMenuHighlight === 'home' || activeMenuHighlight === 'all')
                ? 'opacity-100 scale-105'
                : 'opacity-20 scale-90'
            }`}>
              <div className="px-2 py-0.5 rounded-md bg-[#00F2FE] text-black font-black text-[9px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_#00F2FE] animate-bounce">
                Лента
              </div>
              <ArrowDown className="w-4 h-4 text-[#00F2FE] animate-bounce mt-0.5 stroke-[3]" />
            </div>

            {/* Pointer 2: My Bids / Отклики */}
            <div className={`flex flex-col items-center justify-end w-[60px] h-full transition-all duration-300 ${
              currentStep === 2 && (activeMenuHighlight === 'bids' || activeMenuHighlight === 'all')
                ? 'opacity-100 scale-105'
                : 'opacity-20 scale-90'
            }`}>
              <div className="px-2 py-0.5 rounded-md bg-[#CCFF00] text-black font-black text-[9px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_#CCFF00] animate-bounce">
                Отклики
              </div>
              <ArrowDown className="w-4 h-4 text-[#CCFF00] animate-bounce mt-0.5 stroke-[3]" />
            </div>

            {/* Pointer 3: Central Plus AI Button */}
            <div className={`flex flex-col items-center justify-end w-[60px] h-full transition-all duration-300 ${
              (currentStep === 2 && (activeMenuHighlight === 'plus' || activeMenuHighlight === 'all')) || (currentStep === 5 && selectedGoal === 'client')
                ? 'opacity-100 scale-110'
                : 'opacity-20 scale-90'
            }`}>
              <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-[9.5px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_18px_rgba(0,242,254,0.9)] animate-bounce border border-white">
                Заявка ИИ ⚡
              </div>
              <ArrowDown className="w-5 h-5 text-[#00F2FE] animate-bounce mt-0.5 stroke-[3]" />
            </div>

            {/* Pointer 4: Chat / Чат */}
            <div className={`flex flex-col items-center justify-end w-[60px] h-full transition-all duration-300 ${
              currentStep === 2 && (activeMenuHighlight === 'chat' || activeMenuHighlight === 'all')
                ? 'opacity-100 scale-105'
                : 'opacity-20 scale-90'
            }`}>
              <div className="px-2 py-0.5 rounded-md bg-cyan-400 text-black font-black text-[9px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_#00F2FE] animate-bounce">
                Чат
              </div>
              <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce mt-0.5 stroke-[3]" />
            </div>

            {/* Pointer 5: Account / Кабинет */}
            <div className={`flex flex-col items-center justify-end w-[60px] h-full transition-all duration-300 ${
              currentStep === 2 && (activeMenuHighlight === 'account' || activeMenuHighlight === 'all')
                ? 'opacity-100 scale-105'
                : 'opacity-20 scale-90'
            }`}>
              <div className="px-2 py-0.5 rounded-md bg-purple-400 text-black font-black text-[9px] uppercase tracking-wider whitespace-nowrap shadow-[0_0_12px_#a855f7] animate-bounce">
                Кабинет
              </div>
              <ArrowDown className="w-4 h-4 text-purple-400 animate-bounce mt-0.5 stroke-[3]" />
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
