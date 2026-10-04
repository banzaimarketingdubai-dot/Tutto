import React, { useState, useEffect } from 'react'
import { X, Mail, Zap, ShieldCheck, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { triggerHapticFeedback, isTelegramEnvironment, getTelegramUser } from '../lib/telegram'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'
import { useScrollLock } from '../hooks/useScrollLock'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  currentLang?: Language
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, currentLang }) => {
  useScrollLock(isOpen)

  const lang = currentLang || detectDefaultLanguage()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')


  // ✅ TMA Auto-Auth: если мы внутри Telegram Mini App — авторизация уже есть через initData.
  // Вызываем onSuccess немедленно, не показывая никакой формы.
  useEffect(() => {
    if (isOpen && isTelegramEnvironment()) {
      const tgUser = getTelegramUser()
      if (tgUser) {
        onSuccess()
        onClose()
      }
    }
  }, [isOpen])

  if (!isOpen) return null
  if (isTelegramEnvironment()) return null

  // Браузерная авторизация (не ТМА) — Google OAuth + Email Magic Link
  const handleGoogleLogin = async () => {
    try {
      triggerHapticFeedback('light')
      setLoading(true)
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://tutto.vercel.app'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: currentOrigin },
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e?: React.FormEvent | React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault()
    if (!email) return
    try {
      triggerHapticFeedback('medium')
      setLoading(true)
      setError('')
      setMessage('')
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://needtnow.vercel.app'
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: currentOrigin },
      })
      if (error) throw error
      setMessage('Ссылка для входа отправлена на ' + email)
    } catch (err: any) {
      if (err.message === 'Load failed' || err.message === 'Failed to fetch') {
        setError('Сетевая ошибка (Возможно блокировщик рекламы). Попробуйте Google-вход.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm max-h-[90dvh] overflow-y-auto overscroll-contain bg-gradient-to-b from-slate-900 to-[#0A101D] border border-white/10 rounded-[32px] shadow-[0_0_50px_rgba(0,242,254,0.15)] animate-slideUp">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-gradient-to-br from-[#00F2FE] to-[#4FACFE] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
          </div>

          <h2 className="text-2xl font-black text-white mb-2 font-display uppercase tracking-wide">
            {t(lang, 'auth_title')}
          </h2>
          <p className="text-sm text-gray-400 mb-8">
            {t(lang, 'auth_sub')}
          </p>

          {/* Google Login */}
          <div className="space-y-3 mb-8">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3.5 px-4 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Продолжить с Google
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">или по Email</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Email Magic Link */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleEmailLogin(e) }}
                placeholder="Ваш Email адрес"
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-white font-medium focus:outline-none focus:border-[#00F2FE] transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
            {message && <p className="text-[#00F2FE] text-sm font-medium">{message}</p>}

            <button
              onClick={(e) => handleEmailLogin(e)}
              disabled={loading || !email}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#00D4E8] to-[#00F2FE] text-[#03100A] font-black text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-[#03100A]" />
              {loading ? 'Отправка...' : 'Отправить Magic Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
