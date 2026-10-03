import React, { useState, useEffect, useRef } from 'react'
import { X, Mic, Send, Bot, Sparkles, Loader2, Check, Square, AlertTriangle, RefreshCw, Volume2, Radio } from 'lucide-react'
import { analyzeRequestFlowWithAI, parseDeterministicRequest, ParsedRequest } from '../lib/gemini'
import { triggerHapticFeedback, triggerNotificationFeedback, sendSuperadminErrorAlert } from '../lib/telegram'
import { Language, detectDefaultLanguage, t } from '../lib/i18n'

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
  const lang = currentLang || detectDefaultLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [liveTranscript, setLiveTranscript] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [finalCard, setFinalCard] = useState<ParsedRequest | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

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
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050811]/95 backdrop-blur-2xl animate-fadeIn font-sans">
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
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

        {/* Final Card Output */}
        {finalCard && (
          <div className="flex flex-col gap-3 mt-2 animate-slideUp">
            <div className="p-5 rounded-3xl bg-cyan-900/20 border border-cyan-500/40 shadow-[0_0_30px_rgba(0,242,254,0.15)]">
              <div className="flex items-center gap-2 mb-3 text-cyan-300 font-bold text-[13px] uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Карточка запроса готовая к публикации
              </div>
              <h3 className="text-[18px] font-black text-white mb-2">{finalCard.title}</h3>
              <p className="text-[14px] text-gray-300 mb-4 leading-relaxed">{finalCard.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[13px] text-white font-bold">💰 ${finalCard.budget || 'По договоренности'}</span>
                <span className="px-3 py-1.5 bg-white/10 rounded-xl text-[13px] text-white font-bold">📍 {finalCard.district || currentDistrict}</span>
                <span className="px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-xl text-[13px] font-bold border border-cyan-500/30">📂 {finalCard.categoryName}</span>
              </div>

              <button 
                onClick={() => { triggerHapticFeedback('heavy'); triggerNotificationFeedback('success'); onPublish(finalCard); onClose() }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-[16px] rounded-xl flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Check className="w-5 h-5" />
                Опубликовать заявку сейчас
              </button>
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
