import React, { useState } from 'react'
import { Mic, Flame, MapPin, Clock, Plus } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { MarketItem } from '../types'
import { MarketFilterBar, MarketSortOption } from './MarketFilterBar'
import { FeedHeader, SortOption } from './FeedHeader'

interface MarketSectionProps {
  activeCategory: string | null
  products?: MarketItem[]
  onSelectCategory: (cat: string | null) => void
  onOpenQuickRequest: (req: any) => void
  onSelectProduct: (product: MarketItem) => void
  onOpenCreateListing?: () => void
}

const MARKET_CATEGORY_TILES = [
  { id: 'mcat-moto', label: 'БАЙКИ', icon: '🏍️', slug: 'moto' },
  { id: 'mcat-tech', label: 'ТЕХНИКА', icon: '💻', slug: 'tech' },
  { id: 'mcat-tickets', label: 'БИЛЕТЫ', icon: '🎫', slug: 'tickets' },
  { id: 'mcat-furniture', label: 'МЕБЕЛЬ', icon: '🛋️', slug: 'furniture' },
  { id: 'mcat-clothes', label: 'ОДЕЖДА', icon: '👕', slug: 'clothes' },
  { id: 'mcat-sport', label: 'СПОРТ', icon: '🏄‍♂️', slug: 'sport' },
  { id: 'mcat-pets', label: 'ЖИВОТНЫЕ', icon: '🐶', slug: 'pets' },
  { id: 'mcat-other', label: 'ДРУГОЕ', icon: '📦', slug: 'other' },
]

const MARKET_SORT_OPTIONS: SortOption[] = [
  { id: 'discount', label: '🔥 Скидки' },
  { id: 'urgent', label: '⏱️ Срочные' },
  { id: 'price_asc', label: '💰 Дешевле' }
]

export const DEFAULT_PRODUCTS: MarketItem[] = [
  {
    id: 'prod-1',
    sellerId: 'usr-0451611',
    sellerName: 'Игорь (0451611@gmail.com)',
    sellerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    sellerRating: 5.0,
    title: 'Yamaha NMAX 155cc 2024 (Спец-цена Аренда)',
    description: 'Идеальное состояние, 2 шлема, страховка. Доставка в отель.',
    price: 15,
    oldPrice: 20,
    district: 'Раваи',
    expiresIn: '03:15',
    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=400&q=80',
    condition: 'Аренда',
    category: 'mcat-moto',
  },
  {
    id: 'prod-2',
    sellerId: 'usr-sherlockdxb',
    sellerName: 'Sherlock (@sherlockdxb)',
    sellerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    sellerRating: 4.98,
    title: 'Honda PCX 160cc 2024 Black',
    description: 'Аренда байка от дня. Без залога оригиналов документов.',
    price: 14,
    oldPrice: 18,
    district: 'Чангу',
    expiresIn: '08:40',
    image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=400&q=80',
    condition: 'Аренда',
    category: 'mcat-moto',
  },
  {
    id: 'prod-3',
    sellerId: 'usr-shershadow',
    sellerName: 'Sher Shadow (shershadowcapital@gmail.com)',
    sellerAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100',
    sellerRating: 4.92,
    title: 'Toyota Yaris AT Compact Car 2023',
    description: 'Аренда авто с доставкой в отель или аэропорт. KASKO страховка.',
    price: 35,
    oldPrice: 45,
    district: 'Банг Тао',
    expiresIn: '01:20',
    image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&q=80',
    condition: 'Аренда',
    category: 'mcat-moto',
  },
  {
    id: 'prod-4',
    sellerId: 'usr-dubble',
    sellerName: 'Dubble Ads (dubble.ads@gmail.com)',
    sellerAvatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100',
    sellerRating: 4.89,
    title: 'Kawasaki KLX 250 Эндуро',
    description: 'Прокат мощного мотоцикла. Шлем и экипировка включены.',
    price: 40,
    oldPrice: 50,
    district: 'Улувату',
    expiresIn: '12:00',
    image: 'https://images.unsplash.com/photo-1558981420-c532902e58b4?w=400&q=80',
    condition: 'Аренда',
    category: 'mcat-moto',
  }
]

export const MarketSection: React.FC<MarketSectionProps> = ({
  activeCategory,
  products = DEFAULT_PRODUCTS,
  onSelectCategory,
  onOpenQuickRequest,
  onSelectProduct,
  onOpenCreateListing,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<MarketSortOption>('discount')
  const [conditionFilter, setConditionFilter] = useState<string | null>(null)

  let processed = products.filter((p) => {
    if (activeCategory && activeCategory.startsWith('mcat-') && p.category !== activeCategory) return false
    if (conditionFilter && p.condition !== conditionFilter) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = p.title.toLowerCase().includes(q)
      const matchDesc = p.description.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc) return false
    }
    return true
  })

  // Sorting
  processed = [...processed].sort((a, b) => {
    if (sortBy === 'discount') {
      const discA = a.oldPrice > a.price ? (a.oldPrice - a.price) / a.oldPrice : 0
      const discB = b.oldPrice > b.price ? (b.oldPrice - b.price) / b.oldPrice : 0
      return discB - discA
    }
    if (sortBy === 'price_asc') {
      return a.price - b.price
    }
    if (sortBy === 'urgent') {
      return a.expiresIn.localeCompare(b.expiresIn)
    }
    return 0
  })

  return (
    <div className="w-full space-y-4 pb-28">
      
      <FeedHeader 
        categories={MARKET_CATEGORY_TILES}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={MARKET_SORT_OPTIONS}
      >
        {/* Condition Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {['Новое', 'Б/У', 'Аренда'].map((cond) => (
            <button
              key={cond}
              onClick={() => {
                triggerHapticFeedback('light')
                setConditionFilter(conditionFilter === cond ? null : cond)
              }}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                conditionFilter === cond
                  ? 'bg-amber-400/20 text-amber-400 border-amber-400/50 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                  : 'bg-white/[0.03] text-gray-400 border-white/10 hover:bg-white/[0.08]'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </FeedHeader>

      {/* 3. FLASH MARKET GRID (Pinterest Style 2-Columns) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-[#00F2FE] animate-pulse" />
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-white">
              ГОРЯЩИЕ ТОВАРЫ
            </h2>
          </div>
          {onOpenCreateListing && (
            <button
              type="button"
              onClick={() => {
                triggerHapticFeedback('heavy')
                onOpenCreateListing()
              }}
              className="bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] hover:brightness-110 text-black text-[11px] font-black px-3 py-1.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ Разместить лот</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {processed.map((item) => (
            <div 
              key={item.id}
              onClick={() => {
                triggerHapticFeedback('medium')
                onSelectProduct(item)
              }}
              className="glass-card bg-[#121824]/90 backdrop-blur-xl border border-[#CCFF00]/25 rounded-2xl overflow-hidden flex flex-col hover:border-[#CCFF00]/70 transition-all duration-300 cursor-pointer group shadow-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            >
              {/* Seller Header Row */}
              <div className="p-2.5 pb-1.5 flex items-center justify-between border-b border-white/10 bg-white/[0.03]">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <img
                    src={item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'}
                    alt={item.sellerName}
                    className="w-5 h-5 rounded-full object-cover border border-[#CCFF00]/50"
                  />
                  <span className="text-[10px] font-bold text-gray-200 truncate max-w-[85px]">
                    {item.sellerName}
                  </span>
                </div>
                <div className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                  <span>★</span>
                  <span>{item.sellerRating || '5.0'}</span>
                </div>
              </div>

              {/* Product Image with Overlays */}
              <div className="relative aspect-square w-full bg-black/40">
                {(() => {
                  const isBWCover = !item.isCustomPhoto && (item.image.includes('sat=-100') || !item.images || item.images.length === 0)
                  const photosCount = item.images ? item.images.length : 1
                  return (
                    <>
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                          isBWCover ? 'grayscale contrast-125 brightness-90' : ''
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117] via-transparent to-transparent opacity-80" />
                      
                      {/* Condition Badge */}
                      <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-extrabold text-white uppercase tracking-wider border border-white/15 flex items-center gap-1">
                        <span>{item.condition}</span>
                        {isBWCover && <span className="text-[7px] text-gray-300 bg-white/20 px-1 py-0.2 rounded font-black">Ч/Б</span>}
                      </div>

                      {/* Photo Count Badge (if multiple photos) */}
                      {photosCount > 1 && (
                        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[9px] font-extrabold text-[#CCFF00] border border-[#CCFF00]/30 flex items-center gap-1">
                          <span>📷</span>
                          <span>{photosCount}</span>
                        </div>
                      )}

                      {/* Expiration Timer Badge */}
                      <div className="absolute bottom-2 right-2 bg-[#CCFF00] text-black px-2 py-0.5 rounded-md flex items-center gap-1 shadow-[0_0_12px_rgba(204,255,0,0.6)]">
                        <Clock className="w-2.5 h-2.5 stroke-[3]" />
                        <span className="text-[10px] font-black uppercase tracking-wider font-mono">{item.expiresIn}</span>
                      </div>
                    </>
                  )
                })()}
              </div>

              {/* Product Info */}
              <div className="p-3 flex flex-col flex-1 justify-between space-y-2">
                <div>
                  <h3 className="text-[12px] sm:text-[13px] font-black text-white font-display leading-snug line-clamp-2 mb-1 group-hover:text-[#CCFF00] transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                    <MapPin className="w-3 h-3 text-[#CCFF00]" />
                    <span className="truncate">{item.district}</span>
                  </div>
                </div>

                {/* Price & Action Button Row */}
                <div className="pt-2 border-t border-white/10 flex items-end justify-between gap-1 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 line-through font-semibold leading-none mb-0.5">
                      ${item.oldPrice}
                    </span>
                    <span className="text-[16px] font-black text-[#CCFF00] font-display leading-none glow-price-market">
                      ${item.price}
                    </span>
                  </div>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      triggerHapticFeedback('heavy')
                      onSelectProduct(item)
                    }}
                    className="bg-gradient-to-r from-[#B8E600] to-[#CCFF00] hover:brightness-110 text-black text-[10px] font-black px-2.5 py-1.5 rounded-xl transition-all shadow-[0_0_12px_rgba(204,255,0,0.35)] active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    Купить P2P
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
