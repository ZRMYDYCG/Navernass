'use client'

import type { PublishSettings } from '../types'
import { Moon, Settings, Sun } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { useIsMobile } from '@/hooks/use-media-query'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import {
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS,
  LINE_HEIGHT_OPTIONS,
  READING_BG_MAP,
  READING_BG_OPTIONS,
} from '../contants'

interface ReadingSettingsProps {
  settings: PublishSettings
  onSettingsChange: (settings: Partial<PublishSettings>) => void
}

function SettingsSection({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function SettingsPanel({ settings, onSettingsChange }: ReadingSettingsProps) {
  const { setTheme } = useThemeTransition()

  const toggleTheme = (event: React.MouseEvent) => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme, event)
    onSettingsChange({ theme: newTheme })
  }

  return (
    <div className="space-y-5 p-4">
      {/* Theme toggle */}
      <SettingsSection label="主题">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="w-full justify-center gap-2"
        >
          {settings.theme === 'light'
            ? (
                <>
                  <Moon className="size-4" />
                  {' '}
                  切换深色模式
                </>
              )
            : (
                <>
                  <Sun className="size-4" />
                  {' '}
                  切换浅色模式
                </>
              )}
        </Button>
      </SettingsSection>

      {/* Font size */}
      <SettingsSection label="字号">
        <SegmentedControl
          value={settings.fontSize}
          onValueChange={v => onSettingsChange({ fontSize: v as PublishSettings['fontSize'] })}
          className="w-full"
          size="sm"
        >
          {FONT_SIZE_OPTIONS.map(opt => (
            <SegmentedControlItem key={opt.value} value={opt.value} className="flex-1" size="sm">
              {opt.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </SettingsSection>

      {/* Line height */}
      <SettingsSection label="行间距">
        <SegmentedControl
          value={settings.lineHeight}
          onValueChange={v => onSettingsChange({ lineHeight: v as PublishSettings['lineHeight'] })}
          className="w-full"
          size="sm"
        >
          {LINE_HEIGHT_OPTIONS.map(opt => (
            <SegmentedControlItem key={opt.value} value={opt.value} className="flex-1" size="sm">
              {opt.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </SettingsSection>

      {/* Font family */}
      <SettingsSection label="字体">
        <SegmentedControl
          value={settings.fontFamily}
          onValueChange={v => onSettingsChange({ fontFamily: v as PublishSettings['fontFamily'] })}
          className="w-full"
          size="sm"
        >
          {FONT_FAMILY_OPTIONS.map(opt => (
            <SegmentedControlItem key={opt.value} value={opt.value} className="flex-1" size="sm">
              {opt.label}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </SettingsSection>

      {/* Reading background */}
      <SettingsSection label="阅读背景">
        <div className="flex gap-3">
          {READING_BG_OPTIONS.map((opt) => {
            const isActive = settings.readingBg === opt.value
            const meta = READING_BG_MAP[opt.value]
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onSettingsChange({ readingBg: opt.value })}
                className="flex flex-col items-center gap-1.5 group"
              >
                <span
                  className={`size-10 rounded-full border-2 transition-colors ${meta.preview} ${
                    isActive ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  style={opt.value !== 'default' ? { backgroundColor: meta.bg } : undefined}
                />
                <span className={`text-xs ${isActive ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                  {meta.label}
                </span>
              </button>
            )
          })}
        </div>
      </SettingsSection>
    </div>
  )
}

export function ReadingSettings({ settings, onSettingsChange }: ReadingSettingsProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="size-9" aria-label="阅读设置">
            <Settings className="size-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>阅读设置</DrawerTitle>
          </DrawerHeader>
          <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="size-9" aria-label="阅读设置">
          <Settings className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="border-b px-4 py-3">
          <span className="text-sm font-semibold">阅读设置</span>
        </div>
        <SettingsPanel settings={settings} onSettingsChange={onSettingsChange} />
      </PopoverContent>
    </Popover>
  )
}
