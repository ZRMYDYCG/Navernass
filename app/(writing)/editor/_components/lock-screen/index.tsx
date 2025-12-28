'use client'

import { useEffect, useState } from 'react'
import { LockScreenOverlay } from './lock-screen-overlay'
import { isLocked, setLocked } from './utils'

interface LockScreenProps {
  children: React.ReactNode
  onLockChange?: (locked: boolean) => void
}

export function LockScreen({ children, onLockChange }: LockScreenProps) {
  const [locked, setLockedState] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  const checkLockStatus = () => {
    const shouldBeLocked = isLocked()
    setLockedState(shouldBeLocked)
    onLockChange?.(shouldBeLocked)
  }

  useEffect(() => {
    checkLockStatus()
    setIsInitialized(true)

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editor_lock_screen') {
        checkLockStatus()
      }
    }

    const handleLockChange = () => {
      checkLockStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('lockScreenChange', handleLockChange)

    const interval = setInterval(checkLockStatus, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('lockScreenChange', handleLockChange)
      clearInterval(interval)
    }
  }, [onLockChange])

  const handleUnlock = () => {
    setLocked(false)
    setLockedState(false)
    onLockChange?.(false)
    window.dispatchEvent(new Event('lockScreenChange'))
  }

  if (!isInitialized) {
    return <>{children}</>
  }

  return (
    <>
      {children}
      {locked && <LockScreenOverlay onUnlock={handleUnlock} />}
    </>
  )
}
