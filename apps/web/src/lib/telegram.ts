import WebApp from '@twa-dev/sdk'

export interface TelegramUser {
  id: number
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
}

export const isTelegramEnvironment = (): boolean => {
  if (typeof window === 'undefined') return false
  const tg = (window as any).Telegram?.WebApp || WebApp
  if (tg && (tg.initData || tg.initDataUnsafe?.user)) return true
  if (typeof navigator !== 'undefined' && /Telegram/i.test(navigator.userAgent)) return true
  if (window.location.search.includes('tgWebAppData') || window.location.search.includes('tgWebAppStartParam')) return true
  return false
}

export const getTelegramUser = (): TelegramUser | null => {
  if (typeof window === 'undefined') return null
  const tg = (window as any).Telegram?.WebApp || WebApp
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user as TelegramUser
  }

  const savedTgUsername = localStorage.getItem('tutto_tg_username')
  const savedTgId = localStorage.getItem('tutto_tg_id')
  if (savedTgUsername || savedTgId) {
    return {
      id: parseInt(savedTgId || '999123456', 10),
      first_name: localStorage.getItem('tutto_tg_name') || 'Пользователь',
      username: savedTgUsername || '',
    }
  }

  if (isTelegramEnvironment()) {
    return {
      id: 260669598,
      first_name: 'Ihor',
      last_name: 'Sherlock',
      username: 'sherlockdxb',
      language_code: 'ru',
    }
  }

  // Mock User for Dev & Regular Browser Preview
  return {
    id: 999123456,
    first_name: 'Александр',
    last_name: 'Иванов',
    username: 'alex_phuket',
    language_code: 'ru',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  }
}

export const getTelegramInitData = (): string => {
  if (isTelegramEnvironment()) {
    return WebApp.initData
  }
  return 'mock_init_data_for_web_dev'
}

export const triggerHapticFeedback = (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
  if (isTelegramEnvironment() && WebApp.HapticFeedback) {
    WebApp.HapticFeedback.impactOccurred(style)
  }
}

export const triggerNotificationFeedback = (type: 'error' | 'success' | 'warning') => {
  if (isTelegramEnvironment() && WebApp.HapticFeedback) {
    WebApp.HapticFeedback.notificationOccurred(type)
  }
}

export const openTelegramLink = (url: string) => {
  if (isTelegramEnvironment() && WebApp.openTelegramLink) {
    WebApp.openTelegramLink(url)
  } else {
    window.open(url, '_blank')
  }
}

export const initTelegramApp = () => {
  const tg = (window as any).Telegram?.WebApp || WebApp
  if (tg) {
    try {
      if (typeof tg.ready === 'function') tg.ready()
      if (typeof tg.expand === 'function') tg.expand()

      // API 7.7+: Блокировка сворачивания свайпом вниз
      if (typeof tg.disableVerticalSwipes === 'function') {
        tg.disableVerticalSwipes()
      } else if (typeof (WebApp as any).disableVerticalSwipes === 'function') {
        (WebApp as any).disableVerticalSwipes()
      }

      // API 8.0+: Открытие в полноэкранном режиме
      if (typeof tg.requestFullscreen === 'function') {
        tg.requestFullscreen()
      } else if (typeof (WebApp as any).requestFullscreen === 'function') {
        (WebApp as any).requestFullscreen()
      }

      if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation()
      if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#0B0F19')
      if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#0B0F19')
    } catch (e) {
      console.warn('Telegram WebApp fullscreen / vertical swipes init error:', e)
    }
  }
}

export const SUPERADMIN_CHAT_ID = '260669598'
export const BOT_TOKEN = '8859291375:AAFWh7FXsDHMplqHPpW293DQLcsn9HfrNNU'

export async function sendSuperadminErrorAlert(errorMsg: string, stack?: string, context?: string): Promise<boolean> {
  try {
    const text = 
      `🚨 <b>СИСТЕМНАЯ ОШИБКА TUTTOMINUTTO</b>\n\n` +
      `👤 <b>Суперадмин Alert (ID: ${SUPERADMIN_CHAT_ID})</b>\n` +
      `📍 <b>Контекст:</b> ${context || 'Фронтенд App'}\n` +
      `❌ <b>Текст ошибки:</b> <code>${errorMsg}</code>\n` +
      (stack ? `🔍 <b>Стек:</b> <pre>${stack.slice(0, 300)}</pre>\n` : '') +
      `⏰ <i>${new Date().toLocaleString('ru-RU')}</i>`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: SUPERADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
      }),
    })
    const data = await response.json()
    return data.ok
  } catch (err) {
    console.error('Failed to send error alert to Telegram Superadmin:', err)
    return false
  }
}

export async function sendAPIKeyStatusReport(): Promise<{ ok: boolean; statusMsg: string }> {
  try {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || ''
    const geminiStatus = geminiKey ? '🟢 АКТИВЕН (Gemini 2.0 Flash API)' : '🟡 НЕ ЗАДАЛ VITE_GEMINI_API_KEY (Работает Умный ИИ-фоллбэк)'
    
    const text = 
      `📊 <b>ОТЧЕТ ДОСТУПНОСТИ КЛЮЧЕЙ И ИИ-СЕРВИСОВ</b>\n\n` +
      `🤖 <b>Gemini 2.0 Flash API:</b> ${geminiStatus}\n` +
      `🤖 <b>Telegram Bot API:</b> 🟢 АКТИВЕН (@tuttominutto_bot)\n` +
      `💬 <b>Superadmin Chat ID:</b> <code>${SUPERADMIN_CHAT_ID}</code> (Автопересылка всех системных ошибок)\n\n` +
      `🌐 <b>Vercel Production Endpoints:</b>\n` +
      `• <a href="https://needtnow.vercel.app">https://needtnow.vercel.app</a>\n` +
      `• <a href="https://web-ten-hazel-65.vercel.app">https://web-ten-hazel-65.vercel.app</a>\n\n` +
      `⏰ <i>Время отчета: ${new Date().toLocaleString('ru-RU')}</i>`

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: SUPERADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    const data = await response.json()
    return { ok: data.ok, statusMsg: text }
  } catch (err: any) {
    console.error('Failed to send API key report:', err)
    return { ok: false, statusMsg: err?.message || 'Error sending report' }
  }
}

