import type { Chapter, Volume } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * 章节缓存 store
 *
 * 设计目标：
 * - 进入小说编辑器时一次性把所有章节（含 content）拉到内存
 * - 切换章节直接读 store，零网络请求
 * - 写入也走 store 同步更新（保证编辑器状态与缓存一致）
 * - 同时缓存卷结构，避免重复请求
 *
 * 写入路径：
 *   保存章节 → chaptersApi.update + store.upsertChapter
 *   AI 自治写入 → 后端 tool execute → 前端事件 → store.upsertChapter / addChapter
 *
 * 命中规则：
 *   - chaptersById[chapterId] 存在 → 直接用
 *   - 否则 fallback 到 chaptersApi.getById 并 upsert 回 store
 */

interface ChaptersStoreState {
  /** 当前小说 id（用于检测 novelId 切换时清空缓存） */
  currentNovelId: string | null
  /** byId 索引，便于 O(1) 取章节 */
  chaptersById: Record<string, Chapter>
  /** 用于左侧列表的章节 id 顺序（按 order_index 排好） */
  chapterIdsOrdered: string[]
  /** 卷的缓存 */
  volumesById: Record<string, Volume>
  volumeIdsOrdered: string[]
  /** 是否已经做过初始批量加载（防止重复加载） */
  hydrated: boolean

  hydrate: (novelId: string, chapters: Chapter[], volumes: Volume[]) => void
  reset: () => void

  /** 单章节 upsert：本地编辑保存 / AI 写入后调用 */
  upsertChapter: (chapter: Chapter) => void
  /** 删除一个章节（软删除时也调用，UI 不再展示） */
  removeChapter: (chapterId: string) => void
  /** 一次性同步整个 chapters 列表（创建/重排/批量删除后调用） */
  setChapters: (chapters: Chapter[]) => void

  upsertVolume: (volume: Volume) => void
  removeVolume: (volumeId: string) => void
  setVolumes: (volumes: Volume[]) => void
}

function sortByOrderIndex<T extends { order_index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export const useChaptersStore = create<ChaptersStoreState>()(
  devtools(
    immer<ChaptersStoreState>((set) => ({
      currentNovelId: null,
      chaptersById: {},
      chapterIdsOrdered: [],
      volumesById: {},
      volumeIdsOrdered: [],
      hydrated: false,

      hydrate: (novelId, chapters, volumes) => set((state) => {
        state.currentNovelId = novelId
        state.chaptersById = {}
        state.chapterIdsOrdered = []
        state.volumesById = {}
        state.volumeIdsOrdered = []
        const sortedChapters = sortByOrderIndex(chapters)
        for (const ch of sortedChapters) {
          state.chaptersById[ch.id] = ch
          state.chapterIdsOrdered.push(ch.id)
        }
        const sortedVolumes = sortByOrderIndex(volumes)
        for (const v of sortedVolumes) {
          state.volumesById[v.id] = v
          state.volumeIdsOrdered.push(v.id)
        }
        state.hydrated = true
      }),

      reset: () => set((state) => {
        state.currentNovelId = null
        state.chaptersById = {}
        state.chapterIdsOrdered = []
        state.volumesById = {}
        state.volumeIdsOrdered = []
        state.hydrated = false
      }),

      upsertChapter: chapter => set((state) => {
        const exists = state.chaptersById[chapter.id]
        state.chaptersById[chapter.id] = chapter
        if (!exists) {
          state.chapterIdsOrdered.push(chapter.id)
          state.chapterIdsOrdered.sort((a, b) => {
            const oa = state.chaptersById[a]?.order_index ?? 0
            const ob = state.chaptersById[b]?.order_index ?? 0
            return oa - ob
          })
        }
      }),

      removeChapter: chapterId => set((state) => {
        delete state.chaptersById[chapterId]
        state.chapterIdsOrdered = state.chapterIdsOrdered.filter(id => id !== chapterId)
      }),

      setChapters: chapters => set((state) => {
        state.chaptersById = {}
        state.chapterIdsOrdered = []
        const sorted = sortByOrderIndex(chapters)
        for (const ch of sorted) {
          state.chaptersById[ch.id] = ch
          state.chapterIdsOrdered.push(ch.id)
        }
      }),

      upsertVolume: volume => set((state) => {
        const exists = state.volumesById[volume.id]
        state.volumesById[volume.id] = volume
        if (!exists) {
          state.volumeIdsOrdered.push(volume.id)
          state.volumeIdsOrdered.sort((a, b) => {
            const oa = state.volumesById[a]?.order_index ?? 0
            const ob = state.volumesById[b]?.order_index ?? 0
            return oa - ob
          })
        }
      }),

      removeVolume: volumeId => set((state) => {
        delete state.volumesById[volumeId]
        state.volumeIdsOrdered = state.volumeIdsOrdered.filter(id => id !== volumeId)
      }),

      setVolumes: volumes => set((state) => {
        state.volumesById = {}
        state.volumeIdsOrdered = []
        const sorted = sortByOrderIndex(volumes)
        for (const v of sorted) {
          state.volumesById[v.id] = v
          state.volumeIdsOrdered.push(v.id)
        }
      }),
    })),
    { name: 'chaptersStore' },
  ),
)

/** 选择器：按顺序拿到 chapters 列表 */
export function selectOrderedChapters(state: ChaptersStoreState): Chapter[] {
  return state.chapterIdsOrdered
    .map(id => state.chaptersById[id])
    .filter(Boolean)
}

/** 选择器：按顺序拿到 volumes 列表 */
export function selectOrderedVolumes(state: ChaptersStoreState): Volume[] {
  return state.volumeIdsOrdered
    .map(id => state.volumesById[id])
    .filter(Boolean)
}
