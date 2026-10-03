import React, { useState, useEffect, useRef } from 'react'
import { X, Mic, Send, Bot, Sparkles, Loader2, Check, Square, AlertTriangle, RefreshCw } from 'lucide-react'
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
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [finalCard, setFinalCard] = useState<ParsedRequest | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'model', text: 'Привет! Что вам нужно? Напишите или скажите голосом.' }])
      setFinalCard(null)
      setAiError(null)
      setInputText('')

      // Init Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        if (!recognitionRef.current) {
          recognitionRef.current = new SpeechRecognition()
          recognitionRef.current.continuous = false
          recognitionRef.current.lang = 'ru-RU'

          recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            handleUserSubmit(transcript)
          }
          recognitionRef.current.onend = () => setIsRecording(false)
          recognitionRef.current.onerror = () => setIsRecording(false)
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
    }
  }, [isOpen, initialPrompt, startVoice])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAnalyzing, finalCard, aiError])

  const toggleRecording = () => {
    triggerHapticFeedback('light')
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start()
          setIsRecording(true)
        } catch (e) {
          setIsRecording(false)
        }
      } else {
        alert('Голосовой ввод не поддерживается в вашем браузере')
      }
    }
  }

  const executeUserSubmit = async (text: string) => {
    if (!text.trim()) return
    triggerHapticFeedback('light')
    setAiError(null)
    setIsAnalyzing(true)

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
        // Fallback to deterministic parser
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

      // Send error alert to Superadmin
      sendSuperadminErrorAlert(errorDetails, err?.stack, 'AIAssistantModal executeUserSubmit')

      // Also generate immediate fallback card so user is never blocked
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050811]/90 backdrop-blur-xl animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 safe-area-top border-b border-white/10 bg-[#0A101D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-[18px] font-bold text-white leading-tight">{t(lang, 'ai_assistant_title')}</h2>
            <p className="text-[13px] text-cyan-400">{t(lang, 'ai_assistant_sub')}</p>
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
              <span>Skip ➔</span>
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
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-sm'
                : 'bg-white/10 text-gray-200 rounded-tl-sm border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}

        {isAnalyzing && (
          <div className="flex self-start max-w-[80%]">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-[14px] text-gray-400">Нейросеть анализирует запрос...</span>
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
                  className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center mr-1 transition-all ${isRecording ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-white/5 text-gray-400 hover:text-white'}`}
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
