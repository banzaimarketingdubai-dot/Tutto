import { RequestItem } from '../types'
import { createRequest as createSupabaseRequest, fetchRequests as fetchSupabaseRequests, subscribeToHubRequests } from '../services/api'
import { isSupabaseConfigured } from './supabase'

const STORAGE_KEY_USER_REQ = 'tutto_user_requests'
const STORAGE_KEY_SHARED_REQ = 'tutto_global_shared_requests'
const CHANNEL_NAME = 'tutto_requests_channel'

let broadcastChannel: BroadcastChannel | null = null
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME)
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment')
}

/**
 * Retrieves all stored requests across user and global shared stores.
 */
export function getStoredRequests(): RequestItem[] {
  try {
    const userSaved = localStorage.getItem(STORAGE_KEY_USER_REQ)
    const sharedSaved = localStorage.getItem(STORAGE_KEY_SHARED_REQ)

    const userReqs: RequestItem[] = userSaved ? JSON.parse(userSaved) : []
    const sharedReqs: RequestItem[] = sharedSaved ? JSON.parse(sharedSaved) : []

    const map = new Map<string, RequestItem>()
    
    // Merge shared requests first
    if (Array.isArray(sharedReqs)) {
      sharedReqs.forEach((r) => {
        if (r && r.id) map.set(r.id, r)
      })
    }
    // Override/append with user local requests
    if (Array.isArray(userReqs)) {
      userReqs.forEach((r) => {
        if (r && r.id) map.set(r.id, r)
      })
    }

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (e) {
    console.error('Failed to parse stored requests:', e)
    return []
  }
}

/**
 * Saves a request globally across local storage, broadcast channel, and Supabase.
 */
export function saveRequestGlobally(newReq: RequestItem): RequestItem[] {
  try {
    const currentShared = getStoredRequests()
    const updated = [newReq, ...currentShared.filter((r) => r.id !== newReq.id)]

    // 1. Update localStorage for both local user & global shared
    localStorage.setItem(STORAGE_KEY_USER_REQ, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY_SHARED_REQ, JSON.stringify(updated))

    // 2. Dispatch local window event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tutto-requests-updated'))
    }

    // 3. Broadcast to other open tabs/windows
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'REQUEST_CREATED', request: newReq })
    }

    // 4. Save to Supabase DB if configured
    if (isSupabaseConfigured()) {
      createSupabaseRequest({
        client_id: newReq.clientId,
        hub: newReq.hub,
        district: newReq.district,
        title: newReq.title,
        description: newReq.description,
        media_urls: newReq.mediaUrls,
        budget: newReq.budget,
        currency: newReq.currency,
        is_featured: newReq.isFeatured,
        auction_duration_minutes: 120,
        auction_ends_at: newReq.auctionEndsAt,
      }).catch((err) => console.warn('Supabase sync warning:', err))
    }

    return updated
  } catch (e) {
    console.error('Failed to save request globally:', e)
    return getStoredRequests()
  }
}

/**
 * Deletes a request globally.
 */
export function deleteRequestGlobally(requestId: string): RequestItem[] {
  try {
    const currentShared = getStoredRequests()
    const updated = currentShared.filter((r) => r.id !== requestId)

    localStorage.setItem(STORAGE_KEY_USER_REQ, JSON.stringify(updated))
    localStorage.setItem(STORAGE_KEY_SHARED_REQ, JSON.stringify(updated))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tutto-requests-updated'))
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'REQUEST_DELETED', requestId })
    }

    return updated
  } catch (e) {
    console.error('Failed to delete request globally:', e)
    return getStoredRequests()
  }
}

/**
 * Subscribes to real-time request synchronization across tabs, windows, and Supabase.
 */
export function subscribeToRequestsSync(
  activeHub: string,
  onUpdate: (requests: RequestItem[]) => void
): () => void {
  const handleUpdate = () => {
    onUpdate(getStoredRequests())
  }

  // 1. Listen to window events
  if (typeof window !== 'undefined') {
    window.addEventListener('tutto-requests-updated', handleUpdate)
    window.addEventListener('storage', handleUpdate)
  }

  // 2. Listen to BroadcastChannel
  let onBroadcastMessage: ((e: MessageEvent) => void) | null = null
  if (broadcastChannel) {
    onBroadcastMessage = (e: MessageEvent) => {
      if (e.data && (e.data.type === 'REQUEST_CREATED' || e.data.type === 'REQUEST_DELETED')) {
        handleUpdate()
      }
    }
    broadcastChannel.addEventListener('message', onBroadcastMessage)
  }

  // 3. Listen to Supabase Realtime Hub Requests
  let unsubscribeSupabase: (() => void) | null = null
  if (isSupabaseConfigured() && activeHub) {
    unsubscribeSupabase = subscribeToHubRequests(activeHub, (dbReq) => {
      const mapped: RequestItem = {
        id: dbReq.id,
        clientId: dbReq.client_id || 'usr-remote',
        clientName: 'Клиент (Realtime)',
        clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        clientRating: 5.0,
        hub: (dbReq.hub as any) || activeHub,
        district: dbReq.district || 'Центр',
        categoryL1Id: dbReq.category_l1_id || 'cat-services',
        categoryL1Name: 'Услуги',
        title: dbReq.title,
        description: dbReq.description,
        budget: dbReq.budget,
        currency: dbReq.currency || 'USD',
        mediaUrls: dbReq.media_urls || [],
        isFeatured: dbReq.is_featured || false,
        status: dbReq.status || 'open',
        createdAt: dbReq.created_at,
        expiresAt: dbReq.auction_ends_at || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        auctionEndsAt: dbReq.auction_ends_at || new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
        bidsCount: 0,
      }
      saveRequestGlobally(mapped)
    })
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('tutto-requests-updated', handleUpdate)
      window.removeEventListener('storage', handleUpdate)
    }
    if (broadcastChannel && onBroadcastMessage) {
      broadcastChannel.removeEventListener('message', onBroadcastMessage)
    }
    if (unsubscribeSupabase) {
      unsubscribeSupabase()
    }
  }
}
