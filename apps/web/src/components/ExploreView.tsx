import React, { useState, useMemo } from 'react'
import {
  Search,
  MapPin,
  Sparkles,
  Zap,
  Tag,
  X,
  ChevronRight,
  TrendingUp,
  Package,
} from 'lucide-react'
import { HUBS, CATEGORIES, SERVICE_TEMPLATES } from '../data/mockData'
import { RequestItem, MarketItem, ServiceTemplate } from '../types'
import { triggerHapticFeedback } from '../lib/telegram'

interface ExploreViewProps {
  requests: RequestItem[]
  marketProducts: MarketItem[]
  activeHub: string
  onSelectCategory: (catId: string | null) => void
  onSelectRequest: (req: RequestItem) => void
  onSelectMarketProduct: (item: MarketItem) => void
  onOpenQuickRequest: (template?: ServiceTemplate) => void
}

export const ExploreView: React.FC<ExploreViewProps> = ({
  requests,
  marketProducts,
  activeHub,
  onSelectCategory,
  onSelectRequest,
  onSelectMarketProduct,
  onOpenQuickRequest,
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedHub, setSelectedHub] = useState<string>('all')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [contentType, setContentType] = useState<'all' | 'auctions' | 'market'>('all')
  const [budgetRange, setBudgetRange] = useState<'all' | 'low' | 'mid' | 'high'>('all')

  // Get active districts list based on selected hub
  const currentHubData = HUBS.find((h) => h.id === selectedHub)
  const availableDistricts = useMemo(() => {
    if (selectedHub === 'all') {
      const allDistricts = HUBS.flatMap((h) => h.districts)
      return Array.from(new Set(allDistricts))
    }
    return currentHubData ? currentHubData.districts : []
  }, [selectedHub, currentHubData])

  // Filter requests
  const filteredRequests = useMemo(() => {
    if (contentType === 'market') return []
    return requests.filter((req) => {
      if (req.status && req.status !== 'open') return false
      const budget = req.budget ?? 0

      // Hub filter
      if (selectedHub !== 'all' && req.hub !== selectedHub) return false

      // District filter
      if (selectedDistrict !== 'all' && req.district !== selectedDistrict) return false

      // Category filter
      if (selectedCategory && req.categoryL1Id !== selectedCategory) return false

      // Budget filter
      if (budgetRange === 'low' && budget > 50) return false
      if (budgetRange === 'mid' && (budget <= 50 || budget > 250)) return false
      if (budgetRange === 'high' && budget <= 250) return false

      // Search text query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = req.title.toLowerCase().includes(q)
        const matchDesc = req.description.toLowerCase().includes(q)
        const matchCat = req.categoryL1Name?.toLowerCase().includes(q)
        const matchDist = req.district?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCat && !matchDist) return false
      }

      return true
    })
  }, [requests, selectedHub, selectedDistrict, selectedCategory, contentType, budgetRange, searchQuery])

  // Filter Market Products
  const filteredMarket = useMemo(() => {
    if (contentType === 'auctions') return []
    return marketProducts.filter((item) => {
      const price = item.price ?? 0

      // District filter
      if (selectedDistrict !== 'all' && item.district !== selectedDistrict) return false

      // Category filter
      if (selectedCategory && item.category !== selectedCategory) return false

      // Budget filter
      if (budgetRange === 'low' && price > 50) return false
      if (budgetRange === 'mid' && (price <= 50 || price > 250)) return false
      if (budgetRange === 'high' && price <= 250) return false

      // Search text query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(q)
        const matchDesc = item.description.toLowerCase().includes(q)
        const matchCat = item.category?.toLowerCase().includes(q)
        const matchDist = item.district?.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchCat && !matchDist) return false
      }

      return true
    })
  }, [marketProducts, selectedHub, selectedDistrict, selectedCategory, contentType, budgetRange, searchQuery])

  const totalResultsCount = filteredRequests.length + filteredMarket.length

  const handleResetFilters = () => {
    triggerHapticFeedback('light')
    setSearchQuery('')
    setSelectedHub('all')
    setSelectedDistrict('all')
    setSelectedCategory(null)
    setContentType('all')
    setBudgetRange('all')
  }

  return (
    <div className="space-y-4 pb-20 pt-2 px-1">
      {/* Search Header Input */}
      <div className="relative">
        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 shadow-2xl focus-within:border-[#00F2FE]/70 transition-all duration-300">
          <Search className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск скутера, виллы, обмена..."
            className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 hover:bg-white/10 rounded-full text-gray-400 hover:text-white mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hub / Region Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#00F2FE]" /> Регион (Хаб)
          </span>
          {selectedHub !== 'all' && (
            <button
              onClick={() => {
                setSelectedHub('all')
                setSelectedDistrict('all')
              }}
              className="text-[10px] text-[#00F2FE] hover:underline"
            >
              Сбросить хаб
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setSelectedHub('all')
              setSelectedDistrict('all')
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border ${
              selectedHub === 'all'
                ? 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-slate-950 border-transparent shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                : 'bg-slate-900/60 text-gray-300 border-white/10 hover:border-white/20'
            }`}
          >
            🌎 Все регионы
          </button>

          {HUBS.map((hub) => (
            <button
              key={hub.id}
              onClick={() => {
                triggerHapticFeedback('light')
                setSelectedHub(hub.id)
                setSelectedDistrict('all')
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 border flex items-center gap-1.5 ${
                selectedHub === hub.id
                  ? 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-slate-950 border-transparent shadow-[0_0_12px_rgba(0,242,254,0.4)]'
                  : 'bg-slate-900/60 text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>{hub.flag}</span>
              <span>{hub.nameRu}</span>
            </button>
          ))}
        </div>
      </div>

      {/* District Chips */}
      {availableDistricts.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <button
              onClick={() => {
                triggerHapticFeedback('light')
                setSelectedDistrict('all')
              }}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border ${
                selectedDistrict === 'all'
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-slate-950/40 text-gray-400 border-white/5 hover:border-white/15'
              }`}
            >
              📍 Все районы
            </button>
            {availableDistricts.map((dist) => (
              <button
                key={dist}
                onClick={() => {
                  triggerHapticFeedback('light')
                  setSelectedDistrict(dist)
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-200 border ${
                  selectedDistrict === dist
                    ? 'bg-purple-500/30 text-purple-200 border-purple-400/50 shadow-[0_0_10px_rgba(217,70,239,0.3)]'
                    : 'bg-slate-950/40 text-gray-400 border-white/5 hover:border-white/15'
                }`}
              >
                {dist}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Type & Budget Filters */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* Type Switcher */}
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-1 flex items-center">
          <button
            onClick={() => setContentType('all')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              contentType === 'all' ? 'bg-white/20 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Все
          </button>
          <button
            onClick={() => setContentType('auctions')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              contentType === 'auctions' ? 'bg-[#D946EF]/30 text-purple-200 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚡ Заявки
          </button>
          <button
            onClick={() => setContentType('market')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              contentType === 'market' ? 'bg-[#00F2FE]/30 text-cyan-200 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            🔥 Маркет
          </button>
        </div>

        {/* Budget Filter */}
        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-1 flex items-center">
          <button
            onClick={() => setBudgetRange('all')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              budgetRange === 'all' ? 'bg-white/20 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Любой $
          </button>
          <button
            onClick={() => setBudgetRange('low')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              budgetRange === 'low' ? 'bg-emerald-500/30 text-emerald-200 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            &lt;$50
          </button>
          <button
            onClick={() => setBudgetRange('mid')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              budgetRange === 'mid' ? 'bg-amber-500/30 text-amber-200 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            $50-250
          </button>
          <button
            onClick={() => setBudgetRange('high')}
            className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
              budgetRange === 'high' ? 'bg-purple-500/30 text-purple-200 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            $250+
          </button>
        </div>
      </div>

      {/* Category Horizontal Filter Chips */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-[#CCFF00]" /> Категории
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-[10px] text-[#CCFF00] hover:underline"
            >
              Сбросить категорию
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
              !selectedCategory
                ? 'bg-[#CCFF00] text-slate-950 font-bold border-transparent shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                : 'bg-slate-900/60 text-gray-300 border-white/10 hover:border-white/20'
            }`}
          >
            Все
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-[#CCFF00] text-slate-950 font-bold border-transparent shadow-[0_0_10px_rgba(204,255,0,0.4)]'
                  : 'bg-slate-900/60 text-gray-300 border-white/10 hover:border-white/20'
              }`}
            >
              <span>{cat.titleRu}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Start Templates Section */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Шаблоны в 1 клик
          </span>
          <span className="text-[10px] text-gray-400">Быстрое создание</span>
        </div>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {SERVICE_TEMPLATES.slice(0, 6).map((tmpl) => (
            <div
              key={tmpl.id}
              onClick={() => {
                triggerHapticFeedback('medium')
                onOpenQuickRequest(tmpl)
              }}
              className="shrink-0 w-52 bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 hover:border-amber-400/50 rounded-2xl p-3 cursor-pointer group transition-all duration-300 shadow-lg hover:scale-[1.02]"
            >
              <div className="h-20 rounded-xl overflow-hidden mb-2 relative">
                <img src={tmpl.coverImageUrl} alt={tmpl.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-1.5 right-1.5 bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30">
                  ${tmpl.defaultBudget}
                </div>
              </div>
              <h4 className="font-bold text-xs text-white line-clamp-2 leading-tight group-hover:text-amber-300 transition-colors">
                {tmpl.title}
              </h4>
              <p className="text-[10px] text-gray-400 line-clamp-1 mt-1">
                {tmpl.description}
              </p>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5">
                  <Zap className="w-3 h-3" /> Создать
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Count & Header */}
      <div className="flex items-center justify-between px-1 pt-3 border-t border-white/10">
        <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-[#00F2FE]" /> Найдено предложений: ({totalResultsCount})
        </span>
        {(searchQuery || selectedHub !== 'all' || selectedDistrict !== 'all' || selectedCategory || contentType !== 'all' || budgetRange !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" /> Сбросить все
          </button>
        )}
      </div>

      {/* Results List */}
      {totalResultsCount === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center my-4 space-y-3">
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-white">Ничего не найдено</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            Попробуйте изменить параметры поиска, расширить выбор района или сбросить фильтры.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-slate-950 font-bold rounded-xl text-xs shadow-lg hover:opacity-90 transition-opacity"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Requests Results */}
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => {
                triggerHapticFeedback('light')
                onSelectRequest(req)
              }}
              className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-[#D946EF]/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2 py-0.5 bg-[#D946EF]/20 text-[#D946EF] border border-[#D946EF]/40 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Zap className="w-3 h-3" /> АУКЦИОН
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-[10px] font-medium rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#00F2FE]" /> {req.district || req.hub}
                    </span>
                    <span className="px-2 py-0.5 bg-white/5 text-gray-400 text-[10px] font-medium rounded-full">
                      {req.categoryL1Name}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{req.title}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">{req.description}</p>
                </div>
                {req.mediaUrls && req.mediaUrls[0] && (
                  <img
                    src={req.mediaUrls[0]}
                    alt={req.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img src={req.clientAvatar} alt={req.clientName} className="w-6 h-6 rounded-full object-cover" />
                  <span className="text-xs text-gray-300 font-medium">{req.clientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    {req.bidsCount || 0} откликов
                  </span>
                  <span className="text-sm font-black text-[#CCFF00] bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-2.5 py-0.5 rounded-lg">
                    ${req.budget}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Market Item Results */}
          {filteredMarket.map((item) => {
            const discountPercent = item.oldPrice ? Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100) : null
            return (
              <div
                key={item.id}
                onClick={() => {
                  triggerHapticFeedback('light')
                  onSelectMarketProduct(item)
                }}
                className="bg-slate-900/80 backdrop-blur-xl border border-white/10 hover:border-[#00F2FE]/50 rounded-2xl p-4 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(0,242,254,0.2)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2 py-0.5 bg-[#00F2FE]/20 text-[#00F2FE] border border-[#00F2FE]/40 text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Package className="w-3 h-3" /> МАРКЕТ
                      </span>
                      {discountPercent && discountPercent > 0 && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold rounded-full">
                          -{discountPercent}%
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-white/5 text-gray-300 text-[10px] font-medium rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#00F2FE]" /> {item.district}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-white line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-2 mt-1">{item.description}</p>
                  </div>
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-white/10"
                    />
                  )}
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={item.sellerName || 'Продавец'} className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-xs text-gray-300 font-medium">{item.sellerName || 'Продавец'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.oldPrice && item.oldPrice > item.price && (
                      <span className="text-xs text-gray-500 line-through font-mono">
                        ${item.oldPrice}
                      </span>
                    )}
                    <span className="text-sm font-black text-[#00F2FE] bg-[#00F2FE]/10 border border-[#00F2FE]/30 px-2.5 py-0.5 rounded-lg">
                      ${item.price}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
