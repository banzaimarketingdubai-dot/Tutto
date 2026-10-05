import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getStoredRequests, saveRequestGlobally, deleteRequestGlobally } from '../lib/requestsSync'
import { RequestItem } from '../types'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Scale,
  BarChart3,
  Settings,
  Search,
  ShieldBan,
  CheckCircle2,
  Menu,
  X,
  TrendingUp,
  Activity,
  DollarSign,
  AlertCircle,
  MoreVertical,
  LogOut,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  FileText,
  Download,
  Play,
  Star,
  Send,
  Plus,
  Trash2,
  Eye,
  Flame,
  Coins,
  MessageSquare,
  Clock,
  ExternalLink,
  Lock,
  Unlock,
  Sliders,
  Globe,
  Bot,
  Zap,
  AlertTriangle,
  UserCheck,
  ShieldAlert,
  Filter,
  Check,
  Share2
} from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface SuperAdminPanelViewProps {
  onClose: () => void
}

type AdminTab = 'dashboard' | 'moderation' | 'transactions' | 'payouts' | 'disputes' | 'verification' | 'users' | 'reviews' | 'ai-log' | 'broadcasts' | 'analytics' | 'settings'

type AdminRole = 'SuperAdmin' | 'Moderator' | 'Finance' | 'Support'

interface UserItem {
  id: string
  name: string
  role: 'client' | 'business' | 'provider' | 'admin'
  status: 'active' | 'blocked' | 'pending'
  joined: string
  balance: number
  email?: string
  telegram?: string
}

// Mock Data Sets
const MOCK_METRICS = {
  gmv: '$124,500',
  gmvGrowth: '+14%',
  activeUsers: '8,234',
  usersGrowth: '+5%',
  openDisputes: 12,
  successRate: '98.2%'
}

const INITIAL_USERS: UserItem[] = [
  { id: 'usr-1', name: 'Александр', role: 'client', status: 'active', joined: '2023-10-01', balance: 150, email: 'alex@example.com', telegram: '@alex_phuket' },
  { id: 'usr-2', name: 'Ayana Luxury Resort', role: 'business', status: 'active', joined: '2023-11-15', balance: 3400, email: 'info@ayana.com', telegram: '@ayana_resort' },
  { id: 'usr-3', name: 'Иван К.', role: 'provider', status: 'blocked', joined: '2024-01-20', balance: 0, email: 'ivan@mail.com', telegram: '@ivan_service' },
  { id: 'usr-4', name: 'Phuket Drive', role: 'business', status: 'active', joined: '2024-02-10', balance: 1250, email: 'drive@phuket.io', telegram: '@phuket_drive' },
  { id: 'usr-5', name: 'Мария Светлова', role: 'client', status: 'active', joined: '2024-03-05', balance: 420, email: 'maria@gmail.com', telegram: '@maria_s' },
]

const MOCK_TRANSACTIONS = [
  { id: 'tx-101', type: 'deposit', user: 'Александр', amount: '+500', method: 'Stars ⭐', date: '2026-10-02 14:30', status: 'completed' },
  { id: 'tx-102', type: 'withdrawal', user: 'Ayana Luxury Resort', amount: '-1200', method: 'TON 💎', date: '2026-10-02 12:15', status: 'pending' },
  { id: 'tx-103', type: 'payment', user: 'Иван К.', amount: '-150', method: 'Card 💳', date: '2026-10-01 19:15', status: 'refunded' },
  { id: 'tx-104', type: 'fee', user: 'Phuket Drive', amount: '-25', method: 'System', date: '2026-10-01 15:00', status: 'completed' },
]

const MOCK_PAYOUTS = [
  { id: 'po-101', user: 'Ayana Luxury Resort', amount: '$1,200', wallet: 'EQB...3x9 (TON)', date: 'Сегодня, 14:10', status: 'pending', method: 'TON 💎' },
  { id: 'po-102', user: 'Phuket Drive', amount: '$450', wallet: 'TH8...k29 (USDT TRX)', date: 'Вчера, 19:30', status: 'completed', method: 'USDT 💵' },
  { id: 'po-103', user: 'Иван К.', amount: '$150', wallet: 'Card 4276 **** 8821', date: '01 Окт, 11:00', status: 'rejected', method: 'Card 💳' },
]

const MOCK_DISPUTES = [
  { id: 'dsp-101', dealId: 'req-bike', client: 'Александр', provider: 'Phuket Drive', amount: '$77', reason: 'Байк оказался в плохом состоянии, отличался от описания. Требую возврат 50% стоимости.', status: 'open', priority: 'high', date: '02 Окт 18:30' },
  { id: 'dsp-102', dealId: 'req-villa', client: 'John D.', provider: 'Ayana Resort', amount: '$250', reason: 'Фото не соответствуют реальности, не работал кондиционер.', status: 'reviewing', priority: 'medium', date: '01 Окт 12:15' },
]

const MOCK_VERIFICATIONS = [
  { id: 'ver-01', provider: 'Phuket Drive', category: 'Транспорт', hub: 'Пхукет', stats: '⭐ 4.9 · 128 сделок', date: '24 сент', status: 'pending', company: 'ИП Сидоров О.А.', insta: 'instagram.com/phuket_drive' },
  { id: 'ver-02', provider: 'Rawai Spa', category: 'Красота', hub: 'Пхукет', stats: '⭐ 5.0 · 47 сделок', date: '23 сент', status: 'pending', company: 'Rawai Lotus Co', insta: 'instagram.com/rawai_spa' }
]

const MOCK_REVIEWS = [
  { id: 'rev-1', author: 'Мария С.', business: 'Phuket Drive', rating: 5, text: 'Отличный сервис! Аренда Honda PCX прошла без залога, скутер в идеальном состоянии.', date: '02 Окт', status: 'approved', flagged: false },
  { id: 'rev-2', author: 'Дмитрий В.', business: 'Rawai Spa', rating: 1, text: 'Спа-салон был закрыт в назначенное время, деньги не вернули.', date: '01 Окт', status: 'pending', flagged: true },
  { id: 'rev-3', author: 'Alex M.', business: 'Bali Tours', rating: 5, text: 'Супер гид, показал скрытые водопады! Очень рекомендую.', date: '30 Сент', status: 'approved', flagged: false },
]

const MOCK_AI_LOGS = [
  { id: 'log-801', time: '18:22:04', event: 'Intent Match', user: '@alex_phuket', detail: 'Найдено 3 подходящих исполнителя по запросу "Аренда Виллы в Раваи"', status: 'success', latency: '142ms' },
  { id: 'log-802', time: '18:20:15', event: 'Token Deduct', user: 'Phuket Drive', detail: 'Списано 10 TUTTO за автоматический отклик AI бота', status: 'success', latency: '45ms' },
  { id: 'log-803', time: '18:15:50', event: 'Channel Scan', user: 'System Worker', detail: 'Просканировано 45 Telegram каналов, 12 новых заявок', status: 'info', latency: '310ms' },
  { id: 'log-804', time: '18:10:02', event: 'Fallback AI', user: 'Client #4491', detail: 'Gemini API rate limit -> Использован локальный алгоритм поиска', status: 'warning', latency: '520ms' },
]

const INITIAL_TEAM = [
  { id: 'adm-1', name: 'Alex I. (Вы)', role: 'SuperAdmin' as AdminRole, access: 'Полный доступ (Владелец)' },
  { id: 'adm-2', name: 'Maria K.', role: 'Moderator' as AdminRole, access: 'Отзывы, Арбитраж, Верификация' },
  { id: 'adm-3', name: 'John S.', role: 'Finance' as AdminRole, access: 'Выплаты, Транзакции, Аналитика' }
]

export const SuperAdminPanelView: React.FC<SuperAdminPanelViewProps> = ({ onClose }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Data States
  const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS)
  const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS)
  const [payouts, setPayouts] = useState(MOCK_PAYOUTS)
  const [disputes, setDisputes] = useState(MOCK_DISPUTES)
  const [reviews, setReviews] = useState(MOCK_REVIEWS)
  const [aiLogs, setAiLogs] = useState(MOCK_AI_LOGS)
  const [team, setTeam] = useState(INITIAL_TEAM)
  const [isLoading, setIsLoading] = useState(false)

  // Settings State
  const [platformFee, setPlatformFee] = useState(10)
  const [auctionFee, setAuctionFee] = useState(10)
  const [minWithdrawal, setMinWithdrawal] = useState(50)
  const [gateways, setGateways] = useState({ stars: true, ton: true, card: true, promo: true })
  const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastBody, setBroadcastBody] = useState('')
  const [broadcastTarget, setBroadcastTarget] = useState('all')
  const [broadcastSentCount, setBroadcastSentCount] = useState<number | null>(null)

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [balanceAdjust, setBalanceAdjust] = useState<number>(0)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('Moderator')

  // Supabase Data Fetching
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const { data: txData, error: txError } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50)
        if (!txError && txData && txData.length > 0) {
          const mappedTxs = txData.map((tx: any) => ({
            id: tx.id,
            type: tx.type,
            user: tx.user_name || 'Неизвестно',
            amount: (tx.amount > 0 ? '+' : '') + tx.amount.toString(),
            method: tx.payment_method || 'System',
            date: new Date(tx.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' }),
            status: tx.status
          }))
          setTransactions(mappedTxs)
        }

        const { data: dspData, error: dspError } = await supabase.from('disputes').select('*').order('created_at', { ascending: false }).limit(20)
        if (!dspError && dspData && dspData.length > 0) {
          const mappedDisputes = dspData.map((dsp: any) => ({
            id: dsp.id,
            dealId: dsp.deal_id,
            client: dsp.client_name || 'Клиент',
            provider: dsp.provider_name || 'Исполнитель',
            amount: '$' + (dsp.amount || 0).toString(),
            reason: dsp.reason || 'Нет причины',
            status: dsp.status,
            priority: dsp.priority || 'medium',
            date: new Date(dsp.created_at).toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' })
          }))
          setDisputes(mappedDisputes)
        }
      } catch (err) {
        console.error('Failed to fetch admin data from Supabase', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (activeTab === 'transactions' || activeTab === 'disputes') {
      fetchData()
    }
  }, [activeTab])

  // CSV Exporter Helper
  const handleExportCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.map(x => `"${x}"`).join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      triggerNotificationFeedback('success')
    } catch (err) {
      console.error(err)
      triggerNotificationFeedback('error')
    }
  }

  // Authentication PIN Handler
  if (!isAuthenticated) {
    const handlePinSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      if (pin === '7777') {
        setIsAuthenticated(true)
        triggerNotificationFeedback('success')
      } else {
        triggerNotificationFeedback('error')
        setPin('')
        alert('Неверный PIN-код (Используйте 7777)')
      }
    }

    return (
      <div className="fixed inset-0 z-[200] bg-[#050811] flex items-center justify-center animate-fadeIn px-4">
        <div className="glass-card p-8 max-w-sm w-full border-rose-500/30 text-center shadow-[0_0_50px_rgba(244,63,94,0.2)]">
          <div className="w-16 h-16 mx-auto bg-rose-500/20 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/40">
            <ShieldBan className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Restricted Area</h2>
          <p className="text-sm text-gray-400 mb-6">Введите PIN-код суперадминистратора для доступа (7777)</p>
          <form onSubmit={handlePinSubmit}>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full bg-slate-900/80 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] text-white focus:border-rose-500 outline-none mb-4 font-mono"
              placeholder="••••"
              maxLength={4}
              autoFocus
            />
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3 bg-white/5 text-gray-400 rounded-xl font-bold hover:bg-white/10">Отмена</button>
              <button type="submit" className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 shadow-[0_0_15px_rgba(244,63,94,0.4)]">Войти</button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  // User Actions
  const handleToggleBlockUser = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'blocked' ? 'active' : 'blocked'
        triggerNotificationFeedback('success')
        return { ...u, status: nextStatus }
      }
      return u
    }))
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, status: prev.status === 'blocked' ? 'active' : 'blocked' } : null)
    }
  }

  const handleAdjustBalance = (userId: string, delta: number) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextBal = Math.max(0, u.balance + delta)
        return { ...u, balance: nextBal }
      }
      return u
    }))
    if (selectedUser?.id === userId) {
      setSelectedUser(prev => prev ? { ...prev, balance: Math.max(0, prev.balance + delta) } : null)
    }
    triggerNotificationFeedback('success')
  }

  // Payout Actions
  const handlePayoutStatus = (id: string, newStatus: 'completed' | 'rejected') => {
    setPayouts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p))
    triggerNotificationFeedback('success')
  }

  // Refund Action
  const handleRefund = async (txId: string) => {
    try {
      setIsLoading(true)
      const { error } = await supabase.from('transactions').update({ status: 'refunded' }).eq('id', txId)
      if (error) console.log('Supabase mock fallback used')
      triggerNotificationFeedback('success')
      setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: 'refunded' } : tx))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Resolve Dispute
  const handleResolveDispute = async (disputeId: string, resolution: 'resolved' | 'closed') => {
    try {
      setIsLoading(true)
      const { error } = await supabase.from('disputes').update({ status: resolution }).eq('id', disputeId)
      if (error) console.log('Supabase mock fallback')
      triggerNotificationFeedback('success')
      setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: resolution } : d))
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Review Actions
  const handleReviewAction = (id: string, action: 'approve' | 'delete') => {
    if (action === 'delete') {
      setReviews(prev => prev.filter(r => r.id !== id))
    } else {
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved', flagged: false } : r))
    }
    triggerNotificationFeedback('success')
  }

  // Send Broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastTitle || !broadcastBody) return
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setBroadcastSentCount(broadcastTarget === 'all' ? 8234 : broadcastTarget === 'business' ? 340 : 7894)
    setTimeout(() => {
      setBroadcastTitle('')
      setBroadcastBody('')
    }, 1500)
  }

  // Invite Admin
  const handleInviteAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAdminName) return
    const newAdmin = {
      id: `adm-${Date.now().toString().slice(-3)}`,
      name: newAdminName,
      role: newAdminRole,
      access: newAdminRole === 'SuperAdmin' ? 'Полный доступ' : newAdminRole === 'Finance' ? 'Финансы и Выплаты' : 'Арбитраж и Поддержка'
    }
    setTeam(prev => [...prev, newAdmin])
    setNewAdminName('')
    setIsInviteModalOpen(false)
    triggerNotificationFeedback('success')
  }

  // Navigation Items
  const navItems: { id: AdminTab, label: string, icon: React.ReactNode, color: string }[] = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-[#00F2FE]' },
    { id: 'moderation', label: '🛡️ Модерация (Карантин)', icon: <ShieldAlert className="w-5 h-5" />, color: 'text-rose-400' },
    { id: 'users', label: 'Пользователи', icon: <Users className="w-5 h-5" />, color: 'text-purple-400' },
    { id: 'verification', label: 'Верификация (VIP)', icon: <CheckCircle2 className="w-5 h-5" />, color: 'text-[#00F2FE]' },
    { id: 'transactions', label: 'Транзакции', icon: <CreditCard className="w-5 h-5" />, color: 'text-emerald-400' },
    { id: 'payouts', label: 'Выплаты Партнерам', icon: <DollarSign className="w-5 h-5" />, color: 'text-emerald-400' },
    { id: 'disputes', label: 'Арбитраж', icon: <Scale className="w-5 h-5" />, color: 'text-rose-400' },
    { id: 'reviews', label: 'Модерация Отзывов', icon: <FileText className="w-5 h-5" />, color: 'text-amber-400' },
    { id: 'broadcasts', label: 'Рассылки', icon: <Play className="w-5 h-5" />, color: 'text-cyan-400' },
    { id: 'ai-log', label: 'AI Монитор', icon: <Activity className="w-5 h-5" />, color: 'text-purple-400' },
    { id: 'analytics', label: 'Аналитика', icon: <BarChart3 className="w-5 h-5" />, color: 'text-amber-400' },
    { id: 'settings', label: 'Настройки', icon: <Settings className="w-5 h-5" />, color: 'text-gray-400' },
  ]

  // Render Dashboard View
  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 border-emerald-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">GMV (Месяц)</p>
              <h3 className="text-3xl font-black text-white mt-1">{MOCK_METRICS.gmv}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/40">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 relative z-10">
            <TrendingUp className="w-4 h-4" />
            <span>{MOCK_METRICS.gmvGrowth} к прошлому месяцу</span>
          </div>
        </div>

        <div className="glass-card p-5 border-[#00F2FE]/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00F2FE]/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Активные юзеры</p>
              <h3 className="text-3xl font-black text-white mt-1">{MOCK_METRICS.activeUsers}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#00F2FE]/20 flex items-center justify-center border border-[#00F2FE]/40">
              <Users className="w-5 h-5 text-[#00F2FE]" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#00F2FE] relative z-10">
            <TrendingUp className="w-4 h-4" />
            <span>{MOCK_METRICS.usersGrowth} новых регистраций</span>
          </div>
        </div>

        <div className="glass-card p-5 border-rose-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Открытые арбитражи</p>
              <h3 className="text-3xl font-black text-white mt-1">{disputes.filter(d => d.status === 'open').length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 relative z-10">
            <Activity className="w-4 h-4" />
            <span>Требуют решения администратора</span>
          </div>
        </div>

        <div className="glass-card p-5 border-amber-400/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Успешные сделки</p>
              <h3 className="text-3xl font-black text-white mt-1">{MOCK_METRICS.successRate}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center border border-amber-400/40">
              <CheckCircle2 className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 relative z-10">
            <TrendingUp className="w-4 h-4" />
            <span>Стабильный показатель качества</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 border-white/10 h-80 flex flex-col">
          <h4 className="font-bold text-white mb-4">Аналитика Монетизации (Выручка)</h4>
          <div className="flex-1 h-full min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: '1 Окт', tokens: 400, vip: 240, ai: 120 },
                { name: '2 Окт', tokens: 300, vip: 139, ai: 220 },
                { name: '3 Окт', tokens: 500, vip: 380, ai: 180 },
                { name: '4 Окт', tokens: 600, vip: 290, ai: 250 },
                { name: '5 Окт', tokens: 450, vip: 150, ai: 190 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={10} tickMargin={10} />
                <YAxis stroke="#6b7280" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                <Bar dataKey="tokens" stackId="a" fill="#10b981" name="Токены" />
                <Bar dataKey="vip" stackId="a" fill="#00F2FE" name="VIP Статусы" />
                <Bar dataKey="ai" stackId="a" fill="#a855f7" name="Аренда AI" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5 border-white/10 h-80 flex flex-col">
          <h4 className="font-bold text-white mb-4">Топ ниши за неделю</h4>
          <div className="space-y-4 flex-1">
            {[
              { name: 'Транспорт', percent: 45, color: 'bg-[#00F2FE]' },
              { name: 'Жилье', percent: 30, color: 'bg-emerald-400' },
              { name: 'Услуги', percent: 15, color: 'bg-amber-400' },
              { name: 'Маркет', percent: 10, color: 'bg-purple-400' },
            ].map(item => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{item.name}</span>
                  <span className="text-white font-bold">{item.percent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Render Users & RBAC View
  const renderUsers = () => {
    const filtered = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск по имени, ID, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExportCSV('users_list', ['ID', 'Имя', 'Роль', 'Статус', 'Баланс (TUTTO)', 'Дата регистрации'], users.map(u => [u.id, u.name, u.role, u.status, u.balance, u.joined]))}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
            >
              <Download className="w-4 h-4" /> Выгрузить CSV
            </button>
            <button onClick={() => setIsInviteModalOpen(true)} className="px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Plus className="w-4 h-4" /> Добавить в команду
            </button>
          </div>
        </div>

        {/* User List Table */}
        <div className="glass-card border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-900/80 text-xs uppercase font-bold text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Пользователь</th>
                  <th className="px-6 py-4">Роль</th>
                  <th className="px-6 py-4">Статус</th>
                  <th className="px-6 py-4">Баланс (TUTTO)</th>
                  <th className="px-6 py-4">Регистрация</th>
                  <th className="px-6 py-4 text-right">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F2FE] to-purple-500 flex items-center justify-center text-black font-bold">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-xs text-gray-500">{u.id} {u.telegram && `· ${u.telegram}`}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'business' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                        u.role === 'provider' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' :
                        'bg-white/10 text-gray-300 border border-white/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${u.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                        <span className="capitalize">{u.status === 'active' ? 'Активен' : 'Заблокирован'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white">{u.balance} TUTTO</td>
                    <td className="px-6 py-4 text-gray-400">{u.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u)
                          setIsUserModalOpen(true)
                        }}
                        className="px-3 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-bold border border-white/10 transition-colors"
                      >
                        Управление
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team & RBAC Management Sub-Section */}
        <div className="glass-card p-6 border-white/10 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-purple-400" />
                Команда Администрирования и Права (RBAC)
              </h4>
              <p className="text-xs text-gray-400">Назначение ролей сотрудникам поддержки</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {team.map(member => (
              <div key={member.id} className="bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-white text-sm">{member.name}</div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono uppercase font-bold">{member.role}</span>
                </div>
                <div className="text-xs text-gray-400">{member.access}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Render Transactions View
  const renderTransactions = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          Финансовый реестр
          {isLoading && <RefreshCw className="w-4 h-4 text-emerald-400 animate-spin" />}
        </h3>
        <button
          onClick={() => handleExportCSV('transactions', ['ID', 'Тип', 'Пользователь', 'Сумма', 'Метод', 'Дата', 'Статус'], transactions.map(t => [t.id, t.type, t.user, t.amount, t.method, t.date, t.status]))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
        >
          <Download className="w-4 h-4" /> Выгрузить CSV
        </button>
      </div>

      <div className="glass-card border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">ID / Дата</th>
                <th className="px-6 py-4">Тип</th>
                <th className="px-6 py-4">Пользователь</th>
                <th className="px-6 py-4">Сумма</th>
                <th className="px-6 py-4">Метод</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-white text-xs">{tx.id}</div>
                    <div className="text-[10px] text-gray-500">{tx.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4 text-emerald-400" /> : 
                       tx.type === 'withdrawal' ? <ArrowUpRight className="w-4 h-4 text-rose-400" /> : 
                       <RefreshCw className="w-4 h-4 text-amber-400" />}
                      <span className="capitalize">{tx.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{tx.user}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${tx.amount.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {tx.amount}
                  </td>
                  <td className="px-6 py-4">{tx.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      tx.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' :
                      tx.status === 'pending' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                      'bg-white/10 text-gray-300 border border-white/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {tx.status === 'completed' && tx.type === 'payment' && (
                      <button onClick={() => handleRefund(tx.id)} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/30 mr-2 border border-rose-500/30" title="Компенсировать токены за эту операцию на баланс">
                        Возврат токенов
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Payouts View
  const renderPayouts = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Запросы Выплат Партнерам
          </h3>
          <p className="text-sm text-gray-400">Вывод заработанных средств на криптокошельки TON/USDT и карты</p>
        </div>
        <button
          onClick={() => handleExportCSV('payouts', ['ID', 'Партнер', 'Сумма', 'Кошелек', 'Дата', 'Статус'], payouts.map(p => [p.id, p.user, p.amount, p.wallet, p.date, p.status]))}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white"
        >
          <Download className="w-4 h-4" /> Выгрузить CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 border-amber-400/30 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">$1,200</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Ожидают выплаты</div>
        </div>
        <div className="glass-card p-4 border-emerald-500/30 text-center">
          <div className="text-2xl font-black text-emerald-400 font-mono">$450</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Выплачено сегодня</div>
        </div>
        <div className="glass-card p-4 border-white/10 text-center">
          <div className="text-2xl font-black text-white font-mono">15 мин</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Среднее время обработки</div>
        </div>
      </div>

      <div className="glass-card border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-900/80 text-xs uppercase font-bold text-gray-400 border-b border-white/10">
              <tr>
                <th className="px-6 py-4">ID / Дата</th>
                <th className="px-6 py-4">Партнер</th>
                <th className="px-6 py-4">Сумма</th>
                <th className="px-6 py-4">Реквизиты (Wallet)</th>
                <th className="px-6 py-4">Статус</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {payouts.map(p => (
                <tr key={p.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono text-white text-xs">{p.id}<div className="text-[10px] text-gray-500">{p.date}</div></td>
                  <td className="px-6 py-4 font-bold text-white">{p.user}</td>
                  <td className="px-6 py-4 font-mono font-black text-emerald-400">{p.amount}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-300">{p.wallet}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      p.status === 'completed' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' :
                      p.status === 'pending' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {p.status === 'pending' && (
                      <>
                        <button onClick={() => handlePayoutStatus(p.id, 'completed')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 border border-emerald-500/30">
                          Одобрить
                        </button>
                        <button onClick={() => handlePayoutStatus(p.id, 'rejected')} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/30 border border-rose-500/30">
                          Отклонить
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  // Render Disputes View
  const renderDisputes = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-4 border-rose-500/30 text-center">
          <div className="text-3xl font-black text-rose-400">{disputes.filter(d => d.status === 'open').length}</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Открытых споров</div>
        </div>
        <div className="glass-card p-4 border-amber-400/30 text-center">
          <div className="text-3xl font-black text-amber-400">{disputes.filter(d => d.status === 'reviewing').length}</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">В процессе</div>
        </div>
        <div className="glass-card p-4 border-emerald-500/30 text-center">
          <div className="text-3xl font-black text-emerald-400">145</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Решено за месяц</div>
        </div>
      </div>

      <div className="space-y-3">
        {disputes.map(dispute => (
          <div key={dispute.id} className="glass-card p-5 border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                dispute.priority === 'high' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-amber-400/20 border-amber-400/40 text-amber-400'
              }`}>
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">Спор #{dispute.id}</span>
                  <span className="text-[10px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-mono">{dispute.dealId}</span>
                  {dispute.priority === 'high' && <span className="text-[9px] bg-rose-500 text-white font-black px-2 py-0.5 rounded uppercase">Срочно</span>}
                </div>
                <div className="text-xs text-gray-400 mb-2">
                  <strong className="text-white">{dispute.client}</strong> против <strong className="text-white">{dispute.provider}</strong>
                </div>
                <div className="text-xs text-rose-300 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                  <strong className="text-rose-400">Причина:</strong> {dispute.reason}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
              <div className="text-xl font-black text-white text-right mb-1">{dispute.amount}</div>
              <button onClick={() => handleResolveDispute(dispute.id, 'resolved')} className="w-full md:w-auto px-4 py-2 bg-[#00F2FE] text-black font-bold text-xs rounded-xl hover:brightness-110 mb-1">
                Возврат токенов клиенту (Решено)
              </button>
              <button onClick={() => handleToggleBlockUser('usr-3')} className="w-full md:w-auto px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-xs rounded-xl hover:bg-rose-500/30">
                Заблокировать нарушителя
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render Reviews Moderation
  const renderReviews = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Модерация Отзывов и Репутации
          </h3>
          <p className="text-sm text-gray-400">Проверка жалоб на отзывы пользователей</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {reviews.map(rev => (
          <div key={rev.id} className="glass-card p-5 border-white/10 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-white text-sm">{rev.author}</div>
                  <div className="text-xs text-gray-400">для <span className="text-cyan-400 font-bold">{rev.business}</span></div>
                </div>
                <div className="flex items-center gap-1 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded text-amber-400 text-xs font-bold">
                  <Star className="w-3 h-3 fill-amber-400" /> {rev.rating}
                </div>
              </div>
              <p className="text-xs text-gray-300 italic bg-black/30 p-3 rounded-xl border border-white/5">
                «{rev.text}»
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] text-gray-500">{rev.date}</span>
              <div className="flex gap-2">
                <button onClick={() => handleReviewAction(rev.id, 'approve')} className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg hover:bg-emerald-500/30 border border-emerald-500/30">
                  Одобрить
                </button>
                <button onClick={() => handleReviewAction(rev.id, 'delete')} className="px-3 py-1 bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg hover:bg-rose-500/30 border border-rose-500/30">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render Broadcasts View
  const renderBroadcasts = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Play className="w-6 h-6 text-cyan-400" />
          Системные Рассылки Пользователям
        </h3>
        <p className="text-sm text-gray-400">Массовые уведомления в Telegram бот и веб-приложение</p>
      </div>

      <div className="glass-card p-6 border-white/10 max-w-2xl space-y-4">
        <form onSubmit={handleSendBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Целевая аудитория</label>
            <select
              value={broadcastTarget}
              onChange={(e) => setBroadcastTarget(e.target.value)}
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400"
            >
              <option value="all">Все пользователи платформы (~8,234)</option>
              <option value="clients">Только Клиенты (~7,894)</option>
              <option value="business">Только Исполнители (Business) (~340)</option>
              <option value="phuket">Регион: Пхукет</option>
              <option value="bali">Регион: Бали</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Заголовок сообщения</label>
            <input
              type="text"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              placeholder="Например: Обновление правил платформы Tutto!"
              className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 uppercase mb-2">Текст рассылки</label>
            <textarea
              value={broadcastBody}
              onChange={(e) => setBroadcastBody(e.target.value)}
              placeholder="Введите текст сообщения..."
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-500 outline-none focus:border-cyan-400 h-32 resize-none"
              required
            />
          </div>

          {broadcastSentCount !== null && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" /> Рассылка успешно отправлена {broadcastSentCount} пользователям!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#00F2FE] text-black font-extrabold text-sm rounded-xl hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)]"
          >
            <Send className="w-4 h-4" /> Отправить рассылку сейчас
          </button>
        </form>
      </div>
    </div>
  )

  // Render AI Log Monitor
  const renderAILog = () => (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-purple-400" />
          Монитор AI Intent Hunter & Логи Запросов
        </h3>
        <p className="text-sm text-gray-400">Статус нейросетевого парсера и расхода токенов в реальном времени</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 border-purple-500/30 text-center">
          <div className="text-2xl font-black text-purple-400 font-mono">1,240</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Обработано запросов</div>
        </div>
        <div className="glass-card p-4 border-emerald-500/30 text-center">
          <div className="text-2xl font-black text-emerald-400 font-mono">94.2%</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Точность матчинга</div>
        </div>
        <div className="glass-card p-4 border-[#00F2FE]/30 text-center">
          <div className="text-2xl font-black text-[#00F2FE] font-mono">8,450</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Токенов TUTTO сожжено</div>
        </div>
        <div className="glass-card p-4 border-amber-400/30 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">140ms</div>
          <div className="text-xs text-gray-400 uppercase font-bold mt-1">Средний Latency API</div>
        </div>
      </div>

      <div className="glass-card border-white/10 overflow-hidden">
        <div className="p-4 bg-slate-900/80 border-b border-white/10 flex justify-between items-center">
          <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">Live Stream Событий ИИ</span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">● ONLINE</span>
        </div>
        <div className="divide-y divide-white/5 font-mono text-xs">
          {aiLogs.map(log => (
            <div key={log.id} className="p-4 flex flex-col md:flex-row justify-between gap-2 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-[10px]">{log.time}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.status === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  log.status === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                }`}>
                  {log.event}
                </span>
                <span className="text-white font-bold">{log.user}:</span>
                <span className="text-gray-300">{log.detail}</span>
              </div>
              <div className="text-gray-500 text-right">{log.latency}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // Render Verification View
  const renderVerification = () => (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-[#00F2FE]" />
            Заявки на Verified Partner (VIP)
          </h3>
          <p className="text-sm text-gray-400 mt-1">Ручная проверка документов для выдачи синей галочки</p>
        </div>
        <div className="bg-[#00F2FE]/10 border border-[#00F2FE]/30 px-4 py-2 rounded-xl">
          <span className="text-[#00F2FE] font-bold">Очередь: {MOCK_VERIFICATIONS.length}</span>
        </div>
      </div>

      <div className="space-y-4">
        {MOCK_VERIFICATIONS.map(req => (
          <div key={req.id} className="glass-card p-5 border-white/10 flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-lg font-black text-white">{req.provider}</h4>
                <span className="text-[10px] text-gray-400 font-mono">Подана: {req.date}</span>
              </div>
              <div className="flex gap-4 text-xs text-gray-300 mb-4">
                <span className="bg-white/5 px-2 py-1 rounded">{req.category}</span>
                <span className="bg-white/5 px-2 py-1 rounded">{req.hub}</span>
                <span className="bg-white/5 px-2 py-1 rounded text-amber-400">{req.stats}</span>
              </div>
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                <div className="text-gray-400 font-bold mb-1 uppercase tracking-wider text-[10px]">Данные из онбординга</div>
                <div><span className="text-gray-500 w-20 inline-block">Компания:</span> <span className="text-white">{req.company}</span></div>
                <div><span className="text-gray-500 w-20 inline-block">Instagram:</span> <span className="text-cyan-400 hover:underline cursor-pointer">{req.insta}</span></div>
              </div>
            </div>

            <div className="flex flex-col gap-2 shrink-0 md:w-48 justify-center">
              <button onClick={() => triggerNotificationFeedback('success')} className="w-full py-2 bg-[#00F2FE] text-black font-bold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Верифицировать
              </button>
              <button onClick={() => triggerNotificationFeedback('error')} className="w-full py-2 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20 flex items-center justify-center gap-1.5 border border-rose-500/30">
                <X className="w-4 h-4" /> Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Render Settings View
  const renderSettings = () => (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <div>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-gray-400" />
          Системные Настройки Платформы
        </h3>
        <p className="text-sm text-gray-400">Управление комиссиями, лимитами и шлюзами оплаты</p>
      </div>

      <div className="glass-card p-6 border-white/10 space-y-6">
        {/* Platform Fees */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-[#00F2FE]">Финансовые Комиссии</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Комиссия платформы (%)</label>
              <input
                type="number"
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Создание аукциона (TUTTO)</label>
              <input
                type="number"
                value={auctionFee}
                onChange={(e) => setAuctionFee(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Мин. вывод токенов</label>
              <input
                type="number"
                value={minWithdrawal}
                onChange={(e) => setMinWithdrawal(Number(e.target.value))}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Gateways Toggle */}
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 text-[#00F2FE]">Способы Оплаты</h4>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'stars', label: 'Telegram Stars ⭐' },
              { key: 'ton', label: 'TON Crypto Pay 💎' },
              { key: 'card', label: 'Банковские карты (Stripe) 💳' },
              { key: 'promo', label: 'Промокоды 🎁' },
            ].map(g => (
              <label key={g.key} className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-white/5 cursor-pointer">
                <span className="text-xs font-bold text-white">{g.label}</span>
                <input
                  type="checkbox"
                  checked={(gateways as any)[g.key]}
                  onChange={(e) => setGateways(prev => ({ ...prev, [g.key]: e.target.checked }))}
                  className="w-4 h-4 accent-[#00F2FE]"
                />
              </label>
            ))}
          </div>
        </div>

        {/* Maintenance Toggle */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-rose-400">Режим Технического Обслуживания</h4>
            <p className="text-xs text-gray-400">Заблокировать новые сделки для пользователей во время обновлений</p>
          </div>
          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              maintenanceMode ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-white/10 text-gray-400'
            }`}
          >
            {maintenanceMode ? 'ВКЛЮЧЕН (Ограничен)' : 'ВЫКЛЮЧЕН (Норма)'}
          </button>
        </div>

        <button
          onClick={() => triggerNotificationFeedback('success')}
          className="w-full py-3 bg-[#00F2FE] text-black font-extrabold text-sm rounded-xl hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)]"
        >
          Сохранить системные настройки
        </button>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-[200] bg-[#050811] flex flex-col md:flex-row font-sans animate-fadeIn">
      {/* Mobile Header Overlay */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-[#FF2A85] flex items-center justify-center font-black text-black">A</div>
          <span className="font-display font-black text-white">Super Admin</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white">
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-40 h-[calc(100vh-65px)] md:h-screen bg-slate-900/90 md:bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col
        transition-all duration-300 w-64 shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'}
      `}>
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-white/10 h-20 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 to-[#FF2A85] flex items-center justify-center font-black text-black shrink-0">A</div>
          {isSidebarOpen && <span className="font-display font-black text-white whitespace-nowrap">Super Admin</span>}
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-hide">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                triggerHapticFeedback('light')
                setActiveTab(item.id)
                if (window.innerWidth < 768) setIsSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group
                ${activeTab === item.id ? 'bg-white/10 shadow-inner border border-white/5' : 'hover:bg-white/5 text-gray-400 hover:text-white'}
              `}
              title={item.label}
            >
              <div className={`${activeTab === item.id ? item.color : 'group-hover:text-white'}`}>
                {item.icon}
              </div>
              {(isSidebarOpen || window.innerWidth < 768) && (
                <span className={`font-bold text-xs ${activeTab === item.id ? 'text-white' : ''}`}>
                  {item.label}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button
            onClick={() => {
              triggerHapticFeedback('medium')
              onClose()
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-bold text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            {(isSidebarOpen || window.innerWidth < 768) && <span>Выйти в приложение</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-[calc(100vh-65px)] md:h-screen overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#050811] to-[#050811]">
        
        {/* Topbar */}
        <header className="h-20 shrink-0 border-b border-white/10 flex items-center justify-between px-6 lg:px-10 bg-slate-900/30 backdrop-blur-sm z-10">
          <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
            {navItems.find(i => i.id === activeTab)?.icon}
            {navItems.find(i => i.id === activeTab)?.label}
          </h2>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">Super Admin</div>
                <div className="text-[10px] text-emerald-400">Online · Full Rights</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 z-10 relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'moderation' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                    Лист ожидания & Модерация заявок (Human-in-the-Loop)
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Подозрительные заявки, удерживаемые в карантине. Каждое действие подтверждается администратором.
                  </p>
                </div>
                <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 text-xs font-black font-mono">
                  {getStoredRequests().filter(r => r.status === 'under_review').length} в карантине
                </div>
              </div>

              {getStoredRequests().filter(r => r.status === 'under_review').length === 0 ? (
                <div className="glass-card p-10 text-center space-y-3 border-emerald-500/30 bg-emerald-950/20">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-white">Лист ожидания пуст!</h4>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto">
                    Все опубликованные заявки прошли фильтрацию безопасности и одобрены администратором.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getStoredRequests().filter(r => r.status === 'under_review').map((req) => (
                    <div key={req.id} className="glass-card p-5 border-rose-500/40 bg-slate-900/90 space-y-4 relative overflow-hidden">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider border border-rose-500/40 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> РИСК {Math.round((req.moderationScore || 0.8) * 100)}%
                            </span>
                            <span className="text-xs text-gray-400">📍 {req.hub.toUpperCase()} ({req.district})</span>
                          </div>
                          <h4 className="text-base font-extrabold text-white">{req.title}</h4>
                          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{req.description}</p>
                          {req.moderationReason && (
                            <div className="mt-2 text-[11px] text-rose-300 font-medium bg-rose-950/60 p-2 rounded-lg border border-rose-500/30">
                              🔍 <b>Причина фильтрации:</b> {req.moderationReason}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-sm font-black text-[#CCFF00] font-mono">${req.budget || 0}</span>
                          <div className="text-[10px] text-gray-400 mt-1">Автор: {req.clientName}</div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            triggerHapticFeedback('medium')
                            deleteRequestGlobally(req.id)
                            triggerNotificationFeedback('success')
                            setActiveTab('moderation')
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-xs border border-rose-500/40 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Заблокировать и удалить</span>
                        </button>
                        <button
                          onClick={() => {
                            triggerHapticFeedback('heavy')
                            const approvedReq: RequestItem = { ...req, status: 'open' }
                            saveRequestGlobally(approvedReq)
                            triggerNotificationFeedback('success')
                            setActiveTab('moderation')
                          }}
                          className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:brightness-110 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950 stroke-[3]" />
                          <span>Одобрить и опубликовать</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'transactions' && renderTransactions()}
          {activeTab === 'payouts' && renderPayouts()}
          {activeTab === 'disputes' && renderDisputes()}
          {activeTab === 'verification' && renderVerification()}
          {activeTab === 'reviews' && renderReviews()}
          {activeTab === 'broadcasts' && renderBroadcasts()}
          {activeTab === 'ai-log' && renderAILog()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-amber-400" />
                    Глубокая Аналитика Платформы
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Когортный анализ и динамика GMV по дням</p>
                </div>
                <button
                  onClick={() => handleExportCSV('analytics_gmv', ['День', 'GMV ($)', 'Пользователи'], [['Пн', 4000, 120], ['Вт', 3000, 95], ['Ср', 2000, 80], ['Чт', 2780, 110], ['Пт', 1890, 85], ['Сб', 2390, 105], ['Вс', 3490, 140]])}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold transition-all border border-white/20"
                >
                  <Download className="w-4 h-4" /> Экспорт CSV
                </button>
              </div>

              <div className="glass-card p-6 border-white/10 h-[400px]">
                <h4 className="font-bold text-white mb-6">Динамика оборота (GMV) за неделю</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { name: 'Пн', gmv: 4000 },
                    { name: 'Вт', gmv: 3000 },
                    { name: 'Ср', gmv: 2000 },
                    { name: 'Чт', gmv: 2780 },
                    { name: 'Пт', gmv: 1890 },
                    { name: 'Сб', gmv: 2390 },
                    { name: 'Вс', gmv: 3490 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Area type="monotone" dataKey="gmv" stroke="#CCFF00" fill="#CCFF00" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Management Action Modal */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 border-white/20 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-lg">Управление: {selectedUser.name}</h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400"><span>ID:</span> <span className="text-white font-mono">{selectedUser.id}</span></div>
              <div className="flex justify-between text-gray-400"><span>Telegram:</span> <span className="text-cyan-400 font-bold">{selectedUser.telegram || 'Не указан'}</span></div>
              <div className="flex justify-between text-gray-400"><span>Текущий Баланс:</span> <span className="text-emerald-400 font-bold font-mono">{selectedUser.balance} TUTTO</span></div>
              <div className="flex justify-between text-gray-400"><span>Статус:</span> <span className={selectedUser.status === 'active' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{selectedUser.status}</span></div>
            </div>

            <div className="pt-2 border-t border-white/10 space-y-3">
              <label className="block text-xs font-bold text-gray-300">Корректировка Баланса (TUTTO)</label>
              <div className="flex gap-2">
                <button onClick={() => handleAdjustBalance(selectedUser.id, 50)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30">+50 TUTTO</button>
                <button onClick={() => handleAdjustBalance(selectedUser.id, 200)} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl border border-emerald-500/30 hover:bg-emerald-500/30">+200 TUTTO</button>
                <button onClick={() => handleAdjustBalance(selectedUser.id, -50)} className="flex-1 py-2 bg-rose-500/20 text-rose-400 font-bold text-xs rounded-xl border border-rose-500/30 hover:bg-rose-500/30">-50 TUTTO</button>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleToggleBlockUser(selectedUser.id)}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all ${
                  selectedUser.status === 'blocked' ? 'bg-emerald-500 text-black hover:brightness-110' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                }`}
              >
                {selectedUser.status === 'blocked' ? 'Разблокировать пользователя' : 'Заблокировать пользователя'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Admin Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="glass-card max-w-sm w-full p-6 border-purple-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-lg">Пригласить сотрудника</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleInviteAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Имя / Никнейм</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Мария К."
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Роль (RBAC)</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                >
                  <option value="Moderator">Moderator (Арбитраж и Отзывы)</option>
                  <option value="Finance">Finance (Транзакции и Выплаты)</option>
                  <option value="Support">Support (Верификация)</option>
                  <option value="SuperAdmin">SuperAdmin (Полный доступ)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-500 text-white font-bold text-xs rounded-xl hover:bg-purple-600 transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)]"
              >
                Сохранить и Выдать Доступ
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
