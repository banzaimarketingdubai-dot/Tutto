import React, { useState, useEffect, useRef } from 'react'
import { X, Mic, Send, Bot, Sparkles, Loader2, Check, Square, AlertTriangle, RefreshCw, Volume2, Radio, Edit3 } from 'lucide-react'
import { analyzeRequestFlowWithAI, parseDeterministicRequest, ParsedRequest } from '../lib/gemini'
import { triggerHapticFeedback, triggerNotificationFeedback, sendSuperadminErrorAlert } from '../lib/telegram'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'
import { useScrollLock } from '../hooks/useScrollLock'

interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (request: any) => void
  currentHub: string
  currentDistrict: string
  currentLang?: Language
  onSkipToManual?: () => void
  initialPrompt?: string
  startVoice?: boolean
}

type Message = { role: 'user' | 'model'; text: string }

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onPublish,
  currentHub,
  currentDistrict,
  currentLang,
  onSkipToManual,
  initialPrompt,
  startVoice,
}) => {
  useScrollLock(isOpen)
  const lang = currentLang || detectDefaultLanguage()

  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [finalCard, setFinalCard] = useState<ParsedRequest | null>(null)
  const [isEditingCard, setIsEditingCard] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)

  const updateFinalCard = (field: keyof ParsedRequest, value: any) => {
    setFinalCard(prev => prev ? { ...prev, [field]: value } : null)
  }

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'model', text: 'Привет! Что вам нужно? Напишите текстом или надиктуйте голосом.' }])
      setFinalCard(null)
      setAiError(null)
      setInputText('')
      setLiveTranscript('')

      // Init Speech Recognition with interimResults for live audio transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        if (!recognitionRef.current) {
          try {
            const recog = new SpeechRecognition()
            recog.continuous = true
            recog.interimResults = true
            recog.lang = 'ru-RU'

            recog.onresult = (event: any) => {
              let currentText = ''
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                currentText += event.results[i][0].transcript
              }
              if (currentText) {
                setLiveTranscript(currentText)
                setInputText(currentText)
              }
            }

            recog.onend = () => {
              setIsRecording(false)
            }
            recog.onerror = (err: any) => {
              console.warn('Speech Recognition error:', err)
              setIsRecording(false)
            }

            recognitionRef.current = recog
          } catch (e) {
            console.warn('SpeechRecognition initialization error:', e)
          }
        }
      }

      if (initialPrompt && initialPrompt.trim()) {
        setTimeout(() => {
          handleUserSubmit(initialPrompt)
        }, 300)
      } else if (startVoice && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current.start()
            setIsRecording(true)
          } catch (e) {
            console.warn(e)
          }
        }, 300)
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      setIsRecording(false)
      setLiveTranscript('')
    }
  }, [isOpen, initialPrompt, startVoice])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAnalyzing, finalCard, aiError, liveTranscript])

  const toggleRecording = () => {
    triggerHapticFeedback('heavy')
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      setIsRecording(false)
      if (inputText.trim()) {
        handleUserSubmit(inputText)
      }
    } else {
      if (recognitionRef.current) {
        try {
          setInputText('')
          setLiveTranscript('')
          recognitionRef.current.start()
          setIsRecording(true)
          triggerNotificationFeedback('success')
        } catch (e) {
          setIsRecording(false)
          alert('Не удалось запустить микрофон. Попробуйте ввести текст вручную.')
        }
      } else {
        alert('Голосовой ввод не поддерживается в вашем браузере. Вы можете написать текст в чат!')
      }
    }
  }

  const executeUserSubmit = async (text: string) => {
    if (!text.trim()) return
    triggerHapticFeedback('light')
    setAiError(null)
    setIsAnalyzing(true)
    setIsRecording(false)
    setLiveTranscript('')

    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch (e) {}
    }

    const updatedHistory: Message[] = [...messages, { role: 'user', text }]
    setMessages(updatedHistory)
    setInputText('')

    try {
      const response = await analyzeRequestFlowWithAI(updatedHistory, currentHub, currentDistrict)

      if (response.status === 'clarify' && response.question) {
        setMessages(prev => [...prev, { role: 'model', text: response.question as string }])
      } else if (response.status === 'complete' && response.requestParams) {
        setFinalCard(response.requestParams)
        setMessages(prev => [...prev, { role: 'model', text: '✅ Карточка заявки сформирована! Ознакомьтесь и нажмите "Опубликовать заявку".' }])
      } else {
        const fallbackRes = parseDeterministicRequest(updatedHistory, currentHub, currentDistrict)
        if (fallbackRes.requestParams) {
          setFinalCard(fallbackRes.requestParams)
          setMessages(prev => [...prev, { role: 'model', text: '✅ Карточка заявки сформирована на основе текста!' }])
        }
      }
    } catch (err: any) {
      console.error('AI Processing Error:', err)
      const errorDetails = err?.message || 'Неизвестная ошибка ИИ API'
      setAiError(errorDetails)

      sendSuperadminErrorAlert(errorDetails, err?.stack, 'AIAssistantModal executeUserSubmit')

      const fallbackRes = parseDeterministicRequest(updatedHistory, currentHub, currentDistrict)
      if (fallbackRes.requestParams) {
        setFinalCard(fallbackRes.requestParams)
      }
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUserSubmit = (text: string) => {
    if (isAnalyzing) return
    executeUserSubmit(text)
  }

  const handleApplyFallback = () => {
    triggerHapticFeedback('medium')
    setAiError(null)
    const fallbackRes = parseDeterministicRequest(messages, currentHub, currentDistrict)
    if (fallbackRes.requestParams) {
      setFinalCard(fallbackRes.requestParams)
      setMessages(prev => [...prev, { role: 'model', text: '⚡ Карточка сформирована локальным алгоритмом.' }])
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050811]/95 backdrop-blur-2xl animate-fadeIn font-sans overscroll-contain">
      {/* Dynamic Soundwave Animations CSS inline */}
      <style>{`
        @keyframes soundwave-bar {
          0%, 100% { height: 8px; opacity: 0.5; }
          50% { height: 28px; opacity: 1; }
        }
        .animate-soundwave-1 { animation: soundwave-bar 0.6s infinite ease-in-out 0.1s; }
        .animate-soundwave-2 { animation: soundwave-bar 0.6s infinite ease-in-out 0.25s; }
        .animate-soundwave-3 { animation: soundwave-bar 0.6s infinite ease-in-out 0.4s; }
        .animate-soundwave-4 { animation: soundwave-bar 0.6s infinite ease-in-out 0.15s; }
        .animate-soundwave-5 { animation: soundwave-bar 0.6s infinite ease-in-out 0.3s; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 safe-area-top border-b border-white/10 bg-[#0A101D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white leading-tight">{t(lang, 'ai_assistant_title')}</h2>
            <p className="text-[13px] text-cyan-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Голосовой ИИ-ассистент TuttoMinutto</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onSkipToManual && (
            <button
              onClick={() => {
                triggerHapticFeedback('light')
                onClose()
                onSkipToManual()
              }}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-xs text-cyan-300 font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,254,0.2)]"
            >
              <span>Вручную ➔</span>
            </button>
          )}
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 overscroll-contain">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end' : 'self-start'}`}>
            <div className={`p-3.5 rounded-2xl text-[15px] leading-snug ${
              msg.role === 'user'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm shadow-[0_0_15px_rgba(0,242,254,0.2)]'
                : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Live Audio Visualizer Banner (When Recording) */}
        {isRecording && (
          <div className="p-4 rounded-3xl bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-cyan-500/20 border border-rose-500/40 shadow-[0_0_30px_rgba(244,63,94,0.3)] animate-fadeIn space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="font-extrabold text-xs text-rose-300 uppercase tracking-wider">Голосовой ввод активен — Запись идет...</span>
              </div>
              <div className="flex items-center gap-1.5 h-8">
                <div className="w-1 bg-[#00F2FE] rounded-full animate-soundwave-1"></div>
                <div className="w-1 bg-purple-400 rounded-full animate-soundwave-2"></div>
                <div className="w-1 bg-rose-500 rounded-full animate-soundwave-3"></div>
                <div className="w-1 bg-[#00F2FE] rounded-full animate-soundwave-4"></div>
                <div className="w-1 bg-amber-400 rounded-full animate-soundwave-5"></div>
              </div>
            </div>

            <div className="p-3 bg-black/60 rounded-2xl border border-white/10 text-white font-medium text-sm min-h-[48px] flex items-center italic">
              {liveTranscript ? (
                <span>«{liveTranscript}»</span>
              ) : (
                <span className="text-gray-400 not-italic flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-rose-400 animate-pulse" />
                  Говорите ваш запрос (например: "Нужен байк на 7 дней на Раваи")...
                </span>
              )}
            </div>

            <button
              onClick={() => {
                if (inputText.trim()) {
                  handleUserSubmit(inputText)
                } else {
                  setIsRecording(false)
                }
              }}
              className="w-full py-2.5 bg-rose-500 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(244,63,94,0.4)] hover:bg-rose-600 transition-all flex items-center justify-center gap-2"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Завершить запись и отправить</span>
            </button>
          </div>
        )}

        {/* AI Analyzing Indicator */}
        {isAnalyzing && (
          <div className="flex self-start max-w-[80%]">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 flex items-center gap-3 shadow-[0_0_20px_rgba(0,242,254,0.2)]">
              <Loader2 className="w-5 h-5 text-[#00F2FE] animate-spin" />
              <div className="text-xs">
                <div className="font-bold text-white">Нейросеть обрабатывает запрос...</div>
                <div className="text-[10px] text-cyan-400 mt-0.5">Формирование карточки с четким интентом</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {aiError && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-white space-y-3 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Отчет об ошибке ИИ API</span>
            </div>
            <p className="text-xs text-gray-300 font-mono bg-black/40 p-2 rounded-lg border border-white/5 overflow-x-auto">
              {aiError}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={handleApplyFallback}
                className="flex-1 py-2 px-3 bg-[#00F2FE] text-black font-bold text-xs rounded-xl hover:brightness-110 flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Сформировать карту (Фоллбэк)</span>
              </button>
              {onSkipToManual && (
                <button
                  onClick={() => {
                    onClose()
                    onSkipToManual()
                  }}
                  className="py-2 px-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/10"
                >
                  Заполнить вручную
                </button>
              )}
            </div>
          </div>
        )}

        {/* Final Card Output - Interactive & Editable */}
        {finalCard && (
          <div className="flex flex-col gap-3 mt-2 animate-slideUp">
            <div className="p-5 rounded-3xl bg-[#0F172A]/90 border border-cyan-500/50 shadow-[0_0_35px_rgba(0,242,254,0.2)] space-y-4">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span>Карточка запроса</span>
                </div>
                <button
                  onClick={() => {
                    triggerHapticFeedback('light')
                    setIsEditingCard(!isEditingCard)
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isEditingCard 
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,254,0.5)]' 
                      : 'bg-white/10 text-cyan-300 hover:bg-white/20 border border-white/10'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingCard ? 'Завершить редактирование' : 'Отредактировать'}</span>
                </button>
              </div>

              {isEditingCard ? (
                /* Editable Form Controls */
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Заголовок заявки
                    </label>
                    <input
                      type="text"
                      value={finalCard.title}
                      onChange={e => updateFinalCard('title', e.target.value)}
                      className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-cyan-400 outline-none transition-all shadow-[0_0_10px_rgba(0,242,254,0.1)]"
                      placeholder="Заголовок заявки..."
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Описание (Суть запроса)
                    </label>
                    <textarea
                      value={finalCard.description}
                      onChange={e => updateFinalCard('description', e.target.value)}
                      rows={3}
                      className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-gray-200 text-sm focus:border-cyan-400 outline-none transition-all resize-none shadow-[0_0_10px_rgba(0,242,254,0.1)]"
                      placeholder="Подробное описание..."
                    />
                  </div>

                  {/* Budget Selector */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                        Бюджет ($ / THB)
                      </label>
                      <span className="text-[10px] text-gray-400">0 = по договоренности</span>
                    </div>
                    <input
                      type="number"
                      value={finalCard.budget || ''}
                      onChange={e => updateFinalCard('budget', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-amber-400 font-bold text-sm focus:border-cyan-400 outline-none transition-all mb-2 font-mono"
                      placeholder="0 = по договоренности"
                    />
                    {/* Quick Budget Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {[15, 35, 100, 500, 1500].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('light')
                            updateFinalCard('budget', val)
                          }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            finalCard.budget === val
                              ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'bg-white/5 text-amber-300/80 hover:bg-white/10 border border-amber-500/20'
                          }`}
                        >
                          ${val}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          triggerHapticFeedback('light')
                          updateFinalCard('budget', 0)
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          !finalCard.budget
                            ? 'bg-amber-400 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        По договоренности
                      </button>
                    </div>
                  </div>

                  {/* District & Location Selector */}
                  <div>
                    <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                      Локация / Район
                    </label>
                    <div className="space-y-2">
                      <select
                        value={finalCard.district || currentDistrict}
                        onChange={e => updateFinalCard('district', e.target.value)}
                        className="w-full bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-white font-bold text-sm focus:border-cyan-400 outline-none transition-all cursor-pointer"
                      >
                        {['Patong', 'Rawai', 'Chalong', 'Karon', 'Kamala', 'Bang Tao', 'Cherngtalay', 'Canggu', 'Seminyak', 'Ubud', 'Nusa Dua', 'Thonglor', 'Ekkamai', 'Nha Trang Centre', 'Центр'].map(dist => (
                          <option key={dist} value={dist} className="bg-[#0D1117] text-white">
                            📍 {dist}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={finalCard.district || ''}
                        onChange={e => updateFinalCard('district', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-gray-300 focus:border-cyan-400 outline-none"
                        placeholder="Или введите свой район вручную..."
                      />
                    </div>
                  </div>

                  {/* Category Selector (13 Niche Categories) */}
                  <div>
                    <label className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block mb-1.5">
                      Ниша / Категория
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'ПРОКАТ', 'ЖИЛЬЁ', 'ДЕНЬГИ', 'УСЛУГИ', 'ЕДА', 'КЛИНИНГ',
                        'КРАСОТА', 'ДЕТИ', 'ТУРЫ', 'ВРАЧИ', 'ПРАКТИКИ', 'ТОВАРЫ', 'ДРУГОЕ'
                      ].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            triggerHapticFeedback('light')
                            updateFinalCard('categoryName', cat)
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            finalCard.categoryName === cat
                              ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,254,0.5)]'
                              : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Card Preview with Direct Click-to-Edit Pills */
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[18px] font-black text-white leading-tight">{finalCard.title}</h3>
                    <button
                      onClick={() => {
                        triggerHapticFeedback('light')
                        setIsEditingCard(true)
                      }}
                      className="p-1 text-cyan-400 hover:text-cyan-300 shrink-0 rounded-lg hover:bg-white/5 transition-colors"
                      title="Редактировать карточку"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-[14px] text-gray-300 leading-relaxed bg-black/40 p-3.5 rounded-2xl border border-white/5">
                    {finalCard.description}
                  </p>

                  {/* Clickable Quick Edit Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => {
                        triggerHapticFeedback('light')
                        setIsEditingCard(true)
                      }}
                      className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-xl text-xs font-bold border border-amber-500/20 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>💰 ${finalCard.budget || 'По договоренности'}</span>
                      <Edit3 className="w-3 h-3 text-amber-400/60" />
                    </button>
                    <button
                      onClick={() => {
                        triggerHapticFeedback('light')
                        setIsEditingCard(true)
                      }}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl text-xs font-bold border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>📍 {finalCard.district || currentDistrict}</span>
                      <Edit3 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={() => {
                        triggerHapticFeedback('light')
                        setIsEditingCard(true)
                      }}
                      className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-500/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>📂 {finalCard.categoryName}</span>
                      <Edit3 className="w-3 h-3 text-cyan-400/60" />
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm / Reset Buttons */}
              <div className="pt-2 flex flex-col gap-2 border-t border-white/10">
                <button 
                  onClick={() => {
                    triggerHapticFeedback('heavy')
                    triggerNotificationFeedback('success')
                    onPublish(finalCard)
                    onClose()
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-[16px] rounded-xl flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <Check className="w-5 h-5" />
                  <span>Подтвердить и опубликовать</span>
                </button>

                <div className="flex items-center justify-between gap-2 pt-1">
                  {!isEditingCard && (
                    <button
                      onClick={() => setIsEditingCard(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white/5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Отредактировать поля</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      triggerHapticFeedback('medium')
                      setFinalCard(null)
                    }}
                    className="text-xs text-gray-400 hover:text-rose-300 font-semibold flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white/5 ml-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Сбросить карточку</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {!finalCard && (
        <div className="p-4 bg-[#0A101D] border-t border-white/10 safe-area-bottom space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-1 flex items-center focus-within:border-cyan-500/50 transition-colors">
              <textarea
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUserSubmit(inputText) } }}
                placeholder="Напишите текст или надиктуйте голосом..."
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 max-h-[100px] outline-none resize-none"
                rows={1}
              />
              {inputText.trim() ? (
                <button onClick={() => handleUserSubmit(inputText)} className="w-10 h-10 shrink-0 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-1 hover:bg-cyan-500/30">
                  <Send className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={toggleRecording} 
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-1 transition-all ${isRecording ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-white/5 text-gray-400 hover:text-white'}`}
                  title="Включить голосовой ввод"
                >
                  {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>

          {onSkipToManual && (
            <button
              onClick={() => {
                triggerHapticFeedback('light')
                onClose()
                onSkipToManual()
              }}
              className="w-full py-2 rounded-xl text-xs text-gray-400 hover:text-cyan-300 font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span>Пропустить ИИ (заполнить вручную) ➔</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
