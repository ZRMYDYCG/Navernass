import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DecorationSet } from 'prosemirror-view'

export interface AIAutocompleteOptions {
  trigger: string
  debounceDelay: number
}

export const AIAutocomplete = Extension.create<AIAutocompleteOptions>({
  name: 'ai-autocomplete',

  addOptions() {
    return {
      trigger: '++',
      debounceDelay: 500,
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('ai-autocomplete'),

        state: {
          init() {
            return {
              isGenerating: false,
              decorations: DecorationSet.empty,
            }
          },
          apply(tr, value) {
            // 如果有 AI 生成元数据，更新状态
            const isGenerating = tr.getMeta('ai-generating')
            if (typeof isGenerating === 'boolean') {
              return { ...value, isGenerating }
            }

            return value
          },
        },

        props: {
          handleKeyDown(view, event) {
            // 检测 ++ 输入
            if (event.key === '+') {
              const { state } = view
              const { selection } = state
              const { $from } = selection

              // 获取光标前的文本
              const textBefore = $from.parent.textContent.slice(0, $from.parentOffset)

              // 如果已经输入了一个 +，并且现在又输入 +
              if (textBefore.endsWith('+')) {
                // 阻止默认输入
                event.preventDefault()

                // 删除第一个 +
                const tr = state.tr.delete($from.pos - 1, $from.pos)
                view.dispatch(tr)

                // 触发 AI 续写
                triggerAIAutocomplete(view)

                return true
              }
            }

            return false
          },

          decorations(state) {
            const pluginState = this.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },
        },
      }),
    ]
  },
})

async function triggerAIAutocomplete(view: any) {
  let loadingAnimationInterval: NodeJS.Timeout | null = null

  try {
    const { state, dispatch } = view
    const { selection } = state
    const { from } = selection

    dispatch(state.tr.setMeta('ai-generating', true))

    const textBefore = state.doc.textBetween(Math.max(0, from - 500), from, ' ')

    const loadingFrames = [' AI 续写中.   ', ' AI 续写中..  ', ' AI 续写中... ']
    let frameIndex = 0
    const tr = state.tr.insertText(loadingFrames[0], from)
    dispatch(tr)

    loadingAnimationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % loadingFrames.length
      const currentState = view.state
      const currentFrom = currentState.selection.from
      const loadingText = loadingFrames[frameIndex]

      const animTr = currentState.tr
        .delete(currentFrom - loadingFrames[0].length, currentFrom)
        .insertText(loadingText, currentFrom - loadingFrames[0].length)
      view.dispatch(animTr)
    }, 400)

    const response = await fetch('/api/editor/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'continue',
        text: textBefore,
      }),
    })

    if (!response.ok) {
      throw new Error('AI 请求失败')
    }

    if (loadingAnimationInterval) {
      clearInterval(loadingAnimationInterval)
      loadingAnimationInterval = null
    }

    const currentState = view.state
    const currentFrom = currentState.selection.from
    const deleteTr = currentState.tr.delete(
      currentFrom - loadingFrames[0].length,
      currentFrom,
    )
    view.dispatch(deleteTr)

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
              const currentState = view.state
              const insertTr = currentState.tr.insertText(
                data.data,
                currentState.selection.from,
              )
              view.dispatch(insertTr)
            } else if (data.type === 'done') {
              const finalState = view.state
              view.dispatch(finalState.tr.setMeta('ai-generating', false))
            }
          } catch {
            console.warn('解析 SSE 失败:', trimmedLine)
          }
        }
      }
    }

    const finalState = view.state
    view.dispatch(finalState.tr.setMeta('ai-generating', false))
  } catch (error) {
    console.error('AI 自动补全失败:', error)

    if (loadingAnimationInterval) {
      clearInterval(loadingAnimationInterval)
      loadingAnimationInterval = null
    }

    const currentState = view.state
    view.dispatch(currentState.tr.setMeta('ai-generating', false))

    const errorText = '\nAI 续写失败，请稍后重试\n'
    const errorTr = currentState.tr.insertText(errorText, currentState.selection.from)
    view.dispatch(errorTr)
  }
}
