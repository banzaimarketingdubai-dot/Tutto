import React, { useState, useRef } from 'react'
import { X, Flame, Clock, MapPin, Image as ImageIcon, Upload, Loader2, Star, Check } from 'lucide-react'
import { HubId, MarketItem } from '../types'
import { HUBS } from '../data/mockData'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'
import { getCategoryBWCover, compressImageFile } from '../lib/imageCompressor'
import { useScrollLock } from '../hooks/useScrollLock'

interface CreateMarketListingModalProps {
  isOpen: boolean
  onClose: () => void
  currentHub: HubId
  onCreateListing: (item: MarketItem) => void
  currentLang?: Language
}

const MARKET_CATEGORIES = [
  { id: 'mcat-moto', label: 'БАЙКИ', icon: '🏍️' },
  { id: 'mcat-tech', label: 'ТЕХНИКА', icon: '💻' },
  { id: 'mcat-tickets', label: 'БИЛЕТЫ', icon: '🎫' },
  { id: 'mcat-furniture', label: 'МЕБЕЛЬ', icon: '🛋️' },
  { id: 'mcat-clothes', label: 'ОДЕЖДА', icon: '👕' },
  { id: 'mcat-sport', label: 'СПОРТ', icon: '🏄‍♂️' },
  { id: 'mcat-pets', label: 'ЖИВОТНЫЕ', icon: '🐶' },
  { id: 'mcat-other', label: 'ДРУГОЕ', icon: '📦' },
]

export const CreateMarketListingModal: React.FC<CreateMarketListingModalProps> = ({
  isOpen,
  onClose,
  currentHub,
  onCreateListing,
  currentLang,
}) => {
  useScrollLock(isOpen)
  const lang = currentLang || detectDefaultLanguage()

  const activeHubData = HUBS.find((h) => h.id === currentHub) || HUBS[0]
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(MARKET_CATEGORIES[0].id)
  const [condition, setCondition] = useState<'Б/У' | 'Новое' | 'На запчасти'>('Б/У')
  const [oldPrice, setOldPrice] = useState('300')
  const [price, setPrice] = useState('210')
  const [district, setDistrict] = useState(activeHubData.districts[0] || 'Patong')
  const [expiresHours, setExpiresHours] = useState('6')
  
  // Custom Photos & Compression State
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([])
  const [isCompressing, setIsCompressing] = useState(false)

  if (!isOpen) return null

  const numOldPrice = parseFloat(oldPrice) || 0
  const numPrice = parseFloat(price) || 0
  const discountPercent = numOldPrice > 0 && numPrice < numOldPrice 
    ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100) 
    : 0

  const activeCategoryObj = MARKET_CATEGORIES.find((c) => c.id === category) || MARKET_CATEGORIES[0]
  const bwFallbackCover = getCategoryBWCover(category)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = 10 - uploadedPhotos.length
    if (remainingSlots <= 0) {
      triggerNotificationFeedback('error')
      alert('Вы уже добавили максимально допустимое количество фото (10 шт).')
      return
    }

    const filesToCompress = Array.from(files).slice(0, remainingSlots)
    setIsCompressing(true)
    triggerHapticFeedback('medium')

    try {
      const compressedResults = await Promise.all(
        filesToCompress.map((file) => compressImageFile(file, 1200, 1200, 0.75))
      )
      setUploadedPhotos((prev) => [...prev, ...compressedResults])
      triggerNotificationFeedback('success')
    } catch (err) {
      console.error('Error compressing image:', err)
      triggerNotificationFeedback('error')
      alert('Не удалось обработать одно или несколько фото.')
    } finally {
      setIsCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (indexToRemove: number) => {
    triggerHapticFeedback('light')
    setUploadedPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const handleMakeCover = (indexToPromote: number) => {
    if (indexToPromote === 0) return
    triggerHapticFeedback('medium')
    setUploadedPhotos((prev) => {
      const copy = [...prev]
      const [promoted] = copy.splice(indexToPromote, 1)
      return [promoted, ...copy]
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      triggerNotificationFeedback('error')
      alert('Укажите название вашего товара!')
      return
    }

    if (numPrice <= 0) {
      triggerNotificationFeedback('error')
      alert('Укажите корректную горящую цену товара!')
      return
    }

    // Main cover & images logic
    const hasCustomPhotos = uploadedPhotos.length > 0
    const mainImage = hasCustomPhotos ? uploadedPhotos[0] : bwFallbackCover
    const allImages = hasCustomPhotos ? uploadedPhotos : [bwFallbackCover]

    const newItem: MarketItem = {
      id: `prod-${Date.now()}`,
      sellerId: 'user-me',
      sellerName: 'Вы (Продавец)',
      sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      sellerRating: 5.0,
      title,
      description: description || `Горящий лот «${title}» в районе ${district}. Скидка ${discountPercent}%!`,
      price: numPrice,
      oldPrice: numOldPrice > numPrice ? numOldPrice : numPrice,
      district,
      expiresIn: `${expiresHours}:00`,
      image: mainImage,
      images: allImages,
      isCustomPhoto: hasCustomPhotos,
      condition,
      category,
    }

    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onCreateListing(newItem)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overscroll-contain">
      <form 
        onSubmit={handleSubmit}
        className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-[#00F2FE]/40 p-5 space-y-4 overflow-y-auto max-h-[85dvh] overscroll-contain safe-area-bottom shadow-[0_0_50px_rgba(0,242,254,0.15)] relative"
      >
        {/* Glow Background */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#00F2FE]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#00F2FE]/20 flex items-center justify-center">
              <Flame className="w-4 h-4 text-[#00F2FE] animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Продать в Маркете</span>
                <span className="text-[10px] bg-[#00F2FE]/20 text-[#00F2FE] px-1.5 py-0.5 rounded font-bold border border-[#00F2FE]/40">HOT</span>
              </h3>
              <p className="text-[11px] text-gray-400 font-medium">Добавьте до 10 фото и укажите скидку</p>
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

        {/* Item Title */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Название товара / лота <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Yamaha NMAX 155cc / iPhone 15 Pro Max"
            className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none"
          />
        </div>

        {/* Category Chips */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Категория
          </label>
          <div className="flex flex-wrap gap-1.5">
            {MARKET_CATEGORIES.map((cat) => {
              const isSelected = category === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setCategory(cat.id)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/60 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Condition Selector */}
        <div>
          <label className="block text-gray-300 text-xs mb-1.5 font-bold uppercase tracking-wider">
            Состояние
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['Б/У', 'Новое', 'На запчасти'] as const).map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => {
                  triggerHapticFeedback('light')
                  setCondition(cond)
                }}
                className={`py-2 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                  condition === cond
                    ? 'bg-[#CCFF00] text-black font-extrabold shadow-[0_0_15px_rgba(204,255,0,0.4)]'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Inputs (Original vs Discounted) */}
        <div className="grid grid-cols-2 gap-3 bg-white/[0.03] p-3.5 rounded-2xl border border-white/10">
          <div>
            <label className="block text-gray-400 text-[11px] mb-1 font-medium">
              Обычная цена ($)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">$</span>
              <input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="w-full bg-[#070B12] border border-white/15 rounded-xl pl-7 pr-3 py-2 text-xs text-gray-300 line-through focus:border-[#00F2FE] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[#00F2FE] text-[11px] font-bold">
                Горящая цена ($) <span className="text-red-400">*</span>
              </label>
              {discountPercent > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded animate-pulse">
                  -{discountPercent}%
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#00F2FE] font-black">$</span>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#070B12] border border-[#00F2FE]/50 rounded-xl pl-7 pr-3 py-2 text-xs text-white font-extrabold focus:border-[#00F2FE] outline-none shadow-[0_0_10px_rgba(0,242,254,0.2)]"
              />
            </div>
          </div>
        </div>

        {/* District & Timer Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Район</span>
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00F2FE] outline-none"
            >
              {activeHubData.districts.map((dist) => (
                <option key={dist} value={dist} className="bg-[#070B12] text-white">
                  {dist}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Таймер скидки</span>
            </label>
            <select
              value={expiresHours}
              onChange={(e) => setExpiresHours(e.target.value)}
              className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#00F2FE] outline-none"
            >
              <option value="3" className="bg-[#070B12] text-white">3 часа (Срочно)</option>
              <option value="6" className="bg-[#070B12] text-white">6 часов</option>
              <option value="12" className="bg-[#070B12] text-white">12 часов</option>
              <option value="24" className="bg-[#070B12] text-white">24 часа</option>
            </select>
          </div>
        </div>

        {/* CUSTOM PHOTO UPLOADER (Up to 10 photos + Compression + B&W Fallback) */}
        <div className="space-y-2 bg-[#070B12]/80 p-3.5 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-gray-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#00F2FE]" />
              <span>Фото товара</span>
              <span className="text-[10px] text-gray-400 lowercase font-normal">(до 10 шт, сжатие под web)</span>
            </label>
            <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md ${
              uploadedPhotos.length > 0 ? 'bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/30' : 'bg-white/5 text-gray-400'
            }`}>
              {uploadedPhotos.length} / 10
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />

          {/* Upload Grid */}
          <div className="grid grid-cols-4 gap-2">
            {/* Uploaded Photos List */}
            {uploadedPhotos.map((photoUrl, idx) => {
              const isMainCover = idx === 0
              return (
                <div
                  key={idx}
                  onClick={() => handleMakeCover(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer group ${
                    isMainCover
                      ? 'border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.4)] scale-[1.02]'
                      : 'border-white/15 hover:border-white/40 opacity-85 hover:opacity-100'
                  }`}
                >
                  <img src={photoUrl} alt={`Uploaded ${idx + 1}`} className="w-full h-full object-cover" />
                  
                  {/* Cover Badge */}
                  {isMainCover ? (
                    <span className="absolute top-1 left-1 bg-[#00F2FE] text-black text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-md">
                      <Star className="w-2.5 h-2.5 fill-black text-black" />
                      <span>ОБЛОЖКА</span>
                    </span>
                  ) : (
                    <span className="absolute top-1 left-1 bg-black/70 text-gray-300 text-[8px] font-bold px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      Сделать обложкой
                    </span>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemovePhoto(idx)
                    }}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600/90 hover:bg-red-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )
            })}

            {/* Upload Add Button Slot */}
            {uploadedPhotos.length < 10 && (
              <button
                type="button"
                disabled={isCompressing}
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-xl border-2 border-dashed border-[#00F2FE]/40 hover:border-[#00F2FE] bg-[#00F2FE]/5 hover:bg-[#00F2FE]/10 flex flex-col items-center justify-center text-center p-2 transition-all cursor-pointer group"
              >
                {isCompressing ? (
                  <Loader2 className="w-5 h-5 text-[#00F2FE] animate-spin mb-1" />
                ) : (
                  <Upload className="w-5 h-5 text-[#00F2FE] group-hover:scale-110 transition-transform mb-1" />
                )}
                <span className="text-[10px] font-bold text-gray-300 group-hover:text-white leading-tight">
                  {isCompressing ? 'Сжатие...' : '+ Загрузить'}
                </span>
              </button>
            )}
          </div>

          {/* B&W Category Cover Fallback Banner if 0 photos uploaded */}
          {uploadedPhotos.length === 0 && (
            <div className="mt-2.5 p-2.5 bg-black/60 rounded-xl border border-white/10 flex items-center gap-3">
              <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/20 shrink-0">
                <img
                  src={bwFallbackCover}
                  alt={activeCategoryObj.label}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90"
                />
                <span className="absolute inset-0 bg-black/30 flex items-center justify-center text-[9px] font-black text-white uppercase">
                  Ч/Б
                </span>
              </div>
              <div className="text-[11px] leading-tight">
                <div className="text-gray-300 font-bold flex items-center gap-1">
                  <span>Стандартная Ч/Б обложка для «{activeCategoryObj.label}»</span>
                </div>
                <p className="text-gray-400 text-[10px] mt-0.5">
                  Если вы не загрузили фото, автоматически подставляется черно-белое изображение категории.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-gray-300 text-xs mb-1 font-bold uppercase tracking-wider">
            Описание товара
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Укажите причину скидки, пробег, комплект или дефекты..."
            className="w-full bg-[#070B12] border border-white/15 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,242,254,0.4)] active:scale-[0.98] transition-all uppercase tracking-wider cursor-pointer"
        >
          <Flame className="w-4 h-4 text-black fill-black" />
          <span>{t(lang, 'btn_publish_market')}</span>
        </button>
      </form>
    </div>
  )
}
