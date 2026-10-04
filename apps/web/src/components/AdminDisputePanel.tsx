import React, { useState } from 'react'
import { X, Scale, AlertTriangle, MessageSquare, CheckCircle, Ban, ShieldAlert, DollarSign, BarChart3, TrendingUp, Activity, Users } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback, sendAPIKeyStatusReport, sendSuperadminErrorAlert, SUPERADMIN_CHAT_ID } from '../lib/telegram'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'

interface AdminDisputePanelProps {
  isOpen: boolean
  onClose: () => void
  onOpenDisputeChat?: (dealId: string) => void
  currentLang?: Language
}

const MOCK_DISPUTES = [
  {
    id: 'APL-012',
    date: '24 сент 18:30',
    client: '@alex_phuket',
    provider: 'Phuket Drive',
    dealId: 'DEAL-441',
    service: 'Аренда Honda PCX',
    price: 77,
    reason: 'Байк оказался в плохом состоянии, отличался от описания. Требую возврат 50% стоимости.',
    status: 'open',
  },
  {
    id: 'APL-015',
    date: '25 сент 09:15',
    client: '@maria_bali',
    provider: 'Clean&Clear',
    dealId: 'DEAL-882',
    service: 'Уборка виллы 3BR',
    price: 120,
    reason: 'Клининг не приехал в назначенное время, на сообщения не отвечают.',
    status: 'open',
  }
]

export const AdminDisputePanel: React.FC<AdminDisputePanelProps> = ({
  isOpen,
  onClose,
  onOpenDisputeChat,
  currentLang,
}) => {
  const lang = currentLang || detectDefaultLanguage()

  const [adminTab, setAdminTab] = useState<'disputes' | 'analytics'>('disputes')
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  const [disputes, setDisputes] = useState(MOCK_DISPUTES)
  const [selectedDispute, setSelectedDispute] = useState<typeof MOCK_DISPUTES[0] | null>(null)
  const [decisionText, setDecisionText] = useState('')
  const [isSendingReport, setIsSendingReport] = useState(false)
  const [reportResult, setReportResult] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSendKeyReport = async () => {
    triggerHapticFeedback('medium')
    setIsSendingReport(true)
    setReportResult(null)
    const res = await sendAPIKeyStatusReport()
    setIsSendingReport(false)
    if (res.ok) {
      triggerNotificationFeedback('success')
      setReportResult(`✅ Отчет доступности ключей успешно отправлен в Telegram бота суперадмину (ID: ${SUPERADMIN_CHAT_ID})!`)
    } else {
      triggerNotificationFeedback('error')
      setReportResult(`❌ Не удалось отправить отчет: ${res.statusMsg}`)
    }
  }

  const handleResolve = (resolution: 'client' | 'provider' | 'reject') => {
    if (!selectedDispute) return
    triggerHapticFeedback('heavy')
    
    // Эмуляция закрытия диспута
    setDisputes(prev => prev.filter(d => d.id !== selectedDispute.id))
    setSelectedDispute(null)
    setDecisionText('')
    triggerNotificationFeedback('success')
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#0A101D] animate-fadeIn">
      <div className="safe-area-top bg-black/50 border-b border-red-500/30 p-4 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              <Scale className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h2 className="font-display font-black text-xl text-white tracking-wide">{t(lang, 'admin_panel_title')}</h2>
              <p className="text-xs text-red-400 font-bold">{t(lang, 'admin_panel_sub')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Admin Navigation */}
        <div className="flex gap-4 px-1">
          <button 
            onClick={() => setAdminTab('disputes')}
            className={`pb-3 px-1 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
              adminTab === 'disputes' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t(lang, 'tab_disputes')}
          </button>
          <button 
            onClick={() => setAdminTab('analytics')}
            className={`pb-3 px-1 text-[13px] font-bold uppercase tracking-wider transition-all border-b-2 ${
              adminTab === 'analytics' ? 'border-[#CCFF00] text-[#CCFF00]' : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            {t(lang, 'tab_analytics')}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 relative">
        {/* Background glow */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${adminTab === 'analytics' ? 'bg-[#CCFF00]/10' : 'bg-red-500/10'}`} />

        {adminTab === 'analytics' ? (
          /* Market Analytics Dashboard */
          <div className="space-y-4 relative z-10 animate-fadeIn">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-panel p-4 border-[#CCFF00]/30 rounded-2xl bg-[#CCFF00]/5 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-6 h-6 text-[#CCFF00] mb-2" />
                <div className="text-2xl font-black text-white font-mono">$12,450</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Оборот (GMV) за 24ч</div>
                <div className="text-xs text-[#00F2FE] font-bold mt-1">↑ +14%</div>
              </div>
              <div className="glass-panel p-4 border-[#CCFF00]/30 rounded-2xl bg-[#CCFF00]/5 flex flex-col items-center justify-center text-center">
                <Activity className="w-6 h-6 text-[#00F2FE] mb-2" />
                <div className="text-2xl font-black text-white font-mono">1,842</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Активных лотов</div>
                <div className="text-xs text-red-400 font-bold mt-1">↓ -2%</div>
              </div>
              <div className="glass-panel p-4 border-[#CCFF00]/30 rounded-2xl bg-[#CCFF00]/5 flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-[#CCFF00] mb-2" />
                <div className="text-2xl font-black text-white font-mono">8,204</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Уникальных юзеров</div>
                <div className="text-xs text-[#00F2FE] font-bold mt-1">↑ +8%</div>
              </div>
              <div className="glass-panel p-4 border-[#CCFF00]/30 rounded-2xl bg-[#CCFF00]/5 flex flex-col items-center justify-center text-center">
                <TrendingUp className="w-6 h-6 text-[#00F2FE] mb-2" />
                <div className="text-2xl font-black text-white font-mono">68%</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mt-1">Конверсия аукциона</div>
                <div className="text-xs text-gray-500 font-bold mt-1">стабильно</div>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div className="glass-panel p-4 border-white/10 rounded-2xl mt-4">
              <h3 className="text-white font-bold text-sm mb-4">Активность Маркета</h3>
              <div className="h-32 flex items-end justify-between gap-1 mt-6 border-b border-white/10 pb-2">
                {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
                  <div key={i} className="w-full bg-gradient-to-t from-[#00F2FE] to-[#CCFF00] rounded-t-md opacity-80 hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-gray-500 font-mono">
                <span>Пн</span>
                <span>Вт</span>
                <span>Ср</span>
                <span>Чт</span>
                <span>Пт</span>
                <span>Сб</span>
                <span>Вс</span>
              </div>
            </div>
            
            {/* Top Categories */}
            <div className="glass-panel p-4 border-white/10 rounded-2xl mt-4">
              <h3 className="text-white font-bold text-sm mb-3">Топ категорий по обороту</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">📱 Электроника (Б/У)</span>
                  <span className="text-xs font-black text-[#CCFF00] font-mono">$4,200</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">🛵 Транспорт</span>
                  <span className="text-xs font-black text-[#CCFF00] font-mono">$3,850</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300">👕 Одежда</span>
                  <span className="text-xs font-black text-[#CCFF00] font-mono">$1,900</span>
                </div>
              </div>
            </div>

            {/* Daily Report Widget */}
            <div className="glass-panel p-4 border-white/10 rounded-2xl mt-4">
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-[#00F2FE]" />
                Отчет по заявкам за сегодня
              </h3>
              <p className="text-[10px] text-gray-400 mb-3">
                Активные / Закрытые за сегодня (Всего за все время)
              </p>
              
              <div className="space-y-2">
                {/* Rent */}
                <div className="bg-[#070B12] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">🏠 Аренда</span>
                  </div>
                  <div className="text-xs font-mono flex items-center gap-1.5">
                    <span className="text-[#00F2FE] font-black" title="Активные">42</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-[#CCFF00] font-black" title="Закрытые сегодня">18</span>
                    <span className="text-gray-500 text-[10px]" title="Всего">(3,104)</span>
                  </div>
                </div>
                
                {/* Services */}
                <div className="bg-[#070B12] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">🛠 Услуги</span>
                  </div>
                  <div className="text-xs font-mono flex items-center gap-1.5">
                    <span className="text-[#00F2FE] font-black" title="Активные">25</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-[#CCFF00] font-black" title="Закрытые сегодня">9</span>
                    <span className="text-gray-500 text-[10px]" title="Всего">(1,422)</span>
                  </div>
                </div>

                {/* Market */}
                <div className="bg-[#070B12] p-3 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300 font-bold uppercase tracking-wider">🔥 Маркет</span>
                  </div>
                  <div className="text-xs font-mono flex items-center gap-1.5">
                    <span className="text-[#00F2FE] font-black" title="Активные">88</span>
                    <span className="text-gray-600">/</span>
                    <span className="text-[#CCFF00] font-black" title="Закрытые сегодня">45</span>
                    <span className="text-gray-500 text-[10px]" title="Всего">(8,931)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Availability & Monitoring Widget */}
            <div className="glass-panel p-4 border-[#00F2FE]/30 bg-[#00F2FE]/5 rounded-2xl mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                    <span>🤖 Мониторинг Доступности Ключей & ИИ</span>
                    <span className="text-[9px] bg-[#00F2FE]/20 text-[#00F2FE] px-1.5 py-0.2 rounded font-black border border-[#00F2FE]/40">LIVE</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">Пересылка системных ошибок Суперадмину в Telegram (ID: <code>{SUPERADMIN_CHAT_ID}</code>)</p>
                </div>
              </div>

              <div className="p-3 bg-[#070B12] rounded-xl border border-white/10 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Gemini 2.0 Flash API Key:</span>
                  <span className="font-bold text-[#00F2FE]">{import.meta.env.VITE_GEMINI_API_KEY ? '🟢 АКТИВЕН' : '🟡 УМНЫЙ ИИ-ФОЛЛБЭК'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Telegram Bot API Token:</span>
                  <span className="font-bold text-[#CCFF00]">🟢 АКТИВЕН (@tuttominutto_bot)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Superadmin Alert Chat ID:</span>
                  <span className="font-mono text-purple-300 font-bold">{SUPERADMIN_CHAT_ID}</span>
                </div>
              </div>

              {reportResult && (
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/10 text-[11px] text-white font-medium leading-relaxed animate-fadeIn">
                  {reportResult}
                </div>
              )}

              <button
                type="button"
                disabled={isSendingReport}
                onClick={handleSendKeyReport}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00F2FE] to-cyan-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,254,0.3)] hover:brightness-110 active:scale-98 transition-all cursor-pointer"
              >
                <span>{isSendingReport ? 'Отправка отчета...' : '📊 Отправить отчет о доступности ключей в Telegram'}</span>
              </button>
            </div>
          </div>
        ) : selectedDispute ? (
          /* Окно детального диспута */
          <div className="space-y-4 animate-slideInRight relative z-10">
            <button 
              onClick={() => setSelectedDispute(null)}
              className="text-xs font-bold text-gray-400 flex items-center gap-1 hover:text-white mb-2"
            >
              ← Назад к списку
            </button>

            <div className="glass-panel p-5 border-red-500/30 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-red-500/20 rounded-bl-xl border-l border-b border-red-500/30 text-[10px] font-black text-red-400 uppercase tracking-wider">
                {selectedDispute.id}
              </div>

              <div className="flex items-center gap-2 mb-4 mt-2">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h3 className="text-white font-bold text-lg">Детали апелляции</h3>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Клиент:</span>
                  <span className="text-white font-bold">{selectedDispute.client}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Бизнес:</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    {selectedDispute.provider} <CheckCircle className="w-3 h-3" />
                  </span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Сделка:</span>
                  <span className="text-white">{selectedDispute.dealId} • {selectedDispute.service}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-400">Сумма:</span>
                  <span className="text-[#00F2FE] font-black font-mono text-sm">${selectedDispute.price}</span>
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                <h4 className="text-red-400 font-bold mb-2 flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4" /> Причина апелляции:
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-red-500/50 pl-3">
                  «{selectedDispute.reason}»
                </p>
              </div>

              <div className="flex gap-2 mb-6">
                <button 
                  onClick={() => {
                    if (onOpenDisputeChat) onOpenDisputeChat(selectedDispute.dealId)
                  }}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-bold text-white transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" /> Чат сделки
                </button>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm">Решение модератора:</h4>
                <textarea
                  value={decisionText}
                  onChange={(e) => setDecisionText(e.target.value)}
                  placeholder="Введите основание для решения..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-red-500/50 outline-none resize-none h-24"
                />
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button 
                    onClick={() => handleResolve('client')}
                    className="bg-[#00F2FE]/10 hover:bg-[#00F2FE]/20 border border-[#00F2FE]/30 text-[#00F2FE] rounded-xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <DollarSign className="w-4 h-4" /> {t(lang, 'btn_in_favor_client')}
                  </button>
                  <button 
                    onClick={() => handleResolve('provider')}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
                  >
                    <CheckCircle className="w-4 h-4" /> {t(lang, 'btn_in_favor_provider')}
                  </button>
                </div>
                <button 
                  onClick={() => handleResolve('reject')}
                  className="w-full mt-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <Ban className="w-4 h-4" /> {t(lang, 'btn_reject_dispute')}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Список диспутов */
          <div className="space-y-4 relative z-10">
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setActiveTab('open')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'open' 
                  ? 'bg-red-500/20 border-red-500/50 text-white shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                  : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                Открытые ({disputes.length})
              </button>
              <button 
                onClick={() => setActiveTab('closed')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  activeTab === 'closed' 
                  ? 'bg-white/20 border-white/40 text-white' 
                  : 'bg-white/5 border-white/10 text-gray-500'
                }`}
              >
                Закрытые
              </button>
            </div>

            {disputes.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <CheckCircle className="w-8 h-8 text-[#00F2FE]" />
                </div>
                <h3 className="text-white font-bold">Все диспуты разобраны</h3>
                <p className="text-gray-500 text-xs mt-2">Отличная работа!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <div 
                    key={dispute.id} 
                    onClick={() => setSelectedDispute(dispute)}
                    className="glass-panel p-4 border-white/10 rounded-2xl cursor-pointer hover:border-red-500/50 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[10px] font-black uppercase">
                          {dispute.id}
                        </span>
                        <span className="text-[10px] text-gray-500">{dispute.date}</span>
                      </div>
                      <span className="text-xs font-black text-[#00F2FE]">${dispute.price}</span>
                    </div>
                    
                    <div className="text-sm font-bold text-white mb-1">
                      {dispute.client} <span className="text-gray-600 mx-1">→</span> <span className="text-cyan-400">{dispute.provider}</span>
                    </div>
                    <div className="text-xs text-gray-400 mb-3 truncate">
                      {dispute.service}
                    </div>

                    <div className="text-[11px] text-gray-300 italic border-l-2 border-red-500/30 pl-2 line-clamp-2">
                      «{dispute.reason}»
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
