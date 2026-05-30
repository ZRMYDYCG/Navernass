import type { Outline, WorldbookEntry } from '@/lib/supabase/sdk'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

/**
 * Worldview store：世界观条目 + 大纲节点的统一缓存
 *
 * 设计原则（与 chapters-store 一致）：
 *   - 进入 worldview tab 时一次性 hydrate
 *   - UI 直接订阅 store，不再各自维护 useState
 *   - REST 操作 + AI tool 联动后端 → upsert 到 store
 *   - AutoWriteToolPart 的 store sync 路径同样走这里
 *
 * 不同小说之间隔离：currentNovelId 切换时 reset 缓存。
 */

interface WorldviewStoreState {
  currentNovelId: string | null
  /** 世界观条目 byId */
  worldbookById: Record<string, WorldbookEntry>
  /** 顺序：按 order_index */
  worldbookIdsOrdered: string[]
  worldbookHydrated: boolean

  /** 大纲 byId */
  outlinesById: Record<string, Outline>
  /** 顺序：按 order_index（树结构未来可派生） */
  outlineIdsOrdered: string[]
  outlinesHydrated: boolean

  hydrateWorldbook: (novelId: string, entries: WorldbookEntry[]) => void
  hydrateOutlines: (novelId: string, outlines: Outline[]) => void
  resetForNovel: (novelId: string) => void

  upsertWorldbookEntry: (entry: WorldbookEntry) => void
  removeWorldbookEntry: (id: string) => void

  upsertOutline: (outline: Outline) => void
  removeOutline: (id: string) => void
}

function sortByOrderIndex<T extends { order_index: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order_index - b.order_index)
}

export const useWorldviewStore = create<WorldviewStoreState>()(
  devtools(
    immer<WorldviewStoreState>(set => ({
      currentNovelId: null,
      worldbookById: {},
      worldbookIdsOrdered: [],
      worldbookHydrated: false,
      outlinesById: {},
      outlineIdsOrdered: [],
      outlinesHydrated: false,

      hydrateWorldbook: (novelId, entries) => set((state) => {
        state.currentNovelId = novelId
        state.worldbookById = {}
        state.worldbookIdsOrdered = []
        for (const e of sortByOrderIndex(entries)) {
          state.worldbookById[e.id] = e
          state.worldbookIdsOrdered.push(e.id)
        }
        state.worldbookHydrated = true
      }),

      hydrateOutlines: (novelId, outlines) => set((state) => {
        state.currentNovelId = novelId
        state.outlinesById = {}
        state.outlineIdsOrdered = []
        for (const o of sortByOrderIndex(outlines)) {
          state.outlinesById[o.id] = o
          state.outlineIdsOrdered.push(o.id)
        }
        state.outlinesHydrated = true
      }),

      resetForNovel: novelId => set((state) => {
        if (state.currentNovelId === novelId) return
        state.currentNovelId = novelId
        state.worldbookById = {}
        state.worldbookIdsOrdered = []
        state.worldbookHydrated = false
        state.outlinesById = {}
        state.outlineIdsOrdered = []
        state.outlinesHydrated = false
      }),

      upsertWorldbookEntry: entry => set((state) => {
        const exists = state.worldbookById[entry.id]
        state.worldbookById[entry.id] = entry
        if (!exists) state.worldbookIdsOrdered.push(entry.id)
        // 按 order_index 重新排序
        state.worldbookIdsOrdered.sort((a, b) => {
          const oa = state.worldbookById[a]?.order_index ?? 0
          const ob = state.worldbookById[b]?.order_index ?? 0
          return oa - ob
        })
      }),

      removeWorldbookEntry: id => set((state) => {
        delete state.worldbookById[id]
        state.worldbookIdsOrdered = state.worldbookIdsOrdered.filter(x => x !== id)
      }),

      upsertOutline: outline => set((state) => {
        const exists = state.outlinesById[outline.id]
        state.outlinesById[outline.id] = outline
        if (!exists) state.outlineIdsOrdered.push(outline.id)
        state.outlineIdsOrdered.sort((a, b) => {
          const oa = state.outlinesById[a]?.order_index ?? 0
          const ob = state.outlinesById[b]?.order_index ?? 0
          return oa - ob
        })
      }),

      removeOutline: id => set((state) => {
        delete state.outlinesById[id]
        state.outlineIdsOrdered = state.outlineIdsOrdered.filter(x => x !== id)
      }),
    })),
    { name: 'worldviewStore' },
  ),
)

/** 选择器：按顺序拿到世界观条目 */
export function selectOrderedWorldbookEntries(state: WorldviewStoreState): WorldbookEntry[] {
  return state.worldbookIdsOrdered
    .map(id => state.worldbookById[id])
    .filter(Boolean)
}

/** 选择器：按顺序拿到大纲节点（扁平） */
export function selectOrderedOutlines(state: WorldviewStoreState): Outline[] {
  return state.outlineIdsOrdered
    .map(id => state.outlinesById[id])
    .filter(Boolean)
}
