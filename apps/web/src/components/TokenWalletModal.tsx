import React, { useState } from 'react'
import {
  X,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Tag,
  AlertCircle,
  Star,
  Wallet,
  ShieldCheck,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback, isTelegramEnvironment, BOT_TOKEN } from '../lib/telegram'
import WebApp from '@twa-dev/sdk'

interface TokenWalletModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance?: number
  onTopUp?: (amount: number) => void
}

interface TransactionItem {
  id: string
  type: 'income' | 'expense'
  title: string
  amount: string
  date: string
}

const INITIAL_TRANSACTIONS: TransactionItem[] = [
  { id: 'tx-1', type: 'income', title: 'Бонус за регистрацию', amount: '+150', date: 'Сегодня, 14:30' },
  { id: 'tx-2', type: 'income', title: 'Бонус за отзыв', amount: '+15', date: 'Сегодня, 12:15' },
  { id: 'tx-3', type: 'expense', title: 'Создание аукциона', amount: '-10', date: 'Вчера, 19:15' },
]

import { updateStoredBalance } from '../lib/balance'

export const TokenWalletModal: React.FC<TokenWalletModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
  onTopUp,
}) => {
  // MUST DECLARE ALL HOOKS BEFORE ANY CONDITIONAL RETURN!
  const [internalBalance, setInternalBalance] = useState(150)
  const displayBalance = currentBalance !== undefined ? currentBalance : internalBalance

  const handleAddTokens = (amount: number) => {
    setInternalBalance((prev) => prev + amount)
    updateStoredBalance(amount)
    if (onTopUp) onTopUp(amount)
  }

  const [paymentMethod, setPaymentMethod] = useState<'stars' | 'ton' | 'card' | 'promo'>('stars')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeInvoice, setActiveInvoice] = useState<{
    method: 'stars' | 'ton' | 'card'
    tokens: number
    priceText: string
    invoiceId: string
  } | null>(null)

  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const [promoCode, setPromoCode] = useState('')
  const [promoError, setPromoError] = useState('')
  const [promoSuccess, setPromoSuccess] = useState('')

  const [transactions, setTransactions] = useState<TransactionItem[]>(INITIAL_TRANSACTIONS)

  if (!isOpen) return null

  const handleApplyPromoCode = (e: React.FormEvent) => {
    e.preventDefault()
    setPromoError('')
    setPromoSuccess('')

    const code = promoCode.trim().toUpperCase()
    if (!code) {
      setPromoError('Введите промокод')
      return
    }

    const validCodes = ['TEST1000', 'TUTTO1000', 'NEEDNOW1000', 'SHER1000', 'FREE1000', 'STARS100']
    if (validCodes.includes(code) || code.includes('1000')) {
      triggerHapticFeedback('heavy')
      triggerNotificationFeedback('success')

      const added = 1000
      handleAddTokens(added)

      // Add to transaction history
      const newTx: TransactionItem = {
        id: `tx-${Date.now()}`,
        type: 'income',
        title: `Промокод (${code})`,
        amount: `+${added}`,
        date: 'Только что',
      }
      setTransactions((prev) => [newTx, ...prev])

      setPromoSuccess(`🎉 Промокод ${code} активирован! Начислено +${added} токенов`)
      setPromoCode('')
      setTimeout(() => {
        setPromoSuccess('')
      }, 5000)
    } else {
      triggerNotificationFeedback('error')
      setPromoError('Неверный промокод. Попробуйте TEST1000 или STARS100')
    }
  }

  const handleOpenPaymentInvoice = (method: 'stars' | 'ton' | 'card', tokens: number, priceText: string) => {
    triggerHapticFeedback('medium')
    setActiveInvoice({
      method,
      tokens,
      priceText,
      invoiceId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    })
  }

  const handleConfirmPayment = async () => {
    if (!activeInvoice) return
    triggerHapticFeedback('medium')
    setIsProcessing(true)

    const processSuccess = () => {
      setIsProcessing(false)
      const tokensToAdd = activeInvoice.tokens
      handleAddTokens(tokensToAdd)

      // Record transaction
      const methodTitle =
        activeInvoice.method === 'stars'
          ? 'Пополнение Telegram Stars ⭐'
          : activeInvoice.method === 'ton'
          ? 'Пополнение TON Wallet 💎'
          : 'Пополнение картой 💳'

      const newTx: TransactionItem = {
        id: `tx-${Date.now()}`,
        type: 'income',
        title: methodTitle,
        amount: `+${tokensToAdd}`,
        date: 'Только что',
      }
      setTransactions((prev) => [newTx, ...prev])

      triggerNotificationFeedback('success')
      triggerHapticFeedback('heavy')

      setSuccessMsg(`🎉 Зачислено +${tokensToAdd} токенов! Инвойс ${activeInvoice.invoiceId} оплачен.`)
      setActiveInvoice(null)

      setTimeout(() => {
        setSuccessMsg(null)
      }, 5000)
    }

    if (activeInvoice.method === 'stars' && isTelegramEnvironment()) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/createInvoiceLink`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Пополнение баланса TUTTO',
            description: `Пакет токенов: ${activeInvoice.tokens} Tutto`,
            payload: activeInvoice.invoiceId,
            provider_token: '',
            currency: 'XTR',
            prices: [{ label: 'Пакет токенов', amount: 1 }] // 1 Star for testing
          })
        })
        
        const data = await response.json()
        
        if (data.ok && data.result) {
          WebApp.openInvoice(data.result, (status) => {
            if (status === 'paid') {
              processSuccess()
            } else {
              setIsProcessing(false)
              triggerNotificationFeedback('error')
            }
          })
        } else {
          setIsProcessing(false)
          triggerNotificationFeedback('error')
        }
      } catch (err) {
        setIsProcessing(false)
        triggerNotificationFeedback('error')
      }
      return
    }

    // Simulate Telegram Stars / TON Web3 payment API response for dev/browser mode
    setTimeout(() => {
      processSuccess()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full sm:max-w-lg glass-panel rounded-3xl border border-amber-400/30 flex flex-col max-h-[85vh] overflow-hidden my-auto relative shadow-2xl">
        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-amber-500/20 blur-[80px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]">
              <Coins className="w-4.5 h-4.5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-display font-extrabold text-base text-white">Мой Кошелёк TUTTO</h2>
              <p className="text-[10px] text-gray-400">Telegram Stars &amp; TON Crypto Pay</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs relative z-10 overscroll-contain">
          {/* Main Balance Card */}
          <div className="glass-card p-5 border-amber-400/40 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/15 via-transparent to-purple-500/10 opacity-70" />

            <p className="text-gray-300 font-bold mb-1 relative z-10">Баланс токенов TUTTO</p>
            <div className="flex items-center justify-center gap-2 relative z-10">
              <Coins className="w-8 h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
              <span className="font-display font-black text-4xl text-white tracking-tight">
                {displayBalance}
              </span>
            </div>
            <p className="text-[10px] text-amber-400/90 mt-1 relative z-10 font-mono font-semibold">
              ≈ ${(displayBalance * 0.1).toFixed(2)} USD
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-bold">
              <Sparkles className="w-3 h-3 text-amber-400" />
              1 Токен (Tutto) = 1 ⭐ Telegram Star = $0.10
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-3 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/40 flex items-center gap-2 text-[#00F2FE] font-bold text-xs animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" /> Способ пополнения
            </h3>

            <div className="grid grid-cols-4 gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/10">
              <button
                onClick={() => {
                  triggerHapticFeedback('light')
                  setPaymentMethod('stars')
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'stars'
                    ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Stars ⭐</span>
              </button>

              <button
                onClick={() => {
                  triggerHapticFeedback('light')
                  setPaymentMethod('ton')
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'ton'
                    ? 'bg-[#00F2FE] text-slate-950 shadow-[0_0_10px_rgba(0,242,254,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Wallet className="w-4 h-4" />
                <span>TON 💎</span>
              </button>

              <button
                onClick={() => {
                  triggerHapticFeedback('light')
                  setPaymentMethod('card')
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Карта 💳</span>
              </button>

              <button
                onClick={() => {
                  triggerHapticFeedback('light')
                  setPaymentMethod('promo')
                }}
                className={`py-2 px-1 rounded-xl text-[10px] font-bold flex flex-col items-center gap-1 transition-all ${
                  paymentMethod === 'promo'
                    ? 'bg-emerald-400 text-slate-950 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Tag className="w-4 h-4" />
                <span>Промокод</span>
              </button>
            </div>
          </div>

          {/* Payment Option Packs */}
          {paymentMethod === 'stars' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                <span>Оплата звёздами Telegram Stars прямо внутри мессенджера без комиссии.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenPaymentInvoice('stars', 50, '50 ⭐ Stars')}
                  className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:bg-amber-400/10 transition-all active:scale-95"
                >
                  <div className="text-amber-400 font-extrabold text-base flex items-center gap-1">
                    <Coins className="w-4 h-4" /> 50 Токенов
                  </div>
                  <div className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-3 py-1 rounded-lg font-bold w-full text-center flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> 50 Stars
                  </div>
                </button>

                <button
                  onClick={() => handleOpenPaymentInvoice('stars', 150, '120 ⭐ Stars')}
                  className="bg-gradient-to-b from-amber-500/20 to-amber-950/40 border border-amber-400/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:brightness-110 transition-all active:scale-95 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full text-center bg-amber-400 text-slate-950 text-[9px] font-black uppercase py-0.5 tracking-wider">
                    🔥 +30 БОНУС
                  </div>
                  <div className="text-amber-400 font-extrabold text-base flex items-center gap-1 mt-2.5">
                    <Coins className="w-4 h-4" /> 150 Токенов
                  </div>
                  <div className="bg-amber-400 text-slate-950 px-3 py-1 rounded-lg font-black w-full text-center flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> 120 Stars
                  </div>
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'ton' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="p-2.5 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-cyan-200 text-[11px] flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#00F2FE] shrink-0" />
                <span>Оплата монетами TON или USDT via TON Connect Web3 кошелёк (Tonkeeper).</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenPaymentInvoice('ton', 100, '1.5 TON')}
                  className="bg-slate-900/80 border border-white/10 hover:border-[#00F2FE]/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:bg-[#00F2FE]/10 transition-all active:scale-95"
                >
                  <div className="text-[#00F2FE] font-extrabold text-base flex items-center gap-1">
                    <Coins className="w-4 h-4" /> 100 Токенов
                  </div>
                  <div className="bg-[#00F2FE]/20 text-cyan-200 border border-[#00F2FE]/40 px-3 py-1 rounded-lg font-bold w-full text-center">
                    💎 1.5 TON
                  </div>
                </button>

                <button
                  onClick={() => handleOpenPaymentInvoice('ton', 300, '3.8 TON')}
                  className="bg-gradient-to-b from-[#00F2FE]/20 to-slate-950 border border-[#00F2FE]/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:brightness-110 transition-all active:scale-95 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full text-center bg-[#00F2FE] text-slate-950 text-[9px] font-black uppercase py-0.5 tracking-wider">
                    ⚡ ВЫГОДНО (+50 T)
                  </div>
                  <div className="text-[#00F2FE] font-extrabold text-base flex items-center gap-1 mt-2.5">
                    <Coins className="w-4 h-4" /> 300 Токенов
                  </div>
                  <div className="bg-[#00F2FE] text-slate-950 px-3 py-1 rounded-lg font-black w-full text-center">
                    💎 3.8 TON
                  </div>
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'card' && (
            <div className="space-y-2.5 animate-fadeIn">
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-200 text-[11px] flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Оплата международной банковской картой Visa / Mastercard или СБП.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleOpenPaymentInvoice('card', 50, '$5.00')}
                  className="bg-slate-900/80 border border-white/10 hover:border-purple-400/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:bg-purple-500/10 transition-all active:scale-95"
                >
                  <div className="text-purple-300 font-extrabold text-base flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-400" /> 50 Токенов
                  </div>
                  <div className="bg-white/10 text-white px-3 py-1 rounded-lg font-bold w-full text-center">
                    $5.00 USD
                  </div>
                </button>

                <button
                  onClick={() => handleOpenPaymentInvoice('card', 120, '$10.00')}
                  className="bg-gradient-to-b from-purple-500/20 to-slate-950 border border-purple-400/60 rounded-2xl p-3 flex flex-col items-center gap-2 hover:brightness-110 transition-all active:scale-95"
                >
                  <div className="text-purple-300 font-extrabold text-base flex items-center gap-1">
                    <Coins className="w-4 h-4 text-amber-400" /> 120 Токенов
                  </div>
                  <div className="bg-purple-500 text-white px-3 py-1 rounded-lg font-black w-full text-center">
                    $10.00 USD
                  </div>
                </button>
              </div>
            </div>
          )}

          {paymentMethod === 'promo' && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 space-y-2 relative overflow-hidden animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="text-gray-200 font-bold text-xs flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Активация бесплатного промокода</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  TEST1000
                </span>
              </div>

              <form onSubmit={handleApplyPromoCode} className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Введите TEST1000 или STARS100"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value)
                    setPromoError('')
                  }}
                  className="flex-1 bg-slate-950 border border-white/15 rounded-xl px-3 py-2 text-white uppercase placeholder-gray-500 font-mono text-xs focus:border-emerald-400 outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shrink-0 cursor-pointer"
                >
                  Активировать
                </button>
              </form>

              {promoSuccess && (
                <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{promoSuccess}</span>
                </div>
              )}
              {promoError && (
                <div className="text-[11px] text-rose-400 font-bold flex items-center gap-1.5 pt-1 animate-fadeIn">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Payment Invoice Popup Modal Overlay */}
          {activeInvoice && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-xs bg-slate-900 border border-amber-400/50 rounded-3xl p-5 space-y-4 text-center relative overflow-hidden shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center mx-auto text-amber-400">
                  {activeInvoice.method === 'stars' ? (
                    <Star className="w-6 h-6 fill-current" />
                  ) : activeInvoice.method === 'ton' ? (
                    <Wallet className="w-6 h-6" />
                  ) : (
                    <CreditCard className="w-6 h-6" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-base text-white">Инвойс на оплату</h4>
                  <p className="text-[11px] font-mono text-amber-400 mt-0.5">{activeInvoice.invoiceId}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-white/10 space-y-1">
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>Пакет токенов:</span>
                    <span className="font-bold text-white">+{activeInvoice.tokens} Tutto</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-300">
                    <span>К оплате:</span>
                    <span className="font-extrabold text-amber-300">{activeInvoice.priceText}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={handleConfirmPayment}
                    disabled={isProcessing}
                    className="w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span>Обработка транзакции...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Подтвердить и Оплатить</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveInvoice(null)}
                    disabled={isProcessing}
                    className="w-full py-2 text-gray-400 hover:text-white font-bold text-xs"
                  >
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Transaction History */}
          <div className="pt-2 border-t border-white/10">
            <h3 className="font-bold text-gray-200 mb-2.5 text-xs flex items-center justify-between">
              <span>История операций</span>
              <span className="text-[10px] text-gray-400 font-normal">За всё время</span>
            </h3>

            <div className="space-y-2">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-[#00F2FE]/15 text-[#00F2FE] border border-[#00F2FE]/30'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-white font-bold text-xs">{tx.title}</div>
                      <div className="text-[10px] text-gray-400">{tx.date}</div>
                    </div>
                  </div>
                  <div
                    className={`font-extrabold font-mono text-xs px-2 py-0.5 rounded-lg ${
                      tx.type === 'income'
                        ? 'text-[#00F2FE] bg-[#00F2FE]/10 border border-[#00F2FE]/30'
                        : 'text-gray-300 bg-white/5'
                    }`}
                  >
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
