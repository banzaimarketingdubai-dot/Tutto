import React, { useState, useEffect } from 'react'
import {
  Shield,
  Sparkles,
  Bot,
  Check,
  Star,
  Edit3,
  ChevronRight,
  Store,
  Wallet,
  LayoutTemplate,
  Coins,
  Link2,
  Mail,
  MessageCircle,
  Heart,
  Clock,
  Camera,
  Upload,
  X,
  CheckCircle2,
  LogOut,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { MOCK_BUSINESS_CARDS } from '../data/mockData'
import { getTelegramUser, triggerHapticFeedback, triggerNotificationFeedback, isTelegramEnvironment } from '../lib/telegram'
import { PlatformRulesModal } from './PlatformRulesModal'
import { MyBusinessView } from './MyBusinessView'
import { AIManagerView } from './AIManagerView'
import { FinanceView } from './FinanceView'
import { TokenWalletModal } from './TokenWalletModal'
import { useTokenBalance } from '../lib/balance'
import { supabase } from '../lib/supabase'

interface UserProfileViewProps {
  session?: any
  onOpenAdmin?: () => void
  onOpenAuth?: () => void
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ session, onOpenAdmin, onOpenAuth }) => {
  const telegramUser = getTelegramUser()
  const isTMA = isTelegramEnvironment()
  const supabaseEmail = session?.user?.email

  const bizCard = MOCK_BUSINESS_CARDS.find(c => c.ownerEmail === supabaseEmail) || MOCK_BUSINESS_CARDS[0]

  const [activeSection, setActiveSection] = useState<'hub' | 'business' | 'ai' | 'finance'>('hub')
  const [isRulesOpen, setIsRulesOpen] = useState(false)
  const [isWalletOpen, setIsWalletOpen] = useState(false)
  const [tokenBalance] = useTokenBalance()

  // Real Auth Linkage Detection
  const isTelegramLinked = Boolean(telegramUser?.id || isTMA || localStorage.getItem('tutto_tg_linked') === 'true')
  const activeEmail = supabaseEmail || (localStorage.getItem('tutto_email_linked') === 'true' ? (localStorage.getItem('tutto_user_email') || 'user@gmail.com') : null)
  const isEmailLinked = Boolean(activeEmail)

  // Profile Name & Avatar state with persistence
  const defaultInitialName = telegramUser?.first_name
    ? `${telegramUser.first_name}${telegramUser.last_name ? ' ' + telegramUser.last_name : ''}`
    : supabaseEmail
    ? (session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || supabaseEmail.split('@')[0])
    : bizCard.companyName || 'Александр Иванов'

  const defaultInitialAvatar =
    telegramUser?.photo_url ||
    (session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture) ||
    bizCard.logoUrl ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'

  const [profileName, setProfileName] = useState<string>(
    () => localStorage.getItem('tutto_profile_name') || defaultInitialName
  )
  const [profileAvatar, setProfileAvatar] = useState<string>(
    () => localStorage.getItem('tutto_profile_avatar') || defaultInitialAvatar
  )

  // Sync profile name/avatar when session updates (e.g. after Google OAuth redirect)
  useEffect(() => {
    if (session?.user) {
      const googleName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name
      const googleAvatar = session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture
      if (googleName && !localStorage.getItem('tutto_profile_name')) {
        setProfileName(googleName)
      }
      if (googleAvatar && !localStorage.getItem('tutto_profile_avatar')) {
        setProfileAvatar(googleAvatar)
      }
    }
  }, [session])

  // Profile Edit Modal State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [tempName, setTempName] = useState(profileName)
  const [tempAvatar, setTempAvatar] = useState(profileAvatar)

  const handleOpenEditModal = () => {
    setTempName(profileName)
    setTempAvatar(profileAvatar)
    setIsEditingProfile(true)
    triggerHapticFeedback('light')
  }

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setTempAvatar(reader.result)
          triggerHapticFeedback('light')
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = tempName.trim() || profileName
    setProfileName(trimmed)
    setProfileAvatar(tempAvatar)
    localStorage.setItem('tutto_profile_name', trimmed)
    localStorage.setItem('tutto_profile_avatar', tempAvatar)
    setIsEditingProfile(false)
    triggerNotificationFeedback('success')
    triggerHapticFeedback('heavy')
  }

  const handleSignOutEmail = async () => {
    triggerHapticFeedback('medium')
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('tutto_email_linked')
      localStorage.removeItem('tutto_user_email')
      triggerNotificationFeedback('success')
    } catch (err) {
      console.error('Error signing out', err)
    }
  }

  const handleConnectTelegram = () => {
    triggerHapticFeedback('light')
    // Open Telegram Bot for authentication
    window.open('https://t.me/tuttominutto_bot?start=auth', '_blank')
    // Set optimistic fallback state
    localStorage.setItem('tutto_tg_linked', 'true')
  }

  if (activeSection === 'business') {
    return <MyBusinessView onBack={() => setActiveSection('hub')} bizCard={bizCard} />
  }

  if (activeSection === 'ai') {
    return <AIManagerView onBack={() => setActiveSection('hub')} />
  }

  if (activeSection === 'finance') {
    return <FinanceView onBack={() => setActiveSection('hub')} />
  }

  // Calculate Verification Level
  const verifiedCount = (isTelegramLinked ? 1 : 0) + (isEmailLinked ? 1 : 0)
  const trustPercentage = verifiedCount * 50

  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs relative">
      
      {/* Profile Header (Main Hub Info) */}
      <div className="glass-card p-4 border-white/10 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start gap-4">
          <div className="relative group shrink-0">
            <img
              src={profileAvatar}
              alt="Profile"
              className="w-16 h-16 rounded-2xl border-2 border-cyan-400/50 object-cover shadow-[0_0_15px_rgba(0,242,254,0.3)]"
            />
            <button
              onClick={handleOpenEditModal}
              title="Изменить фото"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-extrabold text-lg text-white truncate">
                {profileName}
              </h3>
              <button
                onClick={handleOpenEditModal}
                className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
              >
                <Edit3 className="w-3 h-3" />
                <span>Изм.</span>
              </button>
            </div>
            
            <div className="text-[11px] text-gray-300 flex items-center gap-1.5 mt-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold text-amber-400">{bizCard.rating || '5.0'}</span>
              <span>Рейтинг доверия</span>
            </div>
            <div className="mt-1 flex gap-1">
              <span className="badge-pro text-[9px] px-1.5 py-0.5 rounded font-extrabold">PRO ACCOUNT</span>
            </div>
          </div>
        </div>
        
        {/* Real Account Bindings / Verification Cards */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            <span>Статус авторизации и верификации</span>
            <span className="text-cyan-400 font-mono font-bold">{trustPercentage}%</span>
          </div>

          {/* Account 1: Telegram */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-cyan-400/40 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isTelegramLinked ? 'bg-[#0088cc]/20 text-[#0088cc] border border-[#0088cc]/40' : 'bg-white/5 text-gray-500'}`}>
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">Telegram Аккаунт</span>
                  {isTelegramLinked ? (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-black border border-emerald-500/40">🟢 ПРИВЯЗАН</span>
                  ) : (
                    <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.2 rounded font-bold">НЕ ПРИВЯЗАН</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {telegramUser?.username
                    ? `@${telegramUser.username}`
                    : telegramUser?.first_name
                    ? `${telegramUser.first_name} ${telegramUser.last_name || ''}`
                    : isTMA
                    ? 'Telegram WebApp Authed'
                    : 'Не привязан к профилю'}
                </p>
              </div>
            </div>

            {isTelegramLinked ? (
              <a
                href="https://t.me/tuttominutto_bot"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 font-bold text-[10px] flex items-center gap-1 border border-white/10 transition-colors"
              >
                <span>Бот ТГ</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <button
                onClick={handleConnectTelegram}
                className="px-3 py-1.5 rounded-xl bg-[#0088cc] text-white font-bold text-[10px] hover:brightness-110 shadow-[0_0_10px_rgba(0,136,204,0.4)] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Привязать</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Account 2: Google / Gmail */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/80 border border-white/10 hover:border-purple-400/40 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isEmailLinked ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'bg-white/5 text-gray-500'}`}>
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white">Google / Gmail</span>
                  {isEmailLinked ? (
                    <span className="text-[9px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-black border border-purple-500/40">🟢 ПРИВЯЗАН</span>
                  ) : (
                    <span className="text-[9px] bg-white/10 text-gray-400 px-1.5 py-0.2 rounded font-bold">НЕ ПРИВЯЗАН</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {activeEmail || 'Войдите через Google для сохранения профиля'}
                </p>
              </div>
            </div>

            {isEmailLinked ? (
              <button
                onClick={handleSignOutEmail}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Выйти из Google аккаунта"
              >
                <LogOut className="w-3 h-3" />
                <span>Выйти</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHapticFeedback('medium')
                  if (onOpenAuth) onOpenAuth()
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-[10px] hover:brightness-110 shadow-[0_0_10px_rgba(168,85,247,0.4)] transition-all flex items-center gap-1 cursor-pointer"
              >
                <span>Войти / Google</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Dynamic Trust Badge */}
          {verifiedCount === 2 ? (
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 bg-emerald-400/10 p-2.5 rounded-xl border border-emerald-400/20 font-bold">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Все аккаунты верифицированы (Максимальный траст 100%) ✓</span>
            </div>
          ) : verifiedCount === 1 ? (
            <div className="flex items-center gap-2 text-[10px] text-cyan-400 bg-cyan-400/10 p-2.5 rounded-xl border border-cyan-400/20 font-bold">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Частичная верификация (Траст 50%). Нажмите "Войти / Google" выше для 100% защиты.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[10px] text-amber-400 bg-amber-400/10 p-2.5 rounded-xl border border-amber-400/20 font-bold">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Аккаунты не верифицированы. Авторизуйтесь в Telegram или Google выше.</span>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Widget */}
      <button 
        onClick={() => {
          triggerHapticFeedback('light')
          setIsWalletOpen(true)
        }}
        className="w-full glass-card p-4 border-amber-400/30 hover:bg-white/5 transition-colors cursor-pointer relative overflow-hidden group text-left"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent group-hover:from-amber-500/10 transition-colors" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Мой Кошелёк</h4>
              <p className="text-[10px] text-amber-300/70 font-medium mt-0.5">Баланс: {tokenBalance} TUTTO Coins</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
        </div>
      </button>

      {/* Section: Я Заказчик */}
      <div>
        <h3 className="text-[10px] uppercase font-black tracking-wider text-gray-500 mb-2 pl-2">Я — Заказчик</h3>
        <div className="space-y-2">
          <button
            onClick={() => triggerHapticFeedback('light')}
            className="w-full glass-card p-3 flex items-center justify-between border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-xs">Мои Заказы</h4>
                <p className="text-[9px] text-gray-400">История запросов и покупок</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={() => triggerHapticFeedback('light')}
            className="w-full glass-card p-3 flex items-center justify-between border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Heart className="w-4 h-4 text-pink-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-xs">Избранное</h4>
                <p className="text-[9px] text-gray-400">Сохраненные лоты и услуги</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Section: Я Исполнитель / Бизнес */}
      <div>
        <h3 className="text-[10px] uppercase font-black tracking-wider text-gray-500 mb-2 pl-2">Я — Бизнес</h3>
        <div className="space-y-2">
          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('business')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-cyan-400/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                <Store className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Моя Витрина</h4>
                <p className="text-[10px] text-gray-400">Управление карточками товаров</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('ai')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-purple-500/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Менеджер ИИ</h4>
                <p className="text-[10px] text-gray-400">Автопилот и база знаний</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>

          <button
            onClick={() => {
              triggerHapticFeedback('light')
              setActiveSection('finance')
            }}
            className="w-full glass-card p-4 flex items-center justify-between border-emerald-400/20 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center border border-emerald-500/30">
                <Wallet className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-white text-sm">Финансы и Статистика</h4>
                <p className="text-[10px] text-gray-400">Доходы, выплаты, график продаж</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Dev / Admin Button */}
      <button
        data-testid="admin-panel-btn"
        onClick={() => {
          if (onOpenAdmin) onOpenAdmin()
        }}
        className="w-full py-4 mt-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-red-500/20 transition-all cursor-pointer"
      >
        <Shield className="w-5 h-5" /> ПАНЕЛЬ АДМИНИСТРАТОРА (DEV)
      </button>

      {/* Platform Rules Link */}
      <div className="pt-2 text-center pb-8">
        <button
          type="button"
          onClick={() => setIsRulesOpen(true)}
          className="text-[11px] text-gray-500 hover:text-cyan-400 underline transition-colors"
        >
          Правила ведения бизнеса (PRO)
        </button>
      </div>

      <PlatformRulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
        type="business" 
      />
      
      <TokenWalletModal 
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
      />

      {/* Profile Edit Modal Overlay */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <form
            onSubmit={handleSaveProfile}
            className="w-full max-w-sm glass-panel rounded-3xl border border-cyan-400/40 p-5 space-y-5 text-white relative shadow-2xl"
          >
            <div className="flex justify-between items-center pb-2 border-b border-white/10">
              <h3 className="font-display font-extrabold text-base flex items-center gap-2 text-white">
                <Edit3 className="w-4 h-4 text-cyan-400" />
                <span>Редактирование профиля</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Custom Photo Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative group">
                <img
                  src={tempAvatar}
                  alt="Avatar Preview"
                  className="w-24 h-24 rounded-3xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.4)]"
                />
                <label
                  htmlFor="photo-upload-input"
                  className="absolute inset-0 bg-black/50 rounded-3xl opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity cursor-pointer text-xs font-bold gap-1 text-cyan-300"
                >
                  <Camera className="w-6 h-6" />
                  <span>Изменить</span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="photo-upload-input"
                  className="px-3 py-1.5 rounded-xl bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 font-bold text-xs hover:bg-cyan-400/30 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить кастомное фото</span>
                </label>
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Имя и Фамилия:</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Введите имя..."
                className="w-full bg-slate-950 border border-white/20 rounded-xl px-3 py-2.5 text-white font-bold text-sm outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-3 bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,242,254,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Сохранить</span>
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-3 bg-white/10 hover:bg-white/15 text-gray-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
