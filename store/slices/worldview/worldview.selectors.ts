import type { Outline, WorldbookEntry } from '@/lib/supabase/sdk'
import type { AppStore } from '../../store.types'

export const selectWorldview = (state: AppStore) => state.worldview
export const selectWorldviewCurrentNovelId = (state: AppStore) => state.worldview.currentNovelId
export const selectWorldbookHydrated = (state: AppStore) => state.worldview.worldbookHydrated
export const selectOutlinesHydrated = (state: AppStore) => state.worldview.outlinesHydrated
export const selectWorldbookEntryById = (id: string) => (state: AppStore): WorldbookEntry | undefined =>
  state.worldview.worldbookById[id]
export const selectOutlineById = (id: string) => (state: AppStore): Outline | undefined =>
  state.worldview.outlinesById[id]

/** 选择器：按顺序拿到世界观条目 */
export function selectOrderedWorldbookEntries(state: AppStore): WorldbookEntry[] {
  return state.worldview.worldbookIdsOrdered
    .map(id => state.worldview.worldbookById[id])
    .filter(Boolean)
}

/** 选择器：按顺序拿到大纲节点（扁平） */
export function selectOrderedOutlines(state: AppStore): Outline[] {
  return state.worldview.outlineIdsOrdered
    .map(id => state.worldview.outlinesById[id])
    .filter(Boolean)
}
