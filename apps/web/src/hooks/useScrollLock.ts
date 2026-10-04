import { useEffect } from 'react'

let activeLocksCount = 0

export const useScrollLock = (isLocked: boolean = true) => {
  useEffect(() => {
    if (!isLocked) return

    activeLocksCount++
    if (activeLocksCount === 1) {
      document.body.style.overflow = 'hidden'
      document.documentElement.style.overflow = 'hidden'
    }

    return () => {
      activeLocksCount = Math.max(0, activeLocksCount - 1)
      if (activeLocksCount === 0) {
        document.body.style.overflow = ''
        document.documentElement.style.overflow = ''
      }
    }
  }, [isLocked])
}

