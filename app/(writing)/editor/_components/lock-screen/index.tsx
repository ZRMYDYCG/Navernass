'use client'

/**
 * 锁屏功能主组件
 * 负责管理锁屏状态和显示锁屏覆盖层
 */

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

  // 检查锁屏状态的函数
  const checkLockStatus = () => {
    const shouldBeLocked = isLocked()
    setLockedState(shouldBeLocked)
    onLockChange?.(shouldBeLocked)
  }

  // 初始化：检查是否处于锁屏状态
  useEffect(() => {
    checkLockStatus()
    setIsInitialized(true)

    // 监听 storage 变化（跨标签页同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'editor_lock_screen') {
        checkLockStatus()
      }
    }

    // 使用自定义事件监听同标签页内的锁屏状态变化
    const handleLockChange = () => {
      checkLockStatus()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('lockScreenChange', handleLockChange)

    // 定期检查锁屏状态（用于处理直接修改 localStorage 的情况）
    const interval = setInterval(checkLockStatus, 500)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('lockScreenChange', handleLockChange)
      clearInterval(interval)
    }
  }, [onLockChange])

  // 解锁屏幕
  const handleUnlock = () => {
    setLocked(false) // 清除 localStorage 中的锁屏状态
    setLockedState(false) // 更新组件状态
    onLockChange?.(false)

    // 触发自定义事件，通知其他组件
    window.dispatchEvent(new Event('lockScreenChange'))
  }

  // 如果还未初始化，不显示任何内容
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
