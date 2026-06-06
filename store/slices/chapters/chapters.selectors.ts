import type { Chapter, Volume } from '@/lib/supabase/sdk'
import type { AppStore } from '../../store.types'

export const selectChapters = (state: AppStore) => state.chapters
export const selectChaptersCurrentNovelId = (state: AppStore) => state.chapters.currentNovelId
export const selectChaptersHydrated = (state: AppStore) => state.chapters.hydrated
export const selectChapterById = (id: string) => (state: AppStore): Chapter | undefined =>
  state.chapters.chaptersById[id]
export const selectVolumeById = (id: string) => (state: AppStore): Volume | undefined =>
  state.chapters.volumesById[id]

/** 按 order_index 拿到 chapters 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedChapters(state: AppStore): Chapter[] {
  return state.chapters.chapterIdsOrdered
    .map(id => state.chapters.chaptersById[id])
    .filter(Boolean)
}

/** 按 order_index 拿到 volumes 列表。返回新数组，订阅时需配 useShallow。 */
export function selectOrderedVolumes(state: AppStore): Volume[] {
  return state.chapters.volumeIdsOrdered
    .map(id => state.chapters.volumesById[id])
    .filter(Boolean)
}
