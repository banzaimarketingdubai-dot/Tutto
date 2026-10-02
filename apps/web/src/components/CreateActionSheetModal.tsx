import React, { useEffect } from 'react'
import { X, Sparkles, LayoutTemplate, PackagePlus, ArrowRight } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

interface CreateActionSheetModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectAction: (action: 'request' | 'template' | 'market') => void
}

export const CreateActionSheetModal: React.FC<CreateActionSheetModalProps> = ({
  isOpen,
  onClose,
  onSelectAction
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      triggerHapticFeedback('light')
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  const handleAction = (action: 'request' | 'template' | 'market') => {
    triggerHapticFeedback('medium')
    onSelectAction(action)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full sm:max-w-md max-h-[90dvh] overflow-y-auto overscroll-contain bg-[#11151C] rounded-t-3xl sm:rounded-3xl border-t border-x sm:border-y border-white/10 p-5 pt-3 pb-8 safe-area-bottom shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transform transition-transform duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
        
        <h2 className="text-xl font-display font-black text-white text-center mb-6">
          Что вы хотите создать?
        </h2>

        <div className="space-y-3">
          {/* Primary Action: Request */}
          <button
            onClick={() => handleAction('request')}
            className="w-full group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00F2FE]/10 to-[#00DFEA]/10 hover:from-[#00F2FE]/20 hover:to-[#00DFEA]/20 border border-[#00F2FE]/30 p-4 flex items-center justify-between text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00F2FE] to-[#00DFEA] flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)] group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg leading-tight">Заявку (ИИ-Ассистент)</h3>
                <p className="text-xs text-[#00F2FE] font-medium mt-0.5">Найду лучшие предложения для вас</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#00F2FE] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Secondary Action: Storefront Template */}
          <button
            onClick={() => handleAction('template')}
            className="w-full group relative overflow-hidden rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 p-4 flex items-center justify-between text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-400/20 group-hover:border-amber-400/30 transition-all">
                <LayoutTemplate className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-200 text-base leading-tight">Карточку-витрину</h3>
                <p className="text-xs text-gray-400 mt-0.5">Добавить товар или услугу в свой магазин</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </button>

          {/* Tertiary Action: Market (Early Access) */}
          <button
            onClick={() => handleAction('market')}
            className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-white/5 p-4 flex items-center justify-between text-left transition-all opacity-80 hover:opacity-100"
          >
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-[#CCFF00]/10 border border-[#CCFF00]/20 flex items-center justify-center text-[#CCFF00] opacity-80">
                <PackagePlus className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-200 text-base leading-tight">Лот в Маркет</h3>
                  <span className="text-[9px] font-black uppercase bg-[#CCFF00]/20 text-[#CCFF00] px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(204,255,0,0.3)]">Скоро</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Быстрая продажа Б/У вещей</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-600 transition-all" />
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-xl bg-white/5 text-gray-400 font-bold hover:bg-white/10 hover:text-white transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  )
}
