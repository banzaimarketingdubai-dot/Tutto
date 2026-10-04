import React, { useState } from 'react'
import { X, MapPin, Search, ChevronRight } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'
import { useScrollLock } from '../hooks/useScrollLock'

interface LocationSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  currentHub: string
  currentDistrict: string
  onSelect: (hub: string, district: string) => void
}

const HUBS = [
  { id: 'bali', name: 'Бали', districts: ['Canggu', 'Ubud', 'Seminyak', 'Kuta', 'Uluwatu', 'Jimbaran', 'Nusa Dua', 'Sanur', 'Amed', 'Lovina'] },
  { id: 'phuket', name: 'Пхукет', districts: ['Patong', 'Rawai', 'Kata', 'Karon', 'Chalong', 'Bang Tao', 'Kamala', 'Surin'] },
  { id: 'dubai', name: 'Дубай', districts: ['Marina', 'Downtown', 'Business Bay', 'Palm Jumeirah', 'JLT', 'Deira'] },
  { id: 'samui', name: 'Самуи', districts: ['Chaweng', 'Lamai', 'Bophut', 'Maenam', 'Fisherman Village'] }
]

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentHub,
  currentDistrict,
  onSelect
}) => {
  useScrollLock(isOpen)

  const [step, setStep] = useState<1 | 2>(1)

  const [selectedHub, setSelectedHub] = useState<string>(currentHub)
  const [isOther, setIsOther] = useState(false)
  const [customDistrict, setCustomDistrict] = useState('')
  const [search, setSearch] = useState('')

  if (!isOpen) return null

  const activeHubObj = HUBS.find(h => h.id === selectedHub) || HUBS[0]
  const filteredDistricts = activeHubObj.districts.filter(d => d.toLowerCase().includes(search.toLowerCase()))

  const handleSelectHub = (hubId: string) => {
    triggerHapticFeedback('light')
    setSelectedHub(hubId)
    setStep(2)
    setSearch('')
    setIsOther(false)
  }

  const handleSelectDistrict = (district: string) => {
    triggerHapticFeedback('medium')
    onSelect(selectedHub, district)
    onClose()
    // Reset state after closing
    setTimeout(() => {
      setStep(1)
      setIsOther(false)
      setCustomDistrict('')
    }, 300)
  }

  const handleCustomDistrictSubmit = () => {
    if (customDistrict.trim()) {
      handleSelectDistrict(customDistrict.trim())
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end overscroll-contain">
      <div className="absolute inset-0 bg-[#050811]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#0D1117] w-full rounded-t-3xl border-t border-cyan-900/40 p-4 pb-8 flex flex-col gap-4 relative z-10 animate-slideUp max-h-[85dvh] overscroll-contain">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[18px] font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            {step === 1 ? 'Выберите регион (Geo 1)' : 'Выберите район (Geo 2)'}
          </h2>
          <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-2 overflow-y-auto">
            {HUBS.map(hub => (
              <button
                key={hub.id}
                onClick={() => handleSelectHub(hub.id)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                  hub.id === currentHub 
                    ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(0,242,254,0.15)]' 
                    : 'bg-[#161B22] border-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-[16px] font-bold text-white">{hub.name}</span>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3 overflow-y-auto min-h-[300px]">
            <button 
              onClick={() => { setStep(1); triggerHapticFeedback('light') }}
              className="text-[13px] text-cyan-400 font-semibold self-start mb-2 flex items-center"
            >
              ← Назад к регионам ({activeHubObj.name})
            </button>

            <div className="bg-[#161B22] border border-white/10 rounded-xl flex items-center px-3 py-2">
              <Search className="w-4 h-4 text-gray-500 mr-2" />
              <input 
                type="text" 
                placeholder="Поиск района..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-[14px] text-white outline-none flex-1 placeholder:text-gray-600"
              />
            </div>

            <div className="flex flex-col gap-2 flex-1 overflow-y-auto mt-2">
              {filteredDistricts.map(dist => (
                <button
                  key={dist}
                  onClick={() => handleSelectDistrict(dist)}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${
                    dist === currentDistrict && selectedHub === currentHub
                      ? 'bg-cyan-900/20 border-cyan-500/50' 
                      : 'bg-[#161B22] border-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-[15px] font-medium text-white">{dist}</span>
                </button>
              ))}

              {/* OTHER OPTION */}
              {!isOther ? (
                <button
                  onClick={() => { setIsOther(true); triggerHapticFeedback('light') }}
                  className="flex items-center justify-between p-4 rounded-2xl border bg-[#161B22] border-dashed border-gray-600 hover:border-cyan-500/50 mt-2"
                >
                  <span className="text-[15px] font-medium text-cyan-400">Иное (Указать свой)</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl border border-cyan-500/50 bg-cyan-900/10 mt-2 flex flex-col gap-3 animate-fadeIn">
                  <span className="text-[13px] text-gray-400">Введите название вашего района:</span>
                  <input
                    type="text"
                    autoFocus
                    value={customDistrict}
                    onChange={e => setCustomDistrict(e.target.value)}
                    className="bg-[#050811] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500 transition-colors"
                    placeholder="Например: Chaweng Noi"
                  />
                  <button 
                    onClick={handleCustomDistrictSubmit}
                    disabled={!customDistrict.trim()}
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-bold py-3 rounded-xl disabled:opacity-50 disabled:grayscale transition-all"
                  >
                    Подтвердить
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
