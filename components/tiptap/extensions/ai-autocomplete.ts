import type { EditorView } from 'prosemirror-view'
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

async function triggerAIAutocomplete(view: EditorView) {
  let loadingAnimationInterval: NodeJS.Timeout | null = null
  let scrollDebounceTimer: NodeJS.Timeout | null = null

  try {
    const { state, dispatch } = view
    const { selection } = state
    const { from } = selection

    // 检测是否在文章底部触发续写
    // 如果光标位置距离文档末尾小于 500 个字符，认为是底部触发
    const docSize = state.doc.content.size
    const distanceFromEnd = docSize - from
    const isTriggeredAtBottom = distanceFromEnd < 500

    dispatch(state.tr.setMeta('ai-generating', true))

    const textBefore = state.doc.textBetween(Math.max(0, from - 500), from, ' ')

    const loadingFrames = [' AI 续写中.   ', ' AI 续写中..  ', ' AI 续写中... ']
    let frameIndex = 0
    const tr = state.tr.insertText(loadingFrames[0], from)
    dispatch(tr)

    // 查找可滚动的父容器（只查找一次，提高性能）
    const findScrollContainer = (): HTMLElement | null => {
      const editorElement = view.dom
      if (!editorElement) return null

      // 查找可滚动的父容器
      let scrollContainer: HTMLElement | null = editorElement.closest('[class*="overflow"]') as HTMLElement

      // 如果没找到，尝试查找父级元素中第一个有 overflow-y-auto 或 overflow-auto 的元素
      if (!scrollContainer) {
        let parent = editorElement.parentElement
        while (parent) {
          const style = window.getComputedStyle(parent)
          if (style.overflowY === 'auto' || style.overflowY === 'scroll'
            || style.overflow === 'auto' || style.overflow === 'scroll') {
            scrollContainer = parent
            break
          }
          parent = parent.parentElement
        }
      }

      return scrollContainer
    }

    const scrollContainer = findScrollContainer()

    // 辅助函数：滚动到底部（使用防抖优化性能）
    const scrollToBottom = (immediate = false) => {
      if (!scrollContainer) return

      // 如果立即滚动，清除之前的定时器
      if (immediate) {
        if (scrollDebounceTimer) {
          clearTimeout(scrollDebounceTimer)
          scrollDebounceTimer = null
        }
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth',
          })
        })
        return
      }

      // 否则使用防抖，减少频繁滚动
      if (scrollDebounceTimer) {
        clearTimeout(scrollDebounceTimer)
      }
      scrollDebounceTimer = setTimeout(() => {
        requestAnimationFrame(() => {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth',
          })
        })
      }, 100) // 100ms 防抖延迟
    }

    // 如果是在底部触发的，初始时也滚动到底部（立即滚动）
    if (isTriggeredAtBottom) {
      scrollToBottom(true)
    }

    loadingAnimationInterval = setInterval(() => {
      frameIndex = (frameIndex + 1) % loadingFrames.length
      const currentState = view.state
      const currentFrom = currentState.selection.from
      const loadingText = loadingFrames[frameIndex]

      const animTr = currentState.tr
        .delete(currentFrom - loadingFrames[0].length, currentFrom)
        .insertText(loadingText, currentFrom - loadingFrames[0].length)
      view.dispatch(animTr)

      // 如果是在底部触发的，加载动画期间也保持滚动到底部（立即滚动）
      if (isTriggeredAtBottom) {
        scrollToBottom(true)
      }
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

              // 如果是在底部触发的续写，每次插入内容后立即滚动到底部（不使用防抖）
              if (isTriggeredAtBottom) {
                scrollToBottom(true)
              }
            } else if (data.type === 'done') {
              const finalState = view.state
              view.dispatch(finalState.tr.setMeta('ai-generating', false))

              // 完成后再次确保滚动到底部（立即滚动）
              if (isTriggeredAtBottom) {
                scrollToBottom(true)
              }
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
