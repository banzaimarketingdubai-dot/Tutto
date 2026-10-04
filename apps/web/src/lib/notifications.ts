export interface NotificationItem {
  id: string
  type: 'bid' | 'market' | 'reward' | 'urgent'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  actionTab?: string
  actionData?: any
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = []

/**
 * Web Push Notification Helpers (Browser Native Notification API)
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied'
  }
  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch {
    return 'denied'
  }
}

export function sendBrowserPushNotification(title: string, options?: NotificationOptions) {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      })
      notif.onclick = () => {
        window.focus()
      }
    } catch {
      // Ignore push notification errors in sandbox environments
    }
  }
}

/**
 * Web Audio Synthesizer chime sound helper for notification alerts
 */
export function playNotificationChime() {
  try {
    if (typeof window === 'undefined') return
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return

    const ctx = new AudioContextClass()
    const now = ctx.currentTime

    // Synth tone 1 (Futuristic chime)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now) // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15) // A5

    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)

    osc1.start(now)
    osc1.stop(now + 0.35)
  } catch {
    // Audio context fallback
  }
}

export function routeNewOfferNotification(
  user: { telegramId?: number; telegramUsername?: string } | null,
  requestTitle: string,
  offersCount: number,
  offerPreview?: { providerName: string; price: number }
) {
  const hasTelegram = Boolean(user && (user.telegramId || user.telegramUsername))

  if (hasTelegram) {
    // Channel A: Telegram Bot Light Notification (No message body clutter, only title + direct TMA button)
    console.log(`[TG Bot Push] ⚡ Получены новые отклики по вашей заявке «${requestTitle}»! Button: [💬 Смотреть отклики в приложении]`)
  } else {
    // Channel B: Web / PWA Standalone App Push Notification
    sendBrowserPushNotification(`⚡ Новый отклик на заявку!`, {
      body: `«${requestTitle}»: отклик от ${offerPreview?.providerName || 'исполнителя'} за $${offerPreview?.price || ''}`,
    })
  }

  // Play audio chime in active session
  playNotificationChime()
}

