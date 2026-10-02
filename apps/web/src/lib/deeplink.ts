import { triggerHapticFeedback, triggerNotificationFeedback } from './telegram'

export const BOT_USERNAME = 'NeedTnow_bot'
export const APP_SHORTNAME = 'app'

export interface DeepLinkParam {
  type: 'request' | 'market' | 'ref'
  id: string
}

/**
 * Generate a Telegram WebApp StartApp direct link
 * Example: https://t.me/NeedTnow_bot/app?startapp=req_req-bike
 */
export function generateShareLink(type: 'request' | 'market' | 'ref', id: string): string {
  const prefix = type === 'request' ? 'req' : type === 'market' ? 'mkt' : 'ref'
  const param = `${prefix}_${id}`
  return `https://t.me/${BOT_USERNAME}/${APP_SHORTNAME}?startapp=${param}`
}

/**
 * Parse Telegram startapp parameter
 * Supports: req_123, mkt_456, ref_777
 */
export function parseDeepLinkParam(paramString?: string | null): DeepLinkParam | null {
  if (!paramString) return null
  
  const cleanParam = paramString.trim()
  if (cleanParam.startsWith('req_')) {
    return { type: 'request', id: cleanParam.replace('req_', '') }
  }
  if (cleanParam.startsWith('mkt_')) {
    return { type: 'market', id: cleanParam.replace('mkt_', '') }
  }
  if (cleanParam.startsWith('ref_')) {
    return { type: 'ref', id: cleanParam.replace('ref_', '') }
  }
  return null
}

/**
 * Trigger Telegram native share dialog or fallback to Web Share / Clipboard
 */
export function shareToTelegram(type: 'request' | 'market', id: string, title: string): { link: string; copied: boolean } {
  triggerHapticFeedback('medium')
  const link = generateShareLink(type, id)
  const text = type === 'request' 
    ? `⚡ Быстрый аукцион на TuttoMinutto: «${title}». Нужен исполнитель!`
    : `🔥 Горящее предложение в Маркете: «${title}». Забронируйте со скидкой!`

  const tgShareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`

  if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp?.openTelegramLink) {
    ;(window as any).Telegram.WebApp.openTelegramLink(tgShareUrl)
    triggerNotificationFeedback('success')
    return { link, copied: false }
  }

  // Fallback to Clipboard
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(`${text}\n${link}`)
    triggerNotificationFeedback('success')
    return { link, copied: true }
  }

  return { link, copied: false }
}
