import type { Node as ProseMirrorNode } from '@tiptap/pm/model'
import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { supabase } from '@/lib/supabase'
import { DialogProvider, setGlobalDialog, useDialog } from './dialog-manager'
import { DragHandle } from './drag-handle-react'
import { AIAutocomplete } from './extensions/ai-autocomplete'
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
  const initTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const { showInputDialog } = useDialog()
  const [showSearchBox, setShowSearchBox] = useState(false)
  const [initialSearchTerm, setInitialSearchTerm] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isContentUserEdited, setIsContentUserEdited] = useState(false)
  const lastContentRef = useRef('')

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
            // 获取 doc 的所有节点并插入
            const nodes: ProseMirrorNode[] = []
            doc.content.forEach((node: ProseMirrorNode) => {
              nodes.push(node)
            })
            if (nodes.length === 0) {
              return false
            }
            // 将所有节点插入到当前位置
            let tr = state.tr.replaceSelectionWith(nodes[0])
            for (let i = 1; i < nodes.length; i += 1) {
              tr = tr.insert(tr.selection.$to.pos, nodes[i])
            }
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
      const customEvent = event as CustomEvent<{ imageUrl: string }>
      const imageUrl = customEvent.detail?.imageUrl
      if (!imageUrl) return

      const { state, dispatch } = editor.view
      const imageNode = state.schema.nodes.image.create({
        src: imageUrl,
        alt: 'AI Generated Image',
      })
      const tr = state.tr.replaceSelectionWith(imageNode)
      dispatch(tr)
    }

    window.addEventListener('novel-insert-image-to-editor', handleInsertImage)

    return () => {
      window.removeEventListener('novel-insert-image-to-editor', handleInsertImage)
    }
  }, [editor])

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
