import React, { useState } from 'react'
import { OfferInstance } from '../types'
import { Eye, MousePointerClick, Edit2 } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { OfferCard } from './OfferCard'

interface UserStorefrontScrollerProps {
  instances: OfferInstance[]
  onEditInstance?: (instance: OfferInstance) => void
}

export const UserStorefrontScroller: React.FC<UserStorefrontScrollerProps> = ({ instances, onEditInstance }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!instances || instances.length === 0) return null

  const handleCardClick = (instance: OfferInstance) => {
    triggerHapticFeedback('light')
    if (expandedId === instance.id) {
      setExpandedId(null)
    } else {
      setExpandedId(instance.id)
    }
  }

  const handleEditClick = (e: React.MouseEvent, instance: OfferInstance) => {
    e.stopPropagation()
    triggerHapticFeedback('medium')
    if (onEditInstance) {
      onEditInstance(instance)
    } else {
      // Fallback action if no handler is provided
      document.dispatchEvent(new CustomEvent('open-action-sheet'))
    }
  }

  return (
    <div className="mb-6 mt-2">
      
      <div className="flex gap-3 overflow-x-auto no-scrollbar px-2 pb-2">
        {instances.map((instance) => {
          const isExpanded = expandedId === instance.id
          
          return (
            <div
              key={instance.id}
              onClick={() => handleCardClick(instance)}
              className={`shrink-0 transition-all duration-300 cursor-pointer ${
                isExpanded ? 'w-[85vw] max-w-[320px]' : 'w-[140px]'
              }`}
            >
              {isExpanded ? (
                <div className="relative animate-fadeIn rounded-3xl overflow-hidden border border-amber-400/30 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <OfferCard offer={instance} mode="feed" />
                  
                  {/* Fullscreen Edit Button overlay */}
                  <div className="absolute top-3 right-3 z-30">
                    <button
                      onClick={(e) => handleEditClick(e, instance)}
                      className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-[180px] rounded-2xl overflow-hidden relative border border-white/10 group bg-slate-900">
                  {/* Mini View */}
                  {instance.imageUrl ? (
                    <img 
                      src={instance.imageUrl} 
                      alt={instance.title} 
                      className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-500/10" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                  
                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <h4 className="text-white text-[11px] font-bold line-clamp-2 leading-tight mb-2">
                      {instance.title}
                    </h4>
                    
                    {/* Fake Stats */}
                    <div className="flex items-center gap-3 text-[10px] font-medium text-gray-300">
                      <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <Eye className="w-3 h-3 text-amber-400" />
                        <span>{Math.floor(Math.random() * 500) + 50}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm">
                        <MousePointerClick className="w-3 h-3 text-[#00F2FE]" />
                        <span>{Math.floor(Math.random() * 50) + 5}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
