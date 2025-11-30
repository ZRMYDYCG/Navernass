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
      <div className="absolute inset-0 bg-[#FAF9F6]/95 dark:bg-zinc-950/95 backdrop-blur-xl" />

      {/* 锁屏内容 */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-stone-200/50 dark:border-zinc-800 p-8">
          {/* 锁图标 */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center shadow-inner">
              <Lock className="w-7 h-7 text-stone-400 dark:text-zinc-500" />
            </div>
          </div>

          {/* 标题 */}
          <h2 className="text-xl font-medium text-[#333333] dark:text-zinc-100 text-center mb-2">
            屏幕已锁定
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 text-center mb-8">
            请输入密码以继续创作
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
                placeholder="输入密码"
                className="w-full h-11 pr-10 bg-stone-50 dark:bg-zinc-800/50 border-stone-200 dark:border-zinc-700 text-[#333333] dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:border-stone-400 dark:focus:border-zinc-500 focus:ring-0 rounded-xl transition-all"
                autoFocus
                onKeyDown={handleKeyDown}
                disabled={isVerifying}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 transition-colors"
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-500 dark:text-red-400 text-center animate-in fade-in slide-in-from-top-1">
                {error}
              </div>
            )}

            {/* 解锁按钮 */}
            <Button
              onClick={handleUnlock}
              disabled={isVerifying || !password.trim()}
              className="w-full h-11 bg-[#333333] dark:bg-zinc-100 hover:bg-black dark:hover:bg-white text-white dark:text-zinc-900 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none"
            >
              {isVerifying ? '验证中...' : '解锁'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
