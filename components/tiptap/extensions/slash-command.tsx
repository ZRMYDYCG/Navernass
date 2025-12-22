import type { LucideIcon } from 'lucide-react'
import type { Instance as TippyInstance } from 'tippy.js'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import {
  Code,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Lightbulb,
  List,
  ListOrdered,
  Minus,
  Quote,
  Sparkles,
} from 'lucide-react'
import tippy from 'tippy.js'
import { CommandList } from '../command-list'
import { showGlobalInputDialog, showGlobalImageGenerationDialog } from '../dialog-manager'

export interface CommandItem {
  title: string
  description: string
  icon: LucideIcon
  command: ({ editor, range }: any) => void
  category?: 'basic' | 'ai' | 'format'
}

export const SlashCommand = Extension.create({
  name: 'slash-command',

  addOptions() {
    return {
      suggestion: {
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
      },
    }
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor as any,
        char: '/',
        command: ({ editor, range, props }: any) => {
          props.command({ editor, range })
        },
        items: ({ query }: { query: string }) => {
          const commands: CommandItem[] = [
            {
              title: 'AI 续写',
              description: '让 AI 帮你继续写作',
              icon: Sparkles,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 续写
                triggerAIContinue(editor)
              },
            },
            {
              title: 'AI 头脑风暴',
              description: '生成创意想法和思路',
              icon: Lightbulb,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 头脑风暴
                triggerAIBrainstorm(editor)
              },
            },
            {
              title: 'AI 大纲',
              description: '生成文章大纲',
              icon: FileText,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 大纲生成
                triggerAIOutline(editor)
              },
            },
            {
              title: 'AI 生成插画',
              description: '使用 AI 生成图片',
              icon: ImageIcon,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 图片生成
                triggerAIImageGeneration(editor)
              },
            },
            // 基础命令
            {
              title: '标题 1',
              description: '大标题',
              icon: Heading1,
              category: 'format',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 1 })
                  .run()
              },
            },
            {
              title: '标题 2',
              description: '中标题',
              icon: Heading2,
              category: 'format',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 2 })
                  .run()
              },
            },
            {
              title: '标题 3',
              description: '小标题',
              icon: Heading3,
              category: 'format',
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setNode('heading', { level: 3 })
                  .run()
              },
            },
            {
              title: '无序列表',
              description: '创建列表',
              icon: List,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
              },
            },
            {
              title: '有序列表',
              description: '带编号的列表',
              icon: ListOrdered,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
              },
            },
            {
              title: '引用',
              description: '引用文本',
              icon: Quote,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
              },
            },
            {
              title: '代码块',
              description: '插入代码',
              icon: Code,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
              },
            },
            {
              title: '分隔线',
              description: '水平分隔线',
              icon: Minus,
              category: 'basic',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setHorizontalRule().run()
              },
            },
          ]

          return commands.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase())
            || item.description.toLowerCase().includes(query.toLowerCase()),
          )
        },
        render: () => {
          let component: ReactRenderer
          let popup: TippyInstance[]

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) {
                return
              }

              popup = tippy('body', {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start',
              })
            },
            onUpdate(props: any) {
              component.updateProps(props)

              if (!props.clientRect) {
                return
              }

              popup[0].setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },
            onKeyDown(props: any) {
              if (props.event.key === 'Escape') {
                popup[0].hide()
                return true
              }

              return (component.ref as any)?.onKeyDown(props)
            },
            onExit() {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
      }),
    ]
  },
})

// AI 续写功能
async function triggerAIContinue(editor: any) {
  try {
    // 获取光标前的文本作为上下文
    const { from } = editor.state.selection
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ')

    // 插入加载提示
    editor.chain().focus().insertContent('AI 正在续写...').run()

    const response = await fetch('/api/editor/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'continue',
        text: textBefore,
      }),
    })

    if (!response.ok) throw new Error('AI 请求失败')

    // 删除加载提示
    const loadingText = 'AI 正在续写...'
    const currentPos = editor.state.selection.from
    editor.chain().focus().deleteRange({ from: currentPos - loadingText.length, to: currentPos }).run()

    // 处理流式响应
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)

            if (data.type === 'content') {
              // 实时插入内容
              editor.chain().focus().insertContent(data.data).run()
            }
          } catch {
            console.warn('解析 SSE 失败:', trimmedLine)
          }
        }
      }
    }
  } catch (error) {
    console.error('AI 续写失败:', error)
    editor.chain().focus().insertContent('\nAI 续写失败，请稍后重试\n').run()
  }
}

// AI 头脑风暴
async function triggerAIBrainstorm(editor: any) {
  const userInput = await showGlobalInputDialog({
    title: 'AI 头脑风暴',
    placeholder: '请输入你想要头脑风暴的主题...',
  })

  if (!userInput) return

  try {
    editor.chain().focus().insertContent('💡 AI 正在生成创意...').run()

    const response = await fetch('/api/editor/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'custom',
        text: userInput,
        prompt: '请围绕这个主题进行头脑风暴，列出5-8个创意想法或思路。用简洁的要点形式呈现。',
      }),
    })

    if (!response.ok) throw new Error('AI 请求失败')

    const loadingText = '💡 AI 正在生成创意...'
    const currentPos = editor.state.selection.from
    editor.chain().focus().deleteRange({ from: currentPos - loadingText.length, to: currentPos }).run()

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)

            if (data.type === 'content') {
              editor.chain().focus().insertContent(data.data).run()
            }
          } catch {
            console.warn('解析 SSE 失败:', trimmedLine)
          }
        }
      }
    }

    editor.chain().focus().insertContent('\n\n').run()
  } catch (error) {
    console.error('AI 头脑风暴失败:', error)
  }
}

// AI 大纲生成
async function triggerAIOutline(editor: any) {
  const userInput = await showGlobalInputDialog({
    title: 'AI 大纲生成',
    placeholder: '请输入文章主题或简要描述...',
  })

  if (!userInput) return

  try {
    editor.chain().focus().insertContent('AI 正在生成大纲...').run()

    const response = await fetch('/api/editor/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'custom',
        text: userInput,
        prompt: '请为这个主题生成一个详细的文章大纲，包括主要章节和子要点。使用层级结构展示。',
      }),
    })

    if (!response.ok) throw new Error('AI 请求失败')

    const loadingText = 'AI 正在生成大纲...'
    const currentPos = editor.state.selection.from
    editor.chain().focus().deleteRange({ from: currentPos - loadingText.length, to: currentPos }).run()

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue

          try {
            const jsonStr = trimmedLine.slice(6)
            const data = JSON.parse(jsonStr)

            if (data.type === 'content') {
              editor.chain().focus().insertContent(data.data).run()
            }
          } catch {
            console.warn('解析 SSE 失败:', trimmedLine)
          }
        }
      }
    }

    editor.chain().focus().insertContent('\n\n').run()
  } catch (error) {
    console.error('AI 大纲生成失败:', error)
  }
}

// AI 图片生成
async function triggerAIImageGeneration(editor: any) {
  showGlobalImageGenerationDialog({
    onConfirm: async (prompt: string, size: string) => {
      try {
        editor.chain().focus().insertContent('🎨 AI 正在生成图片...').run()

        const response = await fetch('/api/images/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'text-to-image',
            prompt,
            size,
            num_images: 1,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '图片生成失败')
        }

        const data = await response.json()

        if (data.images && data.images.length > 0) {
          const imageUrl = data.images[0].url

          const loadingText = '🎨 AI 正在生成图片...'
          const currentPos = editor.state.selection.from
          editor
            .chain()
            .focus()
            .deleteRange({ from: currentPos - loadingText.length, to: currentPos })
            .run()

          const editorEvent = new CustomEvent('novel-insert-image-to-editor', {
            detail: { imageUrl }
          })
          window.dispatchEvent(editorEvent)
        } else {
          throw new Error('未返回生成的图片')
        }
      } catch (error: any) {
        console.error('图片生成失败:', error)
        const loadingText = '🎨 AI 正在生成图片...'
        const currentPos = editor.state.selection.from
        editor
          .chain()
          .focus()
          .deleteRange({ from: currentPos - loadingText.length, to: currentPos })
          .run()
        editor.chain().focus().insertContent('\n图片生成失败，请稍后重试\n').run()
      }
    },
  })
}
