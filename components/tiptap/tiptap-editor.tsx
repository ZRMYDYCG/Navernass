import CharacterCount from '@tiptap/extension-character-count'
import { Color } from '@tiptap/extension-color'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useRef, useState } from 'react'
import { DialogProvider, setGlobalDialog, useDialog } from './dialog-manager'
import { DragHandle } from './drag-handle'
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

  useEffect(() => {
    setGlobalDialog(showInputDialog)
  }, [showInputDialog])

  // 计算统计数据的辅助函数
  const calculateStats = (text: string) => {
    // 字符数：包括所有字符（包括标点符号、空格等）
    const characters = text.length
    // 字数：只统计中文字符和英文字母（不包括标点符号、数字、空格等）
    // 匹配中文字符和英文单词
    const chineseChars = (text.match(/[\u4E00-\u9FA5]/g) || []).length
    const englishWords = (text.match(/[a-z]+/gi) || []).length
    const words = chineseChars + englishWords

    return { words, characters }
  }

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
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
      // AI 功能扩展
      SlashCommand,
      AIAutocomplete.configure({
        trigger: '++',
        debounceDelay: 500,
      }),
      // 搜索高亮扩展
      SearchHighlight,
      // 编辑器内搜索扩展
      EditorSearch,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full',
      },
    },
    onUpdate: ({ editor }) => {
      // 更新字数统计
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

  // 初始化时和内容变化时计算统计
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

  // 动态更新编辑器的可编辑状态
  useEffect(() => {
    if (editor) {
      editor.setEditable(editable)
      // 避免 immutability 问题
      const editorElement = editor.view.dom
      if (editable) {
        editorElement.setAttribute('style', 'cursor: text; opacity: 1;')
      } else {
        editorElement.setAttribute('style', 'cursor: default; opacity: 0.8;')
      }
    }
  }, [editor, editable])

  // 监听 Ctrl+F 快捷键，打开搜索框
  useEffect(() => {
    if (!editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F 或 Cmd+F：打开搜索框
      // 检查是否在编辑器内或搜索框未打开
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        const target = e.target as HTMLElement
        const isInEditor = editor.view.dom.contains(target) || target.closest('.ProseMirror')

        // 如果焦点在编辑器内，或者搜索框未打开，则阻止默认行为并打开搜索框
        if (isInEditor || !showSearchBox) {
          e.preventDefault()
          e.stopPropagation()
          setShowSearchBox(true)
        }
      }
    }

    // 使用 capture 阶段捕获事件，确保能阻止浏览器默认行为
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [editor, showSearchBox])

  // 监听搜索高亮事件（来自左侧搜索面板）
  useEffect(() => {
    if (!editor || !chapterId) return

    const handleHighlight = (event: Event) => {
      const customEvent = event as CustomEvent<{
        chapterId: string | null
        keyword: string | null
        matches: Array<{ start: number, end: number, type: 'title' | 'content' }>
      }>

      const { chapterId: eventChapterId, keyword, matches } = customEvent.detail

      // 只有当事件中的 chapterId 与当前编辑器的 chapterId 匹配时才更新高亮
      if (eventChapterId === chapterId) {
        updateSearchHighlight(editor.view, eventChapterId, keyword, matches)
      } else if (eventChapterId === null) {
        // 如果 chapterId 为 null，清除高亮
        updateSearchHighlight(editor.view, null, null, [])
      }
    }

    window.addEventListener('editor-highlight', handleHighlight as EventListener)

    // 编辑器加载完成后，检查是否有待处理的高亮请求
    // 延迟一下确保编辑器完全初始化
    const timeoutId = setTimeout(() => {
      // 触发一个检查事件，让 SearchTab 重新发送高亮信息
      window.dispatchEvent(new CustomEvent('editor-ready', { detail: { chapterId } }))
    }, 100)

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      window.removeEventListener('editor-highlight', handleHighlight as EventListener)
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
      {showSearchBox && (
        <SearchBox
          editor={editor}
          onClose={() => {
            setShowSearchBox(false)
            // 清除搜索高亮
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

export function useTiptapEditor(content?: string) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      CharacterCount,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-gray max-w-none focus:outline-none min-h-full',
      },
    },
  })

  return editor
}
