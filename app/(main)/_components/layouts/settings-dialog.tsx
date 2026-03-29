'use client'

import { Eye, EyeOff, Monitor, Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { useColorTheme } from '@/hooks/use-color-theme'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import { clearApiKey, getApiKey, saveApiKey } from '@/lib/api-key'

const DEFAULT_USER_ID = 'default-user'

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { theme, setTheme } = useThemeTransition()
  const { colorTheme, setColorTheme } = useColorTheme()
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    if (open) {
      loadApiKey()
    }
  }, [open])

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) return

    try {
      setIsSaving(true)
      await saveApiKey(DEFAULT_USER_ID, apiKey.trim())
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      console.error('保存失败:', error)
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
    } finally {
      setIsSaving(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: '浅色', icon: Sun },
    { value: 'dark', label: '深色', icon: Moon },
    { value: 'system', label: '跟随系统', icon: Monitor },
  ]

  const colorThemes = [
    { name: 'default', note: '基础', swatches: ['#18181B', '#52525B', '#E4E4E7'] },
    { name: 'blue', note: '冷静', swatches: ['#2563EB', '#60A5FA', '#DBEAFE'] },
    { name: 'green', note: '自然', swatches: ['#16A34A', '#4ADE80', '#DCFCE7'] },
    { name: 'orange', note: '温暖', swatches: ['#F97316', '#FB923C', '#FFEDD5'] },
    { name: 'red', note: '醒目', swatches: ['#DC2626', '#F87171', '#FEE2E2'] },
    { name: 'rose', note: '柔和', swatches: ['#E11D48', '#FB7185', '#FFE4E6'] },
    { name: 'violet', note: '偏冷', swatches: ['#7C3AED', '#A78BFA', '#EDE9FE'] },
    { name: 'yellow', note: '明快', swatches: ['#EAB308', '#FACC15', '#FEF9C3'] },
  ]

  const selectedColorTheme = colorThemes.find(item => item.name === colorTheme) || colorThemes[0]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-popover border-border"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">API Key</h3>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                  disabled={isLoading}
                  className="w-full px-3 py-2 pr-10 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  disabled={isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveApiKey}
                  disabled={!apiKey.trim() || isSaving || isLoading}
                  className="flex-1 px-3 py-1.5 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isSaving ? '保存中...' : isSaved ? '已保存' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  disabled={!apiKey || isSaving || isLoading}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border text-muted-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  清除
                </button>
              </div>
              {isLoading
                ? (
                    <p className="text-xs text-muted-foreground">
                      加载中...
                    </p>
                  )
                : apiKey
                  ? (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        ✓ API Key 已保存到云端
                      </p>
                    )
                  : (
                      <p className="text-xs text-muted-foreground">
                        请输入您的 API Key，将安全保存到云端
                      </p>
                    )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">外观</h3>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isActive = theme === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={e => setTheme(option.value, e)}
                    className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'bg-secondary border-ring text-foreground'
                        : 'border-border text-muted-foreground hover:bg-accent hover:border-ring'
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
            <h3 className="text-sm font-medium text-foreground">配色</h3>
            <Select value={colorTheme} onValueChange={setColorTheme}>
              <SelectTrigger className="h-12 rounded-xl bg-card">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex shrink-0 gap-1.5">
                    {selectedColorTheme.swatches.map((swatch, index) => (
                      <span
                        key={`${selectedColorTheme.name}-${index}`}
                        className="h-3.5 w-3.5 rounded-full border border-border/60"
                        style={{ backgroundColor: swatch }}
                      />
                    ))}
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="text-sm font-medium text-foreground">{selectedColorTheme.note}</div>
                  </div>
                </div>
              </SelectTrigger>
              <SelectContent className="z-[200] rounded-xl">
                {colorThemes.map(theme => (
                  <SelectItem key={theme.name} value={theme.name} className="py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="flex shrink-0 gap-1.5">
                        {theme.swatches.map((swatch, index) => (
                          <span
                            key={`${theme.name}-${index}`}
                            className="h-3.5 w-3.5 rounded-full border border-border/60"
                            style={{ backgroundColor: swatch }}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-foreground">{theme.note}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">语言</h3>
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border bg-secondary">
              <span className="text-sm text-foreground">简体中文</span>
              <span className="text-xs text-muted-foreground">默认</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
