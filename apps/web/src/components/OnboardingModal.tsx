import React, { useState } from 'react'
import { Sparkles, X, Check, Compass, MapPin, Bot, Clock, ArrowRight, LayoutTemplate } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { OfferCard } from './OfferCard'
import { MOCK_OFFER_INSTANCES } from '../data/mockData'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Обратный Аукцион Аренды',
    description: `Добро пожаловать в TuttoMinutto!\n\nИщите байк, виллу или авто? Оставьте заявку, укажите бюджет, и проверенные партнеры сами предложат вам лучшие варианты. Выбирайте то, что подходит именно вам!`,
    icon: <Sparkles className="w-12 h-12 text-[#CCFF00]" />,
    gradient: 'from-[#00F2FE]/20 to-[#CCFF00]/20',
  },
  {
    step: 2,
    title: 'Умный ИИ-Ассистент',
    description: `Больше никаких долгих заполнений форм. Просто скажите голосом или напишите текстом, что вам нужно. Наш ИИ сам сформирует идеальную карточку заявки за пару секунд.`,
    icon: <Bot className="w-12 h-12 text-[#00F2FE]" />,
    gradient: 'from-[#FF2A85]/20 to-[#00F2FE]/20',
  },
  {
    step: 3,
    title: 'Услуги и Маркет',
    description: `Разделы Услуг и Быстрой продажи (Маркет) сейчас находятся на этапе закрытого тестирования.\n\nЗапишитесь на ранний доступ прямо в приложении, чтобы первыми оценить новый функционал!`,
    icon: <Clock className="w-12 h-12 text-[#FF2A85]" />,
    gradient: 'from-[#CCFF00]/20 to-[#FF2A85]/20',
  },
  {
    step: 4,
    title: 'Карточки товаров и услуг',
    description: `Создайте свой магазин на платформе!\n\nОдин раз оформите красивое предложение с фото и ценой, откликайтесь на заказы в 1 клик и продвигайте витрину в умной ленте.`,
    icon: <LayoutTemplate className="w-12 h-12 text-amber-400" />,
    gradient: 'from-[#FF2A85]/40 to-[#f59e0b]/40',
    isOfferCardBg: true,
  },
  {
    step: 5,
    title: 'Включите Локацию 📍',
    description: `Чтобы показывать вам только актуальные предложения (на Пхукете, Бали и т.д.), нам нужно знать вашу геопозицию.\n\nПожалуйста, разрешите доступ к локации на следующем экране.`,
    icon: <MapPin className="w-12 h-12 text-[#00DFEA]" />,
    gradient: 'from-[#00F2FE]/20 to-[#00DFEA]/20',
  },
]

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isOpen) return null

  const stepData = ONBOARDING_STEPS[currentStep]
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1

  const handleNext = () => {
    triggerHapticFeedback('light')
    if (isLastStep) {
      localStorage.setItem('needtnow_onboarding_completed', 'true')
      onClose()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticFeedback('medium')
    localStorage.setItem('needtnow_onboarding_completed', 'true')
    onClose()
  }

  return (
    <div
      onClick={handleNext}
      className="fixed inset-0 z-[9999] flex flex-col justify-center items-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none cursor-pointer"
    >
      {/* Header bar: Skip Button */}
      <div className="absolute top-[max(env(safe-area-inset-top),20px)] right-4 z-20">
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs font-extrabold text-white/70 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all cursor-pointer border border-white/10 backdrop-blur-md"
        >
          <span>Пропустить</span>
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Centered Card */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-sm bg-[#11151C] rounded-[2rem] border border-white/10 overflow-hidden shadow-2xl relative z-20 flex flex-col items-center p-8 text-center"
      >
        {/* Fullscreen OfferCard Background for Step 4 */}
        {(stepData as any).isOfferCardBg && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 blur-sm scale-110">
            <OfferCard offer={MOCK_OFFER_INSTANCES[0]} mode="story" />
          </div>
        )}

        {/* Animated Background Glow inside card */}
        <div className={`absolute inset-0 bg-gradient-to-br ${stepData.gradient} opacity-50 animate-pulse pointer-events-none z-0`} />
        
        {/* Dark overlay for readability if bg image is present */}
        {(stepData as any).isOfferCardBg && (
          <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />
        )}

        {/* Icon Container */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-inner">
          {stepData.icon}
        </div>

        {/* Text Content */}
        <div className="relative z-10 w-full mb-8">
          <h2 className="font-display font-black text-2xl text-white tracking-wide leading-tight mb-3">
            {stepData.title}
          </h2>
          <p className="text-sm text-gray-300 font-medium leading-relaxed whitespace-pre-line px-2">
            {stepData.description}
          </p>
        </div>

        {/* Step Indicator Dots */}
        <div className="relative z-10 flex items-center justify-center gap-2 mb-8 w-full">
          {ONBOARDING_STEPS.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                triggerHapticFeedback('light')
                setCurrentStep(idx)
              }}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentStep
                  ? 'w-8 bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] shadow-[0_0_12px_rgba(0,242,254,0.6)]'
                  : 'w-2 bg-white/20 hover:bg-white/40'
              }`}
              aria-label={`Шаг ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleNext}
          className="relative z-10 w-full py-4 rounded-2xl bg-gradient-to-r from-[#00F2FE] to-[#CCFF00] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider cursor-pointer"
        >
          <span>{isLastStep ? 'Разрешить локацию' : 'Понятно, дальше'}</span>
          {isLastStep ? <Check className="w-5 h-5 stroke-[3]" /> : <ArrowRight className="w-5 h-5 stroke-[3]" />}
        </button>
      </div>
    </div>
  )
}
