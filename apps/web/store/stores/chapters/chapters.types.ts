import type { Chapter, Volume } from '@/lib/supabase/sdk'

/**
 * 章节 / 卷 缓存状态。
 *
 * - 进入小说编辑器时一次性把所有章节 + 卷拉到这个缓存
 * - 切换章节直接读 store，零网络请求
 * - 写入也走 store 同步更新（编辑器状态与缓存一致）
 */
export type ChaptersState = {
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
}

export type ChaptersActions = {
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

export type ChaptersStore = {
  chapters: ChaptersState
  chaptersActions: ChaptersActions
}
