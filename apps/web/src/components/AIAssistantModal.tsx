import React, { useState, useEffect, useRef } from 'react'
import { X, Mic, Send, Bot, Sparkles, Loader2, Check, Square } from 'lucide-react'
import { analyzeRequestFlowWithAI, SmartAIResponse, ParsedRequest } from '../lib/gemini'
import { triggerHapticFeedback } from '../lib/telegram'
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
  
  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'model', text: 'Привет! Что вам нужно? Напишите или скажите голосом.' }])
      setFinalCard(null)
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
         // Auto submit if text was typed in the main feed
         setTimeout(() => {
            handleUserSubmit(initialPrompt)
         }, 300)
      } else if (startVoice && recognitionRef.current) {
         // Auto start recording
         setTimeout(() => {
            recognitionRef.current.start()
            setIsRecording(true)
         }, 300)
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)
    }
  }, [isOpen, initialPrompt, startVoice])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isAnalyzing])

  const toggleRecording = () => {
    triggerHapticFeedback('light')
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start()
        setIsRecording(true)
      } else {
        alert('Голосовой ввод не поддерживается в вашем браузере')
      }
    }
  }

  // Wrap logic in a separate function to easily call it
  const executeUserSubmit = async (text: string) => {
    if (!text.trim()) return
    triggerHapticFeedback('light')
    
    // Check if we are already analyzing
    setIsAnalyzing(prev => {
      if (prev) return true
      return true
    })

    const newMessages: Message[] = [...messages, { role: 'user', text }]
    
    // We update messages by using functional update to ensure no race conditions
    setMessages(prev => {
      // prevent duplicate processing for the exact same auto-prompt
      if (prev.length > 1 && prev[prev.length - 1].text === text) return prev;
      return [...prev, { role: 'user', text }]
    })
    
    setInputText('')

    try {
      // Use the newMessages variable here since state update is async
      // But we need to use the full history
      const history = [...messages, { role: 'user', text }] as Message[]
      const response = await analyzeRequestFlowWithAI(history, currentHub, currentDistrict)
      if (response.status === 'clarify' && response.question) {
        setMessages(prev => [...prev, { role: 'model', text: response.question as string }])
      } else if (response.status === 'complete' && response.requestParams) {
        setFinalCard(response.requestParams)
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: 'Произошла ошибка при анализе. Попробуйте еще раз.' }])
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleUserSubmit = (text: string) => {
    if (isAnalyzing) return
    executeUserSubmit(text)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#050811]/90 backdrop-blur-xl animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-12 safe-area-top border-b border-white/10 bg-[#0A101D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
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
              <span className="text-[14px] text-gray-400">Анализирую...</span>
            </div>
          </div>
        )}

        {finalCard && (
          <div className="flex flex-col gap-3 mt-4 animate-slideUp">
            <div className="p-4 rounded-3xl bg-cyan-900/20 border border-cyan-500/30">
              <div className="flex items-center gap-2 mb-3 text-cyan-300 font-bold text-[14px] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                Карточка готова
              </div>
              <h3 className="text-[18px] font-bold text-white mb-2">{finalCard.title}</h3>
              <p className="text-[14px] text-gray-300 mb-4">{finalCard.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[13px] text-white">💰 ${finalCard.budget || 'По договоренности'}</span>
                <span className="px-3 py-1 bg-white/10 rounded-lg text-[13px] text-white">📍 {finalCard.district}</span>
              </div>

              <button 
                onClick={() => { triggerHapticFeedback('medium'); onPublish(finalCard); onClose() }}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-black text-[16px] rounded-xl flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(0,242,254,0.3)]"
              >
                <Check className="w-5 h-5" />
                Опубликовать заявку
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
                placeholder="Текст или голос..."
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 max-h-[100px] outline-none resize-none"
                rows={1}
              />
              {inputText.trim() ? (
                <button onClick={() => handleUserSubmit(inputText)} className="w-10 h-10 shrink-0 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mr-1">
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
