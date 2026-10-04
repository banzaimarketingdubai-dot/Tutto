import React, { useState, useEffect } from 'react'
import { Search, ArrowUpDown, Sparkles, Mic } from 'lucide-react'
import { triggerHapticFeedback } from '../lib/telegram'

export interface CategoryTile {
  id: string
  label: string
  icon: string
  slug: string
}

export interface SortOption {
  id: string
  label: string
}

interface FeedHeaderProps {
  categories: CategoryTile[]
  activeCategory: string | null
  onSelectCategory: (cat: string | null) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  sortBy: string
  onSortChange: (sort: any) => void
  sortOptions?: SortOption[]
  showAiSearch?: boolean
  children?: React.ReactNode
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOptions = [
    { id: 'urgent', label: '🔥 Срочные' },
    { id: 'budget', label: '💰 По бюджету' },
    { id: 'newest', label: '⏱️ Новые' }
  ],
  children
}) => {
  return (
    <div className="w-full flex flex-col gap-2 pt-1">
      {/* Chips & Filters */}
      <div className="z-40">
        <div className="bg-black/60 backdrop-blur-xl border-y border-white/5 py-2.5 space-y-2.5 shadow-lg">

          {/* Categories Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isActive ? null : cat.id)}
                  className={`shrink-0 rounded-full flex items-center gap-1.5 px-3.5 py-1.5 cursor-pointer transition-all duration-200 border ${
                    isActive
                      ? 'bg-[#00F2FE]/20 border-[#00F2FE]/60 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                      : 'bg-white/[0.05] border-white/10 text-gray-200 hover:bg-white/[0.1] hover:border-white/20'
                  }`}
                >
                  <span className="text-[15px] leading-none">{cat.icon}</span>
                  <span className="text-[12px] font-bold tracking-wide uppercase">{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Unified AI & Quick Search Module */}
          <div className="px-2">
            <div className="w-full flex flex-col gap-2 bg-[#0D121F]/90 backdrop-blur-xl p-2.5 rounded-2xl border border-[#00F2FE]/30 focus-within:border-[#00F2FE] shadow-[0_4px_25px_rgba(0,242,254,0.15)] transition-all">
              <div className="relative flex items-center gap-2">
                <div className="relative flex items-center justify-center shrink-0 pl-1">
                  <Search className="w-4 h-4 text-[#00F2FE]" />
                  <Sparkles className="w-2.5 h-2.5 text-[#CCFF00] absolute -top-1 -right-1.5 animate-pulse" />
                </div>
                
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Поиск или надиктуйте 🎤 для ИИ за секунды..."
                  className="w-full bg-transparent border-none text-xs sm:text-sm text-white font-bold placeholder:text-gray-400 focus:outline-none pr-16"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value.trim()
                      if (val) {
                        triggerHapticFeedback('heavy')
                        document.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { initialPrompt: val } }))
                      }
                    }
                  }}
                />

                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="p-1 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                      title="Очистить"
                    >
                      ✕
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      triggerHapticFeedback('heavy')
                      document.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { startVoice: true } }))
                    }}
                    title="Запустить ИИ-Ассистент голосом"
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00F2FE]/25 to-[#CCFF00]/25 hover:from-[#00F2FE]/40 hover:to-[#CCFF00]/40 border border-[#00F2FE]/50 text-[#00F2FE] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.3)] hover:scale-105 active:scale-95 shrink-0"
                  >
                    <Mic className="w-4 h-4 text-[#00F2FE] stroke-[2.5] animate-pulse" />
                  </button>
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs pt-1 border-t border-white/5">
                <span className="text-[10px] font-bold text-gray-400 uppercase mr-1 flex items-center gap-1 shrink-0">
                  <ArrowUpDown className="w-3 h-3 text-[#00F2FE]" /> Сорт:
                </span>
                {sortOptions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      triggerHapticFeedback('light')
                      onSortChange(s.id as any)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 transition-all ${
                      sortBy === s.id 
                        ? 'bg-[#00F2FE] text-black shadow-[0_0_10px_rgba(0,242,254,0.4)]' 
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {children && (
            <div className="px-2 pb-1">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
