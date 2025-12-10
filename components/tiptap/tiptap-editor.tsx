import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { defaultMarkdownParser } from 'prosemirror-markdown'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { DialogProvider, setGlobalDialog, useDialog } from './dialog-manager'
import { DragHandle } from './drag-handle-react'
import { AIAutocomplete } from './extensions/ai-autocomplete'
import { EditorSearch } from './extensions/editor-search'
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
  } = props

  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { showInputDialog } = useDialog()
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  useEffect(() => {
    setGlobalDialog(showInputDialog)
  }, [showInputDialog])

  const calculateStats = (text: string) => {
    const characters = text.length
    const chineseChars = (text.match(/[\u4E00-\u9FA5]/g) || []).length
    const englishWords = (text.match(/[a-z]+/gi) || []).length
    const words = chineseChars + englishWords

    return { words, characters }
  }

  const uploadIllustration = async (file: File) => {
    setIsUploadingImage(true)
    const ext = file.name.split('.').pop() || 'png'
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error } = await supabase.storage.from('narraverse').upload(`illustrations/${fileName}`, file, {
      cacheControl: '3600',
      upsert: false,
    })
    if (error) {
      setIsUploadingImage(false)
      throw error
    }
    const { data: publicData } = supabase.storage.from('narraverse').getPublicUrl(data.path)
    setIsUploadingImage(false)
    return publicData.publicUrl
  }

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
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
          const imageFiles: File[] = []
          for (let i = 0; i < items.length; i += 1) {
            const item = items[i]
            if (item.type && item.type.startsWith('image/')) {
              const file = item.getAsFile()
              if (file) {
                imageFiles.push(file)
              }
            }
          }
          if (!imageFiles.length) {
            return false
          }
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
            onUpdate(editor.getHTML())
          }, autoSaveDelay)
        } else {
          onUpdate(editor.getHTML())
        }
      }
    },
  })

  useEffect(() => {
    if (!editor) return

    if (!content) {
      editor.commands.clearContent()
      return
    }

    // !!!!!!!!!!!!!!! 区分传入的是 HTML（富文本）还是 Markdown（纯文本/markdown）
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(content)

    if (isHtml) {
      editor.commands.setContent(content)
    } else {
      const doc = defaultMarkdownParser.parse(content)
      editor.commands.setContent(doc.toJSON())
    }
  }, [editor, content])

  useEffect(() => {
    if (editor && onStatsChange) {
      const text = editor.getText()
      const stats = calculateStats(text)
      onStatsChange(stats)
    }
  }, [editor, onStatsChange, content])

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
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

  if (!editor) {
    return null
  }

  return (
    <div className={`${className} relative`}>
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
          onClose={() => {
            setShowSearchBox(false)
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
