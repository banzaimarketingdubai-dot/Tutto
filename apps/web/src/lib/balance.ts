import { useState, useEffect } from 'react'

const BALANCE_KEY = 'tutto_token_balance'
const BALANCE_EVENT = 'tutto_balance_changed'

export function getStoredBalance(): number {
  if (typeof window === 'undefined') return 150
  const val = localStorage.getItem(BALANCE_KEY)
  return val !== null ? parseInt(val, 10) : 150
}

export function updateStoredBalance(delta: number): number {
  const current = getStoredBalance()
  const next = Math.max(0, current + delta)
  if (typeof window !== 'undefined') {
    localStorage.setItem(BALANCE_KEY, String(next))
    window.dispatchEvent(new CustomEvent(BALANCE_EVENT, { detail: next }))
  }
  return next
}

export function useTokenBalance() {
  const [balance, setBalance] = useState<number>(getStoredBalance)

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<number>
      if (customEvent.detail !== undefined) {
        setBalance(customEvent.detail)
      }
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === BALANCE_KEY && e.newValue) {
        setBalance(parseInt(e.newValue, 10))
      }
    }

    window.addEventListener(BALANCE_EVENT, handleUpdate)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(BALANCE_EVENT, handleUpdate)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  const addTokens = (amount: number) => {
    updateStoredBalance(amount)
  }

  return [balance, addTokens] as const
}
