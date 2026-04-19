'use client'

import type { PublishSettings } from '../types'
import { ReadingSettings } from './reading-settings'

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
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between max-w-5xl mx-auto px-4">
        <h1 className="text-lg font-semibold truncate">{novelTitle}</h1>

        <div className="flex items-center gap-2">
          <ReadingSettings settings={settings} onSettingsChange={onSettingsChange} />
        </div>
      </div>
    </header>
  )
}
