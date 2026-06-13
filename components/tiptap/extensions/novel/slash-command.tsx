import type { LucideIcon } from 'lucide-react'
import type { Instance as TippyInstance } from 'tippy.js'
import { Extension } from '@tiptap/core'
import { ReactRenderer } from '@tiptap/react'
import Suggestion from '@tiptap/suggestion'
import {
  Asterisk,
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
import { streamSelectionAI, type SelectionAIStreamRequest } from '@/lib/editor/selection-ai-stream'
import { emitGlobalInsertImage } from '@/components/tiptap/core/editor-context'
import { CommandList } from '@/components/tiptap/ui/command-list'
import { showGlobalImageGenerationDialog, showGlobalInputDialog } from '@/components/tiptap/ui/dialog-manager'

type TFunctionLike = (key: string, options?: Record<string, any>) => string

async function streamAIIntoEditor(
  editor: { chain: () => any, state: { selection: { from: number } } },
  request: SelectionAIStreamRequest,
  loadingText: string,
) {
  editor.chain().focus().insertContent(loadingText).run()

  let insertedFrom: number | null = null
  let insertedTo: number | null = null

  await streamSelectionAI(request, {
    onTextUpdate: (fullText) => {
      const currentPos = editor.state.selection.from

      if (insertedFrom === null) {
        const from = currentPos - loadingText.length
        editor.chain().focus()
          .deleteRange({ from, to: currentPos })
          .insertContentAt(from, fullText)
          .run()
        insertedFrom = from
        insertedTo = from + fullText.length
        return
      }

      editor.chain().focus()
        .deleteRange({ from: insertedFrom, to: insertedTo! })
        .insertContentAt(insertedFrom, fullText)
        .run()
      insertedTo = insertedFrom + fullText.length
    },
  })
}

export interface SlashCommandOptions {
  t?: TFunctionLike
}

export interface CommandItem {
  title: string
  description: string
  icon: LucideIcon
  command: ({ editor, range }: any) => void
  category?: 'basic' | 'ai' | 'format'
}

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: 'slash-command',

  addOptions() {
    return {
      t: undefined,
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
          const t = this.options.t ?? ((key: string) => key)
          const commands: CommandItem[] = [
            {
              title: t('tiptap.slashCommand.items.aiContinue.title'),
              description: t('tiptap.slashCommand.items.aiContinue.description'),
              icon: Sparkles,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 续写
                triggerAIContinue(editor, t)
              },
            },
            {
              title: t('tiptap.slashCommand.items.aiBrainstorm.title'),
              description: t('tiptap.slashCommand.items.aiBrainstorm.description'),
              icon: Lightbulb,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 头脑风暴
                triggerAIBrainstorm(editor, t)
              },
            },
            {
              title: t('tiptap.slashCommand.items.aiOutline.title'),
              description: t('tiptap.slashCommand.items.aiOutline.description'),
              icon: FileText,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 大纲生成
                triggerAIOutline(editor, t)
              },
            },
            {
              title: t('tiptap.slashCommand.items.aiImage.title'),
              description: t('tiptap.slashCommand.items.aiImage.description'),
              icon: ImageIcon,
              category: 'ai',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).run()
                // 触发 AI 图片生成
                triggerAIImageGeneration(editor, t)
              },
            },
            // 基础命令
            {
              title: t('tiptap.slashCommand.items.heading1.title'),
              description: t('tiptap.slashCommand.items.heading1.description'),
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
              title: t('tiptap.slashCommand.items.heading2.title'),
              description: t('tiptap.slashCommand.items.heading2.description'),
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
              title: t('tiptap.slashCommand.items.heading3.title'),
              description: t('tiptap.slashCommand.items.heading3.description'),
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
              title: t('tiptap.slashCommand.items.bulletList.title'),
              description: t('tiptap.slashCommand.items.bulletList.description'),
              icon: List,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBulletList().run()
              },
            },
            {
              title: t('tiptap.slashCommand.items.orderedList.title'),
              description: t('tiptap.slashCommand.items.orderedList.description'),
              icon: ListOrdered,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleOrderedList().run()
              },
            },
            {
              title: t('tiptap.slashCommand.items.blockquote.title'),
              description: t('tiptap.slashCommand.items.blockquote.description'),
              icon: Quote,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleBlockquote().run()
              },
            },
            {
              title: t('tiptap.slashCommand.items.codeBlock.title'),
              description: t('tiptap.slashCommand.items.codeBlock.description'),
              icon: Code,
              category: 'format',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
              },
            },
            {
              title: t('tiptap.slashCommand.items.sceneBreak.title'),
              description: t('tiptap.slashCommand.items.sceneBreak.description'),
              icon: Asterisk,
              category: 'basic',
              command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setSceneBreak().run()
              },
            },
            {
              title: t('tiptap.slashCommand.items.divider.title'),
              description: t('tiptap.slashCommand.items.divider.description'),
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
async function triggerAIContinue(editor: any, t: TFunctionLike) {
  try {
    const { from } = editor.state.selection
    const textBefore = editor.state.doc.textBetween(Math.max(0, from - 500), from, ' ')
    await streamAIIntoEditor(
      editor,
      { action: 'continue', text: textBefore },
      t('tiptap.slashCommand.ai.continue.loading'),
    )
  } catch (error) {
    console.error('AI continue failed:', error)
    editor.chain().focus().insertContent(t('tiptap.slashCommand.ai.continue.failedInline')).run()
  }
}

// AI 头脑风暴
async function triggerAIBrainstorm(editor: any, t: TFunctionLike) {
  const userInput = await showGlobalInputDialog({
    title: t('tiptap.slashCommand.ai.brainstorm.dialog.title'),
    placeholder: t('tiptap.slashCommand.ai.brainstorm.dialog.placeholder'),
  })

  if (!userInput) return

  try {
    await streamAIIntoEditor(
      editor,
      {
        action: 'custom',
        text: userInput,
        prompt: t('tiptap.slashCommand.ai.brainstorm.systemPrompt'),
      },
      t('tiptap.slashCommand.ai.brainstorm.loading'),
    )
    editor.chain().focus().insertContent('\n\n').run()
  } catch (error) {
    console.error('AI brainstorm failed:', error)
  }
}

// AI 大纲生成
async function triggerAIOutline(editor: any, t: TFunctionLike) {
  const userInput = await showGlobalInputDialog({
    title: t('tiptap.slashCommand.ai.outline.dialog.title'),
    placeholder: t('tiptap.slashCommand.ai.outline.dialog.placeholder'),
  })

  if (!userInput) return

  try {
    await streamAIIntoEditor(
      editor,
      {
        action: 'custom',
        text: userInput,
        prompt: t('tiptap.slashCommand.ai.outline.systemPrompt'),
      },
      t('tiptap.slashCommand.ai.outline.loading'),
    )
    editor.chain().focus().insertContent('\n\n').run()
  } catch (error) {
    console.error('AI outline failed:', error)
  }
}

// AI 图片生成
async function triggerAIImageGeneration(editor: any, t: TFunctionLike) {
  showGlobalImageGenerationDialog({
    onConfirm: async (prompt: string, size: string) => {
      try {
        editor.chain().focus().insertContent(t('tiptap.slashCommand.ai.image.loading')).run()

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
          throw new Error(error.error || t('tiptap.slashCommand.ai.image.generateFailed'))
        }

        const data = await response.json()

        if (data.images && data.images.length > 0) {
          const imageUrl = data.images[0].url

          const loadingText = t('tiptap.slashCommand.ai.image.loading')
          const currentPos = editor.state.selection.from
          editor
            .chain()
            .focus()
            .deleteRange({ from: currentPos - loadingText.length, to: currentPos })
            .run()

          emitGlobalInsertImage({ imageUrl })
        } else {
          throw new Error(t('tiptap.slashCommand.ai.image.noImageReturned'))
        }
      } catch (error: any) {
        console.error('Image generation failed:', error)
        const loadingText = t('tiptap.slashCommand.ai.image.loading')
        const currentPos = editor.state.selection.from
        editor
          .chain()
          .focus()
          .deleteRange({ from: currentPos - loadingText.length, to: currentPos })
          .run()
        editor.chain().focus().insertContent(t('tiptap.slashCommand.ai.image.failedInline')).run()
      }
    },
  })
}
