'use client'

import type { CharacterPanelViewMode } from '@/store/characterGraphStore'
import { Monitor, Moon, Plus, Sun, SwatchBook } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { useAuth } from '@/hooks/use-auth'
import { useThemeTransition } from '@/hooks/use-theme-transition'

const viewModes: Array<{ value: CharacterPanelViewMode, label: string }> = [
  { value: 'overview', label: '人物总览' },
  { value: 'relationship', label: '关系网' },
]

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const

interface CharacterPanelHeaderProps {
  novelId: string
  novelTitle?: string
  viewMode: CharacterPanelViewMode
  onViewModeChange: (value: CharacterPanelViewMode) => void
  onCreateCharacter: () => void
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: CharacterPanelViewMode
  onChange: (value: CharacterPanelViewMode) => void
}) {
  return (
    <SegmentedControl value={value} onValueChange={val => onChange(val as CharacterPanelViewMode)} size="sm">
      {viewModes.map(mode => (
        <SegmentedControlItem key={mode.value} value={mode.value}>
          {mode.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useThemeTransition()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        className="p-1.5 h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <SwatchBook className="w-3.5 h-3.5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-[240px] bg-popover border border-border rounded-lg shadow-lg z-50 p-3">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-foreground">Theme</h3>
            </div>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {themeOptions.map((option) => {
                const Icon = option.icon
                const isActive = theme === option.value
                return (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      setTheme(option.value, e)
                      setIsOpen(false)
                    }}
                    className={`flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-md transition-all ${
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function CharacterPanelHeader({
  novelId,
  novelTitle,
  viewMode,
  onViewModeChange,
  onCreateCharacter,
}: CharacterPanelHeaderProps) {
  const { user, profile } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || '用户'
  const avatarUrl = profile?.avatar_url

  return (
    <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4 h-[73px] relative">
      <div className="flex items-center gap-3 min-w-[160px]">
        <Image
          src="/assets/svg/logo-dark.svg"
          alt="Narraverse"
          width={28}
          height={28}
          className="dark:hidden"
        />
        <Image
          src="/assets/svg/logo-light.svg"
          alt="Narraverse"
          width={28}
          height={28}
          className="hidden dark:block"
        />
        <div className="text-sm font-semibold text-foreground truncate">
          {novelTitle ?? novelId}
        </div>
      </div>

      <div className="flex-1 flex justify-center">
        <ViewSwitcher value={viewMode} onChange={onViewModeChange} />
      </div>

      <div className="flex items-center gap-3 min-w-[160px] justify-end">
        <Button size="sm" variant="outline" onClick={onCreateCharacter}>
          <Plus className="h-4 w-4" />
          新建角色
        </Button>

        <ThemeToggle />

        <div className="relative">
          <Button
            variant="ghost"
            className="relative p-0 h-8 w-8 rounded-full"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="text-xs">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-border">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
