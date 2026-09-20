import type { Node as ProseMirrorNode } from 'prosemirror-model'
import type { EditorView } from 'prosemirror-view'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface SearchHighlightOptions {
  chapterId: string | null
  keyword: string | null
  matches: Array<{ start: number, end: number, type: 'title' | 'content' }>
}

export const SearchHighlight = Extension.create<SearchHighlightOptions>({
  name: 'search-highlight',

  addOptions() {
    return {
      chapterId: null,
      keyword: null,
      matches: [],
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('search-highlight')

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init() {
            return {
              chapterId: null,
              keyword: null,
              matches: [],
              decorations: DecorationSet.empty,
            }
          },
          apply(tr, value) {
            // 如果有搜索高亮元数据，更新状态
            const highlightData = tr.getMeta('search-highlight')
            if (highlightData) {
              const { chapterId, keyword, matches } = highlightData
              const decorations = createDecorations(tr.doc, keyword, matches)
              return {
                chapterId,
                keyword,
                matches,
                decorations,
              }
            }

            // 如果文档内容变化，重新计算装饰
            if (tr.docChanged && value.keyword) {
              const decorations = createDecorations(tr.doc, value.keyword, value.matches)
              return {
                ...value,
                decorations,
              }
            }

            return value
          },
        },

        props: {
          decorations(state) {
            const pluginState = pluginKey.getState(state)
            return pluginState?.decorations || DecorationSet.empty
          },
        },
      }),
    ]
  },
})

// 创建装饰的函数
function createDecorations(
  doc: ProseMirrorNode,
  keyword: string | null,
  _matches: Array<{ start: number, end: number, type: 'title' | 'content' }>,
): DecorationSet {
  if (!keyword || keyword.trim() === '') {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []
  const escapedKeyword = escapeRegex(keyword.trim())
  const regex = new RegExp(escapedKeyword, 'gi')

  // 遍历文档节点，找到所有匹配的关键字
  doc.descendants((node: ProseMirrorNode, pos: number) => {
    // 只处理文本节点
    if (!node.isText) return

    const nodeText = node.textContent
    if (!nodeText) return

    // 在当前文本节点中查找所有匹配项
    // 重置正则表达式的 lastIndex，确保每次都能正确匹配
    regex.lastIndex = 0

    let matchResult = regex.exec(nodeText)
    while (matchResult !== null) {
      const from = pos + matchResult.index
      const to = from + matchResult[0].length

      decorations.push(
        Decoration.inline(from, to, {
          class: 'bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5',
        }),
      )

      matchResult = regex.exec(nodeText)
    }
  })

  return DecorationSet.create(doc, decorations)
}

// 转义正则表达式特殊字符
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// 全局函数：更新搜索高亮
export function updateSearchHighlight(
  view: EditorView,
  chapterId: string | null,
  keyword: string | null,
  matches: Array<{ start: number, end: number, type: 'title' | 'content' }>,
) {
  const { state, dispatch } = view
  const tr = state.tr.setMeta('search-highlight', {
    chapterId,
    keyword,
    matches,
  })
  dispatch(tr)
}
