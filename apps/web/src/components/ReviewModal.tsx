import React, { useState, useRef } from 'react'
import { X, Star, Sparkles, Coins, CheckCircle, Award, Image as ImageIcon, Video, Trash2, Info } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { ReviewItem } from '../types'
import { useScrollLock } from '../hooks/useScrollLock'

interface ReviewModalProps {
  isOpen: boolean
  dealId?: string
  targetName?: string
  productName?: string
  onClose: () => void
  onSubmitReview: (review: Omit<ReviewItem, 'id' | 'createdAt'>) => void
}

const REVIEW_TAG_OPTIONS = [
  '⚡ Быстрый выезд / доставка',
  '💎 Идеальное состояние',
  '🤝 Честная цена',
  '💬 Вежливый сервис',
  '🛡️ Без залога документов',
  '⭐ Высший класс',
]

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  dealId = `deal-${Date.now()}`,
  targetName = 'Исполнитель',
  productName,
  onClose,
  onSubmitReview,
}) => {
  useScrollLock(isOpen)

  if (!isOpen) return null


  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [selectedTags, setSelectedTags] = useState<string[]>([
    '⚡ Быстрый выезд / доставка',
    '💬 Вежливый сервис',
  ])
  const [comment, setComment] = useState<string>('')
  const [mediaFiles, setMediaFiles] = useState<{ url: string; type: 'image' | 'video' }[]>([])
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      triggerHapticFeedback('light')
      const newFiles = Array.from(e.target.files).map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
      }))
      setMediaFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeMedia = (index: number) => {
    triggerHapticFeedback('light')
    setMediaFiles(prev => prev.filter((_, i) => i !== index))
  }

  const toggleTag = (tag: string) => {
    triggerHapticFeedback('light')
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')

    onSubmitReview({
      dealId,
      authorName: 'Александр',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      targetName,
      targetProductName: productName,
      rating,
      tags: selectedTags,
      comment: comment || 'Отличный сервис, всё вовремя и по честной цене!',
      rewardCoins: 15,
    })

    setIsSubmitted(true)
    setTimeout(() => {
      setIsSubmitted(false)
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn overscroll-contain">
      <div className="w-full max-w-md bg-[#0D1117] border border-white/15 rounded-3xl p-6 shadow-2xl relative text-white max-h-[90dvh] flex flex-col overscroll-contain">
        {/* Background Glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            triggerHapticFeedback('light')
            onClose()
          }}
          aria-label="Закрыть"
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(251,191,36,0.5)]">
              <Award className="w-8 h-8 text-black" />
            </div>
            <h3 className="text-xl font-black text-white font-display">Отзыв опубликован!</h3>
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 px-4 py-2 rounded-2xl text-amber-300 font-extrabold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+15 TUTTO Coins начислено в кошелёк</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 overflow-y-auto overscroll-contain custom-scrollbar pr-2 flex-1 pb-4">
            {/* Header Title */}
            <div className="text-center pt-2 shrink-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Оценка качества сделки</span>
              </div>
              <h2 className="text-lg font-black font-display text-white">
                Как прошёл сервис с {targetName}?
              </h2>
              {productName ? (
                <div className="mt-2 text-[10px] text-cyan-300 bg-cyan-400/10 py-1.5 px-3 rounded-xl inline-block border border-cyan-400/20 font-medium">
                  Прикреплено к: <strong className="font-extrabold text-[#00F2FE]">{productName}</strong>
                </div>
              ) : (
                <div className="mt-2 text-[10px] text-gray-400 bg-white/5 py-1.5 px-3 rounded-xl inline-block border border-white/10 font-medium">
                  Отзыв на профиль (без привязки к товару)
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Поделитесь честным мнением и получите награду Karma
              </p>
            </div>

            {/* Interactive 5-Star Rating Picker */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = star <= (hoverRating || rating)
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                      triggerHapticFeedback('medium')
                      setRating(star)
                    }}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        active
                          ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                          : 'text-gray-600 fill-transparent'
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            {/* Tag Selection Pills */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">
                Выберите подходящие теги:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REVIEW_TAG_OPTIONS.map((tag) => {
                  const isSelected = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00F2FE]/20 border border-[#00F2FE]/50 text-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Comment Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                Ваш комментарий (необязательно)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Всё супер! Байк доставили вовремя в отель..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:border-amber-400 outline-none resize-none"
              />
            </div>

            {/* Media Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-300">
                  Медиа (Фото/Видео)
                </label>
                <div className="flex items-center gap-1 text-[9px] text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-white/5">
                  <Info className="w-3 h-3 text-[#00F2FE]" />
                  <span>Автоудаление через 8 часов</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {mediaFiles.map((media, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 group">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-black/50 flex flex-col items-center justify-center text-[8px] text-gray-400 gap-1">
                        <Video className="w-5 h-5 text-white/50" />
                        <span>Видео</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-16 h-16 rounded-xl bg-white/5 border border-dashed border-white/20 flex flex-col items-center justify-center gap-1 hover:bg-white/10 hover:border-[#00F2FE]/50 transition-all text-gray-400 hover:text-[#00F2FE] cursor-pointer"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-[8px] font-bold uppercase tracking-wider">Файл</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                />
              </div>
            </div>

            {/* Reward Card */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/30 rounded-2xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-extrabold text-amber-300">+15 TUTTO Coins</div>
                  <div className="text-[10px] text-gray-400">Бонус за активность и честный отзыв</div>
                </div>
              </div>
              <CheckCircle className="w-4 h-4 text-amber-400" />
            </div>

            {/* Submit Button */}
            <div className="shrink-0 pt-2">
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_4px_25px_rgba(251,191,36,0.35)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Опубликовать отзыв (+15 Coins)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
