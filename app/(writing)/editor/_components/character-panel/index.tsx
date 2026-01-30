'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SegmentedControl, SegmentedControlItem } from '@/components/ui/segmented-control'
import { cn } from '@/lib/utils'
import { useCharacterGraphStore } from '@/store/characterGraphStore'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'
import { CharacterModal } from './character-modal'
import { CharacterOverviewGraph } from './character-overview-graph'
import { RelationshipGraph } from './relationship-graph'
import { RelationshipModal } from './relationship-modal'

type CharacterViewMode = 'overview' | 'relationship'

const viewModes: Array<{ value: CharacterViewMode, label: string }> = [
  { value: 'overview', label: '人物总览' },
  { value: 'relationship', label: '关系网' },
]

interface CharacterPanelProps {
  novelId: string
  novelTitle?: string
}

function ViewSwitcher({
  value,
  onChange,
}: {
  value: CharacterViewMode
  onChange: (value: CharacterViewMode) => void
}) {
  return (
    <SegmentedControl value={value} onValueChange={val => onChange(val as CharacterViewMode)} size="sm">
      {viewModes.map(mode => (
        <SegmentedControlItem key={mode.value} value={mode.value}>
          {mode.label}
        </SegmentedControlItem>
      ))}
    </SegmentedControl>
  )
}

export function CharacterPanel({ novelId, novelTitle }: CharacterPanelProps) {
  const {
    characters,
    selectedCharacterId: materialSelectedCharacterId,
    selectCharacter: selectMaterialCharacter,
  } = useCharacterMaterialStore()

  const {
    viewMode,
    relationshipGraphViewMode,
    selectedCharacterId,
    selectedRelationshipId,
    characterModalOpen,
    editingCharacterId,
    relationshipModalOpen,
    editingRelationshipId,
    defaultRelationshipSourceId,
    defaultRelationshipTargetId,
    linkingSourceId,

    setViewMode,
    setRelationshipGraphViewMode,

    selectCharacter,
    selectRelationship,

    openCreateCharacter,
    openEditCharacter,
    closeCharacterModal,

    openCreateRelationship,
    openEditRelationship,
    closeRelationshipModal,

    startLink,
    cancelLink,
  } = useCharacterGraphStore()

  const effectiveSelectedCharacterId = selectedCharacterId ?? materialSelectedCharacterId ?? null

  const editingCharacter = editingCharacterId
    ? characters.find(c => c.id === editingCharacterId)
    : null

  const {
    relationshipsByNovel,
    createRelationship,
    updateRelationship,
  } = useCharacterGraphStore()

  const relationships = relationshipsByNovel[novelId] ?? []

  const editingRelationship = editingRelationshipId
    ? relationships.find(r => r.id === editingRelationshipId)
    : null

  const handleSelectCharacter = (id: string) => {
    selectCharacter(id)
    selectMaterialCharacter(id)
  }

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex items-center gap-4 border-b border-border/60 px-6 py-4">
        <div className="min-w-[180px]">
          <div className="text-sm font-semibold text-foreground">
            {novelTitle ?? novelId}
            {' '}
            · 角色编排
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <ViewSwitcher value={viewMode} onChange={setViewMode} />
        </div>
        <Button size="sm" variant="outline" onClick={openCreateCharacter}>
          <Plus className="h-4 w-4" />
          新建角色
        </Button>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <section className="flex-1 min-w-0 flex flex-col">
          <div className={cn('flex-1 min-h-0 p-4')}>
            {viewMode === 'overview' && (
              <CharacterOverviewGraph
                novelId={novelId}
                characters={characters}
                relationships={relationships}
                linkingSourceId={linkingSourceId}
                onSelectCharacter={(id) => {
                  if (id) {
                    handleSelectCharacter(id)
                  } else {
                    selectCharacter(null)
                    selectMaterialCharacter(undefined)
                  }
                }}
                onSelectRelationship={(id) => {
                  selectRelationship(id ?? null)
                }}
                onEditCharacter={openEditCharacter}
                onEditRelationship={openEditRelationship}
                onStartLink={startLink}
                onCancelLink={cancelLink}
                onCompleteLink={(targetId, sourceId) => {
                  const srcId = sourceId ?? linkingSourceId
                  if (srcId) {
                    const exists = relationships.some(r =>
                      (r.sourceId === srcId && r.targetId === targetId)
                      || (r.sourceId === targetId && r.targetId === srcId),
                    )
                    if (!exists) {
                      openCreateRelationship({ sourceId: srcId, targetId })
                    }
                  }
                  cancelLink()
                }}
              />
            )}

            {viewMode === 'relationship' && (
              <RelationshipGraph
                characters={characters}
                relationships={relationships}
                selectedCharacterId={effectiveSelectedCharacterId ?? undefined}
                selectedRelationshipId={selectedRelationshipId ?? undefined}
                viewMode={relationshipGraphViewMode}
                showViewSwitcher
                onViewModeChange={setRelationshipGraphViewMode}
                onSelectCharacter={(id) => {
                  if (id) handleSelectCharacter(id)
                }}
                onSelectRelationship={(id) => {
                  selectRelationship(id ?? null)
                }}
                onEditCharacter={openEditCharacter}
                onEditRelationship={openEditRelationship}
              />
            )}
          </div>
        </section>
      </div>

      <CharacterModal
        open={characterModalOpen}
        onOpenChange={(open) => {
          if (!open) closeCharacterModal()
        }}
        character={editingCharacter ?? null}
        novelId={novelId}
      />

      <RelationshipModal
        open={relationshipModalOpen}
        onOpenChange={(open) => {
          if (!open) closeRelationshipModal()
        }}
        relationship={editingRelationship ?? null}
        characters={characters}
        defaultSourceId={defaultRelationshipSourceId ?? undefined}
        defaultTargetId={defaultRelationshipTargetId ?? undefined}
        onCreate={async (relationship) => {
          await createRelationship({ ...relationship, novel_id: novelId, note: relationship.note ?? undefined })
        }}
        onUpdate={async (id, updates) => {
          await updateRelationship(id, { ...updates, novel_id: novelId, note: updates.note ?? undefined })
        }}
      />
    </div>
  )
}
