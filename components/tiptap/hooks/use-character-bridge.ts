import type { NovelCharacter } from '@/lib/supabase/sdk'
import type { Editor } from '@tiptap/react'
import { useEffect, useRef, useState } from 'react'
import type { CharacterNameSuggestUIState } from '@/components/tiptap/extensions/character/character-name-suggest'
import {
  getCharacterNameSuggestUIState,
  updateCharacterNameSuggest,
} from '@/components/tiptap/extensions/character/character-name-suggest'
import { updateCharacterHighlight } from '@/components/tiptap/extensions/character/character-highlight'

export function useCharacterBridge(editor: Editor | null, characters: NovelCharacter[]) {
  const [nameSuggest, setNameSuggest] = useState<CharacterNameSuggestUIState | null>(null)
  const [tooltipCharacter, setTooltipCharacter] = useState<NovelCharacter | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const hideTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (editor) updateCharacterHighlight(editor.view, characters)
  }, [editor, characters])

  useEffect(() => {
    if (editor) updateCharacterNameSuggest(editor.view, characters)
  }, [editor, characters])

  useEffect(() => {
    if (!editor) return

    const handleTransaction = () => {
      setNameSuggest(getCharacterNameSuggestUIState(editor.view.state))
    }

    handleTransaction()
    editor.on('transaction', handleTransaction)
    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [editor])

  const bindCharacterTooltip = (editorRoot: HTMLElement | null) => {
    const editorElement = editorRoot?.querySelector('.ProseMirror')
    if (!editorElement) return

    const getHighlightElement = (target: EventTarget | null) => {
      if (!target) return null
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null
      const highlight = element?.closest('.character-highlight')
      return highlight instanceof HTMLElement ? highlight : null
    }

    const handleMouseOver = (e: Event) => {
      const highlightElement = getHighlightElement(e.target)
      if (!highlightElement) return
      const id = highlightElement.getAttribute('data-character-id')
      if (!id) return
      const character = characters.find(c => c.id === id)
      if (!character) return

      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current)
        hideTooltipTimeoutRef.current = undefined
      }

      setTooltipCharacter(character)
      const rect = highlightElement.getBoundingClientRect()
      setTooltipPosition({ x: rect.left + rect.width / 2, y: rect.bottom })
      setIsTooltipVisible(false)
      requestAnimationFrame(() => setIsTooltipVisible(true))
    }

    const handleMouseOut = (e: Event) => {
      const highlightElement = getHighlightElement(e.target)
      if (!highlightElement) return
      const mouseEvent = e as MouseEvent
      const relatedTarget = mouseEvent.relatedTarget
      if (relatedTarget instanceof Node && highlightElement.contains(relatedTarget)) return

      setIsTooltipVisible(false)
      if (hideTooltipTimeoutRef.current) clearTimeout(hideTooltipTimeoutRef.current)
      hideTooltipTimeoutRef.current = setTimeout(() => {
        setTooltipCharacter(null)
        setTooltipPosition(null)
      }, 160)
    }

    editorElement.addEventListener('mouseover', handleMouseOver)
    editorElement.addEventListener('mouseout', handleMouseOut)

    return () => {
      editorElement.removeEventListener('mouseover', handleMouseOver)
      editorElement.removeEventListener('mouseout', handleMouseOut)
      if (hideTooltipTimeoutRef.current) clearTimeout(hideTooltipTimeoutRef.current)
    }
  }

  const clearTooltip = () => {
    setTooltipCharacter(null)
    setTooltipPosition(null)
    setIsTooltipVisible(false)
  }

  return {
    nameSuggest,
    tooltipCharacter,
    tooltipPosition,
    isTooltipVisible,
    setIsTooltipVisible,
    hideTooltipTimeoutRef,
    bindCharacterTooltip,
    clearTooltip,
  }
}
