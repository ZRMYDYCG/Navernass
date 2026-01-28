'use client'

interface CharacterPanelProps {
  novelId: string
}

export function CharacterPanel({ novelId }: CharacterPanelProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      角色图谱 - {novelId}
    </div>
  )
}
