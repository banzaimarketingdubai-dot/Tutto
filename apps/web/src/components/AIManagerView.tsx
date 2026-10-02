import React, { useState } from 'react'
import { Bot, Sparkles, Check, Zap, ChevronLeft, MessageSquare } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

interface AIManagerViewProps {
  onBack: () => void
}

export const AIManagerView: React.FC<AIManagerViewProps> = ({ onBack }) => {
  const [aiEnabled, setAiEnabled] = useState(true)
  const [knowledgeBaseText, setKnowledgeBaseText] = useState(
    'Прайс: Тойота Фортунер — 1500 THB/сут. Хонда Клик — 300 THB/сут. Залог: Паспорт или 200$. Бесплатная доставка по Раваи и Найхарну при аренде от 7 дней. Страховка включена.'
  )
  const [minBudget, setMinBudget] = useState(25)
  const [isSaved, setIsSaved] = useState(false)
  const [interviewMessages, setInterviewMessages] = useState([
    { sender: 'agent', text: 'Привет! Я ваш ИИ-менеджер. Какие у нас правила возврата?' }
  ])
  const [replyText, setReplyText] = useState('')

  const handleToggleAi = () => {
    setAiEnabled(!aiEnabled)
    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')
  }

  const handleSaveAiSettings = () => {
    setIsSaved(true)
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setTimeout(() => setIsSaved(false), 2500)
  }

  const handleSendReply = () => {
    if (!replyText.trim()) return
    triggerHapticFeedback('light')
    const userMsg = { sender: 'user', text: replyText }
    const botMsg = { sender: 'agent', text: 'Отлично, я добавил это в базу знаний! Есть ли скидки на долгий срок?' }
    setInterviewMessages((prev) => [...prev, userMsg, botMsg])
    setKnowledgeBaseText((prev) => prev + '\n' + replyText)
    setReplyText('')
  }

  return (
    <div className="space-y-5 pb-20 animate-fadeIn text-xs relative">
      <button
        onClick={() => {
          triggerHapticFeedback('light')
          onBack()
        }}
        className="flex items-center gap-2 text-cyan-400 font-bold mb-4"
      >
        <ChevronLeft className="w-5 h-5" />
        Назад в профиль
      </button>

      {/* AI Sales Agent Status Card */}
      <div className="glass-card p-5 relative overflow-hidden border-purple-500/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 p-0.5 shadow-lg shadow-purple-500/30">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base text-white">AI Sales Agent</h3>
                <span className="badge-ai px-2 py-0.5 rounded-full text-[10px] font-bold">24/7 Autopilot</span>
              </div>
              <p className="text-gray-400 text-xs mt-0.5">
                Авто-отклики на новые целевые заказы за 3-5 секунд
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleAi}
            className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center cursor-pointer ${
              aiEnabled ? 'bg-cyan-400 justify-end' : 'bg-white/10 justify-start'
            }`}
          >
            <div className={`w-5 h-5 rounded-full shadow-md ${aiEnabled ? 'bg-black' : 'bg-gray-400'}`} />
          </button>
        </div>

        {/* AI Stats Row */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-cyan-400 font-extrabold text-sm">3.4 сек</div>
            <div className="text-[10px] text-gray-400">Ср. скорость отклика</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-purple-400 font-extrabold text-sm">84%</div>
            <div className="text-[10px] text-gray-400">Конверсия в чат</div>
          </div>
          <div className="bg-white/5 p-2 rounded-xl">
            <div className="text-amber-400 font-extrabold text-sm">142</div>
            <div className="text-[10px] text-gray-400">Сделок проведено</div>
          </div>
        </div>
      </div>

      {/* AI Interview */}
      <div className="glass-card p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <div>
            <h4 className="font-display font-bold text-sm text-white">Интервью с ИИ-агентом</h4>
            <p className="text-[11px] text-gray-400">Обучите агента, отвечая на его вопросы</p>
          </div>
        </div>

        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 no-scrollbar">
          {interviewMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl ${msg.sender === 'user' ? 'bg-cyan-900/40 border border-cyan-500/30 text-white' : 'bg-purple-900/40 border border-purple-500/30 text-gray-200'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Ваш ответ..."
            className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleSendReply}
            className="px-4 py-2 rounded-xl bg-cyan-400 text-black font-extrabold"
          >
            Ответить
          </button>
        </div>
      </div>

      {/* AI Knowledge Base (RAG) & Auto-Bid Settings */}
      <div className="glass-card p-5 border-cyan-500/30 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <div>
              <h4 className="font-display font-bold text-sm text-white">База знаний ИИ-продавца (RAG)</h4>
              <p className="text-[11px] text-gray-400">ИИ консультирует клиентов строго по вашим правилам</p>
            </div>
          </div>
        </div>

        {/* Text Area for RAG Prompt */}
        <div>
          <label className="block text-gray-300 font-medium text-xs mb-1">
            Инструкции и Прайс-лист для ИИ:
          </label>
          <textarea
            value={knowledgeBaseText}
            onChange={(e) => setKnowledgeBaseText(e.target.value)}
            rows={4}
            placeholder="Введите ваши цены, условия аренды, районы доставки, правила залога..."
            className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-gray-200 text-xs focus:border-cyan-400 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* Min Budget Threshold Slider */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-gray-300 font-medium text-xs flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Минимальный бюджет заказа для авто-отклика:</span>
            </label>
            <span className="font-extrabold text-cyan-400 text-sm bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-500/30">
              ${minBudget} USD
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="300"
            step="5"
            value={minBudget}
            onChange={(e) => setMinBudget(Number(e.target.value))}
            className="w-full accent-cyan-400 bg-white/10 rounded-lg h-2 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>$5 (все подряд)</span>
            <span>$150 (средние)</span>
            <span>$300 (только крупные)</span>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          onClick={handleSaveAiSettings}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4 text-black" />
              <span>Настройки ИИ успешно сохранены!</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              <span>Сохранить настройки ИИ-менеджера</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
