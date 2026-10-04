import { getTelegramUser, TelegramUser } from './telegram'

export interface UnifiedProfile {
  telegramId: string | null
  telegramUsername: string | null
  telegramName: string | null
  telegramPhoto: string | null
  email: string | null
  profileName: string
  profileAvatar: string
  isTelegramLinked: boolean
  isEmailLinked: boolean
}

const STORAGE_KEY_UNIFIED = 'tutto_unified_profile'
const STORAGE_KEY_TG_LINKED = 'tutto_tg_linked'
const STORAGE_KEY_EMAIL_LINKED = 'tutto_email_linked'

/**
 * Retrieves the unified profile, synchronizing active Telegram user (TMA/local) and active Email (Supabase session/local).
 */
export function getUnifiedProfile(supabaseSession?: any): UnifiedProfile {
  const tgUser: TelegramUser | null = getTelegramUser()
  const savedEmail = localStorage.getItem('tutto_user_email') || supabaseSession?.user?.email || null
  const savedTgId = localStorage.getItem('tutto_tg_id') || (tgUser?.id ? String(tgUser.id) : null)
  const savedTgUsername = localStorage.getItem('tutto_tg_username') || tgUser?.username || null
  const savedTgName = localStorage.getItem('tutto_tg_name') || (tgUser?.first_name ? `${tgUser.first_name}${tgUser.last_name ? ' ' + tgUser.last_name : ''}` : null)

  // Look up indexed registry for saved cross-links
  let linkedEmailForTg: string | null = null
  if (savedTgId) {
    linkedEmailForTg = localStorage.getItem(`tutto_link_tg_${savedTgId}`)
  }
  if (!linkedEmailForTg && savedTgUsername) {
    linkedEmailForTg = localStorage.getItem(`tutto_link_tg_user_${savedTgUsername}`)
  }

  let linkedTgForEmail: { id: string; username: string; name: string } | null = null
  if (savedEmail) {
    const rawTgData = localStorage.getItem(`tutto_link_email_${savedEmail}`)
    if (rawTgData) {
      try {
        linkedTgForEmail = JSON.parse(rawTgData)
      } catch (e) {
        // ignore parse error
      }
    }
  }

  const effectiveEmail = savedEmail || linkedEmailForTg || (localStorage.getItem(STORAGE_KEY_EMAIL_LINKED) === 'true' ? 'user@gmail.com' : null)
  const effectiveTgId = savedTgId || linkedTgForEmail?.id || null
  const effectiveTgUsername = savedTgUsername || linkedTgForEmail?.username || null
  const effectiveTgName = savedTgName || linkedTgForEmail?.name || null

  const isTelegramLinked = Boolean(effectiveTgId || effectiveTgUsername || localStorage.getItem(STORAGE_KEY_TG_LINKED) === 'true')
  const isEmailLinked = Boolean(effectiveEmail)

  // Name resolution hierarchy
  const googleName = supabaseSession?.user?.user_metadata?.full_name || supabaseSession?.user?.user_metadata?.name
  const savedProfileName = localStorage.getItem('tutto_profile_name')

  const defaultName =
    savedProfileName ||
    googleName ||
    effectiveTgName ||
    (effectiveTgUsername ? `@${effectiveTgUsername}` : null) ||
    (effectiveEmail ? effectiveEmail.split('@')[0] : 'Пользователь')

  // Avatar resolution hierarchy: Custom Upload > Google OAuth > Telegram > Fallback
  const customAvatar = localStorage.getItem('tutto_profile_custom_avatar') || localStorage.getItem('tutto_profile_avatar')
  const googleAvatar = supabaseSession?.user?.user_metadata?.avatar_url || supabaseSession?.user?.user_metadata?.picture
  const tgPhoto = tgUser?.photo_url || localStorage.getItem('tutto_tg_photo')

  const defaultAvatar =
    customAvatar ||
    googleAvatar ||
    tgPhoto ||
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'

  return {
    telegramId: effectiveTgId,
    telegramUsername: effectiveTgUsername,
    telegramName: effectiveTgName,
    telegramPhoto: tgPhoto || null,
    email: effectiveEmail,
    profileName: defaultName,
    profileAvatar: defaultAvatar,
    isTelegramLinked,
    isEmailLinked,
  }
}

/**
 * Links Telegram and Email accounts in local unified registry so that logging in via Email
 * on Web automatically restores the linked Telegram account, and vice versa.
 */
export function linkAccounts(params: {
  email?: string | null
  tgId?: string | number | null
  tgUsername?: string | null
  tgName?: string | null
}): UnifiedProfile {
  const { email, tgId, tgUsername, tgName } = params

  if (email) {
    localStorage.setItem('tutto_user_email', email)
    localStorage.setItem(STORAGE_KEY_EMAIL_LINKED, 'true')
  }

  if (tgId || tgUsername) {
    localStorage.setItem(STORAGE_KEY_TG_LINKED, 'true')
    if (tgId) localStorage.setItem('tutto_tg_id', String(tgId))
    if (tgUsername) localStorage.setItem('tutto_tg_username', tgUsername)
    if (tgName) localStorage.setItem('tutto_tg_name', tgName)
  }

  // Cross-index in local registry for persistence across logins
  if (email && (tgId || tgUsername)) {
    const tgInfo = {
      id: tgId ? String(tgId) : '',
      username: tgUsername || '',
      name: tgName || '',
    }
    localStorage.setItem(`tutto_link_email_${email}`, JSON.stringify(tgInfo))
    if (tgId) {
      localStorage.setItem(`tutto_link_tg_${tgId}`, email)
    }
    if (tgUsername) {
      localStorage.setItem(`tutto_link_tg_user_${tgUsername}`, email)
    }
  }

  window.dispatchEvent(new Event('tutto-profile-updated'))
  return getUnifiedProfile()
}

/**
 * Unlinks email from account
 */
export function unlinkEmail(): void {
  localStorage.removeItem('tutto_user_email')
  localStorage.removeItem(STORAGE_KEY_EMAIL_LINKED)
  window.dispatchEvent(new Event('tutto-profile-updated'))
}

/**
 * Unlinks Telegram from account
 */
export function unlinkTelegram(): void {
  localStorage.removeItem('tutto_tg_id')
  localStorage.removeItem('tutto_tg_username')
  localStorage.removeItem('tutto_tg_name')
  localStorage.removeItem('tutto_tg_photo')
  localStorage.removeItem(STORAGE_KEY_TG_LINKED)
  window.dispatchEvent(new Event('tutto-profile-updated'))
}
