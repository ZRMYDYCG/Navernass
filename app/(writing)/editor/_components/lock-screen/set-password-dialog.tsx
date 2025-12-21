'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (password: string) => void
  isSetting: boolean
}

export function SetPasswordDialog({
  open,
  onOpenChange,
  onConfirm,
  isSetting,
}: SetPasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = () => {
    setError('')

    if (!password.trim()) {
      setError('请输入密码')
      return
    }

    if (password.length < 4) {
      setError('密码长度至少为4位')
      return
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    onConfirm(password)
    setPassword('')
    setConfirmPassword('')
    setError('')
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setPassword('')
      setConfirmPassword('')
      setError('')
    }
    onOpenChange(newOpen)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleConfirm()
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-in fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] animate-in fade-in-0 zoom-in-95">
          <div className="bg-background rounded-xl shadow-xl border border-border p-6">
            <Dialog.Title className="text-lg font-medium text-foreground mb-6">
              设置锁屏密码
            </Dialog.Title>

            <div className="space-y-5">
              {/* 密码输入 */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                  密码
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="输入密码（至少4位）"
                    className="w-full h-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 rounded-lg transition-all"
                    autoFocus
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 确认密码输入 */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 ml-1">
                  确认密码
                  {' '}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                    }}
                    placeholder="再次输入密码"
                    className="w-full h-10 pr-10 bg-background border-border text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-0 rounded-lg transition-all"
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 错误提示 */}
              {error && (
                <div className="text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                  {error}
                </div>
              )}
            </div>

            {/* 按钮组 */}
            <div className="flex gap-3 mt-8">
              <Dialog.Close asChild>
                <Button
                  type="button"
                  className="flex-1 h-10 bg-secondary text-foreground hover:bg-accent border border-border rounded-lg"
                  disabled={isSetting}
                >
                  取消
                </Button>
              </Dialog.Close>
              <Button
                onClick={handleConfirm}
                className="flex-1 h-10 bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm"
                disabled={isSetting || !password.trim() || !confirmPassword.trim()}
              >
                {isSetting ? '设置中...' : '确定'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
