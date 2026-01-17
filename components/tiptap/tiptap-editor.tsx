import type { NovelCharacter } from '@/lib/supabase/sdk'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Slice } from '@tiptap/pm/model'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CharacterCard } from '@/app/(writing)/editor/_components/character-card'
import { Spinner } from '@/components/ui/spinner'
import { DialogProvider, setGlobalDialog, useDialog } from './dialog-manager'
import { DragHandle } from './drag-handle-react'
import { AIAutocomplete } from './extensions/ai-autocomplete'
import { CharacterHighlight, updateCharacterHighlight } from './extensions/character-highlight'
import { EditorSearch } from './extensions/editor-search'
import { parseMarkdownContent } from './extensions/markdown-parser'
import { SearchHighlight, updateSearchHighlight } from './extensions/search-highlight'
import { SlashCommand } from './extensions/slash-command'
import { FloatingMenu } from './floating-menu'
import { SearchBox } from './search-box'
import 'tippy.js/dist/tippy.css'
import './tiptap.css'

export interface TiptapEditorStats {
  words: number
  characters: number
}

export interface TiptapEditorProps {
  content?: string
  placeholder?: string
  onUpdate?: (content: string) => void
  onStatsChange?: (stats: TiptapEditorStats) => void
  autoSave?: boolean
  autoSaveDelay?: number
  className?: string
  editable?: boolean
  chapterId?: string
  characters?: NovelCharacter[]
}

function TiptapEditorInner(props: TiptapEditorProps) {
  const {
    content = '',
    placeholder = '开始写作...',
    onUpdate,
    onStatsChange,
    autoSave = true,
    autoSaveDelay = 3000,
    className = '',
    editable = true,
    chapterId,
    characters = [],
  } = props

  const editorRef = useRef<HTMLDivElement>(null)
  const [tooltipCharacter, setTooltipCharacter] = useState<NovelCharacter | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null)
  const [isTooltipVisible, setIsTooltipVisible] = useState(false)
  const hideTooltipTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const initTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { showInputDialog, showImageGenerationDialog } = useDialog()
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isContentUserEdited, setIsContentUserEdited] = useState(false)
  const lastContentRef = useRef('')

  useEffect(() => {
    setGlobalDialog(showInputDialog, showImageGenerationDialog)
  }, [showInputDialog, showImageGenerationDialog])

  const calculateStats = (text: string) => {
    const characters = text.length
    const chineseChars = (text.match(/[\u4E00-\u9FA5]/g) || []).length
    const englishWords = (text.match(/[a-z]+/gi) || []).length
    const words = chineseChars + englishWords

    return { words, characters }
  }

  const uploadIllustration = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'illustration')

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || '插图上传失败')
      }

      const result = await response.json()
      return result.data.url
    } finally {
      setIsUploadingImage(false)
    }
  }

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'my-4 rounded-md max-w-full h-auto',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      SlashCommand,
      AIAutocomplete.configure({
        trigger: '++',
        debounceDelay: 500,
      }),
      SearchHighlight,
      EditorSearch,
      CharacterHighlight,
    ],
    [placeholder],
  )

  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: '',
    editable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full',
      },
      handleDOMEvents: {
        blur: () => {
          return false
        },
        paste: (view, event) => {
          const e = event as ClipboardEvent
          const items = e.clipboardData?.items
          if (!items) return false

          // 检查是否有文本内容
          let pastedText: string | null = null
          const imageFiles: File[] = []

          for (let i = 0; i < items.length; i += 1) {
            const item = items[i]
            // 优先处理文本（HTML 或纯文本）
            if (item.type === 'text/html' || item.type === 'text/plain') {
              pastedText = e.clipboardData!.getData(item.type)
              break
            }
            // 其次处理图片
            if (item.type && item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                imageFiles.push(file)
              }
            }
          }

          // 如果有文本内容，处理 Markdown 转换
          if (pastedText && !/<[a-z][\s\S]*>/i.test(pastedText)) {
            e.preventDefault()
            const { state, dispatch } = view
            const { schema } = state
            const doc = parseMarkdownContent(pastedText, schema)
            if (doc.content.childCount === 0) {
              return false
            }
            const { from, to } = state.selection
            const $from = state.doc.resolve(from)
            const openStart = $from.depth > 0 ? 1 : 0
            const openEnd = to !== from && state.doc.resolve(to).depth > 0 ? 1 : 0
            const slice = new Slice(doc.content, openStart, openEnd)
            const tr = state.tr.replace(from, to, slice)
            dispatch(tr)
            return true
          }

          // 如果只有图片，处理图片上传
          if (imageFiles.length > 0) {
            e.preventDefault()
            const file = imageFiles[0]
            void (async () => {
              try {
                const url = await uploadIllustration(file)
                const { state, dispatch } = view
                const { schema } = state
                const imageNode = schema.nodes.image?.create({ src: url })
                if (!imageNode) return
                const tr = state.tr.replaceSelectionWith(imageNode).scrollIntoView()
                dispatch(tr)
              } catch (error) {
                console.error('Failed to upload pasted image', error)
              }
            })()
            return true
          }

          return false
        },
      },
    },
    onUpdate: ({ editor }) => {
      if (onStatsChange) {
        const text = editor.getText()
        const stats = calculateStats(text)
        onStatsChange(stats)
      }

      if (onUpdate) {
        if (autoSave) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
          }
          saveTimeoutRef.current = setTimeout(() => {
            const currentContent = editor.getHTML()
            if (currentContent !== lastContentRef.current) {
              lastContentRef.current = currentContent
              onUpdate(currentContent)
            }
          }, autoSaveDelay)
        } else {
          const currentContent = editor.getHTML()
          if (currentContent !== lastContentRef.current) {
            lastContentRef.current = currentContent
            onUpdate(currentContent)
          }
        }
      }
    },
  })

  useEffect(() => {
    if (!editor) return

    if (!isInitialized) {
      if (!content) {
        editor.commands.clearContent()
        initTimeoutRef.current = setTimeout(() => {
          setIsInitialized(true)
        }, 0)
        return
      }

      // 区分传入的是 HTML（富文本）还是 Markdown（纯文本）
      const isHtml = /<\/?[a-z][\s\S]*>/i.test(content)

      if (isHtml) {
        // 直接设置 HTML 内容
        editor.commands.setContent(content)
        lastContentRef.current = content
      } else {
        // 解析 Markdown 内容
        const doc = parseMarkdownContent(content, editor.schema)
        editor.commands.setContent(doc.toJSON())
        lastContentRef.current = editor.getHTML()
      }

      initTimeoutRef.current = setTimeout(() => {
        setIsInitialized(true)
      }, 0)
    }
  }, [editor, content, isInitialized])

  useEffect(() => {
    if (editor && onStatsChange) {
      const text = editor.getText()
      const stats = calculateStats(text)
      onStatsChange(stats)
    }
  }, [editor, onStatsChange, content])

  useEffect(() => {
    if (!editor || !isInitialized) return

    const handleTransaction = (props: { transaction: { docChanged: boolean, steps: unknown[] } }) => {
      if (props.transaction.docChanged && props.transaction.steps.length > 0) {
        setIsContentUserEdited(true)
      }
    }

    editor.on('transaction', handleTransaction)

    return () => {
      editor.off('transaction', handleTransaction)
    }
  }, [editor, isInitialized])

  useEffect(() => {
    if (chapterId) {
      initTimeoutRef.current = setTimeout(() => {
        setIsInitialized(false)
        setIsContentUserEdited(false)
      }, 0)
      lastContentRef.current = ''
    }
  }, [chapterId])

  useEffect(() => {
    if (!editor || !isInitialized || isContentUserEdited) return

    const currentContent = lastContentRef.current
    if (content && currentContent && content !== currentContent) {
      const diffRatio = Math.abs(content.length - currentContent.length) / currentContent.length
      if (diffRatio > 0.1) {
        const isHtml = /<\/?[a-z][\s\S]*>/i.test(content)
        if (isHtml) {
          editor.commands.setContent(content)
          lastContentRef.current = content
        } else {
          const doc = parseMarkdownContent(content, editor.schema)
          editor.commands.setContent(doc.toJSON())
          lastContentRef.current = editor.getHTML()
        }
      }
    }
  }, [content, isInitialized, isContentUserEdited, editor])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
      const editorElement = editor.view.dom
      if (editable) {
        editorElement.setAttribute('style', 'cursor: text; opacity: 1;')
      } else {
        editorElement.setAttribute('style', 'cursor: default; opacity: 0.8;')
      }
    }
  }, [editor, editable])

  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const target = e.target as HTMLElement
        const isInEditor = editor.view.dom.contains(target) || target.closest('.ProseMirror')

        if (isInEditor || !showSearchBox) {
          e.preventDefault()
          e.stopPropagation()

          // 获取选中的文本作为初始搜索词
          const { state } = editor.view
          const { from, to } = state.selection
          let selectedText = ''

          if (from !== to) {
            // 有选中文本
            selectedText = state.doc.textBetween(from, to, ' ')
          }

          setInitialSearchTerm(selectedText)
          setShowSearchBox(true)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [editor, showSearchBox])

  useEffect(() => {
    if (!editor || !chapterId) return

    const handleHighlight: EventListener = (event) => {
      const customEvent = event as CustomEvent<{
        chapterId: string | null
        keyword: string | null
        matches: Array<{ start: number, end: number, type: 'title' | 'content' }>
      }>

      const { chapterId: eventChapterId, keyword, matches } = customEvent.detail

      if (eventChapterId === chapterId) {
        updateSearchHighlight(editor.view, eventChapterId, keyword, matches)
      } else if (eventChapterId === null) {
        updateSearchHighlight(editor.view, null, null, [])
      }
    }

    window.addEventListener('editor-highlight', handleHighlight)

    const timeoutId = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('editor-ready', { detail: { chapterId } }))
    }, 100)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('editor-highlight', handleHighlight)
    }
  }, [editor, chapterId])

  useEffect(() => {
    if (!editor) return

    const handleInsertImage = (event: Event) => {
      const customEvent = event as CustomEvent<{ imageUrl: string, chapterId?: string }>
      const imageUrl = customEvent.detail?.imageUrl
      if (!imageUrl || !editor) return

      editor.chain().focus().insertContent({
        type: 'image',
        attrs: {
          src: imageUrl,
          alt: 'AI Generated Image',
        },
      }).run()
    }

    window.addEventListener('novel-insert-image-to-editor', handleInsertImage)

    return () => {
      window.removeEventListener('novel-insert-image-to-editor', handleInsertImage)
    }
  }, [editor])

  // 更新角色高亮
  useEffect(() => {
    if (editor) {
      updateCharacterHighlight(editor.view, characters)
    }
  }, [editor, characters])

  // 处理角色悬停提示
  useEffect(() => {
    if (!editorRef.current) return

    const editorElement = editorRef.current.querySelector('.ProseMirror')
    if (!editorElement) return

    const getHighlightElementFromEventTarget = (target: EventTarget | null) => {
      if (!target) return null
      const element = target instanceof Element ? target : target instanceof Node ? target.parentElement : null
      if (!element) return null
      const highlightElement = element.closest('.character-highlight')
      return highlightElement instanceof HTMLElement ? highlightElement : null
    }

    const handleMouseOver = (e: Event) => {
      const highlightElement = getHighlightElementFromEventTarget(e.target)
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
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.bottom + 5,
      })
      setIsTooltipVisible(false)
      window.requestAnimationFrame(() => {
        setIsTooltipVisible(true)
      })
    }

    const handleMouseOut = (e: Event) => {
      const highlightElement = getHighlightElementFromEventTarget(e.target)
      if (!highlightElement) return

      const mouseEvent = e as MouseEvent
      const relatedTarget = mouseEvent.relatedTarget
      if (relatedTarget instanceof Node && highlightElement.contains(relatedTarget)) {
        return
      }

      setIsTooltipVisible(false)
      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current)
      }
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
      if (hideTooltipTimeoutRef.current) {
        clearTimeout(hideTooltipTimeoutRef.current)
        hideTooltipTimeoutRef.current = undefined
      }
    }
  }, [editor, characters])

  if (!editor) {
    return null
  }

  return (
    <div className={`${className} relative`} ref={editorRef}>
      {tooltipCharacter && tooltipPosition && typeof document !== 'undefined'
        ? createPortal(
            <div
              className={[
                'fixed z-50 w-72 pointer-events-none -translate-x-1/2 transition-[opacity,transform] duration-150 ease-out',
                isTooltipVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-1 scale-95',
              ].join(' ')}
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
              }}
            >
              <CharacterCard
                character={{
                  ...tooltipCharacter,
                  role: tooltipCharacter.role || '未知角色',
                  description: tooltipCharacter.description || '',
                  traits: tooltipCharacter.traits || [],
                  keywords: tooltipCharacter.keywords || [],
                  chapters: [],
                }}
                className="shadow-xl bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
              />
            </div>,
            document.body,
          )
        : null}
      {editable && (
        <>
          <FloatingMenu editor={editor} />
          <DragHandle editor={editor} />
        </>
      )}
      <EditorContent editor={editor} />
      {isUploadingImage && (
        <div className="absolute top-2 right-2 z-50 flex items-center gap-2 rounded-md bg-black/80 text-xs text-white px-3 py-2 shadow-md">
          <Spinner className="w-3.5 h-3.5" />
          <span>插画上传中...</span>
        </div>
      )}
      {showSearchBox && (
        <SearchBox
          editor={editor}
          initialSearchTerm={initialSearchTerm}
          onClose={() => {
            setShowSearchBox(false)
            setInitialSearchTerm('')
            const { state, dispatch } = editor.view
            const tr = state.tr.setMeta('search-highlight', {
              keyword: null,
              matches: [],
              currentIndex: -1,
            })
            dispatch(tr)
          }}
        />
      )}
    </div>
  )
}

export function TiptapEditor(props: TiptapEditorProps) {
  return (
    <DialogProvider>
      <TiptapEditorInner {...props} />
    </DialogProvider>
  )
}
