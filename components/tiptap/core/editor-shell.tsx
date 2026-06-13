'use client'

import type { NovelCharacter } from '@/lib/supabase/sdk'
import type { Editor } from '@tiptap/react'
import { EditorContent } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import { CharacterCard } from '@/app/(writing)/editor/_components/character-card'
import { Spinner } from '@/components/ui/spinner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useI18n } from '@/hooks/use-i18n'
import type { NovelEditorMode } from '@/components/tiptap/core/types'
import { useCharacterBridge } from '@/components/tiptap/hooks/use-character-bridge'
import { useEditorBridgeEvents, useEditorImageBindings, useEditorSearchShortcut } from '@/components/tiptap/hooks/use-editor-bridge-events'
import { useProposeEditBridge } from '@/components/tiptap/hooks/use-propose-edit-bridge'
import { getCharacterNameSuggestUIState } from '@/components/tiptap/extensions/character/character-name-suggest'
import { DragHandle } from '@/components/tiptap/ui/drag-handle'
import { FloatingMenu } from '@/components/tiptap/ui/floating-menu'
import { ProposeEditToolbar } from '@/components/tiptap/ui/propose-edit-toolbar'
import { CharacterNameSuggestList } from '@/components/tiptap/ui/character-name-suggest-list'
import { SearchBox } from '@/components/tiptap/ui/search-box'

export interface EditorShellProps {
  editor: Editor | null
  mode: NovelEditorMode
  className?: string
  editable?: boolean
  chapterId?: string
  content?: string
  characters?: NovelCharacter[]
  isInitialized?: boolean
  enableAi?: boolean
  isUploadingImage?: boolean
}

export function EditorShell({
  editor,
  mode,
  className = '',
  editable = true,
  chapterId,
  content = '',
  characters = [],
  isInitialized = true,
  enableAi = true,
  isUploadingImage = false,
}: EditorShellProps) {
  const { t } = useI18n()
  const editorRef = useRef<HTMLDivElement>(null)
  const tooltipContentRef = useRef<HTMLDivElement>(null)

  const showCharacter = mode === 'chapter'
  const showFloatingMenu = editable && mode !== 'lite'
  const showProposeEdit = enableAi && mode === 'chapter' && chapterId
  const showDragHandle = editable && mode !== 'lite'

  const characterBridge = useCharacterBridge(showCharacter ? editor : null, characters)
  const search = useEditorSearchShortcut(editor)

  useProposeEditBridge(showProposeEdit ? editor : null, chapterId, {
    isReady: isInitialized,
    chapterHtml: content,
  })

  useEditorBridgeEvents(mode === 'chapter' ? editor : null, chapterId)
  useEditorImageBindings(editor)

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
      const editorElement = editor.view.dom as HTMLElement
      editorElement.style.opacity = editable ? '1' : '0.8'
      editorElement.style.removeProperty('cursor')
    }
  }, [editor, editable])

  useEffect(() => {
    if (!showCharacter) return
    return characterBridge.bindCharacterTooltip(editorRef.current)
  }, [showCharacter, editor, characters, characterBridge])

  if (!editor) return null

  return (
    <div className={`${className} relative`} ref={editorRef}>
      {showProposeEdit && <ProposeEditToolbar editor={editor} chapterId={chapterId} />}

      {showCharacter && (
        <TooltipProvider>
          <Tooltip open={!!characterBridge.nameSuggest && editable} disableHoverableContent={false}>
            <TooltipTrigger asChild>
              <div
                style={{
                  position: 'fixed',
                  left: characterBridge.nameSuggest?.anchor.x ?? -9999,
                  top: characterBridge.nameSuggest?.anchor.y ?? -9999,
                  width: 1,
                  height: 1,
                  pointerEvents: 'none',
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" align="start" sideOffset={6} className="p-0 border border-border shadow-lg">
              {characterBridge.nameSuggest && (
                <CharacterNameSuggestList
                  items={characterBridge.nameSuggest.items}
                  query={characterBridge.nameSuggest.query}
                  selectedIndex={characterBridge.nameSuggest.selectedIndex}
                  onHoverIndex={(index) => {
                    editor.view.dispatch(editor.view.state.tr.setMeta('character-name-suggest-select', index))
                  }}
                  onSelectIndex={(index) => {
                    const ui = getCharacterNameSuggestUIState(editor.view.state)
                    if (!ui) return
                    const item = ui.items[index]
                    if (!item) return
                    const currentText = editor.view.state.doc.textBetween(ui.range.from, ui.range.to, '\0', '\0')
                    if (currentText !== ui.query) {
                      editor.view.dispatch(editor.view.state.tr.setMeta('character-name-suggest-ui', null))
                      return
                    }
                    editor.chain().focus().insertContentAt(ui.range, item.name).run()
                    editor.view.dispatch(editor.view.state.tr.setMeta('character-name-suggest-ui', null))
                  }}
                />
              )}
            </TooltipContent>
          </Tooltip>

          <Tooltip open={!!characterBridge.tooltipCharacter && characterBridge.isTooltipVisible} disableHoverableContent={false}>
            <TooltipTrigger asChild>
              <div
                style={{
                  position: 'fixed',
                  left: characterBridge.tooltipPosition?.x ?? -9999,
                  top: characterBridge.tooltipPosition?.y ?? -9999,
                  width: 1,
                  height: 1,
                  pointerEvents: 'none',
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              showArrow={false}
              side="bottom"
              align="center"
              sideOffset={6}
              className="p-0 bg-transparent shadow-none border-0 overflow-visible"
              onMouseEnter={() => {
                if (characterBridge.hideTooltipTimeoutRef.current) {
                  clearTimeout(characterBridge.hideTooltipTimeoutRef.current)
                  characterBridge.hideTooltipTimeoutRef.current = undefined
                }
                characterBridge.setIsTooltipVisible(true)
              }}
              onMouseLeave={() => {
                characterBridge.setIsTooltipVisible(false)
                if (characterBridge.hideTooltipTimeoutRef.current) {
                  clearTimeout(characterBridge.hideTooltipTimeoutRef.current)
                }
                characterBridge.hideTooltipTimeoutRef.current = setTimeout(() => {
                  characterBridge.clearTooltip()
                }, 160)
              }}
            >
              {characterBridge.tooltipCharacter && (
                <div ref={tooltipContentRef} className="w-72">
                  <CharacterCard
                    character={{
                      ...characterBridge.tooltipCharacter,
                      role: characterBridge.tooltipCharacter.role || t('tiptap.editor.unknownRole'),
                      description: characterBridge.tooltipCharacter.description || '',
                      traits: characterBridge.tooltipCharacter.traits || [],
                      keywords: characterBridge.tooltipCharacter.keywords || [],
                      chapters: [],
                    }}
                    className="shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
                  />
                </div>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {showFloatingMenu && (
        <>
          <FloatingMenu editor={editor} enableAi={enableAi} />
          {showDragHandle && <DragHandle editor={editor} />}
        </>
      )}

      <EditorContent editor={editor} />

      {isUploadingImage && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2 rounded-md bg-black/80 text-xs text-white px-3 py-2 shadow-md">
          <Spinner className="w-3.5 h-3.5" />
          <span>{t('tiptap.editor.uploadingIllustration')}</span>
        </div>
      )}

      {search.showSearchBox && (
        <SearchBox
          editor={editor}
          initialSearchTerm={search.initialSearchTerm}
          onClose={() => {
            search.setShowSearchBox(false)
            search.setInitialSearchTerm('')
            const { state, dispatch } = editor.view
            dispatch(state.tr.setMeta('search-highlight', {
              keyword: null,
              matches: [],
              currentIndex: -1,
            }))
          }}
        />
      )}
    </div>
  )
}
