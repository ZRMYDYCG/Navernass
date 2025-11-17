'use client'

import { Eye, EyeOff, Lock } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { setLocked, verifyPassword } from './utils'

interface LockScreenOverlayProps {
  onUnlock: () => void
}

export function LockScreenOverlay({ onUnlock }: LockScreenOverlayProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)

  const handleUnlock = async () => {
    setError('')

    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    setIsVerifying(true)

    // 模拟验证延迟
    await new Promise(resolve => setTimeout(resolve, 300))

    if (verifyPassword(password)) {
      setLocked(false)
      setPassword('')
      setError('')

      // 触发自定义事件，通知其他组件
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('lockScreenChange'))
      }

      onUnlock()
    } else {
      setError('密码错误，请重试')
      setPassword('')
    }

    setIsVerifying(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleUnlock()
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* 毛玻璃背景 */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" />

      {/* 锁屏内容 */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white/10 dark:bg-zinc-900/10 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/20 shadow-2xl p-8">
          {/* 锁图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/10 dark:bg-zinc-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 flex items-center justify-center">
              <Lock className="w-8 h-8 text-white dark:text-gray-300" />
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-2xl font-semibold text-white dark:text-gray-100 text-center mb-2">
            屏幕已锁定
          </h2>
          <p className="text-sm text-white/80 dark:text-gray-400 text-center mb-6">
            请输入密码以解锁
          </p>

          {/* 密码输入 */}
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError('')
                }}
                placeholder="请输入密码"
                className="w-full pr-10 bg-white/10 dark:bg-zinc-800/10 border-white/20 dark:border-gray-700/20 text-white dark:text-gray-100 placeholder:text-white/50 dark:placeholder:text-gray-500 focus:border-white/40 dark:focus:border-gray-600/40"
                autoFocus
                onKeyDown={handleKeyDown}
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white/70 dark:text-gray-400 hover:text-white dark:hover:text-gray-300"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-300 dark:text-red-400 text-center">
                {error}
              </div>
            )}

            {/* 解锁按钮 */}
            <Button
              onClick={handleUnlock}
              disabled={isVerifying || !password.trim()}
              className="w-full bg-white/20 dark:bg-zinc-800/20 hover:bg-white/30 dark:hover:bg-gray-800/30 text-white dark:text-gray-100 border border-white/30 dark:border-gray-700/30 backdrop-blur-sm"
            >
              {isVerifying ? '验证中...' : '解锁'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
