import React, { useState, useEffect } from 'react'
import { Clock, Zap, MapPin, Users, Star } from 'lucide-react'
import { RequestItem } from '../types'
import { CATEGORIES } from '../data/mockData'
import { triggerHapticFeedback } from '../lib/telegram'

interface RequestCardProps {
  request: RequestItem
  onOpenDetails: (request: RequestItem) => void
  onQuickBid: (request: RequestItem) => void
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onOpenDetails,
  onQuickBid,
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('')

  const category = CATEGORIES.find((c) => c.id === request.categoryL1Id)
  const displayImage =
    request.mediaUrls && request.mediaUrls.length > 0
      ? request.mediaUrls[0]
      : category?.defaultCoverUrl || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'

  useEffect(() => {
    const updateTimer = () => {
      const endsAt = new Date(request.auctionEndsAt).getTime()
      const now = new Date().getTime()
      const diff = endsAt - now

      if (diff <= 0) {
        setTimeLeft('00:00:00')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [request.auctionEndsAt])

  return (
    <div className="mockup-card-main p-4.5 flex flex-col justify-between relative overflow-hidden group">
      {/* Location Subtitle Header (1:1 Mockup) */}
      <div className="mb-3">
        <h3
          onClick={() => onOpenDetails(request)}
          className="font-display font-black text-base text-white hover:text-[#00F2FE] transition-colors cursor-pointer line-clamp-1 leading-snug"
        >
          <span className="text-[#00F2FE]">{request.hub.toUpperCase()}:</span> {request.title}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-0.5">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span>5★ {request.district}</span>
        </div>
      </div>

      {/* Main Content Layout: Left Image + Right Details Block (1:1 Mockup) */}
      <div className="grid grid-cols-12 gap-3 mb-4">
        {/* Left Image */}
        <div className="col-span-5 rounded-2xl overflow-hidden h-36 relative border border-white/12 shadow-lg">
          <img
            src={displayImage}
            alt={request.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060911]/60 via-transparent to-transparent" />
        </div>

        {/* Right Details Block */}
        <div className="col-span-7 flex flex-col justify-between pl-1">
          {/* Prices & Bidders */}
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-gray-400">Current Low Bid:</span>
              <span className="text-xl font-black text-[#00F2FE] font-display glow-price">
                ${request.budget || 345}
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[11px] text-gray-400 mt-0.5">
              <span>Original Price:</span>
              <span className="line-through text-gray-500 font-medium">$980</span>
            </div>
            <div className="text-[11px] text-gray-300 font-semibold mt-1 flex items-center gap-1">
              <Users className="w-3 h-3 text-[#00F2FE]" />
              <span>Откликов: {typeof request.bidsCount === 'number' ? request.bidsCount : 0}</span>
            </div>
          </div>

          {/* Giant Glowing Timer (1:1 Mockup) */}
          <div className="mt-2">
            <span className="text-[28px] font-black text-[#00F2FE] font-mono glow-timer leading-none tracking-wider block">
              {timeLeft || '00:04:18'}
            </span>
          </div>
        </div>
      </div>

      {/* Clarification Alert (if any) */}
      {request.clarificationRequests && request.clarificationRequests.length > 0 && !request.clarificationComment && (
        <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
          <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Исполнители просят уточнить:
          </div>
          <p className="mb-2 italic">"{request.clarificationRequests[request.clarificationRequests.length - 1].question}"</p>
          <button 
            onClick={() => {
              const answer = prompt('Ваш ответ (он будет добавлен к заявке для всех исполнителей):')
              if (answer) {
                // mock behavior: ideally this hits an API and parent updates state
                alert('Ответ сохранен: ' + answer)
                request.clarificationComment = answer
                triggerHapticFeedback('medium')
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/40 hover:bg-amber-500/30 transition-colors w-full"
          >
            Уточнить детали
          </button>
        </div>
      )}
      
      {/* Client's Clarification Comment (if answered) */}
      {request.clarificationComment && (
        <div className="mb-3 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-gray-300">
          <strong className="text-cyan-400">Дополнение к заявке:</strong> {request.clarificationComment}
        </div>
      )}

      {/* Full Width Bright Gradient Action Button (1:1 Mockup) */}
      <button
        onClick={() => onQuickBid(request)}
        className="mockup-action-btn w-full py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2"
      >
        <Zap className="w-4 h-4 fill-black" />
        <span>VIEW OFFER / BID NOW</span>
      </button>
    </div>
  )
}
