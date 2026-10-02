import React, { useState, useEffect } from 'react'
import { X, Flame, MapPin, Clock, ShieldCheck, Truck, UserCheck, MessageSquare, Share2 } from 'lucide-react'
import { MarketItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { shareToTelegram } from '../lib/deeplink'

interface MarketBuyModalProps {
  isOpen: boolean
  item: MarketItem | null
  onClose: () => void
  onContactSeller: (item: MarketItem, deliveryMethod: string) => void
}

export const MarketBuyModal: React.FC<MarketBuyModalProps> = ({
  isOpen,
  item,
  onClose,
  onContactSeller,
}) => {
  const [deliveryMethod, setDeliveryMethod] = useState<'meetup' | 'courier'>('meetup')
  const [activePhotoIdx, setActivePhotoIdx] = useState(0)

  useEffect(() => {
    setActivePhotoIdx(0)
  }, [item])

  if (!isOpen || !item) return null

  const discountAmount = item.oldPrice > item.price ? item.oldPrice - item.price : 0
  const discountPercent = item.oldPrice > item.price 
    ? Math.round((discountAmount / item.oldPrice) * 100) 
    : 0

  const allPhotos = item.images && item.images.length > 0 ? item.images : [item.image]
  const currentDisplayPhoto = allPhotos[activePhotoIdx] || item.image
  const isBWFallback = !item.isCustomPhoto && allPhotos.length === 1 && currentDisplayPhoto.includes('sat=-100')

  const handleConfirmOrder = () => {
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onContactSeller(item, deliveryMethod === 'courier' ? 'Курьерская доставка' : 'Личная встреча')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full sm:max-w-md glass-panel rounded-t-3xl sm:rounded-3xl border border-[#00F2FE]/40 p-5 space-y-4 overflow-y-auto max-h-[85vh] overscroll-contain safe-area-bottom shadow-[0_0_50px_rgba(0,242,254,0.15)] relative">
        {/* Glow Sprite */}
        <div className="absolute -top-10 -left-10 w-36 h-36 bg-[#00F2FE]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00F2FE]/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#00F2FE] animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider">
                Детали лота Маркета
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">Горящее предложение от продавца</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Product Photo Preview */}
        <div className="relative rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black/50">
          <img
            src={currentDisplayPhoto}
            alt={item.title}
            className={`w-full h-full object-cover transition-all duration-300 ${
              isBWFallback ? 'grayscale contrast-125 brightness-90' : ''
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider border border-white/10 flex items-center gap-1.5">
            <span>{item.condition}</span>
            {isBWFallback && (
              <span className="bg-white/20 text-gray-200 text-[8px] px-1 py-0.2 rounded border border-white/30">Ч/Б Обложка</span>
            )}
          </div>

          <div className="absolute top-2.5 right-2.5 bg-[#CCFF00] text-black px-2 py-0.5 rounded-lg flex items-center gap-1 font-black text-[10px] shadow-[0_0_10px_rgba(204,255,0,0.5)]">
            <Clock className="w-3 h-3 text-black" />
            <span>Осталось {item.expiresIn}</span>
          </div>

          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-gray-400 text-xs line-through font-semibold">${item.oldPrice}</span>
              <span className="text-2xl font-black text-[#00F2FE] tracking-tight drop-shadow-[0_0_10px_rgba(0,242,254,0.6)]">
                ${item.price} USD
              </span>
            </div>
            {discountPercent > 0 && (
              <span className="bg-red-500 text-white font-black text-xs px-2.5 py-1 rounded-xl shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse">
                Скидка -{discountPercent}%
              </span>
            )}
          </div>
        </div>

        {/* Multiple Photos Thumbnail Strip (if more than 1 photo) */}
        {allPhotos.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {allPhotos.map((photo, pIdx) => {
              const isActive = pIdx === activePhotoIdx
              return (
                <button
                  key={pIdx}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setActivePhotoIdx(pIdx)
                  }}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-[#00F2FE] shadow-[0_0_10px_rgba(0,242,254,0.5)] scale-105'
                      : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                </button>
              )
            })}
          </div>
        )}

        {/* Item Title & Description */}
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-white leading-snug">{item.title}</h2>
          <p className="text-xs text-gray-300 leading-relaxed font-normal bg-white/[0.03] p-2.5 rounded-xl border border-white/10">
            {item.description}
          </p>
        </div>

        {/* Seller Info */}
        <div className="flex items-center justify-between bg-[#121824] p-3 rounded-2xl border border-white/10">
          <div className="flex items-center gap-2.5">
            <img
              src={item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={item.sellerName || 'Продавец'}
              className="w-10 h-10 rounded-xl border border-[#00F2FE] object-cover"
            />
            <div>
              <div className="font-bold text-white text-xs flex items-center gap-1">
                <span>{item.sellerName || 'Частный продавец'}</span>
                <span className="text-[9px] bg-[#CCFF00]/20 text-[#CCFF00] px-1.5 py-0.2 rounded font-black border border-[#CCFF00]/30">PRO 4.9★</span>
              </div>
              <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-[#00F2FE]" />
                <span>{item.district}</span>
              </div>
            </div>
          </div>
          <ShieldCheck className="w-5 h-5 text-[#CCFF00]" />
        </div>

        {/* Delivery Option Selector */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Способ получения
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('light')
                setDeliveryMethod('meetup')
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                deliveryMethod === 'meetup'
                  ? 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/60 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>🤝 Личная встреча</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('light')
                setDeliveryMethod('courier')
              }}
              className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                deliveryMethod === 'courier'
                  ? 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/60 shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>🚚 Экспресс курьер</span>
            </button>
          </div>
        </div>

        {/* Action Button & Share */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleConfirmOrder}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-black fill-black" />
            <span>🔥 ЗАБРОНИРОВАТЬ И НАПИСАТЬ ПРОДАВЦУ (${item.price})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const res = shareToTelegram('market', item.id, item.title)
              if (res.copied) {
                alert('🔗 Ссылка на лот скопирована! Поделитесь в Telegram.')
              }
            }}
            className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-500/20 transition-all cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Поделиться лотом в Telegram</span>
          </button>
        </div>
      </div>
    </div>
  )
}
