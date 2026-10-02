import React, { useRef, useState } from 'react'
import { OfferInstance } from '../types'
import { Share2, ArrowRight, Bell } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { toJpeg } from 'html-to-image'

interface OfferCardProps {
  offer: OfferInstance
  mode?: 'feed' | 'chat' | 'story'
  onAction?: (offer: OfferInstance) => void
  onShare?: (offer: OfferInstance) => void
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer, mode = 'feed', onAction, onShare }) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.MouseEvent) => {
    e.stopPropagation()
    triggerHapticFeedback('light')
    setIsSubscribed(!isSubscribed)
    
    if (!isSubscribed) {
      triggerNotificationFeedback('success')
      // Optional: Show toast or telegram alert
      const tg = (window as any).Telegram?.WebApp
      if (tg?.showPopup) {
        tg.showPopup({
          title: 'Подписка оформлена! 🎉',
          message: `Новые предложения из категории "${offer.category}" будут приходить вам в бота.`,
          buttons: [{ type: 'ok' }]
        })
      } else {
        alert(`Подписка оформлена! Новые предложения из категории "${offer.category}" будут приходить вам в бота.`)
      }
    }
  }

  const handleShare = async () => {
    triggerHapticFeedback('light')
    
    if (cardRef.current) {
      try {
        const dataUrl = await toJpeg(cardRef.current, { quality: 0.95, canvasWidth: 1080, canvasHeight: 1920 })
        
        // If Telegram WebApp is available, it might have a native sharing method, but for now we mock it
        console.log('Generated story image:', dataUrl)
        triggerNotificationFeedback('success')
        
        // Mock download/share
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = `tuttominutto-story-${offer.id}.jpg`
        a.click()
        
        if (onShare) {
          onShare(offer)
        }
      } catch (err) {
        console.error('Error generating image', err)
        triggerNotificationFeedback('error')
      }
    }
  }

  // Fallback gradients if no image
  const getFallbackGradient = (type: string) => {
    switch (type) {
      case 'rent':
        return 'from-[#00F2FE]/20 to-[#00DFEA]/5'
      case 'service':
        return 'from-[#FF2A85]/20 to-[#FF007F]/5'
      default:
        return 'from-[#B8E600]/20 to-[#CCFF00]/5'
    }
  }

  const getAccentColor = (type: string) => {
    switch (type) {
      case 'rent':
        return 'text-[#00F2FE]'
      case 'service':
        return 'text-[#FF2A85]'
      default:
        return 'text-[#CCFF00]'
    }
  }

  const typeLabel =
    offer.type === 'rent' ? 'ПРОКАТ' : offer.type === 'service' ? 'УСЛУГА' : 'ТОВАР'

  if (mode === 'chat') {
    return (
      <div 
        onClick={() => onAction && onAction(offer)}
        className={`w-full bg-[#070B12] rounded-2xl border border-white/10 overflow-hidden flex shadow-lg ${onAction ? 'cursor-pointer hover:border-white/30 active:scale-[0.98] transition-all' : ''}`}
      >
        <div className={`w-24 shrink-0 bg-gradient-to-br ${getFallbackGradient(offer.type)} relative`}>
          {offer.imageUrl ? (
            <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center opacity-50">
              <span className={`text-[10px] font-black tracking-widest uppercase ${getAccentColor(offer.type)} rotate-[-45deg]`}>
                {typeLabel}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 p-3 flex flex-col justify-between">
          <div>
            <h4 className="text-white text-xs font-bold leading-tight line-clamp-1">{offer.title}</h4>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">{offer.description}</p>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className={`font-black text-sm ${getAccentColor(offer.type)}`}>
              {offer.price} {offer.currency}
            </span>
            {onAction && (
              <div className={`text-[10px] font-bold uppercase tracking-wider ${getAccentColor(offer.type)} bg-white/5 px-2 py-1 rounded-lg`}>
                Выбрать
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Feed & Story Mode
  const isStory = mode === 'story'

  return (
    <div
      ref={cardRef}
      className={`relative rounded-3xl overflow-hidden bg-slate-950 border border-white/10 group ${
        isStory ? 'w-[1080px] h-[1920px] rounded-[60px]' : 'w-full h-64'
      }`}
    >
      {/* Subscribe Button (Top Right) */}
      {!isStory && (
        <button
          onClick={handleSubscribe}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 ${
            isSubscribed
              ? 'bg-[#00F2FE] text-black shadow-[0_0_15px_rgba(0,242,254,0.4)]'
              : 'bg-black/30 text-white hover:bg-black/50 border border-white/10'
          }`}
          aria-label="Subscribe"
        >
          <Bell className={`w-4 h-4 ${isSubscribed ? 'fill-black' : ''}`} />
        </button>
      )}

      {/* Background Image / Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getFallbackGradient(offer.type)}`}>
        {offer.imageUrl && (
          <img
            src={offer.imageUrl}
            alt={offer.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
      </div>

      {/* Glass Overlay (Bottom) */}
      <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent ${isStory ? 'p-16 pt-40' : 'p-4 pt-12'}`}>
        <div className="flex items-start justify-between">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-1.5 border ${
              offer.type === 'rent'
                ? 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/30'
                : offer.type === 'service'
                ? 'bg-[#FF2A85]/20 text-[#FF2A85] border-[#FF2A85]/30'
                : 'bg-[#CCFF00]/20 text-[#CCFF00] border-[#CCFF00]/30'
            }`}>
              {typeLabel} • {offer.category}
            </span>
            <h3 className={`font-display font-black text-white leading-tight ${isStory ? 'text-7xl mb-4' : 'text-sm mb-1'}`}>
              {offer.title}
            </h3>
            {!isStory && (
              <p className="text-[10px] text-gray-300 line-clamp-2 leading-relaxed">
                {offer.description}
              </p>
            )}
          </div>
        </div>

        <div className={`flex items-center justify-between ${isStory ? 'mt-12' : 'mt-3'}`}>
          <div className={`font-black ${getAccentColor(offer.type)} ${isStory ? 'text-6xl' : 'text-base'}`}>
            {offer.price} <span className={isStory ? 'text-4xl' : 'text-xs opacity-80'}>{offer.currency}</span>
          </div>
          
          {!isStory && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>
              {onAction && (
                <button
                  type="button"
                  onClick={() => onAction(offer)}
                  className={`px-4 h-8 rounded-full font-bold text-[10px] text-black uppercase tracking-wider bg-gradient-to-r ${
                    offer.type === 'rent'
                      ? 'from-[#00F2FE] to-[#00DFEA] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                      : offer.type === 'service'
                      ? 'from-[#FF2A85] to-[#FF007F] shadow-[0_0_15px_rgba(255,42,133,0.3)]'
                      : 'from-[#B8E600] to-[#CCFF00] shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                  } hover:brightness-110 transition-all`}
                >
                  Выбрать
                </button>
              )}
            </div>
          )}
        </div>

        {isStory && (
          <div className="mt-16 pt-8 border-t border-white/20 flex items-center gap-6">
            <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl">
              {/* Fake QR */}
              <div className="w-16 h-16 bg-white rounded-xl" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">Tutto Minutto</div>
              <div className="text-xl text-gray-400 mt-2">Сканируй для заказа</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
