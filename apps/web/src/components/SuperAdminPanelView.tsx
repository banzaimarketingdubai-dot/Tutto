import React, { useState } from 'react'
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
  LogOut
} from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

interface SuperAdminPanelViewProps {
  onClose: () => void
}

type AdminTab = 'dashboard' | 'transactions' | 'disputes' | 'analytics' | 'users' | 'settings'

// Mock Data
const MOCK_METRICS = {
  gmv: '$124,500',
  gmvGrowth: '+14%',
  activeUsers: '8,234',
  usersGrowth: '+5%',
  openDisputes: 12,
  successRate: '98.2%'
}

const MOCK_USERS = [
  { id: 'usr-1', name: 'Александр', role: 'client', status: 'active', joined: '2023-10-01', balance: 150 },
  { id: 'usr-2', name: 'Ayana Luxury Resort', role: 'business', status: 'active', joined: '2023-11-15', balance: 3400 },
  { id: 'usr-3', name: 'Иван К.', role: 'provider', status: 'blocked', joined: '2024-01-20', balance: 0 },
  { id: 'usr-4', name: 'Phuket Drive', role: 'business', status: 'active', joined: '2024-02-10', balance: 1250 },
]

export const SuperAdminPanelView: React.FC<SuperAdminPanelViewProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GMV Card */}
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

        {/* Users Card */}
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

        {/* Disputes Card */}
        <div className="glass-card p-5 border-rose-500/30 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] -mr-10 -mt-10 transition-transform group-hover:scale-150" />
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Открытые арбитражи</p>
              <h3 className="text-3xl font-black text-white mt-1">{MOCK_METRICS.openDisputes}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center border border-rose-500/40">
              <AlertCircle className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400 relative z-10">
            <Activity className="w-4 h-4" />
            <span>Требуют внимания (Высокий приоритет)</span>
          </div>
        </div>

        {/* Success Rate Card */}
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
        <div className="lg:col-span-2 glass-card p-5 border-white/10 h-80 flex items-center justify-center text-gray-500 font-medium">
          [Здесь будет график GMV (Recharts)]
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

  const renderUsers = () => {
    const filtered = MOCK_USERS.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))

    return (
      <div className="space-y-4 animate-fadeIn">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Поиск пользователей по имени, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors">
              Фильтры
            </button>
            <button className="px-4 py-2 bg-[#00F2FE] text-black rounded-xl text-sm font-bold hover:brightness-110 transition-all">
              Добавить юзера
            </button>
          </div>
        </div>

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
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00F2FE] to-purple-500 flex items-center justify-center text-black font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'business' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' :
                        user.role === 'provider' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/30' :
                        'bg-white/10 text-gray-300 border border-white/20'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`} />
                        <span className="capitalize">{user.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold">{user.balance}</td>
                    <td className="px-6 py-4 text-gray-400">{user.joined}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const renderPlaceholder = (title: string) => (
    <div className="flex-1 flex items-center justify-center animate-fadeIn min-h-[60vh]">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Settings className="w-8 h-8 text-gray-500 animate-spin-slow" />
        </div>
        <h3 className="text-2xl font-bold text-white">Раздел "{title}"</h3>
        <p className="text-gray-400 max-w-sm mx-auto">
          Этот раздел находится в разработке (Фаза 2 плана). Здесь будет реализован специализированный функционал для управления {title.toLowerCase()}.
        </p>
      </div>
    </div>
  )

  const navItems: { id: AdminTab, label: string, icon: React.ReactNode, color: string }[] = [
    { id: 'dashboard', label: 'Дашборд', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-[#00F2FE]' },
    { id: 'transactions', label: 'Транзакции', icon: <CreditCard className="w-5 h-5" />, color: 'text-emerald-400' },
    { id: 'disputes', label: 'Арбитраж', icon: <Scale className="w-5 h-5" />, color: 'text-rose-400' },
    { id: 'analytics', label: 'Аналитика', icon: <BarChart3 className="w-5 h-5" />, color: 'text-amber-400' },
    { id: 'users', label: 'Пользователи', icon: <Users className="w-5 h-5" />, color: 'text-purple-400' },
    { id: 'settings', label: 'Настройки', icon: <Settings className="w-5 h-5" />, color: 'text-gray-400' },
  ]

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

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 scrollbar-hide">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                triggerHapticFeedback('light')
                setActiveTab(item.id)
                if (window.innerWidth < 768) setIsSidebarOpen(false)
              }}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer group
                ${activeTab === item.id ? 'bg-white/10 shadow-inner border border-white/5' : 'hover:bg-white/5 text-gray-400 hover:text-white'}
              `}
              title={item.label}
            >
              <div className={`${activeTab === item.id ? item.color : 'group-hover:text-white'}`}>
                {item.icon}
              </div>
              {(isSidebarOpen || window.innerWidth < 768) && (
                <span className={`font-bold text-sm ${activeTab === item.id ? 'text-white' : ''}`}>
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
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <AlertCircle className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#050811]"></span>
            </button>
            <div className="flex items-center gap-2 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">Chief Admin</div>
                <div className="text-[10px] text-emerald-400">Online</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/20 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="Admin" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 z-10 relative">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'transactions' && renderPlaceholder('Транзакции')}
          {activeTab === 'disputes' && renderPlaceholder('Арбитраж')}
          {activeTab === 'analytics' && renderPlaceholder('Аналитика')}
          {activeTab === 'settings' && renderPlaceholder('Настройки')}
        </div>
      </div>
    </div>
  )
}
