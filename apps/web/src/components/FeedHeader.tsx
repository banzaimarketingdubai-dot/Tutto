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
  showAiSearch = true,
  children
}) => {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Search Bar (Scrolls with page) */}
      {showAiSearch && (
        <div className="px-2 mt-2">
          <div className="w-full relative overflow-hidden group bg-white/5 backdrop-blur-xl border border-white/10 focus-within:border-[#00F2FE]/50 rounded-2xl p-2 flex flex-col transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00F2FE]/0 via-[#00F2FE]/5 to-[#00DFEA]/0 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="flex items-center gap-3 relative z-10 w-full p-2">
              <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-[#00F2FE] to-[#00DFEA] flex items-center justify-center shadow-[0_0_15px_rgba(0,242,254,0.3)]">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              
              <div className="flex-1 w-full flex flex-col justify-center">
                <input
                  type="text"
                  placeholder="Быстрый поиск с ИИ..."
                  className="w-full bg-transparent text-white font-bold text-[15px] placeholder:text-gray-400 outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = e.currentTarget.value
                      if (val.trim()) {
                        triggerHapticFeedback('heavy')
                        document.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { initialPrompt: val } }))
                        e.currentTarget.value = ''
                      }
                    }
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  triggerHapticFeedback('heavy')
                  document.dispatchEvent(new CustomEvent('open-ai-assistant', { detail: { startVoice: true } }))
                }}
                className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chips & Filters (Now normally scrolling) */}
      <div className="z-40">
        <div className="bg-black/60 backdrop-blur-xl border-y border-white/5 py-3 space-y-3 shadow-lg">

          {/* Categories Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(isActive ? null : cat.id)}
                  className={`shrink-0 rounded-full flex items-center gap-1.5 px-3.5 py-2 cursor-pointer transition-all duration-200 border ${isActive
                      ? 'bg-[#00F2FE]/20 border-[#00F2FE]/60 text-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.3)]'
                      : 'bg-white/[0.05] border-white/10 text-gray-200 hover:bg-white/[0.1] hover:border-white/20'
                    }`}
                >
                  <span className="text-[16px] leading-none">{cat.icon}</span>
                  <span className="text-[13px] font-bold tracking-wide uppercase">{cat.label}</span>
                </button>
              )
            })}
          </div>

          {/* Search & Sort Input */}
          <div className="px-2">
            <div className="w-full flex flex-col gap-2 bg-[#121824]/80 p-2.5 rounded-2xl border border-white/5">
              <div className="relative">
                <Search className="w-4 h-4 text-[#00F2FE] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Поиск по названию или описанию..."
                  className="w-full bg-[#070B12] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#00F2FE] outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-2 text-xs text-gray-400 hover:text-white"
                  >✕</button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
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
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shrink-0 transition-all ${sortBy === s.id ? 'bg-[#00F2FE] text-black shadow-[0_0_10px_rgba(0,242,254,0.4)]' : 'bg-white/5 text-gray-300 hover:bg-white/10'
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
