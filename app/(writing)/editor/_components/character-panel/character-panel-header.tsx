'use client'

import type { CharacterPanelViewMode } from '@/store'
import { Plus } from 'lucide-react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'

const viewModes: Array<{ value: CharacterPanelViewMode, label: string }> = [
  { value: 'overview', label: '关系总览' },
  { value: 'relationship', label: '关系网' },
  { value: 'castingPool', label: '选角池' },
]

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

export function CharacterPanelHeader({
  novelId,
  novelTitle,
  viewMode,
  onViewModeChange,
  onCreateCharacter,
}: CharacterPanelHeaderProps) {
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
        <div className="text-sm font-medium text-muted-foreground truncate flex items-center gap-1">
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
      </div>
    </div>
  )
}
