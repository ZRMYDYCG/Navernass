import type { Chapter, Volume } from '@/lib/supabase/sdk'
import type { ChaptersStore } from './chapters.types'

export const selectChapters = (state: ChaptersStore) => state.chapters
export const selectChaptersCurrentNovelId = (state: ChaptersStore) => state.chapters.currentNovelId
export const selectChaptersHydrated = (state: ChaptersStore) => state.chapters.hydrated
export const selectChapterById = (id: string) => (state: ChaptersStore): Chapter | undefined =>
  state.chapters.chaptersById[id]
export const selectVolumeById = (id: string) => (state: ChaptersStore): Volume | undefined =>
  state.chapters.volumesById[id]

/** 按 order_index 拿到 chapters 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedChapters(state: ChaptersStore): Chapter[] {
  return state.chapters.chapterIdsOrdered
    .map(id => state.chapters.chaptersById[id])
    .filter(Boolean)
}

/** 按 order_index 拿到 volumes 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedVolumes(state: ChaptersStore): Volume[] {
  return state.chapters.volumeIdsOrdered
    .map(id => state.chapters.volumesById[id])
    .filter(Boolean)
}
