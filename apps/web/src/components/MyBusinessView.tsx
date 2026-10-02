import React, { useState } from 'react'
import { ChevronLeft, Edit3, Image as ImageIcon, Briefcase, Store, Check, Plus, AlertCircle, Clock } from 'lucide-react'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'
import { UserStorefrontScroller } from './UserStorefrontScroller'
import { MOCK_OFFER_INSTANCES } from '../data/mockData'
import { OfferInstance } from '../types'
import { X, LayoutTemplate, Upload } from 'lucide-react'
import { useScrollLock } from '../hooks/useScrollLock'

interface MyBusinessViewProps {
  onBack: () => void
  bizCard: any
}

export const MyBusinessView: React.FC<MyBusinessViewProps> = ({ onBack, bizCard }) => {
  // Store Profile State
  const [storeType, setStoreType] = useState('rent')
  const [storeName, setStoreName] = useState(bizCard.companyName || 'Store Name')
  const [storeDesc, setStoreDesc] = useState(bizCard.description || '')
  const [isSaved, setIsSaved] = useState(false)

  // Store Cards State
  const [instances, setInstances] = useState<OfferInstance[]>(MOCK_OFFER_INSTANCES)
  const [editingInstance, setEditingInstance] = useState<OfferInstance | null>(null)

  useScrollLock(!!editingInstance)

  const handleSaveProfile = () => {
    setIsSaved(true)
    triggerHapticFeedback('heavy')
    triggerNotificationFeedback('success')
    setTimeout(() => setIsSaved(false), 2000)
  }

  const handleEditInstance = (instance: OfferInstance) => {
    setEditingInstance(instance)
  }

  const handleAddInstance = () => {
    const newInst: OfferInstance = {
      id: `inst-${Date.now()}`,
      userId: 'usr-1',
      type: storeType as any,
      category: 'cat-bikes',
      title: 'Новая карточка',
      description: '',
      price: 0,
      currency: 'USD',
      createdAt: new Date().toISOString()
    }
    setEditingInstance(newInst)
  }

  const handleSaveInstance = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInstance) return
    const exists = instances.find(i => i.id === editingInstance.id)
    if (exists) {
      setInstances((prev) => prev.map((inst) => (inst.id === editingInstance.id ? editingInstance : inst)))
    } else {
      setInstances((prev) => [editingInstance, ...prev])
    }
    setEditingInstance(null)
    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')
  }

  const handleDeleteInstance = () => {
    if (!editingInstance) return
    setInstances((prev) => prev.filter(i => i.id !== editingInstance.id))
    setEditingInstance(null)
    triggerHapticFeedback('heavy')
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

      {/* Store Profile Form */}
      <div className="glass-card p-5 border-cyan-400/30 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Store className="w-5 h-5 text-cyan-400" />
          <div>
            <h4 className="font-display font-bold text-sm text-white">Профиль магазина</h4>
            <p className="text-[11px] text-gray-400">Настройки вашей витрины</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-400 font-medium text-xs mb-1.5">Тип бизнеса:</label>
            <div className="flex gap-2">
              {['rent', 'services', 'goods'].map((type) => (
                <button
                  key={type}
                  onClick={() => setStoreType(type)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-colors ${
                    storeType === type
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-gray-400'
                  }`}
                >
                  {type === 'rent' ? 'Аренда' : type === 'services' ? 'Услуги' : 'Товары'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 font-medium text-xs mb-1.5">Название:</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-gray-400 font-medium text-xs mb-1.5">Описание:</label>
            <textarea
              rows={3}
              value={storeDesc}
              onChange={(e) => setStoreDesc(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4 text-black" />
                <span>Сохранено!</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4 text-black" />
                <span>Сохранить профиль</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Store Cards (Instances) */}
      <div className="glass-card pt-5 pb-2 border-amber-400/30 overflow-hidden relative">
        <div className="flex items-center justify-between px-5 mb-1">
           <h4 className="font-display font-bold text-sm text-white flex items-center gap-2">
             <LayoutTemplate className="w-4 h-4 text-amber-400" />
             Моя Витрина
           </h4>
           <button 
             onClick={() => {
               triggerHapticFeedback('light')
               handleAddInstance()
             }}
             className="w-7 h-7 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/40 hover:bg-amber-400 hover:text-black transition-colors"
           >
             <Plus className="w-4 h-4" />
           </button>
        </div>
        <UserStorefrontScroller instances={instances} onEditInstance={handleEditInstance} />
      </div>

      {/* Transactions History */}
      <div className="glass-card p-5 border-white/10 space-y-4">
        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <h4 className="font-display font-bold text-sm text-white">История транзакций</h4>
            <p className="text-[11px] text-gray-400">Сделки по вашим карточкам</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Mock Transactions */}
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
               <div className="text-white font-bold text-xs">Yamaha NMAX 2024 White</div>
               <div className="text-gray-400 text-[10px]">Александр • Вчера, 14:30</div>
            </div>
            <div className="text-[#CCFF00] font-black text-xs">
              + $350
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
            <div>
               <div className="text-white font-bold text-xs">Тайский массаж на вилле</div>
               <div className="text-gray-400 text-[10px]">Елена • 3 дня назад</div>
            </div>
            <div className="text-[#CCFF00] font-black text-xs">
              + $120
            </div>
          </div>
        </div>
      </div>

      {/* Edit Instance Modal */}
      {editingInstance && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-[#0D1117] border border-[#00F2FE]/40 rounded-3xl p-5 shadow-2xl relative text-white space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#00F2FE]" />
                <h3 className="font-extrabold text-base text-white">Редактирование карточки</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingInstance(null)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveInstance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Название</label>
                <input
                  type="text"
                  value={editingInstance.title}
                  onChange={(e) => setEditingInstance({ ...editingInstance, title: e.target.value })}
                  className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00F2FE]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Цена</label>
                <input
                  type="number"
                  value={editingInstance.price || 0}
                  onChange={(e) => setEditingInstance({ ...editingInstance, price: Number(e.target.value) })}
                  className="w-full bg-[#070B12] border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#00F2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">Описание</label>
                <textarea
                  rows={3}
                  value={editingInstance.description || ''}
                  onChange={(e) => setEditingInstance({ ...editingInstance, description: e.target.value })}
                  className="w-full bg-[#070B12] border border-white/15 rounded-xl p-3 text-xs text-white outline-none focus:border-[#00F2FE] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">Изображение (Загрузка)</label>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const url = URL.createObjectURL(e.target.files[0])
                        setEditingInstance({ ...editingInstance, imageUrl: url })
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="w-full h-24 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center bg-white/5 group-hover:bg-white/10 group-hover:border-[#00F2FE]/50 transition-all overflow-hidden relative">
                    {editingInstance.imageUrl ? (
                      <img src={editingInstance.imageUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mb-1" />
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Загрузить фото</span>
                      </>
                    )}
                    {editingInstance.imageUrl && (
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white mb-1" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-wider">Изменить фото</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInstance(null)}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDeleteInstance}
                  className="py-3 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs transition-colors cursor-pointer"
                  title="Удалить карточку"
                >
                  Удалить
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#00DFEA] text-black font-extrabold text-xs shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer"
                >
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
