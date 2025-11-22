'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { clearApiKey, getApiKey, saveApiKey } from '@/lib/api-key'
import { Eye, EyeOff, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const DEFAULT_USER_ID = 'default-user'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    loadApiKey()
  }, [])

  const loadApiKey = async () => {
    try {
      setIsLoading(true)
      const key = await getApiKey(DEFAULT_USER_ID)
      if (key) {
        setApiKey(key)
      }
    } catch (error) {
      console.error('加载 API Key 失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    try {
      setIsSaving(true)
      await saveApiKey(DEFAULT_USER_ID, apiKey.trim())
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleClearApiKey = async () => {
    try {
      setIsSaving(true)
      await clearApiKey(DEFAULT_USER_ID)
      setApiKey('')
    } catch (error) {
      console.error('清除失败:', error)
      alert('清除失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  if (!mounted) {
    return null
  }

  const themeOptions = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-200 dark:border-gray-800"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">API Key</h3>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-gray-100 focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim() || isSaving || isLoading}
                  className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? '保存中...' : isSaved ? '已保存' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  disabled={!apiKey || isSaving || isLoading}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  清除
                </button>
              </div>
              {isLoading ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  加载中...
                </p>
              ) : apiKey ? (
                <p className="text-xs text-green-600 dark:text-green-400">
                  ✓ API Key 已保存到云端
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  请输入您的 API Key，将安全保存到云端
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">主题</h3>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isActive = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">语言</h3>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800/50">
              <span className="text-sm text-gray-700 dark:text-gray-300">简体中文</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">默认</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
