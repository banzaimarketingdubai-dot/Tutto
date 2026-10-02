export type HubId = 'phuket' | 'bali' | 'bangkok' | 'vietnam' | 'seoul' | 'tokyo'

export interface HubLocation {
  id: HubId
  nameRu: string
  nameEn: string
  flag: string
  districts: string[]
}

export interface Category {
  id: string
  slug: string
  titleRu: string
  titleEn: string
  iconName: string
  description?: string
  defaultCoverUrl?: string
}

export interface ServiceTemplate {
  id: string
  categoryL1Id: string
  title: string
  description: string
  defaultBudget: number | null
  currency: string
  coverImageUrl: string
  isCustomUserTemplate?: boolean
}

export interface RequestItem {
  id: string
  clientId: string
  clientName: string
  clientAvatar?: string
  clientRating: number
  hub: HubId
  district: string
  categoryL1Id: string
  categoryL1Name: string
  title: string
  description: string
  budget: number | null
  currency: string
  mediaUrls: string[]
  isFeatured: boolean
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'expired'
  createdAt: string
  expiresAt: string
  auctionEndsAt: string
  bidsCount: number
  clarificationRequests?: { providerId: string; question: string; createdAt: string }[]
  clarificationComment?: string
}

export interface BidItem {
  id: string
  requestId: string
  providerId: string
  providerName: string
  providerAvatar?: string
  providerRating: number
  isPro: boolean
  isAiAgent: boolean
  proposedPrice: number
  currency: string
  comment: string
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
  createdAt: string
}

export interface UserProfile {
  id: string
  telegramId: number
  username?: string
  firstName: string
  lastName?: string
  photoUrl?: string
  role: 'client' | 'provider' | 'both'
  rating: number
  dealsCount: number
  hubLocation: HubId
  lang: 'ru' | 'en'
  referralCode?: string
}

export interface BusinessCard {
  id: string
  ownerEmail?: string
  companyName: string
  tagline: string
  description: string
  logoUrl?: string
  coverPhotoUrl?: string
  rating: number
  dealsCount: number
  isPro: boolean
  isAiEnabled: boolean
  servicesList: { name: string; price: number; unit?: string }[]
  advantages: string[]
  coverageArea: string
  workingHours: string
  socialLinks: string[]
}

export interface MarketItem {
  id: string
  sellerId?: string
  sellerName?: string
  sellerAvatar?: string
  sellerRating?: number
  title: string
  description: string
  price: number
  oldPrice: number
  district: string
  expiresIn: string
  image: string
  images?: string[]
  isCustomPhoto?: boolean
  condition: 'Б/У' | 'Новое' | 'На запчасти'
  category: string
}

export interface ReviewItem {
  id: string
  dealId: string
  authorName: string
  authorAvatar?: string
  targetName: string
  rating: number
  tags: string[]
  comment: string
  createdAt: string
  rewardCoins: number
}

export interface OfferInstance {
  id: string
  userId: string
  type: 'rent' | 'service' | 'market'
  category: string
  title: string
  description: string
  price: number
  currency: string
  imageUrl?: string // Compressed image or fallback mockup
  createdAt: string
}

