'use client'

import { Moon, Sun, Type } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useThemeTransition } from '@/hooks/use-theme-transition'
import type { PublishSettings } from '../types'

interface PublishHeaderProps {
  novelTitle: string
  settings: PublishSettings
  onSettingsChange: (settings: Partial<PublishSettings>) => void
}

export function PublishHeader({
  novelTitle,
  settings,
  onSettingsChange,
}: PublishHeaderProps) {
  const { setTheme } = useThemeTransition()

  const toggleTheme = (event: React.MouseEvent) => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme, event)
    onSettingsChange({ theme: newTheme })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between max-w-5xl mx-auto px-4">
        <h1 className="text-lg font-semibold truncate">{novelTitle}</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Type className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onSettingsChange({ fontSize: 'small' })}
                className={
                  settings.fontSize === 'small' ? 'bg-accent' : ''
                }
              >
                小
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSettingsChange({ fontSize: 'medium' })}
                className={
                  settings.fontSize === 'medium' ? 'bg-accent' : ''
                }
              >
                中
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSettingsChange({ fontSize: 'large' })}
                className={
                  settings.fontSize === 'large' ? 'bg-accent' : ''
                }
              >
                大
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSettingsChange({ fontSize: 'x-large' })}
                className={
                  settings.fontSize === 'x-large' ? 'bg-accent' : ''
                }
              >
                特大
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            {settings.theme === 'light'
              ? <Moon className="h-4 w-4" />
              : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  )
}
