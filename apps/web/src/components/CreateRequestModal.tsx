import React, { useState } from 'react'
import { X, Sparkles, MapPin, DollarSign, CheckCircle, Navigation, Image as ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { CATEGORIES, HUBS } from '../data/mockData'
import { HubId, RequestItem } from '../types'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { detectUserLocation, detectLocationFromCoords } from '../lib/geo'
import { MapLocationPickerModal } from './MapLocationPickerModal'
import { uploadUserPhoto } from '../lib/storage'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'
import { useScrollLock } from '../hooks/useScrollLock'

interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  currentHub: HubId
  onCreateRequest: (newReq: Partial<RequestItem>) => void
  currentLang?: Language
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  currentHub,
  onCreateRequest,
  currentLang,
}) => {
  useScrollLock(isOpen)

  const lang = currentLang || detectDefaultLanguage()
  if (!isOpen) return null


  const activeHub = HUBS.find((h) => h.id === currentHub) || HUBS[0]

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryL1Id, setCategoryL1Id] = useState(CATEGORIES[0].id)
  const [selectedHub, setSelectedHub] = useState<HubId>(currentHub)
  const [district, setDistrict] = useState(activeHub.districts[0] || 'Rawai')
  const [budgetType, setBudgetType] = useState<'fixed' | 'open'>('fixed')
  const [budgetValue, setBudgetValue] = useState('150')
  const [durationMinutes, setDurationMinutes] = useState('120') // 2 hours default
  const [isFeatured, setIsFeatured] = useState(false)
  const [isDetectingGeo, setIsDetectingGeo] = useState(false)
  const [geoStatusMsg, setGeoStatusMsg] = useState('')
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  const handleCategoryChange = (catId: string) => {
    setCategoryL1Id(catId)
    const catObj = CATEGORIES.find((c) => c.id === catId)
    if (catObj && !description) {
      setDescription(`Заявка по направлению "${catObj.titleRu}": нужная услуга, утреннее/вечернее время, желательно без залога паспорта.`)
    }
  }

  // GPS Geolocation auto-detection
  const handleGPSDetect = async () => {
    triggerHapticFeedback('medium')
    setIsDetectingGeo(true)
    setGeoStatusMsg('Определение GPS координаты...')
    try {
      const res = await detectUserLocation()
      setSelectedHub(res.hubId)
      setDistrict(res.district)
      setGeoStatusMsg(`📍 Найдено: ${res.hubNameRu} (${res.district}), ~${res.distanceKm} км`)
      triggerHapticFeedback('heavy')
    } catch (err: any) {
      setGeoStatusMsg(`⚠️ ${err.message || 'GPS не доступен'}`)
      triggerNotificationFeedback('error')
    } finally {
      setIsDetectingGeo(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      triggerNotificationFeedback('error')
      alert('Заполните название вашей заявки!')
      return
    }

    const selectedCategory = CATEGORIES.find((c) => c.id === categoryL1Id) || CATEGORIES[0]

    const newRequest: Partial<RequestItem> = {
      title,
      description: description || `Заявка на услугу "${title}" в районе ${district}`,
      categoryL1Id,
      categoryL1Name: selectedCategory.titleRu,
      hub: selectedHub,
      district,
      budget: budgetType === 'fixed' && budgetValue ? parseFloat(budgetValue) || 0 : null,
      currency: 'USD',
      mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
      isFeatured,
      auctionEndsAt: new Date(Date.now() + parseInt(durationMinutes) * 60 * 1000).toISOString(),
    }

    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    onCreateRequest(newRequest)
    onClose()
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploadingPhoto(true)
    triggerHapticFeedback('light')

    for (let i = 0; i < files.length; i++) {
      const { url } = await uploadUserPhoto(files[i], 'requests')
      if (url) {
        setMediaUrls((prev) => [...prev, url])
      }
    }
    setIsUploadingPhoto(false)
  }

  const currentHubData = HUBS.find((h) => h.id === selectedHub) || HUBS[0]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn overscroll-contain">
      <div className="w-full sm:max-w-lg glass-panel rounded-t-3xl sm:rounded-3xl border border-white/10 p-5 overflow-y-auto max-h-[90dvh] safe-area-bottom overscroll-contain">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">{t(lang, 'create_request_title')}</h2>
              <p className="text-xs text-gray-400">{t(lang, 'create_request_sub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Category Dropdown */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Категория услуги</label>
            <select
              value={categoryL1Id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-cyan-400 outline-none font-medium"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.titleRu}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Что именно вам требуется?</label>
            <input
              type="text"
              placeholder="Например: Нужна аренда NMAX на 14 дней в Раваи"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:border-cyan-400 outline-none"
            />
          </div>

          {/* Geo-Matrix: Hub + District + GPS Auto-detection */}
          <div className="space-y-2 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-300 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" /> Гео-матрица (Локация & Район)
              </span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsMapOpen(true)}
                  className="text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-500/30 transition-colors"
                >
                  🗺 Карта
                </button>
                <button
                  type="button"
                  onClick={handleGPSDetect}
                  disabled={isDetectingGeo}
                  className="text-[11px] font-bold text-[#00F2FE] hover:underline flex items-center gap-1 bg-[#00F2FE]/10 px-2 py-1 rounded-lg border border-[#00F2FE]/30"
                >
                  <Navigation className={`w-3 h-3 ${isDetectingGeo ? 'animate-spin' : ''}`} />
                  <span>GPS</span>
                </button>
              </div>
            </div>

            {geoStatusMsg && (
              <p className="text-[10px] text-cyan-300 font-medium">{geoStatusMsg}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Локация (Хаб)</label>
                <select
                  value={selectedHub}
                  onChange={(e) => {
                    const newH = e.target.value as HubId
                    setSelectedHub(newH)
                    const hd = HUBS.find((h) => h.id === newH)
                    if (hd) setDistrict(hd.districts[0] || 'Center')
                  }}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:border-cyan-400 outline-none text-xs"
                >
                  {HUBS.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.flag} {h.nameRu}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-[10px] mb-1">Район (District)</label>
                <input
                  type="text"
                  list="districts_list"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="Например: Rawai или свой..."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-2.5 py-2 text-white placeholder-gray-500 focus:border-cyan-400 outline-none text-xs"
                />
                <datalist id="districts_list">
                  {currentHubData.districts.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Подробное описание и требования</label>
            <textarea
              rows={3}
              placeholder="Укажите даты, важные условия, место доставки..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-cyan-400 outline-none resize-none"
            />
          </div>

          {/* Photo Upload (Supabase Storage with 30-Day Retention) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-gray-300 font-semibold text-xs flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#00F2FE]" />
                <span>Фото / Скриншоты (До 30 дней хранения)</span>
              </label>
              {isUploadingPhoto && (
                <span className="text-[10px] text-[#00F2FE] flex items-center gap-1 animate-pulse font-bold">
                  <Loader2 className="w-3 h-3 animate-spin" /> Загрузка в Cloud...
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {mediaUrls.map((url, index) => (
                <div key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/20 group">
                  <img src={url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setMediaUrls(prev => prev.filter((_, i) => i !== index))}
                    className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <label className="w-16 h-16 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-white">
                <ImageIcon className="w-5 h-5 text-gray-400 mb-0.5" />
                <span className="text-[9px] font-bold">+ Фото</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Budget Switcher */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Бюджет заказа</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setBudgetType('fixed')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  budgetType === 'fixed'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Указать бюджет</span>
              </button>
              <button
                type="button"
                onClick={() => setBudgetType('open')}
                className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  budgetType === 'open'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-white/5 border-white/10 text-gray-400'
                }`}
              >
                <span>Жду предложений</span>
              </button>
            </div>

            {budgetType === 'fixed' && (
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Укажите сумму (или оставьте пустым)"
                  value={budgetValue}
                  onChange={(e) => setBudgetValue(e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, ''))}
                  className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white pr-16 focus:border-cyan-400 outline-none font-bold text-sm"
                />
                <span className="absolute right-3 top-2.5 text-cyan-400 font-bold">USD</span>
              </div>
            )}
          </div>

          {/* Auction Duration */}
          <div>
            <label className="block text-gray-300 font-semibold mb-1.5">Длительность аукциона</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-cyan-400 outline-none"
            >
              <option value="30">30 минут (Срочный выезд)</option>
              <option value="120">2 часа (Стандарт)</option>
              <option value="360">6 часов</option>
              <option value="1440">24 часа</option>
            </select>
          </div>

          {/* Featured VIP Option */}
          <div
            onClick={() => setIsFeatured(!isFeatured)}
            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              isFeatured
                ? 'bg-amber-500/10 border-amber-400/50'
                : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-400 font-bold">
                ★
              </div>
              <div>
                <div className="text-white font-bold">Закрепить заказ в ТОПе (VIP)</div>
                <div className="text-[10px] text-gray-400">В 3 раза больше откликов от PRO-исполнителей ($2)</div>
              </div>
            </div>
            {isFeatured && <CheckCircle className="w-5 h-5 text-amber-400" />}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 text-black font-extrabold text-sm shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98] transition-all"
          >
            {t(lang, 'btn_publish_auction')}
          </button>
        </form>
      </div>

      <MapLocationPickerModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onSelectLocation={async (lat, lng) => {
          try {
            const res = await detectLocationFromCoords(lat, lng)
            setSelectedHub(res.hubId)
            setDistrict(res.district)
            setGeoStatusMsg(`📍 Найдено по карте: ${res.hubNameRu} (${res.district})`)
            triggerHapticFeedback('heavy')
          } catch (err) {
            setGeoStatusMsg('⚠️ Карта: не удалось определить хаб')
          }
        }}
      />
    </div>
  )
}
