import React, { useState, useEffect, useRef } from 'react'
import { Sparkles, Zap, ArrowRight, ShieldCheck, Heart, MapPin, Mic, Clock, Car, Home, Wallet, Wrench, Package, Search, ArrowUpDown } from 'lucide-react'
import { RequestItem, BidItem } from '../types'
import { SERVICE_TEMPLATES, CATEGORIES, MOCK_OFFER_INSTANCES } from '../data/mockData'
import { triggerHapticFeedback } from '../lib/telegram'
import { FeedHeader } from './FeedHeader'
import { ClientOffersStream } from './ClientOffersStream'
import { CreateRequestDashedCard } from './MyDealsAndListingsView'
import { getUnifiedProfile } from '../lib/accountSync'

interface MockupAuctionSectionProps {
  mode?: 'rent' | 'services'
  onSelectHub: (hub: string) => void
  activeHub: string
  activeCategory: string | null
  onSelectCategory: (cat: string | null) => void
  onOpenBidModal: (request: RequestItem) => void
  onOpenQuickRequest: (request: RequestItem) => void
  requests: RequestItem[]
  onAcceptBidDirectly?: (request: RequestItem, bid: BidItem) => void
  onNavigateToBidsTab?: () => void
}

const RENT_CATEGORIES = [
  { id: 'cat-bikes', label: 'БАЙКИ', icon: '🛵', slug: 'bikes' },
  { id: 'cat-cars', label: 'АВТО', icon: '🚗', slug: 'cars' },
  { id: 'cat-villas', label: 'ВИЛЛЫ', icon: '🏡', slug: 'villas' },
  { id: 'cat-apartments', label: 'КВАРТИРЫ', icon: '🏢', slug: 'apartments' },
  { id: 'cat-yachts', label: 'ЯХТЫ', icon: '🛥️', slug: 'yachts' },
  { id: 'cat-equipment', label: 'ОБОРУДОВАНИЕ', icon: '📷', slug: 'equipment' },
]

const SERVICES_CATEGORIES = [
  { id: 'cat-beauty', label: 'КРАСОТА', icon: '💆', slug: 'beauty' },
  { id: 'cat-cleaning', label: 'КЛИНИНГ', icon: '🧹', slug: 'cleaning' },
  { id: 'cat-health', label: 'ВРАЧИ', icon: '🩺', slug: 'health' },
  { id: 'cat-kids', label: 'ДЕТИ', icon: '👶', slug: 'kids' },
  { id: 'cat-tours', label: 'ТУРЫ', icon: '🗺️', slug: 'tours' },
  { id: 'cat-events', label: 'ИВЕНТЫ', icon: '🎈', slug: 'events' },
  { id: 'cat-repair', label: 'РЕМОНТ', icon: '🛠️', slug: 'repair' },
  { id: 'cat-legal', label: 'ЮРИСТЫ', icon: '⚖️', slug: 'legal' },
  { id: 'cat-other', label: 'ДРУГОЕ', icon: '🌀', slug: 'other' },
]

/**
 * Reusable Marquee Continuous Auto-Scrolling Slider Component
 */
interface InteractiveMarqueeSliderProps {
  title: string
  items: RequestItem[]
  direction?: 'left' | 'right'
  activeHub: string
  selectedCardId: string | null
  onCardClick: (item: RequestItem, e: React.MouseEvent) => void
  isHero?: boolean
}

const InteractiveMarqueeSlider: React.FC<InteractiveMarqueeSliderProps> = ({
  title,
  items,
  direction = 'left',
  activeHub,
  selectedCardId,
  onCardClick,
  isHero = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef<number | null>(null)
  const isPausedRef = useRef(false)

  // Pause scrolling if any card in this slider is currently selected
  const hasSelectedCard = items.some((it) => it.id === selectedCardId)

  useEffect(() => {
    isPausedRef.current = hasSelectedCard
  }, [hasSelectedCard])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let speed = direction === 'left' ? 0.75 : -0.75

    const step = () => {
      if (!isPausedRef.current && el) {
        el.scrollLeft += speed
        const max = el.scrollWidth - el.clientWidth
        if (speed > 0 && el.scrollLeft >= max - 2) {
          el.scrollLeft = 0
        } else if (speed < 0 && el.scrollLeft <= 2) {
          el.scrollLeft = max
        }
      }
      animFrameRef.current = requestAnimationFrame(step)
    }

    animFrameRef.current = requestAnimationFrame(step)

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [direction])

  return (
    <div className="space-y-2 pt-2">
      {/* Slider Header */}
      <div className="flex items-center justify-between px-1">
        <h3
          className="text-xs uppercase tracking-wider font-extrabold text-white flex items-center gap-1.5"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          <span>{title}</span>
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-ping" />
        </h3>
      </div>

      {/* Marquee Track */}
      <div
        ref={containerRef}
        onMouseEnter={() => (isPausedRef.current = true)}
        onMouseLeave={() => (isPausedRef.current = hasSelectedCard)}
        onTouchStart={() => (isPausedRef.current = true)}
        onTouchEnd={() => (isPausedRef.current = hasSelectedCard)}
        className="flex gap-3.5 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-4 px-4 pr-10 scroll-smooth"
      >
        {items.map((item) => {
          const isSelected = item.id === selectedCardId
          const isCustomCard = item.id.includes('special-card-other')
          const coverImage =
            item.mediaUrls?.[0] || 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'

          return (
            <div
              key={item.id}
              onClick={(e) => onCardClick(item, e)}
              className={`${
                isHero 
                  ? 'w-[85vw] max-w-[340px] min-h-[300px] h-[300px] p-5' 
                  : 'w-[75vw] max-w-[280px] min-h-[240px] h-[240px] p-4'
              } shrink-0 rounded-3xl flex flex-col justify-between relative overflow-hidden z-10 cursor-pointer group border transition-all duration-300 ${
                isSelected
                  ? 'scale-[1.05] border-[#00F2FE] shadow-[0_0_35px_rgba(0,242,254,0.9)] ring-2 ring-[#00F2FE]/80'
                  : isCustomCard
                  ? 'border-[#00F2FE]/60 shadow-[0_0_25px_rgba(0,242,254,0.35)] hover:scale-[1.02]'
                  : 'border-white/25 shadow-[0_15px_35px_rgba(0,0,0,0.6)] hover:scale-[1.02]'
              }`}
              style={{
                background: isSelected ? 'rgba(0, 242, 254, 0.12)' : 'rgba(10, 16, 26, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
              }}
            >
              {/* Photo Background */}
              <img
                src={coverImage}
                alt={item.title}
                className={`absolute inset-0 w-full h-full object-cover filter transition-all duration-500 pointer-events-none ${
                  isSelected ? 'blur-[1px] scale-110 opacity-70' : 'blur-[3px] scale-105 opacity-50 group-hover:scale-110'
                }`}
              />

              {/* Dark Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85 pointer-events-none" />

              {/* Selection Badge Banner */}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 z-20 bg-[#00F2FE] text-[#03100A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                  Нажмите ещё раз для заказа
                </div>
              )}

              {/* Card Top: Title & Hub/District */}
              <div className="relative z-10">
                <h4 className="font-display font-black text-sm text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]">
                  <span className="text-[#00F2FE] tracking-wider uppercase font-bold">{activeHub.toUpperCase()}:</span> {item.title}
                </h4>
                <p
                  className="text-[10px] text-gray-300 font-medium mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] flex items-center gap-1"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <span>📍 {item.district}</span> • <span className="text-[#CCFF00] font-bold">{item.categoryL1Name}</span>
                </p>
              </div>

              {/* Card Middle: Giant Pulsing Plus with Dashed Outline */}
              <div className="relative z-10 flex items-center justify-center my-2">
                <div
                  className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-[3px] border-dashed flex items-center justify-center transition-all duration-300 ${
                    isSelected
                      ? 'border-[#00F2FE] bg-[#00F2FE]/25 text-[#00F2FE] scale-110 shadow-[0_0_25px_rgba(0,242,254,0.8)] animate-pulse'
                      : isCustomCard
                      ? 'border-[#00F2FE] bg-[#00F2FE]/15 text-[#00F2FE] shadow-[0_0_20px_rgba(0,242,254,0.5)]'
                      : 'border-[#00F2FE]/70 bg-black/40 text-[#00F2FE] group-hover:border-[#00F2FE] group-hover:bg-[#00F2FE]/20 group-hover:scale-110 shadow-[0_0_15px_rgba(0,242,254,0.4)]'
                  }`}
                >
                  <span className="font-black text-5xl sm:text-6xl leading-none select-none drop-shadow-[0_0_10px_rgba(0,242,254,0.9)] mt-[-4px]">
                    +
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const MockupAuctionSection: React.FC<MockupAuctionSectionProps> = ({
  mode = 'rent',
  onSelectHub,
  activeHub,
  activeCategory,
  onSelectCategory,
  onOpenBidModal,
  onOpenQuickRequest,
  requests,
  onAcceptBidDirectly,
  onNavigateToBidsTab,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'urgent' | 'budget' | 'newest'>('urgent')
  const timerRef = useRef<any>(null)

  const currentProfile = getUnifiedProfile()
  const currentUserId = currentProfile.email || (currentProfile.telegramId ? String(currentProfile.telegramId) : 'usr-current')
  const currentProfileName = currentProfile.profileName.toLowerCase()

  // Filter user's own active requests (Pinned at top!)
  const myRequests = requests.filter((r) => {
    if (!r) return false
    if (r.clientId === currentUserId || r.clientId === 'usr-current') return true
    if (r.clientName && currentProfileName && r.clientName.toLowerCase().includes(currentProfileName)) return true
    return false
  })
  
  // JTBD Focus Mode: If user has active open requests, collapse search, chips and voice input by default to remove clutter!
  const [showSearchHeader, setShowSearchHeader] = useState<boolean>(() => myRequests.length === 0)

  const hubsList = [
    { id: 'dubai', label: '🇦🇪 ДУБАЙ' },
    { id: 'bali', label: '🇮🇩 БАЛИ' },
    { id: 'phuket', label: '🇹🇭 ПХУКЕТ' },
    { id: 'bangkok', label: '🇹🇭 БАНГКОК' },
    { id: 'pattaya', label: '🇹🇭 ПАТТАЙЯ' },
    { id: 'samui', label: '🇹🇭 САМУИ' },
    { id: 'nhatrang', label: '🇻🇳 НЯЧАНГ' },
    { id: 'danang', label: '🇻🇳 ДАНАНГ' },
    { id: 'seoul', label: '🇰🇷 СЕУЛ' },
    { id: 'tokyo', label: '🇯🇵 ТОКИО' },
    { id: 'istanbul', label: '🇹🇷 СТАМБУЛ' },
    { id: 'tbilisi', label: '🇬🇪 ТБИЛИСИ' },
    { id: 'belgrade', label: '🇷🇸 БЕЛГРАД' },
    { id: 'lisbon', label: '🇵🇹 ЛИССАБОН' },
    { id: 'colombo', label: '🇱🇰 КОЛОМБО' },
    { id: 'yerevan', label: '🇦🇲 ЕРЕВАН' },
  ]

  // Default district helper per hub
  const getHubDefaultDistrict = (hubName: string) => {
    const lower = hubName.toLowerCase()
    if (lower === 'dubai') return 'Marina'
    if (lower === 'bali') return 'Canggu'
    if (lower === 'phuket') return 'Patong'
    if (lower === 'bangkok') return 'Thonglor'
    if (lower === 'pattaya') return 'Jomtien'
    if (lower === 'samui') return 'Chaweng'
    if (lower === 'nhatrang') return 'Nha Trang Centre'
    if (lower === 'danang') return 'My Khe'
    if (lower === 'seoul') return 'Gangnam'
    if (lower === 'tokyo') return 'Shibuya'
    if (lower === 'istanbul') return 'Kadikoy'
    if (lower === 'tbilisi') return 'Vake'
    if (lower === 'belgrade') return 'Stari Grad'
    if (lower === 'lisbon') return 'Alfama'
    if (lower === 'colombo') return 'Kollupitiya'
    if (lower === 'yerevan') return 'Kentron'
    return 'Центр'
  }

  const currentDistrict = getHubDefaultDistrict(activeHub)

  // Clear selection after 5 seconds timeout or click outside
  const handleCardClick = (item: RequestItem, e: React.MouseEvent) => {
    e.stopPropagation()

    if (selectedCardId === item.id) {
      // 2nd click: Open Quick Request Modal!
      triggerHapticFeedback('heavy')
      if (timerRef.current) clearTimeout(timerRef.current)
      setSelectedCardId(null)
      onOpenQuickRequest(item)
    } else {
      // 1st click: Pause slider, zoom +5%, highlight, set 5s timeout
      triggerHapticFeedback('medium')
      setSelectedCardId(item.id)

      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => {
        setSelectedCardId(null)
      }, 5000)
    }
  }

  // Deselect on click anywhere outside cards
  useEffect(() => {
    const handleOutsideClick = () => {
      if (selectedCardId) {
        setSelectedCardId(null)
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }
    window.addEventListener('click', handleOutsideClick)
    return () => window.removeEventListener('click', handleOutsideClick)
  }, [selectedCardId])

  // Filter templates/cards based on activeCategory for main hero slider
  const filteredTemplates = activeCategory
    ? SERVICE_TEMPLATES.filter((tmpl) => tmpl.categoryL1Id === activeCategory)
    : SERVICE_TEMPLATES

  // Use all approved open requests for the main feed
  const combinedItems = requests

  let displayAuctionItems = combinedItems.filter((item) => {
    if (item.status && item.status !== 'open') return false
    if (activeCategory && item.categoryL1Id && !item.id.includes('hero-')) {
      const cat = item.categoryL1Id
      const matches =
        cat === activeCategory ||
        ((activeCategory === 'cat-bikes' || activeCategory === 'cat-cars') && cat === 'cat-transport') ||
        ((activeCategory === 'cat-villas' || activeCategory === 'cat-apartments') && (cat === 'cat-housing' || cat === 'cat-realestate'))
      if (!matches) return false
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchTitle = item.title.toLowerCase().includes(q)
      const matchDesc = item.description.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc) return false
    }
    return true
  })

  if (sortBy === 'budget') {
    displayAuctionItems = [...displayAuctionItems].sort((a, b) => (b.budget || 0) - (a.budget || 0))
  } else if (sortBy === 'urgent') {
    displayAuctionItems = [...displayAuctionItems].sort((a, b) => (a.auctionEndsAt || '').localeCompare(b.auctionEndsAt || ''))
  }

  return (
    <div className="w-full space-y-5 pb-6">
      {/* Global Gradient Definition for Icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="cyberpunk-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F2FE" />
            <stop offset="100%" stopColor="#CCFF00" />
          </linearGradient>
        </defs>
      </svg>

      {/* Active Requests Pill Banner on Home */}
      {myRequests.length > 0 && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-cyan-500/50 shadow-[0_0_20px_rgba(0,242,254,0.25)] animate-fadeIn mx-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-ping" />
            <div>
              <div className="text-xs font-black uppercase text-white tracking-wide flex items-center gap-1.5">
                <span>⚡ Активных заявок: {myRequests.length}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] text-[10px] font-mono border border-[#00F2FE]/40">
                  {myRequests.reduce((acc, r) => acc + (r.bidsCount || 0), 0)} откликов
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium">Отклики исполнителей поступают в ваш Центр Управления</p>
            </div>
          </div>
          {onNavigateToBidsTab && (
            <button
              onClick={() => {
                triggerHapticFeedback('heavy')
                onNavigateToBidsTab()
              }}
              className="text-[11px] font-extrabold text-black bg-gradient-to-r from-[#00F2FE] to-[#00DFEA] px-3.5 py-2 rounded-xl shadow-[0_0_12px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Отклики ⭐</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </button>
          )}
        </div>
      )}
      
      <FeedHeader 
        categories={mode === 'rent' ? RENT_CATEGORIES : SERVICES_CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={onSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* 3. LIVE GENERAL FEED */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-ping" />
          <h2 className="text-[15px] font-bold uppercase tracking-wider text-white">
            🔥 ВСЕ АУКЦИОНЫ В РАЙОНЕ
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {displayAuctionItems.length > 0 ? (
            displayAuctionItems.slice(0, 10).map((item) => (
              <AuctionRequestCard key={item.id} item={item} onOpenBidModal={onOpenBidModal} />
            ))
          ) : (
            <CreateRequestDashedCard onClick={() => onOpenQuickRequest?.({} as any)} />
          )}
        </div>
      </div>
    </div>
  )
}

function getMockBidsForRequest(req: RequestItem): BidItem[] {
  const t = req.title.toLowerCase()
  if (t.includes('байк') || t.includes('скутер') || t.includes('nmax') || t.includes('pcx') || t.includes('прокат') || t.includes('авто')) {
    return [
      {
        id: `bid-${req.id}-1`,
        requestId: req.id,
        providerId: 'usr-0451611',
        providerName: 'Ihor Sherlock Mobility (0451611@gmail.com)',
        providerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        providerRating: 5.0,
        isPro: true,
        isAiAgent: false,
        proposedPrice: req.budget && req.budget > 0 ? Math.max(10, Math.round(req.budget * 0.9)) : 14,
        currency: 'USD',
        comment: 'Yamaha NMAX 2024г. Бесплатная доставка в ваш отель в районе ' + req.district + '. 2 шлема + страховка.',
        status: 'pending',
        createdAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
      } as any,
      {
        id: `bid-${req.id}-2`,
        requestId: req.id,
        providerId: 'usr-sherlockdxb',
        providerName: 'Sherlock (@sherlockdxb)',
        providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        providerRating: 4.98,
        isPro: true,
        isAiAgent: true,
        proposedPrice: req.budget && req.budget > 0 ? req.budget : 16,
        currency: 'USD',
        comment: 'Honda PCX 160cc / Toyota Yaris в идеальном состоянии. Залог паспорта не нужен.',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
      } as any,
      {
        id: `bid-${req.id}-3`,
        requestId: req.id,
        providerId: 'usr-shershadow',
        providerName: 'Shadow Capital Rentals (shershadowcapital@gmail.com)',
        providerAvatar: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=100',
        providerRating: 4.92,
        isPro: true,
        isAiAgent: false,
        proposedPrice: req.budget && req.budget > 0 ? Math.round(req.budget * 1.05) : 20,
        currency: 'USD',
        comment: 'Премиум транспорт с полной страховкой KASKO и детским креслом по запросу.',
        status: 'pending',
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        mediaUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80',
      } as any,
    ]
  }

  return [
    {
      id: `bid-${req.id}-1`,
      requestId: req.id,
      providerId: 'usr-sherlockdxb',
      providerName: 'Sherlock Luxury Housing (@sherlockdxb)',
      providerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      providerRating: 4.98,
      isPro: true,
      isAiAgent: true,
      proposedPrice: req.budget && req.budget > 0 ? req.budget : 1500,
      currency: 'USD',
      comment: 'Отличная 2-спальная вилла / кондо в районе ' + req.district + '. Скоростной Wi-Fi и бассейн.',
      status: 'pending',
      createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      mediaUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600&auto=format&fit=crop&q=80',
    } as any,
    {
      id: `bid-${req.id}-2`,
      requestId: req.id,
      providerId: 'usr-dubble',
      providerName: 'Dubble Housing & Transport (dubble.ads@gmail.com)',
      providerAvatar: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100',
      providerRating: 4.89,
      isPro: true,
      isAiAgent: false,
      proposedPrice: req.budget && req.budget > 0 ? Math.round(req.budget * 0.95) : 1400,
      currency: 'USD',
      comment: 'Уютные апартаменты / вилла у пляжа. Быстрое заселение и уборка 2 раза в неделю.',
      status: 'pending',
      createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      mediaUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80',
    } as any,
  ]
}

function MyPinnedRequestCard({
  item,
  onOpenBidModal,
  onAcceptBidDirectly,
}: {
  item: RequestItem
  onOpenBidModal: (item: RequestItem) => void
  onAcceptBidDirectly?: (item: RequestItem, bid: BidItem) => void
}) {
  const bids = getMockBidsForRequest(item)

  return (
    <div className="w-full rounded-3xl p-4.5 bg-gradient-to-br from-[#0A101D] via-[#0F172A] to-[#0A101D] border-2 border-[#00F2FE]/70 shadow-[0_0_30px_rgba(0,242,254,0.25)] flex flex-col gap-3 relative overflow-hidden animate-fadeIn">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2FE]/15 rounded-full blur-[40px] pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${item.status === 'under_review' ? 'bg-rose-400' : 'bg-[#CCFF00]'}`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${item.status === 'under_review' ? 'bg-rose-500' : 'bg-[#CCFF00]'}`}></span>
          </span>
          {item.status === 'under_review' ? (
            <span className="text-xs font-black text-rose-400 uppercase tracking-wider">
              ⏳ НА РУЧНОЙ МОДЕРАЦИИ У АДМИНИСТРАТОРА
            </span>
          ) : (
            <span className="text-xs font-black text-[#CCFF00] uppercase tracking-wider">
              МОЯ ЗАЯВКА В ЛЕНТЕ
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
          📍 {item.district}
        </span>
      </div>

      {/* Title & Description */}
      <div>
        <h3 className="text-[18px] font-black text-white leading-tight mb-1">
          {item.title}
        </h3>
        <p className="text-xs text-gray-300 leading-snug">
          {item.description}
        </p>
      </div>

      {/* InDrive Style Incoming Offers Stream */}
      <ClientOffersStream
        request={item}
        bids={bids}
        onAcceptOffer={(bid) => {
          if (onAcceptBidDirectly) {
            onAcceptBidDirectly(item, bid)
          } else {
            onOpenBidModal(item)
          }
        }}
      />
    </div>
  )
}

function AuctionRequestCard({ item, onOpenBidModal }: { item: RequestItem, onOpenBidModal: (item: RequestItem) => void }) {
  const [timeLeftStr, setTimeLeftStr] = useState('02:45 МИН')
  const [progress, setProgress] = useState(100)
  const [isUrgent, setIsUrgent] = useState(false)

  const getIntentBadge = (title: string, categoryId?: string) => {
    const t = title.trim().toUpperCase()
    if (t.startsWith('СНИМУ')) return { text: '🏠 СНИМУ', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.3)]' }
    if (t.startsWith('КУПЛЮ')) return { text: '🛒 КУПЛЮ', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.3)]' }
    if (t.startsWith('ОБМЕНЯЮ') || t.includes('ОБМЕН')) return { text: '💵 ОБМЕНЯЮ', style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]' }
    if (t.startsWith('ЗАКАЖУ')) return { text: '🛠️ ЗАКАЖУ', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]' }
    if (t.startsWith('ВЫЗОВУ')) return { text: '🩺 ВЫЗОВУ', style: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]' }
    if (t.startsWith('ОФОРМЛЮ')) return { text: '📄 ОФОРМЛЮ', style: 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-[0_0_8px_rgba(59,130,246,0.3)]' }
    return { text: '🔍 ИЩУ', style: 'bg-[#00F2FE]/20 text-[#00F2FE] border-[#00F2FE]/40 shadow-[0_0_8px_rgba(0,242,254,0.3)]' }
  }

  const intentBadge = getIntentBadge(item.title, item.categoryL1Id)

  useEffect(() => {
    const now = new Date().getTime()
    const endTime = item.auctionEndsAt
      ? new Date(item.auctionEndsAt).getTime()
      : item.expiresAt
      ? new Date(item.expiresAt).getTime()
      : now + 60 * 60 * 1000

    const startTime = item.createdAt
      ? new Date(item.createdAt).getTime()
      : endTime - 60 * 60 * 1000

    const totalDuration = Math.max(1000, endTime - startTime)

    const calculateTime = () => {
      const currentTime = new Date().getTime()
      const diff = endTime - currentTime

      if (diff <= 0) {
        setTimeLeftStr('ЗАВЕРШЕНО')
        setProgress(0)
        setIsUrgent(true)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / 60000)
      const seconds = Math.floor((diff % 60000) / 1000)
      
      const formatted = hours > 0
        ? `${hours}ч. ${minutes}м.`
        : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} МИН`
      
      setTimeLeftStr(formatted)
      setProgress(Math.max(0, Math.min(100, (diff / totalDuration) * 100)))
      setIsUrgent(diff < 10 * 60 * 1000)
    }

    calculateTime()
    const int = setInterval(calculateTime, 1000)
    return () => clearInterval(int)
  }, [item.auctionEndsAt, item.expiresAt, item.createdAt])

  return (
    <div 
      onClick={() => onOpenBidModal(item)}
      className="w-full glass-card p-4 flex flex-col gap-4 cursor-pointer relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2FE]/10 rounded-full blur-[50px] pointer-events-none" />

      <div className="flex gap-4 relative z-10 items-start">
        <div className="w-[100px] h-[100px] sm:w-[110px] sm:h-[110px] aspect-square shrink-0 rounded-2xl bg-[#0D1117] border border-[#222222] overflow-hidden relative group-hover:border-[#00F2FE]/40 transition-colors shadow-[0_0_15px_rgba(0,242,254,0.1)]">
          {item.mediaUrls && item.mediaUrls.length > 0 ? (
            <img src={item.mediaUrls[0]} alt="Request" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#00F2FE]/20 to-[#CCFF00]/20 flex items-center justify-center">
              <Package className="w-8 h-8 text-white/50" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0 pt-1">
          <h3 className="text-[17px] font-bold text-white leading-tight break-words">
            {item.title}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Intent Badge */}
            <span className={`inline-flex shrink-0 border px-2.5 py-1 rounded-full items-center gap-1 font-black text-[10px] uppercase tracking-wider ${intentBadge.style}`}>
              {intentBadge.text}
            </span>

            {/* Timer Badge */}
            <div className={`inline-flex shrink-0 border px-2.5 py-1 rounded-full items-center gap-1.5 shadow-sm transition-colors ${
              isUrgent ? 'bg-[#D946EF]/15 border-[#D946EF]/40 shadow-[0_0_10px_rgba(217,70,239,0.3)]' : 'bg-[#CCFF00]/10 border-[#CCFF00]/30 shadow-[0_0_10px_rgba(204,255,0,0.2)]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                isUrgent ? 'bg-[#D946EF] shadow-[0_0_5px_#D946EF]' : 'bg-[#CCFF00] shadow-[0_0_5px_#CCFF00]'
              }`} />
              <span className={`text-[10px] font-black uppercase tracking-wider ${
                isUrgent ? 'text-[#D946EF]' : 'text-[#CCFF00]'
              }`}>{timeLeftStr}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-400 font-medium mt-1">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="truncate max-w-[120px]">{item.district}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#00F2FE]" />
              <span>Сегодня</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-cyan-950 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-1.5">
          {item.bidsCount > 0 && (
            <div className="flex -space-x-2">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64" className="w-5 h-5 rounded-full border border-[#050811]" />
            </div>
          )}
          <span className="text-[13px] font-semibold text-cyan-200">
            ⚡ Откликов: {item.bidsCount || 0}
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          {item.budget && (
            <span className="text-[18px] font-black text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              💰 ${item.budget}
            </span>
          )}
          <button 
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              triggerHapticFeedback('heavy')
              onOpenBidModal(item)
            }}
            className="relative overflow-hidden hover:opacity-90 transition-all rounded-xl shadow-[0_0_15px_rgba(0,242,254,0.4)] bg-[#161B22] cursor-pointer"
          >
            <div 
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-[#00F2FE] via-[#00DFEA] to-[#CCFF00] transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
            <span className="relative z-10 text-white text-[14px] font-black px-5 py-2.5 block drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
              Откликнуться
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
