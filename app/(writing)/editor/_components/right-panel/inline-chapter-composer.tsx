'use client'

import type { Chapter, Volume } from '@/lib/supabase/sdk'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import {
  hasChapterAttachmentDrag,
  parseComposerAttachmentDragPayload,
} from '@/lib/editor/chapter-attachment-drag'
import {
  encodeChapterMarker,
  encodeCharacterMarker,
  encodeVolumeMarker,
  chapterRefsEqual,
  characterRefsEqual,
  extractContextChapterRefs,
  extractContextCharacterRefs,
  getMentionQueryFromTextBefore,
  filterMentionListItems,
  hasComposerContent,
  parseComposerSegments,
  stripRefMarkers,
  type ComposerSegment,
  type MentionListItem,
  type SerializedChapterRef,
  type SerializedCharacterRef,
  type SerializedVolumeRef,
} from '@/lib/editor/inline-composer'
import { useI18n } from '@/hooks/use-i18n'
import { cn } from '@/lib/utils'
import { ChapterMentionMenu } from './chapter-mention-menu'

const CHIP_CLASS = 'inline-composer-chip'
const INVISIBLE_CHAR_RE = /[\u200B\uFEFF]/g

function shouldShowComposerPlaceholder(value: string): boolean {
  if (hasComposerContent(value)) return false
  const plain = stripRefMarkers(value).replace(INVISIBLE_CHAR_RE, '').trim()
  return plain.length === 0
}

function resetEmptyEditorDom(root: HTMLElement): Text {
  root.innerHTML = ''
  const textNode = document.createTextNode('')
  root.append(textNode)
  return textNode
}

function placeCaretAtStart(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection) return
  const textNode = root.firstChild?.nodeType === Node.TEXT_NODE
    ? (root.firstChild as Text)
    : resetEmptyEditorDom(root)
  const range = document.createRange()
  range.setStart(textNode, 0)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

function normalizeEmptyEditor(root: HTMLElement) {
  const serialized = serializeFromEditor(root)
  if (!shouldShowComposerPlaceholder(serialized)) return
  resetEmptyEditorDom(root)
  if (root === document.activeElement) {
    placeCaretAtStart(root)
  }
}

export interface InlineChapterComposerHandle {
  focus: () => void
  insertAtChar: (char: string) => void
}

interface InlineChapterComposerProps {
  value: string
  onChange: (value: string) => void
  onChaptersChange: (chapters: SerializedChapterRef[]) => void
  onCharactersChange?: (characters: SerializedCharacterRef[]) => void
  chapters: Chapter[]
  volumes?: Volume[]
  characters?: Array<{ id: string, name: string }>
  placeholder?: string
  disabled?: boolean
  isCompact?: boolean
  maxHeight?: number
  onSend?: () => void
  className?: string
}

function isComposerChipElement(node: HTMLElement): boolean {
  return node.classList.contains(CHIP_CLASS)
    && (Boolean(node.dataset.chapterId) || Boolean(node.dataset.volumeId) || Boolean(node.dataset.characterId))
}

function createChapterChipElement(chapter: SerializedChapterRef): HTMLSpanElement {
  const chip = document.createElement('span')
  chip.dataset.chapterId = chapter.id
  chip.dataset.chapterTitle = chapter.title
  chip.contentEditable = 'false'
  chip.className = cn(
    CHIP_CLASS,
    'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-border/80',
    'bg-muted/70 px-1.5 py-0.5 text-xs font-medium text-foreground select-none',
  )
  chip.setAttribute('aria-label', chapter.title)

  const label = document.createElement('span')
  label.className = 'truncate max-w-[180px]'
  label.textContent = chapter.title

  chip.append(label)
  return chip
}

function createVolumeChipElement(volume: SerializedVolumeRef): HTMLSpanElement {
  const chip = document.createElement('span')
  chip.dataset.volumeId = volume.id
  chip.dataset.volumeTitle = volume.title
  chip.contentEditable = 'false'
  chip.className = cn(
    CHIP_CLASS,
    'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-primary/25',
    'bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-foreground select-none',
  )
  chip.setAttribute('aria-label', volume.title)

  const label = document.createElement('span')
  label.className = 'truncate max-w-[180px]'
  label.textContent = volume.title

  chip.append(label)
  return chip
}

function createCharacterChipElement(character: SerializedCharacterRef): HTMLSpanElement {
  const chip = document.createElement('span')
  chip.dataset.characterId = character.id
  chip.dataset.characterName = character.name
  chip.contentEditable = 'false'
  chip.className = cn(
    CHIP_CLASS,
    'mx-0.5 inline-flex max-w-[200px] align-middle items-center gap-0.5 rounded-md border border-chart-2/30',
    'bg-chart-2/10 px-1.5 py-0.5 text-xs font-medium text-foreground select-none',
  )
  chip.setAttribute('aria-label', character.name)

  const label = document.createElement('span')
  label.className = 'truncate max-w-[180px]'
  label.textContent = character.name

  chip.append(label)
  return chip
}

function appendTextNode(root: HTMLElement, text: string) {
  if (!text) return
  root.append(document.createTextNode(text))
}

function renderSegmentsToEditor(root: HTMLElement, segments: ComposerSegment[]) {
  root.innerHTML = ''
  for (const segment of segments) {
    if (segment.type === 'text') {
      appendTextNode(root, segment.value)
    } else if (segment.type === 'volume') {
      root.append(createVolumeChipElement(segment))
    } else if (segment.type === 'character') {
      root.append(createCharacterChipElement(segment))
    } else {
      root.append(createChapterChipElement(segment))
    }
  }
  if (!root.childNodes.length) {
    root.append(document.createTextNode(''))
  }
}

function serializeFromEditor(root: HTMLElement): string {
  let result = ''
  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
      return
    }
    if (!(node instanceof HTMLElement)) return
    if (isComposerChipElement(node)) {
      if (node.dataset.volumeId) {
        result += encodeVolumeMarker({
          id: node.dataset.volumeId,
          title: node.dataset.volumeTitle ?? '',
        })
      } else if (node.dataset.chapterId) {
        result += encodeChapterMarker({
          id: node.dataset.chapterId,
          title: node.dataset.chapterTitle ?? '',
        })
      } else if (node.dataset.characterId) {
        result += encodeCharacterMarker({
          id: node.dataset.characterId,
          name: node.dataset.characterName ?? '',
        })
      }
      return
    }
    node.childNodes.forEach(walk)
  }
  root.childNodes.forEach(walk)
  return result
}

function getTextBeforeCaret(root: HTMLElement): string {
  const selection = window.getSelection()
  if (!selection?.rangeCount) return ''

  const { anchorNode, anchorOffset } = selection
  let result = ''
  let found = false

  const walk = (node: Node): void => {
    if (found) return
    if (node === anchorNode) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += (node.textContent ?? '').slice(0, anchorOffset)
      }
      found = true
      return
    }
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent ?? ''
      return
    }
    if (node instanceof HTMLElement && isComposerChipElement(node)) {
      return
    }
    node.childNodes.forEach(walk)
  }

  root.childNodes.forEach(walk)
  return result
}

function moveCaretToPreviousTextNode(selection: Selection, root: HTMLElement): boolean {
  const range = document.createRange()
  range.selectNodeContents(root)
  range.setEnd(selection.anchorNode!, selection.anchorOffset)
  const textNodes: Text[] = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let node = walker.nextNode()
  while (node) {
    textNodes.push(node as Text)
    node = walker.nextNode()
  }
  const anchorNode = selection.anchorNode
  const anchorOffset = selection.anchorOffset
  for (let i = textNodes.length - 1; i >= 0; i--) {
    const textNode = textNodes[i]
    if (textNode === anchorNode) {
      if (anchorOffset > 0) return true
      continue
    }
    if (!anchorNode) continue
    const pos = anchorNode.compareDocumentPosition(textNode)
    if (pos & Node.DOCUMENT_POSITION_PRECEDING) {
      selection.collapse(textNode, textNode.length)
      return true
    }
  }
  return false
}

function deleteCharsBeforeCaret(root: HTMLElement, count: number) {
  const selection = window.getSelection()
  if (!selection?.rangeCount || count <= 0) return

  let remaining = count
  while (remaining > 0) {
    const { anchorNode, anchorOffset } = selection
    if (anchorNode?.nodeType === Node.TEXT_NODE && anchorOffset > 0) {
      const textNode = anchorNode as Text
      const take = Math.min(anchorOffset, remaining)
      textNode.deleteData(anchorOffset - take, take)
      selection.collapse(textNode, anchorOffset - take)
      remaining -= take
      continue
    }
    if (!moveCaretToPreviousTextNode(selection, root)) break
  }
}

function insertChipAtCaret(root: HTMLElement, chip: HTMLSpanElement) {
  const selection = window.getSelection()
  if (!selection?.rangeCount) {
    root.append(chip)
    appendTextNode(root, '\u200B')
    return
  }

  const range = selection.getRangeAt(0)
  range.deleteContents()
  const spacer = document.createTextNode('\u200B')
  range.insertNode(spacer)
  range.insertNode(chip)
  range.setStart(spacer, 1)
  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

function placeCaretAtEnd(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(root)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

export const InlineChapterComposer = forwardRef<InlineChapterComposerHandle, InlineChapterComposerProps>(
  function InlineChapterComposer(
    {
      value,
      onChange,
      onChaptersChange,
      onCharactersChange,
      chapters,
      volumes = [],
      characters = [],
      placeholder,
      disabled,
      isCompact = true,
      maxHeight = 168,
      onSend,
      className,
    },
    ref,
  ) {
    const { t } = useI18n()
    const placeholderText = placeholder ?? t('chat.input.placeholder')
    const editorRef = useRef<HTMLDivElement>(null)
    const lastSerializedRef = useRef(value)
    const lastChaptersRef = useRef<SerializedChapterRef[]>([])
    const lastCharactersRef = useRef<SerializedCharacterRef[]>([])
    const isComposingRef = useRef(false)

    const [mentionOpen, setMentionOpen] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [mentionIndex, setMentionIndex] = useState(0)
    const [isDragOver, setIsDragOver] = useState(false)
    const [showPlaceholder, setShowPlaceholder] = useState(() => shouldShowComposerPlaceholder(value))

    const updatePlaceholderVisibility = useCallback(() => {
      const root = editorRef.current
      if (!root) return
      setShowPlaceholder(shouldShowComposerPlaceholder(serializeFromEditor(root)))
    }, [])

    const syncFromEditor = useCallback(() => {
      const root = editorRef.current
      if (!root) return
      const serialized = serializeFromEditor(root)
      setShowPlaceholder(shouldShowComposerPlaceholder(serialized))
      if (serialized !== lastSerializedRef.current) {
        lastSerializedRef.current = serialized
        onChange(serialized)
      }
      const contextChapters = extractContextChapterRefs(serialized, chapters)
      if (!chapterRefsEqual(contextChapters, lastChaptersRef.current)) {
        lastChaptersRef.current = contextChapters
        onChaptersChange(contextChapters)
      }
      const contextCharacters = extractContextCharacterRefs(serialized)
      if (onCharactersChange && !characterRefsEqual(contextCharacters, lastCharactersRef.current)) {
        lastCharactersRef.current = contextCharacters
        onCharactersChange(contextCharacters)
      }
    }, [onChange, onChaptersChange, onCharactersChange, chapters])

    const closeMentionMenu = useCallback(() => {
      setMentionOpen(false)
      setMentionQuery('')
      setMentionIndex(0)
    }, [])

    const updateMentionMenu = useCallback(() => {
      const root = editorRef.current
      if (!root) return
      const textBefore = getTextBeforeCaret(root)
      const mention = getMentionQueryFromTextBefore(textBefore)
      if (!mention) {
        closeMentionMenu()
        return
      }
      setMentionOpen(true)
      setMentionQuery(mention.query)
      setMentionIndex(0)
    }, [closeMentionMenu])

    const insertMentionItem = useCallback((item: MentionListItem) => {
      const root = editorRef.current
      if (!root) return

      const textBefore = getTextBeforeCaret(root)
      const mention = getMentionQueryFromTextBefore(textBefore)
      if (mention) {
        deleteCharsBeforeCaret(root, textBefore.length - mention.startOffset)
      }

      const chip = item.type === 'volume'
        ? createVolumeChipElement({ id: item.id, title: item.title })
        : item.type === 'character'
          ? createCharacterChipElement({ id: item.id, name: item.name })
          : createChapterChipElement({ id: item.id, title: item.title })
      insertChipAtCaret(root, chip)
      closeMentionMenu()
      syncFromEditor()
      root.focus()
    }, [closeMentionMenu, syncFromEditor])

    useImperativeHandle(ref, () => ({
      focus: () => {
        const root = editorRef.current
        if (!root) return
        root.focus()
        if (shouldShowComposerPlaceholder(serializeFromEditor(root))) {
          placeCaretAtStart(root)
        }
      },
      insertAtChar: (char: string) => {
        const root = editorRef.current
        if (!root) return
        root.focus()
        const selection = window.getSelection()
        if (selection?.rangeCount) {
          const range = selection.getRangeAt(0)
          range.deleteContents()
          const node = document.createTextNode(char)
          range.insertNode(node)
          range.setStartAfter(node)
          range.collapse(true)
          selection.removeAllRanges()
          selection.addRange(range)
        } else {
          appendTextNode(root, char)
          placeCaretAtEnd(root)
        }
        syncFromEditor()
        updateMentionMenu()
      },
    }), [syncFromEditor, updateMentionMenu])

    useLayoutEffect(() => {
      const root = editorRef.current
      if (!root) return
      if (value === lastSerializedRef.current) return
      lastSerializedRef.current = value
      lastChaptersRef.current = extractContextChapterRefs(value, chapters)
      renderSegmentsToEditor(root, parseComposerSegments(value))
      const isEmpty = shouldShowComposerPlaceholder(value)
      setShowPlaceholder(isEmpty)
      if (isEmpty && root === document.activeElement) {
        placeCaretAtStart(root)
      }
    }, [value, chapters])

    const handleInput = () => {
      updatePlaceholderVisibility()
      if (isComposingRef.current) return
      syncFromEditor()
      updateMentionMenu()
    }

    const handleEditorActivate = () => {
      const root = editorRef.current
      if (!root) return
      if (!shouldShowComposerPlaceholder(serializeFromEditor(root))) return
      normalizeEmptyEditor(root)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      const root = editorRef.current
      if (!root) return

      if (
        !mentionOpen
        && e.key.length === 1
        && !e.ctrlKey
        && !e.metaKey
        && !e.altKey
      ) {
        setShowPlaceholder(false)
      }

      if (mentionOpen) {
        const filtered = filterMentionListItems(volumes, chapters, mentionQuery, characters)
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          setMentionIndex(i => (i + 1) % Math.max(filtered.length, 1))
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          setMentionIndex(i => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1))
          return
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault()
          const item = filtered[mentionIndex]
          if (item) insertMentionItem(item)
          return
        }
        if (e.key === 'Escape') {
          e.preventDefault()
          closeMentionMenu()
          return
        }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSend?.()
        return
      }

      if (e.key === 'Backspace') {
        const selection = window.getSelection()
        if (!selection?.rangeCount || !selection.isCollapsed) return
        const { anchorNode, anchorOffset } = selection
        if (anchorOffset === 0 && anchorNode?.previousSibling instanceof HTMLElement) {
          const prev = anchorNode.previousSibling
          if (prev.classList.contains(CHIP_CLASS)) {
            e.preventDefault()
            prev.remove()
            syncFromEditor()
          }
        }
      }
    }

    const handleDrop = (e: React.DragEvent) => {
      if (!hasChapterAttachmentDrag(e.dataTransfer)) return
      e.preventDefault()
      setIsDragOver(false)
      const payload = parseComposerAttachmentDragPayload(e.dataTransfer)
      if (!payload) return
      editorRef.current?.focus()
      insertMentionItem(
        payload.kind === 'volume'
          ? { type: 'volume', id: payload.id, title: payload.title }
          : { type: 'chapter', id: payload.id, title: payload.title },
      )
    }

    useEffect(() => {
      if (!mentionOpen) return
      const onPointerDown = (event: MouseEvent) => {
        const root = editorRef.current
        const target = event.target as Node
        if (root?.contains(target)) return
        if (target instanceof Element && target.closest('[data-chapter-mention-menu]')) return
        closeMentionMenu()
      }
      document.addEventListener('mousedown', onPointerDown)
      return () => document.removeEventListener('mousedown', onPointerDown)
    }, [mentionOpen, closeMentionMenu])

    return (
      <div className="flex flex-col -mx-3 -mt-3">
        {mentionOpen ? (
          <div
            className={cn(
              'border-b border-border bg-muted/20',
              'animate-in fade-in-0 slide-in-from-top-2 duration-200',
            )}
          >
            <ChapterMentionMenu
              variant="drawer"
              volumes={volumes}
              chapters={chapters}
              characters={characters}
              query={mentionQuery}
              activeIndex={mentionIndex}
              onActiveIndexChange={setMentionIndex}
              onSelect={insertMentionItem}
            />
          </div>
        ) : null}

        <div className="relative">
          {showPlaceholder ? (
            <div
              className={cn(
                'pointer-events-none absolute inset-x-0 top-0 z-0 px-3 text-pretty text-muted-foreground/80 leading-relaxed',
                mentionOpen ? 'pt-2' : 'pt-3',
                isCompact ? 'text-sm' : 'text-base font-serif',
              )}
              aria-hidden
            >
              {placeholderText}
            </div>
          ) : null}

          <div
            ref={editorRef}
            contentEditable={!disabled}
            suppressContentEditableWarning
            role="textbox"
            aria-multiline="true"
            aria-label={placeholderText}
            onInput={handleInput}
            onFocus={handleEditorActivate}
            onClick={handleEditorActivate}
            onBlur={() => {
              const root = editorRef.current
              if (!root) return
              normalizeEmptyEditor(root)
              syncFromEditor()
            }}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => {
              isComposingRef.current = true
              setShowPlaceholder(false)
            }}
            onCompositionUpdate={updatePlaceholderVisibility}
            onCompositionEnd={() => {
              isComposingRef.current = false
              handleInput()
            }}
            onDragEnter={(e) => {
              if (!hasChapterAttachmentDrag(e.dataTransfer)) return
              e.preventDefault()
              setIsDragOver(true)
            }}
            onDragOver={(e) => {
              if (!hasChapterAttachmentDrag(e.dataTransfer)) return
              e.preventDefault()
              e.dataTransfer.dropEffect = 'copy'
              setIsDragOver(true)
            }}
            onDragLeave={(e) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return
              setIsDragOver(false)
            }}
            onDrop={handleDrop}
            className={cn(
              'input-area-scrollbar relative z-10 w-full bg-transparent outline-none',
              'text-foreground leading-relaxed px-3',
              mentionOpen ? 'pt-2' : 'pt-3',
              isCompact ? 'min-h-[72px] text-sm' : 'min-h-[56px] text-base font-serif',
              isDragOver && 'bg-accent/30 ring-1 ring-inset ring-ring/30 rounded-md',
              disabled && 'cursor-not-allowed opacity-60',
              className,
            )}
            style={{ maxHeight }}
          />
        </div>
      </div>
    )
  },
)
