import React, { useEffect } from 'react'
import { Sparkles, ArrowRight, X, Volume2 } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

interface LiveOfferToastProps {
  message: string
  subtext?: string
  price?: number
  providerName?: string
  onOpen: () => void
  onDismiss: () => void
}

export const LiveOfferToast: React.FC<LiveOfferToastProps> = ({
  message,
  subtext,
  price,
  providerName,
  onOpen,
  onDismiss,
}) => {
  useEffect(() => {
    triggerHapticFeedback('heavy')
    const timer = setTimeout(() => {
      onDismiss()
    }, 6000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed top-16 left-4 right-4 z-[999] animate-slideDown font-sans pointer-events-auto">
      <div className="p-3.5 rounded-2xl bg-[#0F172A]/95 border-2 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.5)] backdrop-blur-xl flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-[#00F2FE] shrink-0 shadow-[0_0_10px_rgba(0,242,254,0.3)]">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-black text-white leading-tight truncate flex items-center gap-1.5">
              <span>{message}</span>
              {price && (
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded text-[11px] border border-amber-500/30">
                  ${price}
                </span>
              )}
            </div>
            {subtext && <div className="text-[11px] text-cyan-300 font-medium truncate mt-0.5">{subtext}</div>}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              triggerHapticFeedback('medium')
              onOpen()
              onDismiss()
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs shadow-[0_0_12px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
          >
            <span>Открыть</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismiss}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
