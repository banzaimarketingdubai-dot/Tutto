import React, { useState } from 'react'
import { Plus, X, Image as ImageIcon } from 'lucide-react'
import { OfferInstance } from '../types'
import { OfferCard } from './OfferCard'
import { MOCK_OFFER_INSTANCES } from '../data/mockData'
import { triggerHapticFeedback, triggerNotificationFeedback } from '../lib/telegram'

export const OfferInstancesManager: React.FC = () => {
  const [instances, setInstances] = useState<OfferInstance[]>(MOCK_OFFER_INSTANCES)
  const [isCreating, setIsCreating] = useState(false)
  
  // New Offer State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Аренда')
  const [type, setType] = useState<'rent'|'service'|'market'>('rent')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !price) return

    triggerHapticFeedback('medium')
    triggerNotificationFeedback('success')

    const newInstance: OfferInstance = {
      id: `inst-${Date.now()}`,
      userId: 'me',
      type,
      category,
      title,
      description,
      price: Number(price),
      currency: 'USD',
      createdAt: new Date().toISOString()
    }
    
    setInstances([newInstance, ...instances])
    setIsCreating(false)
    setTitle('')
    setPrice('')
    setDescription('')
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-white text-lg">Мои Шаблоны</h3>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {isCreating && (
        <form onSubmit={handleCreate} className="bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">Новая карточка</h4>
            <button type="button" onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400 w-1/3"
            >
              <option value="rent">Прокат</option>
              <option value="service">Услуга</option>
              <option value="market">Товар</option>
            </select>
            <input
              type="text"
              placeholder="Название (напр. Скутер PCX)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Цена"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, '').replace(/^0+(?=\d)/, ''))}
              className="w-1/3 bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400"
            />
            <textarea
              placeholder="Короткое описание..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="flex-1 bg-black border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-cyan-400 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <button type="button" className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10">
              <ImageIcon className="w-4 h-4" />
              Добавить фото
            </button>
            <button type="submit" className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs py-2.5 rounded-xl transition-colors">
              Сохранить шаблон
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {instances.map(inst => (
          <OfferCard key={inst.id} offer={inst} mode="feed" />
        ))}
      </div>
    </div>
  )
}
