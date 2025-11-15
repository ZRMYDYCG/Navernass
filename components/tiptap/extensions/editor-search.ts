import type { Node as ProseMirrorNode } from 'prosemirror-model'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface EditorSearchOptions {
  keyword: string | null
  matches: Array<{ from: number, to: number }>
  currentIndex: number
}

export const EditorSearch = Extension.create<EditorSearchOptions>({
  name: 'editor-search',

  addOptions() {
    return {
      keyword: null,
      matches: [],
      currentIndex: -1,
    }
  },

  addProseMirrorPlugins() {
    const pluginKey = new PluginKey('editor-search')

    return [
      new Plugin({
        key: pluginKey,

        state: {
          init() {
            return {
              keyword: null,
              matches: [],
              currentIndex: -1,
              decorations: DecorationSet.empty,
            }
          },
          apply(tr, value) {
            // 如果有搜索高亮元数据，更新状态
            const searchData = tr.getMeta('search-highlight')
            if (searchData) {
              const { keyword, matches, currentIndex } = searchData
              const decorations = createSearchDecorations(tr.doc, keyword, matches, currentIndex)
              return {
                keyword,
                matches,
                currentIndex,
                decorations,
              }
            }

            // 如果文档内容变化，重新计算装饰
            if (tr.docChanged && value.keyword) {
              const decorations = createSearchDecorations(tr.doc, value.keyword, value.matches, value.currentIndex)
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

// 创建搜索装饰的函数
function createSearchDecorations(
  doc: ProseMirrorNode,
  keyword: string | null,
  matches: Array<{ from: number, to: number }>,
  currentIndex: number,
): DecorationSet {
  if (!keyword || keyword.trim() === '' || matches.length === 0) {
    return DecorationSet.empty
  }

  const decorations: Decoration[] = []

  // 遍历所有匹配项
  matches.forEach((match, index) => {
    const isCurrent = index === currentIndex

    decorations.push(
      Decoration.inline(match.from, match.to, {
        class: isCurrent
          ? 'bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5 ring-2 ring-yellow-400 dark:ring-yellow-600'
          : 'bg-yellow-200 dark:bg-yellow-800/50 rounded px-0.5',
      }),
    )
  })

  return DecorationSet.create(doc, decorations)
}
