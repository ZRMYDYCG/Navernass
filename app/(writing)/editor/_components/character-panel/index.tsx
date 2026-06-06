'use client'

import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store'

import { CastingPool } from './casting-pool'
import { CharacterModal } from './character-modal'
import { CharacterOverviewGraph } from './character-overview-graph'
import { CharacterPanelHeader } from './character-panel-header'
import { FloatingScriptChat } from './floating-script-chat'
import { RelationshipGraph } from './relationship-graph'
import { RelationshipModal } from './relationship-modal'
import { TimelinePanel } from './timeline-panel'

export { AvatarPromptModal } from './avatar-prompt-modal'

interface CharacterPanelProps {
  novelId: string
  novelTitle?: string
}

export function CharacterPanel({ novelId, novelTitle }: CharacterPanelProps) {
  const characters = useAppStore(s => s.characterMaterial.characters)
  const materialSelectedCharacterId = useAppStore(s => s.characterMaterial.selectedCharacterId)
  const characterChapterMap = useAppStore(s => s.characterMaterial.characterChapterMap)
  const selectMaterialCharacter = useAppStore(s => s.characterMaterialActions.selectCharacter)

  const viewMode = useAppStore(s => s.characterGraph.viewMode)
  const relationshipGraphViewMode = useAppStore(s => s.characterGraph.relationshipGraphViewMode)
  const selectedCharacterId = useAppStore(s => s.characterGraph.selectedCharacterId)
  const selectedRelationshipId = useAppStore(s => s.characterGraph.selectedRelationshipId)
  const characterModalOpen = useAppStore(s => s.characterGraph.characterModalOpen)
  const editingCharacterId = useAppStore(s => s.characterGraph.editingCharacterId)
  const relationshipModalOpen = useAppStore(s => s.characterGraph.relationshipModalOpen)
  const editingRelationshipId = useAppStore(s => s.characterGraph.editingRelationshipId)
  const defaultRelationshipSourceId = useAppStore(s => s.characterGraph.defaultRelationshipSourceId)
  const defaultRelationshipTargetId = useAppStore(s => s.characterGraph.defaultRelationshipTargetId)
  const linkingSourceId = useAppStore(s => s.characterGraph.linkingSourceId)
  const relationshipsByNovel = useAppStore(s => s.characterGraph.relationshipsByNovel)

  const setViewMode = useAppStore(s => s.characterGraphActions.setViewMode)
  const setRelationshipGraphViewMode = useAppStore(s => s.characterGraphActions.setRelationshipGraphViewMode)
  const selectCharacter = useAppStore(s => s.characterGraphActions.selectCharacter)
  const selectRelationship = useAppStore(s => s.characterGraphActions.selectRelationship)
  const openCreateCharacter = useAppStore(s => s.characterGraphActions.openCreateCharacter)
  const openEditCharacter = useAppStore(s => s.characterGraphActions.openEditCharacter)
  const closeCharacterModal = useAppStore(s => s.characterGraphActions.closeCharacterModal)
  const openCreateRelationship = useAppStore(s => s.characterGraphActions.openCreateRelationship)
  const openEditRelationship = useAppStore(s => s.characterGraphActions.openEditRelationship)
  const closeRelationshipModal = useAppStore(s => s.characterGraphActions.closeRelationshipModal)
  const startLink = useAppStore(s => s.characterGraphActions.startLink)
  const cancelLink = useAppStore(s => s.characterGraphActions.cancelLink)
  const createRelationship = useAppStore(s => s.characterGraphActions.createRelationship)
  const updateRelationship = useAppStore(s => s.characterGraphActions.updateRelationship)

  const effectiveSelectedCharacterId = selectedCharacterId ?? materialSelectedCharacterId ?? null

  const editingCharacter = editingCharacterId
    ? characters.find(c => c.id === editingCharacterId)
    : null

  const focusedCharacter = useMemo(
    () => effectiveSelectedCharacterId
      ? characters.find(c => c.id === effectiveSelectedCharacterId) || null
      : null,
    [characters, effectiveSelectedCharacterId],
  )

  const [scriptChatOpen, setScriptChatOpen] = useState(false)

  const relationships = useMemo(() => relationshipsByNovel[novelId] ?? [], [relationshipsByNovel, novelId])

  const editingRelationship = editingRelationshipId
    ? relationships.find(r => r.id === editingRelationshipId)
    : null

  const { visibleCharacters, visibleRelationships } = useMemo(() => {
    // 直接展示小说下所有角色/关系（不再按章节过滤）
    return { visibleCharacters: characters, visibleRelationships: relationships }
  }, [characters, relationships])

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
                characters={visibleCharacters}
                relationships={visibleRelationships}
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
                characters={visibleCharacters}
                relationships={visibleRelationships}
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

            {viewMode === 'castingPool' && (
              <CastingPool
                novelId={novelId}
                novelTitle={novelTitle}
                characters={visibleCharacters}
                relationships={visibleRelationships.map(r => ({
                  id: r.id,
                  sourceId: r.sourceId,
                  targetId: r.targetId,
                  sourceToTargetLabel: r.sourceToTargetLabel,
                  targetToSourceLabel: r.targetToSourceLabel,
                  note: r.note,
                }))}
              />
            )}
          </div>
        </section>

        {/* 右侧时间线抽屉 */}
        <aside className="w-72 shrink-0 border-l border-border">
          <TimelinePanel
            novelId={novelId}
            character={focusedCharacter}
            onOpenScriptChat={() => setScriptChatOpen(true)}
          />
        </aside>
      </div>

      {/* 浮动剧本对话框：focusedCharacter 才能开 */}
      <FloatingScriptChat
        novelId={novelId}
        character={focusedCharacter}
        open={scriptChatOpen && !!focusedCharacter}
        onClose={() => setScriptChatOpen(false)}
      />

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
