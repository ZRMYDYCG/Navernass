import type { Outline, WorldbookEntry } from '@/lib/supabase/sdk'

/**
 * Worldview 缓存：世界观条目 + 大纲节点统一管理。
 *
 * 设计原则（与 chapters 一致）：
 * - 进入 worldview tab 时一次性 hydrate
 * - UI 直接订阅 store，不再各自维护 useState
 * - REST 操作 + AI tool 联动后端 → upsert 到 store
 * - AutoWriteToolPart 的 store sync 路径同样走这里
 *
 * 不同小说之间隔离：currentNovelId 切换时 reset 缓存。
 */
export type WorldviewState = {
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
}

export type WorldviewActions = {
  hydrateWorldbook: (novelId: string, entries: WorldbookEntry[]) => void
  hydrateOutlines: (novelId: string, outlines: Outline[]) => void
  resetForNovel: (novelId: string) => void

  upsertWorldbookEntry: (entry: WorldbookEntry) => void
  removeWorldbookEntry: (id: string) => void

  upsertOutline: (outline: Outline) => void
  removeOutline: (id: string) => void
}

export type WorldviewStore = {
  worldview: WorldviewState
  worldviewActions: WorldviewActions
}
