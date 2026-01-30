'use client'

import { CharacterModal } from './character-modal'
import { CharacterOverviewGraph } from './character-overview-graph'
import { CharacterPanelHeader } from './character-panel-header'
import { RelationshipGraph } from './relationship-graph'
import { RelationshipModal } from './relationship-modal'
import { cn } from '@/lib/utils'
import { useCharacterGraphStore } from '@/store/characterGraphStore'
import { useCharacterMaterialStore } from '@/store/characterMaterialStore'

interface CharacterPanelProps {
  novelId: string
  novelTitle?: string
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
      <CharacterPanelHeader
        novelId={novelId}
        novelTitle={novelTitle}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateCharacter={openCreateCharacter}
      />

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
