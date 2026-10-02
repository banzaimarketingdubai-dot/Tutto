// Vercel Deployment Trigger (banzaimarketingdubai-dot): 2026-09-27T19:00:00
import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { MockupAuctionSection } from './components/MockupAuctionSection'
import { RequestCard } from './components/RequestCard'
import { TemplateCard } from './components/TemplateCard'
import { CreateRequestModal } from './components/CreateRequestModal'
import { AIAssistantModal } from './components/AIAssistantModal'
import { BidModal } from './components/BidModal'
import { BusinessProfileView } from './components/BusinessProfileView'
import { DealChatModal } from './components/DealChatModal'
import { OnboardingModal } from './components/OnboardingModal'
import { BottomNav, TabId, AppMode } from './components/BottomNav'
import { PillSwitcher } from './components/PillSwitcher'
import { MarketSection, DEFAULT_PRODUCTS } from './components/MarketSection'
import { CreateMarketListingModal } from './components/CreateMarketListingModal'
import { MarketBuyModal } from './components/MarketBuyModal'
import { CreateActionSheetModal } from './components/CreateActionSheetModal'
import { MyDealsAndListingsView } from './components/MyDealsAndListingsView'
import { ExploreView } from './components/ExploreView'
import { MOCK_REQUESTS, SERVICE_TEMPLATES } from './data/mockData'
import { RequestItem, BidItem, ServiceTemplate, MarketItem } from './types'
import { initTelegramApp, triggerHapticFeedback, isTelegramEnvironment } from './lib/telegram'
import { CheckCircle2, Zap, Scale } from 'lucide-react'
import { AdminDisputePanel } from './components/AdminDisputePanel'
import { AuthModal } from './components/AuthModal'
import { NotificationCenterModal } from './components/NotificationCenterModal'
import { INITIAL_NOTIFICATIONS, NotificationItem } from './lib/notifications'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import { Language, detectDefaultLanguage, setSavedLanguage } from './lib/i18n'
import { parseDeepLinkParam } from './lib/deeplink'
import { ErrorBoundary } from './components/ErrorBoundary'

export function App() {
  const [currentLang, setCurrentLang] = useState<Language>(() => detectDefaultLanguage())
  const [mode, setMode] = useState<AppMode>('rent')
  const [activeHub, setActiveHub] = useState<string>('bali')
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [activeCategory, setActiveCategory] = useState<string | null>('cat-transport')
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false)

  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'req-bike',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: 'bali',
      district: 'Доставка в отель',
      categoryL1Id: 'cat-transport',
      categoryL1Name: 'Транспорт',
      title: 'НУЖЕН БАЙК',
      description: 'Аренда скутера 155cc с бесплатной доставкой в отель.',
      budget: 15,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 8,
    },
    {
      id: 'req-car',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Аренда с доставкой',
      categoryL1Id: 'cat-transport',
      categoryL1Name: 'Транспорт',
      title: 'НУЖНО АВТО',
      description: 'Компактный авто без залога оригиналов документов.',
      budget: 35,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 5,
    },
    {
      id: 'req-villa-short',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.95,
      hub: 'bali',
      district: 'Вилла / Отель',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ПОСУТОЧНО',
      description: 'Посуточная аренда виллы с бассейном.',
      budget: 250,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1613977257363-707ba9348227?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 12,
    },
    {
      id: 'req-villa-long',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 4.9,
      hub: 'bali',
      district: 'Апартаменты / Вилла',
      categoryL1Id: 'cat-realestate',
      categoryL1Name: 'Жильё',
      title: 'АРЕНДА ДОЛГОСРОК',
      description: 'Долгосрочная аренда апартаментов или виллы.',
      budget: 1200,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 6,
    },
    {
      id: 'req-exchange',
      clientId: 'usr-kaitlyn',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: 'bali',
      district: 'Доставка наличных',
      categoryL1Id: 'cat-exchange',
      categoryL1Name: 'Обмен',
      title: 'ОБМЕН ВАЛЮТЫ',
      description: 'Экспресс-доставка наличной валюты в отель.',
      budget: 0,
      currency: 'USD',
      mediaUrls: ['https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600'],
      isFeatured: true,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 4 * 60 * 1000 + 18 * 1000).toISOString(),
      bidsCount: 10,
    },
  ])

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('')
  const [aiStartVoice, setAiStartVoice] = useState<boolean>(false)
  const [selectedRequestForBid, setSelectedRequestForBid] = useState<RequestItem | null>(null)

  // Flash Market State
  const [isCreateMarketListingOpen, setIsCreateMarketListingOpen] = useState(false)
  const [isCreateActionSheetOpen, setIsCreateActionSheetOpen] = useState(false)
  const [selectedMarketProduct, setSelectedMarketProduct] = useState<MarketItem | null>(null)
  const [marketProducts, setMarketProducts] = useState<MarketItem[]>(DEFAULT_PRODUCTS)

  // In-App Deal Chat State
  const [activeDealRequest, setActiveDealRequest] = useState<RequestItem | null>(null)
  const [activeDealBid, setActiveDealBid] = useState<BidItem | null>(null)
  const [isAdminDisputeOpen, setIsAdminDisputeOpen] = useState(false)
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null)

  // Notifications Center State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0)

  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    initTelegramApp()
    
    const handleOpenAiAssistant = (e: Event) => {
      const ce = e as CustomEvent
      setAiInitialPrompt(ce.detail?.initialPrompt || '')
      setAiStartVoice(ce.detail?.startVoice || false)
      setIsAIAssistantOpen(true)
    }
    document.addEventListener('open-ai-assistant', handleOpenAiAssistant)

    // Auth Session Check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Deep Linking: Check Telegram startapp parameter (e.g. ?startapp=req_req-bike)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('admin') === 'true') {
      setIsAdminDisputeOpen(true)
    }

    const startAppParam = urlParams.get('startapp') || urlParams.get('tgWebAppStartParam') || (window as any).Telegram?.WebApp?.initDataUnsafe?.start_param
    const parsedLink = parseDeepLinkParam(startAppParam)
    if (parsedLink) {
      if (parsedLink.type === 'request') {
        const found = requests.find((r) => r.id === parsedLink.id) || requests[0]
        if (found) setSelectedRequestForBid(found)
      } else if (parsedLink.type === 'market') {
        const found = DEFAULT_PRODUCTS.find((m) => m.id === parsedLink.id) || DEFAULT_PRODUCTS[0]
        if (found) setSelectedMarketProduct(found)
      }
    }

    // Onboarding tutorial auto-display on first visit
    const hasSeenOnboarding = localStorage.getItem('needtnow_onboarding_completed')
    const isPlaywright = typeof window !== 'undefined' && Boolean((window as any).isPlaywright)
    if (!hasSeenOnboarding && !isPlaywright) {
      setIsOnboardingOpen(true)
    }

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('open-ai-assistant', handleOpenAiAssistant)
    }
  }, [])

  const handleSelectHub = (hub: string) => {
    setActiveHub(hub)
    triggerHapticFeedback('light')
  }

  const handleSelectTab = (tab: TabId) => {
    const isPlaywright = typeof window !== 'undefined' && Boolean((window as any).isPlaywright)
    if ((tab === 'account' || tab === 'my-bids' || tab === 'chat') && !session && !isTelegramEnvironment() && !isPlaywright) {
      setIsAuthOpen(true)
      triggerHapticFeedback('heavy')
      return
    }

    if (tab === 'market') {
      setMode('market')
      setActiveCategory(null)
    } else if (tab === 'home') {
      setMode('rent')
    }

    if (tab === 'chat' || tab === 'mine') {
      setUnreadChatCount(0)
    }

    // Close all open popups/modals
    setIsNotificationsOpen(false)
    setIsCreateActionSheetOpen(false)
    setIsCreateOpen(false)
    setIsAIAssistantOpen(false)
    setSelectedRequestForBid(null)
    setIsCreateMarketListingOpen(false)
    setSelectedMarketProduct(null)
    setActiveDealRequest(null)
    setActiveDealBid(null)
    setIsAdminDisputeOpen(false)
    setIsAuthOpen(false)

    setActiveTab(tab)
  }

  const handleModeChange = (newMode: AppMode) => {
    setMode(newMode)
    setActiveTab((newMode === 'rent' || newMode === 'services') ? 'home' : 'market')
    setActiveCategory(null)
  }

  const handleCreateRequest = (newReq: Partial<RequestItem>) => {
    const createdItem: RequestItem = {
      id: `req-${Date.now()}`,
      clientId: 'usr-current',
      clientName: 'Александр',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: (newReq.hub as any) || activeHub,
      district: newReq.district || 'Jimbaran',
      categoryL1Id: newReq.categoryL1Id || 'cat-realestate',
      categoryL1Name: newReq.categoryL1Name || 'Жильё',
      title: newReq.title || 'Запрос на услугу',
      description: newReq.description || '',
      budget: newReq.budget ?? 345,
      currency: 'USD',
      mediaUrls: [],
      isFeatured: false,
      status: 'open',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      bidsCount: 0,
    }

    setRequests([createdItem, ...requests])
    setNotificationMsg('🎉 Заявка опубликована на живой аукцион!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleCreateMarketListing = (newItem: MarketItem) => {
    setMarketProducts((prev) => [newItem, ...prev])
    setActiveCategory(null)
    setNotificationMsg('🔥 Лот успешно опубликован в Маркете!')
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  const handleContactSeller = (item: MarketItem, deliveryMethod: string) => {
    const marketDealReq: RequestItem = {
      id: `req-market-${Date.now()}`,
      clientId: 'usr-buyer',
      clientName: 'Покупатель',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      clientRating: 5.0,
      hub: activeHub as any,
      district: item.district,
      categoryL1Id: 'cat-market',
      categoryL1Name: 'Маркет',
      title: `Покупка: «${item.title}»`,
      description: `Покупка лота на Маркете. Способ получения: ${deliveryMethod}.`,
      budget: item.price,
      currency: 'USD',
      mediaUrls: [item.image],
      isFeatured: true,
      status: 'in_progress',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      auctionEndsAt: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
      bidsCount: 1,
    }

    const sellerBid: BidItem = {
      id: `bid-seller-${Date.now()}`,
      requestId: marketDealReq.id,
      providerId: item.sellerId || 'seller-1',
      providerName: item.sellerName || 'Продавец',
      providerAvatar: item.sellerAvatar,
      providerRating: item.sellerRating || 4.9,
      isPro: true,
      isAiAgent: false,
      proposedPrice: item.price,
      currency: 'USD',
      comment: `Здравствуйте! Готов к сделке по «${item.title}». Вариант получения: ${deliveryMethod}.`,
      status: 'accepted',
      createdAt: new Date().toISOString(),
    }

    setActiveDealRequest(marketDealReq)
    setActiveDealBid(sellerBid)
    setSelectedMarketProduct(null)
  }

  const handleSubmitBid = (requestId: string, price: number, comment: string) => {
    if (comment.startsWith('[CLARIFICATION]')) {
      const question = comment.replace('[CLARIFICATION] ', '')
      setRequests((prev) =>
        prev.map((r) => {
          if (r.id === requestId) {
            const reqs = r.clarificationRequests || []
            return {
              ...r,
              clarificationRequests: [
                ...reqs,
                { providerId: 'biz-current', question, createdAt: new Date().toISOString() }
              ]
            }
          }
          return r
        })
      )
      setNotificationMsg('📨 Запрос на уточнение отправлен клиенту!')
      setTimeout(() => setNotificationMsg(null), 4000)
      return
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, bidsCount: r.bidsCount + 1 } : r))
    )

    let targetReq = requests.find((r) => r.id === requestId)
    if (!targetReq && selectedRequestForBid) {
      targetReq = selectedRequestForBid
    }

    if (targetReq) {
      const mockBid: BidItem = {
        id: `bid-${Date.now()}`,
        requestId: targetReq.id,
        providerId: 'biz-1',
        providerName: 'Ayana Luxury Resort',
        providerAvatar: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=100',
        providerRating: 4.98,
        isPro: true,
        isAiAgent: true,
        proposedPrice: price,
        currency: 'USD',
        comment: comment || 'Вилла готова к бронированию!',
        status: 'accepted',
        createdAt: new Date().toISOString(),
      }

      setActiveDealRequest(targetReq)
      setActiveDealBid(mockBid)
    }

    setNotificationMsg(`✅ Предложение принято! Чат сделки открыт.`)
    setTimeout(() => setNotificationMsg(null), 4000)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center font-sans sm:py-6 selection:bg-[#00F2FE] selection:text-black relative overflow-hidden">
      {/* Fixed Background Glow Sprites Engine (Anchored 100% fixed on viewport during scrolling) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute -top-24 -left-24 w-[500px] h-[500px] rounded-full blur-[140px] transition-colors duration-1000 ${
          mode === 'rent' ? 'bg-[#00F2FE]/20' : mode === 'services' ? 'bg-[#FF2A85]/20' : 'bg-[#CCFF00]/15'
        }`} />
        <div className={`absolute -top-24 -right-24 w-[450px] h-[450px] rounded-full blur-[120px] transition-colors duration-1000 ${
          mode === 'rent' ? 'bg-[#CCFF00]/15' : mode === 'services' ? 'bg-[#00F2FE]/25' : 'bg-[#00F2FE]/25'
        }`} />
        <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[160px] opacity-40 transition-colors duration-1000 ${
          mode === 'rent' ? 'bg-[#00F2FE]/10' : mode === 'services' ? 'bg-[#FF2A85]/10' : 'bg-[#CCFF00]/10'
        }`} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050811]/90 to-[#000000]" />
      </div>

      {/* Main Full-Width Application Container */}
      <div className="relative flex min-h-[100dvh] w-full flex-col overflow-x-hidden bg-transparent z-10">
        {/* Header */}
        <Navbar
          currentLang={currentLang}
          onLanguageChange={(lang) => {
            setCurrentLang(lang)
            setSavedLanguage(lang)
          }}
          onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
          onLocationChange={(hub, district) => {
            handleSelectHub(hub)
            // If you want to store district globally you can add it to state too
          }}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          unreadNotifCount={notifications.filter((n) => !n.isRead).length}
          activeAuctionsCount={requests.filter(r => r.status === 'open').length}
          totalBidsCount={requests.reduce((acc, r) => acc + r.bidsCount, 0)}
          userRole="client"
          mode={mode}
          session={session}
          shouldFetchLocation={!isOnboardingOpen}
        />

        {(activeTab === 'home' || activeTab === 'market') && (
          <PillSwitcher mode={mode} onModeChange={handleModeChange} currentLang={currentLang} />
        )}

        {/* Notification Toast */}
        {notificationMsg && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#00F2FE] text-[#050811] font-black text-xs shadow-[0_0_25px_rgba(0,242,254,0.6)] flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#050811]" />
            <span>{notificationMsg}</span>
          </div>
        )}

        {/* Main Content Area */}
        <main className={`w-full px-4 py-2 flex-1 space-y-4 relative z-10 pb-32 ${
          (mode === 'services' || mode === 'market') && (activeTab === 'home' || activeTab === 'market')
            ? 'overflow-hidden h-[calc(100vh-140px)]'
            : ''
        }`}>
          {(mode === 'rent' || mode === 'services') && (activeTab === 'home' || activeTab === 'market') && (
            <div className="relative h-full w-full">
              <div className={`${mode === 'services' ? 'opacity-30 blur-sm pointer-events-none' : ''}`}>
                <MockupAuctionSection
                  mode={mode as 'rent' | 'services'}
                  activeHub={activeHub}
                  onSelectHub={handleSelectHub}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                  onOpenBidModal={(req) => setSelectedRequestForBid(req)}
                  onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
                  requests={requests}
                />
              </div>
              
              {mode === 'services' && (
                <div className="absolute top-32 left-0 right-0 z-50 flex flex-col items-center justify-center p-8 bg-[#161B22]/80 backdrop-blur-xl rounded-[2rem] border border-[#FF2A85]/50 shadow-[0_0_50px_rgba(255,42,133,0.3)] mx-2">
                   <h3 className="text-2xl font-black text-white text-center mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Биржа Услуг</h3>
                   <div className="text-sm text-gray-200 text-left font-medium leading-relaxed drop-shadow-md mb-6 w-full max-w-[280px] space-y-3">
                     <p className="font-bold text-center text-white mb-2 text-xs uppercase tracking-wide">Как это работает:</p>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center font-black text-xs border border-[#FF2A85]/50">1</span>
                       <p className="leading-tight"><strong className="text-white">Создайте запрос</strong><br/><span className="text-[11px] text-gray-400">Опишите задачу (клининг, ремонт, юрист).</span></p>
                     </div>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center font-black text-xs border border-[#FF2A85]/50">2</span>
                       <p className="leading-tight"><strong className="text-white">Сравните цены</strong><br/><span className="text-[11px] text-gray-400">Получите отклики от проверенных профи.</span></p>
                     </div>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF2A85]/20 text-[#FF2A85] flex items-center justify-center font-black text-xs border border-[#FF2A85]/50">3</span>
                       <p className="leading-tight"><strong className="text-white">Решите проблему</strong><br/><span className="text-[11px] text-gray-400">Выберите лучшие условия и сэкономьте.</span></p>
                     </div>
                   </div>
                   <button
                     onClick={() => {
                       triggerHapticFeedback('heavy')
                       setNotificationMsg('✅ Вы добавлены в список раннего доступа! Ждите уведомлений.')
                       setTimeout(() => setNotificationMsg(null), 4000)
                     }}
                     className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#FF2A85] to-[#FF5E99] text-white font-extrabold text-sm shadow-[0_0_20px_rgba(255,42,133,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                   >
                     🚀 Ранний доступ
                   </button>
                </div>
              )}
            </div>
          )}

          {mode === 'market' && (activeTab === 'home' || activeTab === 'market') && (
            <div className="relative h-full w-full">
              <div className="opacity-30 blur-sm pointer-events-none">
                <MarketSection
                  activeCategory={activeCategory}
                  products={marketProducts.length > 0 ? marketProducts : undefined}
                  onSelectCategory={setActiveCategory}
                  onOpenQuickRequest={() => setIsAIAssistantOpen(true)}
                  onSelectProduct={(product) => setSelectedMarketProduct(product)}
                  onOpenCreateListing={() => setIsCreateMarketListingOpen(true)}
                />
              </div>

              <div className="absolute top-32 left-0 right-0 z-50 flex flex-col items-center justify-center p-8 bg-[#161B22]/80 backdrop-blur-xl rounded-[2rem] border border-[#CCFF00]/50 shadow-[0_0_50px_rgba(204,255,0,0.3)] mx-2">
                  <h3 className="text-2xl font-black text-white text-center mb-3 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">Быстрая продажа</h3>
                  <div className="text-sm text-gray-200 text-left font-medium leading-relaxed drop-shadow-md mb-6 w-full max-w-[280px] space-y-3">
                     <p className="font-bold text-center text-white mb-2 text-xs uppercase tracking-wide">Как это работает:</p>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center font-black text-xs border border-[#CCFF00]/50">1</span>
                       <p className="leading-tight"><strong className="text-white">Выложите лот</strong><br/><span className="text-[11px] text-gray-400">Добавьте товар на продажу в 1 клик.</span></p>
                     </div>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center font-black text-xs border border-[#CCFF00]/50">2</span>
                       <p className="leading-tight"><strong className="text-white">Соберите заявки</strong><br/><span className="text-[11px] text-gray-400">Получайте отклики от покупателей рядом.</span></p>
                     </div>
                     <div className="flex items-start gap-3">
                       <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CCFF00]/20 text-[#CCFF00] flex items-center justify-center font-black text-xs border border-[#CCFF00]/50">3</span>
                       <p className="leading-tight"><strong className="text-white">Проведите сделку</strong><br/><span className="text-[11px] text-gray-400">Быстро продайте и получите деньги.</span></p>
                     </div>
                  </div>
                  <button
                    onClick={() => {
                      triggerHapticFeedback('heavy')
                      setNotificationMsg('✅ Вы добавлены в список раннего доступа! Мы пришлем уведомление в бота.')
                      setTimeout(() => setNotificationMsg(null), 4000)
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#CCFF00] to-[#E5FF00] text-black font-extrabold text-sm shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    🚀 Ранний доступ
                  </button>
              </div>
            </div>
          )}



          {activeTab === 'explore' && (
            <ExploreView
              requests={requests}
              marketProducts={marketProducts}
              activeHub={activeHub}
              onSelectCategory={(catId) => setActiveCategory(catId)}
              onSelectRequest={(req) => setSelectedRequestForBid(req)}
              onSelectMarketProduct={(item) => setSelectedMarketProduct(item)}
              onOpenQuickRequest={(template) => {
                setIsCreateOpen(true)
              }}
            />
          )}

          {(activeTab === 'my-bids' || activeTab === 'mine') && (
            <MyDealsAndListingsView
              myRequests={requests}
              myMarketItems={marketProducts}
              onOpenDealChat={(req, bid) => {
                setActiveDealRequest(req)
                setActiveDealBid(bid)
              }}
              onOpenMarketItem={(item) => setSelectedMarketProduct(item)}
              onDeleteMarketItem={(itemId) => {
                setMarketProducts((prev) => prev.filter((i) => i.id !== itemId))
                setNotificationMsg('🗑️ Лот удален из Маркета')
                setTimeout(() => setNotificationMsg(null), 3000)
              }}
              onDeleteRequest={(reqId) => {
                setRequests((prev) => prev.filter((r) => r.id !== reqId))
                setNotificationMsg('🗑️ Заявка удалена из аукциона')
                setTimeout(() => setNotificationMsg(null), 3000)
              }}
            />
          )}

          {activeTab === 'chat' && (
            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 text-center my-4">
              <h3 className="font-bold text-base text-white">Чат сделок</h3>
              <p className="text-xs text-gray-300 mt-1">Прямое общение клиентов с исполнителями в реальном времени</p>
            </div>
          )}

          {activeTab === 'account' && (
            <BusinessProfileView onOpenAdmin={() => setIsAdminDisputeOpen(true)} />
          )}
        </main>

        {/* Modals */}
        <CreateRequestModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          currentHub={activeHub as any}
          onCreateRequest={handleCreateRequest}
          currentLang={currentLang}
        />

        <AIAssistantModal
          isOpen={isAIAssistantOpen}
          initialPrompt={aiInitialPrompt}
          startVoice={aiStartVoice}
          onClose={() => setIsAIAssistantOpen(false)}
          currentHub={activeHub}
          currentDistrict="Равай" // Fallback district, could be dynamic
          onPublish={handleCreateRequest}
          currentLang={currentLang}
          onSkipToManual={() => {
            setIsAIAssistantOpen(false)
            setIsCreateOpen(true)
          }}
        />

        <BidModal
          isOpen={Boolean(selectedRequestForBid)}
          request={selectedRequestForBid}
          onClose={() => setSelectedRequestForBid(null)}
          onSubmitBid={handleSubmitBid}
        />

        {/* In-App Realtime Deal Chat Modal */}
        <DealChatModal
          isOpen={Boolean(activeDealRequest && activeDealBid)}
          request={activeDealRequest}
          bid={activeDealBid}
          onClose={() => {
            setActiveDealRequest(null)
            setActiveDealBid(null)
          }}
          onCompleteDeal={() => {
            setNotificationMsg('🎉 Сделка завершена! Открыто окно отзыва.')
            setTimeout(() => setNotificationMsg(null), 4000)
          }}
          onNewMessage={(msg) => {
            // Increment unread count if we are not actively viewing the chat tab
            // For testing: we can just increment it to verify the badge works
            setUnreadChatCount((prev) => prev + 1)
          }}
        />

        <AdminDisputePanel 
          isOpen={isAdminDisputeOpen} 
          onClose={() => setIsAdminDisputeOpen(false)} 
          currentLang={currentLang}
          onOpenDisputeChat={(dealId) => {
            // Mock a request and bid to show the chat
            const mockReq: RequestItem = {
              id: dealId,
              clientId: 'client-1',
              clientName: 'Александр',
              clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
              clientRating: 4.9,
              hub: 'phuket',
              district: 'Chalong',
              categoryL1Id: 'cat-transport',
              categoryL1Name: 'Транспорт',
              title: `Спор по сделке ${dealId}`,
              description: 'Спорный заказ',
              budget: 100,
              currency: 'USD',
              mediaUrls: [],
              isFeatured: false,
              status: 'in_progress',
              createdAt: new Date().toISOString(),
              expiresAt: new Date().toISOString(),
              auctionEndsAt: new Date().toISOString(),
              bidsCount: 1,
            }
            const mockBid: BidItem = {
              id: `bid-${dealId}`,
              requestId: dealId,
              providerId: 'prov-1',
              providerName: 'Phuket Drive',
              providerAvatar: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=100',
              providerRating: 4.8,
              isPro: true,
              isAiAgent: false,
              proposedPrice: 100,
              currency: 'USD',
              comment: 'Готов выполнить',
              status: 'accepted',
              createdAt: new Date().toISOString(),
            }
            setActiveDealRequest(mockReq)
            setActiveDealBid(mockBid)
            // Close admin panel or keep it open in background
            setIsAdminDisputeOpen(false)
          }}
        />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onSuccess={() => {
            setIsAuthOpen(false)
            setNotificationMsg('✅ Авторизация успешна!')
            setTimeout(() => setNotificationMsg(null), 3000)
          }}
          currentLang={currentLang}
        />

        <CreateMarketListingModal
          isOpen={isCreateMarketListingOpen}
          onClose={() => setIsCreateMarketListingOpen(false)}
          currentHub={activeHub as any}
          onCreateListing={handleCreateMarketListing}
          currentLang={currentLang}
        />

        <MarketBuyModal
          isOpen={Boolean(selectedMarketProduct)}
          item={selectedMarketProduct}
          onClose={() => setSelectedMarketProduct(null)}
          onContactSeller={handleContactSeller}
        />

        <NotificationCenterModal
          isOpen={isNotificationsOpen}
          notifications={notifications}
          onClose={() => setIsNotificationsOpen(false)}
          onMarkAllRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
          }}
          onSelectNotification={(item) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
            )
            if (item.actionTab) {
              handleSelectTab(item.actionTab as any)
            }
            setIsNotificationsOpen(false)
          }}
        />

        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
        />

        <CreateActionSheetModal
          isOpen={isCreateActionSheetOpen}
          onClose={() => setIsCreateActionSheetOpen(false)}
          onSelectAction={(action) => {
            if (action === 'request') {
              setIsAIAssistantOpen(true)
            } else if (action === 'template') {
              handleSelectTab('account') // Go to profile templates
            } else if (action === 'market') {
              setNotificationMsg('✅ Вы добавлены в список раннего доступа! Мы пришлем уведомление в бота.')
              setTimeout(() => setNotificationMsg(null), 4000)
            }
          }}
        />

        {/* Bottom Tab Bar */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          mode={mode}
          currentLang={currentLang}
          unreadChatCount={unreadChatCount}
          onCentralAction={() => {
            triggerHapticFeedback('heavy')
            setIsCreateActionSheetOpen(true)
          }}
        />

      </div>
    </div>
  )
}

export default function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}
